/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Post, Param, UseGuards, Req, Query } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminAuthGuard } from "src/common/guards/admin-auth.guard";
import { AuthService } from "src/auth/auth.service";
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";
import { ApiBearerAuth, ApiResponse, ApiTags, ApiProperty, ApiQuery } from "@nestjs/swagger";

export class AdminLoginDto {
    @ApiProperty({ example: "admin@safetrade.com", required: true })
    email: string;

    @ApiProperty({ example: "admin123", required: true })
    password: string;
}

export class ReportFilterDto {
    @ApiProperty({ example: "nuevo", required: false })
    status?: string;

    @ApiProperty({ example: "email", required: false })
    attack_type?: string;

    @ApiProperty({ example: "2025-01-01", required: false })
    date_from?: string;

    @ApiProperty({ example: "2025-12-31", required: false })
    date_to?: string;
}

@ApiTags('Administración')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly authService: AuthService
    ) {}

    @Post('login')
    @ApiResponse({ status: 200, description: 'Login de administrador exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales de administrador inválidas' })
    async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
        return this.authService.loginAdmin(adminLoginDto.email, adminLoginDto.password);
    }

    @Get('users/list')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
    @ApiResponse({ status: 401, description: 'Token de administrador requerido' })
    @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
    async getUsersList(@Req() req: AuthenticatedRequest) {
        const users = await this.adminService.getAllUsers();
        return {
            success: true,
            message: "Lista de usuarios obtenida exitosamente",
            users: users,
            total: users.length
        };
    }

    @Get('users/:id')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 401, description: 'Token de administrador requerido' })
    async getUserById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const userId = parseInt(id);
        const user = await this.adminService.getUserById(userId);

        if (!user) {
            return {
                success: false,
                message: "Usuario no encontrado"
            };
        }

        return {
            success: true,
            user: user
        };
    }

    @Get('dashboard')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Estadísticas del dashboard obtenidas exitosamente' })
    async getDashboard(@Req() req: AuthenticatedRequest) {
        const stats = await this.adminService.getDashboardStats();
        return {
            success: true,
            stats: stats
        };
    }

    @Get('reportes')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'attack_type', required: false })
    @ApiQuery({ name: 'date_from', required: false })
    @ApiQuery({ name: 'date_to', required: false })
    @ApiResponse({ status: 200, description: 'Lista de reportes obtenida exitosamente' })
    async getReportes(@Query() filters: ReportFilterDto, @Req() req: AuthenticatedRequest) {
        const reports = await this.adminService.getFilteredReports(filters);
        return {
            success: true,
            message: "Lista de reportes obtenida exitosamente",
            reportes: reports,
            total: reports.length
        };
    }
}