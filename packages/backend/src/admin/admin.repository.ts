import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export interface ReportFilters {
    status?: string;
    attack_type?: string;
    is_anonymous?: string;
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

export interface EnhancedDashboardStats {
    total_reports: number;
    reports_today: number;
    reports_this_week: number;
    reports_this_month: number;
    critical_reports: number;
    pending_reports: number;
    resolved_reports: number;
    anonymous_reports: number;
    identified_reports: number;
    status_distribution: { status: string; count: number; percentage: number }[];
    attack_types: { attack_type: string; count: number; percentage: number }[];
    impact_distribution: { impact_level: string; count: number; percentage: number }[];
    weekly_trends: { week_start: string; count: number }[];
    monthly_trends: { month: string; count: number }[];
    response_times: {
        avg_resolution_time: number;
        avg_first_response_time: number;
    };
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

    async getFilteredReports(filters: ReportFilters): Promise<unknown[]> {
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
                r.updated_at,
                u.email as user_email,
                u.name as user_name
            FROM reportes r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE 1=1
        `;

        const params: (string | number)[] = [];

        if (filters.status) {
            sql += ` AND r.status = ?`;
            params.push(filters.status);
        }

        if (filters.attack_type) {
            sql += ` AND r.attack_type = ?`;
            params.push(filters.attack_type);
        }

        if (filters.is_anonymous !== undefined) {
            const isAnonymous = filters.is_anonymous === 'true';
            sql += ` AND r.is_anonymous = ?`;
            params.push(isAnonymous ? 1 : 0);
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
        return rows as unknown[];
    }

    async updateReportStatus(reportId: number, status: string, adminNotes?: string): Promise<Record<string, unknown> | null> {
        let sql = `UPDATE reportes SET status = ?, updated_at = CURRENT_TIMESTAMP`;
        const params: (string | number)[] = [status];

        if (adminNotes) {
            sql += `, admin_notes = ?`;
            params.push(adminNotes);
        }

        sql += ` WHERE id = ?`;
        params.push(reportId.toString());

        const [result] = await this.db.getPool().query(sql, params);
        const updateResult = result as { affectedRows: number };

        // If update was successful, return the updated report
        if (updateResult.affectedRows > 0) {
            return await this.getReportById(reportId);
        }

        return null;
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
        const result = rows as Record<string, unknown>[];
        return result[0] || null;
    }

    async getEnhancedDashboardStats(): Promise<EnhancedDashboardStats> {
        // Get basic counts
        const totalSql = `SELECT COUNT(*) as count FROM reportes`;
        const [totalRows] = await this.db.getPool().query(totalSql);
        const totalResult = totalRows as { count: number }[];

        // Get reports today
        const todaySql = `SELECT COUNT(*) as count FROM reportes WHERE DATE(created_at) = CURDATE()`;
        const [todayRows] = await this.db.getPool().query(todaySql);
        const todayResult = todayRows as { count: number }[];

        // Get reports this week
        const weekSql = `SELECT COUNT(*) as count FROM reportes WHERE YEARWEEK(created_at) = YEARWEEK(NOW())`;
        const [weekRows] = await this.db.getPool().query(weekSql);
        const weekResult = weekRows as { count: number }[];

        // Get reports this month
        const monthSql = `SELECT COUNT(*) as count FROM reportes WHERE YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())`;
        const [monthRows] = await this.db.getPool().query(monthSql);
        const monthResult = monthRows as { count: number }[];

        // Get critical reports
        const criticalSql = `SELECT COUNT(*) as count FROM reportes WHERE impact_level IN ('robo_datos', 'robo_dinero', 'cuenta_comprometida')`;
        const [criticalRows] = await this.db.getPool().query(criticalSql);
        const criticalResult = criticalRows as { count: number }[];

        // Get pending reports
        const pendingSql = `SELECT COUNT(*) as count FROM reportes WHERE status = 'nuevo'`;
        const [pendingRows] = await this.db.getPool().query(pendingSql);
        const pendingResult = pendingRows as { count: number }[];

        // Get resolved reports
        const resolvedSql = `SELECT COUNT(*) as count FROM reportes WHERE status = 'cerrado'`;
        const [resolvedRows] = await this.db.getPool().query(resolvedSql);
        const resolvedResult = resolvedRows as { count: number }[];

        // Get anonymous vs identified reports
        const anonymousSql = `SELECT COUNT(*) as count FROM reportes WHERE is_anonymous = true`;
        const [anonymousRows] = await this.db.getPool().query(anonymousSql);
        const anonymousResult = anonymousRows as { count: number }[];

        const identifiedSql = `SELECT COUNT(*) as count FROM reportes WHERE is_anonymous = false`;
        const [identifiedRows] = await this.db.getPool().query(identifiedSql);
        const identifiedResult = identifiedRows as { count: number }[];

        // Get status distribution
        const statusSql = `SELECT status, COUNT(*) as count FROM reportes GROUP BY status`;
        const [statusRows] = await this.db.getPool().query(statusSql);
        const statusData = statusRows as { status: string; count: number }[];

        const totalReports = totalResult[0].count;
        const statusDistribution = statusData.map(row => ({
            status: row.status,
            count: row.count,
            percentage: totalReports > 0 ? Math.round((row.count / totalReports) * 100) : 0
        }));

        // Get attack types distribution
        const attackTypesSql = `SELECT attack_type, COUNT(*) as count FROM reportes GROUP BY attack_type ORDER BY count DESC`;
        const [attackTypesRows] = await this.db.getPool().query(attackTypesSql);
        const attackTypesData = attackTypesRows as { attack_type: string; count: number }[];

        const attackTypes = attackTypesData.map(row => ({
            attack_type: row.attack_type,
            count: row.count,
            percentage: totalReports > 0 ? Math.round((row.count / totalReports) * 100) : 0
        }));

        // Get impact distribution
        const impactSql = `SELECT impact_level, COUNT(*) as count FROM reportes GROUP BY impact_level`;
        const [impactRows] = await this.db.getPool().query(impactSql);
        const impactData = impactRows as { impact_level: string; count: number }[];

        const impactDistribution = impactData.map(row => ({
            impact_level: row.impact_level,
            count: row.count,
            percentage: totalReports > 0 ? Math.round((row.count / totalReports) * 100) : 0
        }));

        // Get weekly trends (last 8 weeks)
        const weeklyTrendsSql = `
            SELECT
                DATE(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as week_start,
                COUNT(*) as count
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
            GROUP BY week_start
            ORDER BY week_start DESC
        `;
        const [weeklyRows] = await this.db.getPool().query(weeklyTrendsSql);
        const weeklyTrends = weeklyRows as { week_start: string; count: number }[];

        // Get monthly trends (last 6 months)
        const monthlyTrendsSql = `
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM reportes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month
            ORDER BY month DESC
        `;
        const [monthlyRows] = await this.db.getPool().query(monthlyTrendsSql);
        const monthlyTrends = monthlyRows as { month: string; count: number }[];

        // Calculate response times (simplified)
        const responseTimesSql = `
            SELECT
                AVG(DATEDIFF(updated_at, created_at)) as avg_resolution_time
            FROM reportes
            WHERE status = 'cerrado' AND updated_at IS NOT NULL
        `;
        const [responseRows] = await this.db.getPool().query(responseTimesSql);
        const responseResult = responseRows as { avg_resolution_time: number }[];

        return {
            total_reports: totalReports,
            reports_today: todayResult[0].count,
            reports_this_week: weekResult[0].count,
            reports_this_month: monthResult[0].count,
            critical_reports: criticalResult[0].count,
            pending_reports: pendingResult[0].count,
            resolved_reports: resolvedResult[0].count,
            anonymous_reports: anonymousResult[0].count,
            identified_reports: identifiedResult[0].count,
            status_distribution: statusDistribution,
            attack_types: attackTypes,
            impact_distribution: impactDistribution,
            weekly_trends: weeklyTrends,
            monthly_trends: monthlyTrends,
            response_times: {
                avg_resolution_time: responseResult[0]?.avg_resolution_time || 0,
                avg_first_response_time: 0 // Simplified for now
            }
        };
    }
}