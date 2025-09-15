/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export interface ReportFilters {
    status?: string;
    attack_type?: string;
    date_from?: string;
    date_to?: string;
}

export interface ReportStats {
    total_reports: number;
    reports_today: number;
    critical_reports: number;
    pending_reports: number;
    attack_types: { attack_type: string; count: number }[];
}

@Injectable()
export class AdminRepository {
    constructor(private readonly db: DbService) {}

    async getUserCount(): Promise<number> {
        const sql = `SELECT COUNT(*) as count FROM users`;
        const [rows] = await this.db.getPool().query(sql);
        const result = rows as { count: number }[];
        return result[0].count;
    }

    async getReportStats(): Promise<ReportStats> {
        // Get total reports
        const totalSql = `SELECT COUNT(*) as count FROM reportes`;
        const [totalRows] = await this.db.getPool().query(totalSql);
        const totalResult = totalRows as { count: number }[];

        // Get reports today
        const todaySql = `SELECT COUNT(*) as count FROM reportes WHERE DATE(created_at) = CURDATE()`;
        const [todayRows] = await this.db.getPool().query(todaySql);
        const todayResult = todayRows as { count: number }[];

        // Get critical reports (high impact)
        const criticalSql = `SELECT COUNT(*) as count FROM reportes WHERE impact_level IN ('robo_datos', 'robo_dinero', 'cuenta_comprometida')`;
        const [criticalRows] = await this.db.getPool().query(criticalSql);
        const criticalResult = criticalRows as { count: number }[];

        // Get pending reports
        const pendingSql = `SELECT COUNT(*) as count FROM reportes WHERE status = 'nuevo'`;
        const [pendingRows] = await this.db.getPool().query(pendingSql);
        const pendingResult = pendingRows as { count: number }[];

        // Get attack types distribution
        const attackTypesSql = `SELECT attack_type, COUNT(*) as count FROM reportes GROUP BY attack_type ORDER BY count DESC`;
        const [attackTypesRows] = await this.db.getPool().query(attackTypesSql);
        const attackTypes = attackTypesRows as { attack_type: string; count: number }[];

        return {
            total_reports: totalResult[0].count,
            reports_today: todayResult[0].count,
            critical_reports: criticalResult[0].count,
            pending_reports: pendingResult[0].count,
            attack_types: attackTypes
        };
    }

    async getFilteredReports(filters: ReportFilters) {
        let sql = `
            SELECT
                r.id,
                r.user_id,
                r.is_anonymous,
                r.attack_type,
                r.incident_date,
                r.incident_time,
                r.attack_origin,
                r.suspicious_url,
                r.impact_level,
                r.status,
                r.description,
                r.created_at,
                u.email as user_email,
                u.name as user_name
            FROM reportes r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (filters.status) {
            sql += ` AND r.status = ?`;
            params.push(filters.status);
        }

        if (filters.attack_type) {
            sql += ` AND r.attack_type = ?`;
            params.push(filters.attack_type);
        }

        if (filters.date_from) {
            sql += ` AND DATE(r.created_at) >= ?`;
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            sql += ` AND DATE(r.created_at) <= ?`;
            params.push(filters.date_to);
        }

        sql += ` ORDER BY r.created_at DESC`;

        const [rows] = await this.db.getPool().query(sql, params);
        return rows;
    }

    async updateReportStatus(reportId: number, status: string, adminNotes?: string) {
        let sql = `UPDATE reportes SET status = ?, updated_at = CURRENT_TIMESTAMP`;
        const params = [status];

        if (adminNotes) {
            sql += `, admin_notes = ?`;
            params.push(adminNotes);
        }

        sql += ` WHERE id = ?`;
        params.push(reportId);

        const [result] = await this.db.getPool().query(sql, params);
        const updateResult = result as any;
        return updateResult.affectedRows > 0;
    }

    async getReportById(id: number) {
        const sql = `
            SELECT
                r.*,
                u.email as user_email,
                u.name as user_name
            FROM reportes r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as any[];
        return result[0] || null;
    }
}