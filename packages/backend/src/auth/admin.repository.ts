/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { hashPassword, verifyPassword } from "src/util/hash/hash.util";

export type AdminUser = {
    id: number;
    email: string;
    password_hash: string;
    salt: string;
    last_login: Date;
    created_at: Date;
};

@Injectable()
export class AdminRepository {
    constructor(private readonly db: DbService) {}

    async findByEmail(email: string): Promise<AdminUser | null> {
        const sql = `SELECT * FROM admin_users WHERE email = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [email]);
        const result = rows as AdminUser[];
        return result[0] || null;
    }

    async findById(id: number): Promise<AdminUser | null> {
        const sql = `SELECT * FROM admin_users WHERE id = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as AdminUser[];
        return result[0] || null;
    }

    async validateAdmin(email: string, password: string): Promise<AdminUser | null> {
        const admin = await this.findByEmail(email);
        if (!admin) {
            return null;
        }

        const isValid = await verifyPassword(password, admin.salt, admin.password_hash);
        return isValid ? admin : null;
    }

    async updateLastLogin(id: number): Promise<void> {
        const sql = `UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
        await this.db.getPool().query(sql, [id]);
    }

    async createAdmin(email: string, password: string, salt: string): Promise<AdminUser | null> {
        const hashedPassword = await hashPassword(password, salt);
        const sql = `INSERT INTO admin_users (email, password_hash, salt) VALUES (?, ?, ?)`;

        try {
            const [result] = await this.db.getPool().query(sql, [email, hashedPassword, salt]);
            const insertResult = result as any;
            return this.findById(insertResult.insertId);
        } catch (error) {
            // Email might already exist
            return null;
        }
    }
}