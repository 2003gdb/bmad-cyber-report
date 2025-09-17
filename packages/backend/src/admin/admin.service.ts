
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AdminRepository } from './admin.repository';

export interface ReportFilters {
    status?: string;
    attack_type?: string;
    date_from?: string;
    date_to?: string;
}

@Injectable()
export class AdminService {
    constructor(
        private readonly usersService: UsersService, // Reuse existing service
        private readonly adminRepository: AdminRepository,
    ) {}

    // User management methods (reusing UsersService)
    async getAllUsers() {
        const users = await this.usersService.findAll();
        // Remove sensitive data before returning
        return users.map(user => {
            const { password_hash: _password_hash, salt: _salt, ...safeUser } = user;
            return safeUser;
        });
    }

    async getUserById(id: number) {
        const user = await this.usersService.findById(id);
        if (user) {
            const { password_hash: _password_hash, salt: _salt, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }

    // Dashboard statistics
    async getDashboardStats() {
        const userCount = await this.adminRepository.getUserCount();
        const reportStats = await this.adminRepository.getReportStats();

        return {
            total_users: userCount,
            total_reports: reportStats.total_reports,
            reports_today: reportStats.reports_today,
            critical_reports: reportStats.critical_reports,
            pending_reports: reportStats.pending_reports,
            attack_types: reportStats.attack_types
        };
    }

    // Report management
    async getFilteredReports(filters: ReportFilters) {
        return this.adminRepository.getFilteredReports(filters);
    }

    async updateReportStatus(reportId: number, status: string, adminNotes?: string) {
        return this.adminRepository.updateReportStatus(reportId, status, adminNotes);
    }
}