import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export type Reporte = {
    id: number;
    user_id: number | null;
    is_anonymous: boolean;
    attack_type: 'email' | 'SMS' | 'whatsapp' | 'llamada' | 'redes_sociales' | 'otro';
    incident_date: string;
    incident_time: string | null;
    attack_origin: string;
    suspicious_url: string | null;
    message_content: string | null;
    impact_level: 'ninguno' | 'robo_datos' | 'robo_dinero' | 'cuenta_comprometida';
    description: string | null;
    status: 'nuevo' | 'revisado' | 'en_investigacion' | 'cerrado';
    admin_notes: string | null;
    created_at: Date;
    updated_at: Date;
};

export interface CreateReporteData {
    user_id?: number | null;
    is_anonymous: boolean;
    attack_type: string;
    incident_date: string;
    incident_time?: string;
    attack_origin: string;
    suspicious_url?: string;
    message_content?: string;
    impact_level: string;
    description?: string;
}

@Injectable()
export class ReportesRepository {
    constructor(private readonly db: DbService) {}

    async createReporte(data: CreateReporteData): Promise<Reporte | null> {
        const sql = `
            INSERT INTO reportes (
                user_id, is_anonymous, attack_type, incident_date, incident_time,
                attack_origin, suspicious_url, message_content, impact_level, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.user_id || null,
            data.is_anonymous,
            data.attack_type,
            data.incident_date,
            data.incident_time || null,
            data.attack_origin,
            data.suspicious_url || null,
            data.message_content || null,
            data.impact_level,
            data.description || null
        ];

        try {
            const [result] = await this.db.getPool().query(sql, values);
            const insertResult = result as { insertId: number };
            return this.findById(insertResult.insertId);
        } catch (error) {
            console.error('Error creating reporte:', error);
            return null;
        }
    }

    async findById(id: number): Promise<Reporte | null> {
        const sql = `
            SELECT r.*,
                   u.email as user_email,
                   u.name as user_name
            FROM reportes r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ? LIMIT 1
        `;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as Reporte[];
        return result[0] || null;
    }

    async findUserReports(userId: number): Promise<Reporte[]> {
        const sql = `
            SELECT * FROM reportes
            WHERE user_id = ? AND is_anonymous = FALSE
            ORDER BY created_at DESC
        `;
        const [rows] = await this.db.getPool().query(sql, [userId]);
        return rows as Reporte[];
    }

    async findRecentReports(limit: number = 10): Promise<Reporte[]> {
        const sql = `
            SELECT r.*,
                   CASE
                       WHEN r.is_anonymous = TRUE THEN 'Anónimo'
                       ELSE u.name
                   END as reporter_name
            FROM reportes r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT ?
        `;
        const [rows] = await this.db.getPool().query(sql, [limit]);
        return rows as Reporte[];
    }

    async getTrendsByAttackType(days: number = 30): Promise<{ attack_type: string; count: number }[]> {
        const sql = `
            SELECT attack_type, COUNT(*) as count
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY attack_type
            ORDER BY count DESC
        `;
        const [rows] = await this.db.getPool().query(sql, [days]);
        return rows as { attack_type: string; count: number }[];
    }

    async getTrendsByImpactLevel(days: number = 30): Promise<{ impact_level: string; count: number }[]> {
        const sql = `
            SELECT impact_level, COUNT(*) as count
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY impact_level
            ORDER BY count DESC
        `;
        const [rows] = await this.db.getPool().query(sql, [days]);
        return rows as { impact_level: string; count: number }[];
    }

    async getReportStats(): Promise<{
        total: number;
        today: number;
        this_week: number;
        anonymous: number;
        identified: number;
    }> {
        const totalSql = `SELECT COUNT(*) as count FROM reportes`;
        const [totalRows] = await this.db.getPool().query(totalSql);

        const todaySql = `SELECT COUNT(*) as count FROM reportes WHERE DATE(created_at) = CURDATE()`;
        const [todayRows] = await this.db.getPool().query(todaySql);

        const weekSql = `SELECT COUNT(*) as count FROM reportes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        const [weekRows] = await this.db.getPool().query(weekSql);

        const anonymousSql = `SELECT COUNT(*) as count FROM reportes WHERE is_anonymous = TRUE`;
        const [anonymousRows] = await this.db.getPool().query(anonymousSql);

        const identifiedSql = `SELECT COUNT(*) as count FROM reportes WHERE is_anonymous = FALSE`;
        const [identifiedRows] = await this.db.getPool().query(identifiedSql);

        return {
            total: (totalRows as { count: number }[])[0].count,
            today: (todayRows as { count: number }[])[0].count,
            this_week: (weekRows as { count: number }[])[0].count,
            anonymous: (anonymousRows as { count: number }[])[0].count,
            identified: (identifiedRows as { count: number }[])[0].count,
        };
    }
}