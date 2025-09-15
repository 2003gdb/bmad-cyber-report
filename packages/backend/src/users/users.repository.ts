/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export type User = {
    id: number;
    email: string;
    name: string;
    password_hash: string;
    salt: string;
    last_login: Date | null;
    created_at: Date;
    updated_at: Date;
};

@Injectable()
export class UsersRepository{
    constructor(private readonly db: DbService) {}

    async createUser(email: string, name: string, password_hash: string, salt: string): Promise<User | null>{
        const sql = `INSERT INTO users (email, name, password_hash, salt)
                     VALUES (?, ?, ?, ?)`;
        const [result] = await this.db.getPool().query(sql, [email, name, password_hash, salt]);
        const insertResult = result as any;

        // Return the created user
        return this.findById(insertResult.insertId);
    }

    async findByEmail(email: string): Promise<User | null> {
        const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [email]);
        const result = rows as User[];
        return result[0] || null;
    }

    async findById(id: number): Promise<User | null> {
        const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as User[];
        return result[0] || null;
    }

    async findAll(): Promise<User[]> {
        const sql = `SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as User[];
    }

    async updateUser(id: number, updates: Partial<Pick<User, 'email' | 'name'>>): Promise<User | null> {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);

        const sql = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await this.db.getPool().query(sql, [...values, id]);

        return this.findById(id);
    }

    async deleteUser(id: number): Promise<boolean> {
        const sql = `DELETE FROM users WHERE id = ?`;
        const [result] = await this.db.getPool().query(sql, [id]);
        const deleteResult = result as any;
        return deleteResult.affectedRows > 0;
    }

    async updateLastLogin(id: number): Promise<void> {
        const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
        await this.db.getPool().query(sql, [id]);
    }
}