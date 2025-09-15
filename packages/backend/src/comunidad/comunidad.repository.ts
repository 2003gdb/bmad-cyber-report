/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export interface TrendData {
    attack_type: string;
    count: number;
    percentage: number;
    trend_direction?: 'increasing' | 'decreasing' | 'stable';
}

export interface CommunityStats {
    total_reports: number;
    active_period: string;
    most_common_attack: string;
    highest_impact_count: number;
    anonymous_percentage: number;
}

@Injectable()
export class ComunidadRepository {
    constructor(private readonly db: DbService) {}

    async getAttackTypeTrends(days: number = 30): Promise<TrendData[]> {
        const sql = `
            SELECT
                attack_type,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reportes WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY))), 2) as percentage
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY attack_type
            ORDER BY count DESC
        `;
        const [rows] = await this.db.getPool().query(sql, [days, days]);
        return rows as TrendData[];
    }

    async getImpactLevelTrends(days: number = 30): Promise<TrendData[]> {
        const sql = `
            SELECT
                impact_level as attack_type,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reportes WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY))), 2) as percentage
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY impact_level
            ORDER BY count DESC
        `;
        const [rows] = await this.db.getPool().query(sql, [days, days]);
        return rows as TrendData[];
    }

    async getTimeBasedTrends(days: number = 7): Promise<{ date: string; count: number }[]> {
        const sql = `
            SELECT
                DATE(created_at) as date,
                COUNT(*) as count
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        const [rows] = await this.db.getPool().query(sql, [days]);
        return rows as { date: string; count: number }[];
    }

    async getCommunityStats(days: number = 30): Promise<CommunityStats> {
        // Total reports in period
        const totalSql = `
            SELECT COUNT(*) as total FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const [totalRows] = await this.db.getPool().query(totalSql, [days]);
        const total = (totalRows as { total: number }[])[0].total;

        // Most common attack type
        const mostCommonSql = `
            SELECT attack_type, COUNT(*) as count
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY attack_type
            ORDER BY count DESC
            LIMIT 1
        `;
        const [mostCommonRows] = await this.db.getPool().query(mostCommonSql, [days]);
        const mostCommon = (mostCommonRows as { attack_type: string; count: number }[])[0];

        // High impact reports
        const highImpactSql = `
            SELECT COUNT(*) as count FROM reportes
            WHERE impact_level IN ('robo_datos', 'robo_dinero', 'cuenta_comprometida')
            AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const [highImpactRows] = await this.db.getPool().query(highImpactSql, [days]);
        const highImpact = (highImpactRows as { count: number }[])[0].count;

        // Anonymous percentage
        const anonymousSql = `
            SELECT
                COUNT(CASE WHEN is_anonymous = TRUE THEN 1 END) as anonymous_count,
                COUNT(*) as total_count
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const [anonymousRows] = await this.db.getPool().query(anonymousSql, [days]);
        const anonymousData = (anonymousRows as { anonymous_count: number; total_count: number }[])[0];
        const anonymousPercentage = total > 0 ? Math.round((anonymousData.anonymous_count / total) * 100) : 0;

        return {
            total_reports: total,
            active_period: `${days} días`,
            most_common_attack: mostCommon?.attack_type || 'N/A',
            highest_impact_count: highImpact,
            anonymous_percentage: anonymousPercentage
        };
    }

    async getSimilarReports(attackType: string, impactLevel: string, limit: number = 5) {
        const sql = `
            SELECT
                id,
                attack_type,
                impact_level,
                description,
                created_at,
                CASE WHEN is_anonymous = TRUE THEN 'Anónimo' ELSE 'Usuario registrado' END as reporter_type
            FROM reportes
            WHERE attack_type = ? AND impact_level = ?
            AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            ORDER BY created_at DESC
            LIMIT ?
        `;
        const [rows] = await this.db.getPool().query(sql, [attackType, impactLevel, limit]);
        return rows;
    }

    async getTopSuspiciousOrigins(days: number = 30, limit: number = 10) {
        const sql = `
            SELECT
                attack_origin,
                COUNT(*) as report_count,
                GROUP_CONCAT(DISTINCT attack_type) as attack_types
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            AND attack_origin IS NOT NULL
            GROUP BY attack_origin
            HAVING report_count > 1
            ORDER BY report_count DESC
            LIMIT ?
        `;
        const [rows] = await this.db.getPool().query(sql, [days, limit]);
        return rows;
    }
}