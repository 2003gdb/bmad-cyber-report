import { Body, Controller, Get, Post, Param, UseGuards, Req, Query } from "@nestjs/common";
import { ReportesService } from "./reportes.service";
import { CrearReporteDto } from "./dto/crear-reporte.dto";
import { AnonymousAuthGuard } from "src/common/guards/anonymous-auth.guard";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";
import { ApiBearerAuth, ApiResponse, ApiTags, ApiQuery, ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ReportFilterDto {
    @ApiProperty({ example: "nuevo", required: false })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({ example: "email", required: false })
    @IsOptional()
    @IsString()
    attack_type?: string;

    @ApiProperty({ example: "true", required: false })
    @IsOptional()
    @IsString()
    is_anonymous?: string;

    @ApiProperty({ example: "2025-01-01", required: false })
    @IsOptional()
    @IsString()
    date_from?: string;

    @ApiProperty({ example: "2025-12-31", required: false })
    @IsOptional()
    @IsString()
    date_to?: string;

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiProperty({ example: 10, required: false })
    @IsOptional()
    @IsString()
    limit?: string;
}

@ApiTags('Reportes de Incidentes')
@Controller('reportes')
export class ReportesController {
    constructor(
        private readonly reportesService: ReportesService
    ) {}

    @Post()
    @UseGuards(AnonymousAuthGuard) // Allows both anonymous and authenticated users
    @ApiResponse({ status: 201, description: 'Reporte creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos del reporte inválidos' })
    async createReporte(
        @Body() crearReporteDto: CrearReporteDto,
        @Req() req: AuthenticatedRequest
    ) {
        try {
            // Determine if user is authenticated or anonymous
            const isAuthenticated = req.user.userId !== "anonymous";
            const userId = isAuthenticated ? parseInt(req.user.userId) : null;

            // Create report data
            const isAnonymousReport = crearReporteDto.is_anonymous ?? !isAuthenticated;
            const reporteData = {
                user_id: isAnonymousReport ? null : userId, // NULL for anonymous reports
                is_anonymous: isAnonymousReport,
                attack_type: crearReporteDto.attack_type,
                incident_date: crearReporteDto.incident_date,
                incident_time: crearReporteDto.incident_time,
                attack_origin: crearReporteDto.attack_origin,
                suspicious_url: crearReporteDto.suspicious_url,
                message_content: crearReporteDto.message_content,
                impact_level: crearReporteDto.impact_level,
                description: crearReporteDto.description,
            };

            const reporte = await this.reportesService.createReporte(reporteData);

            if (!reporte) {
                return {
                    success: false,
                    message: "Error al crear el reporte"
                };
            }

            // Generate victim support if impact was suffered
            let victimSupport = null;
            if (reporte.impact_level !== 'ninguno') {
                victimSupport = await this.reportesService.getVictimSupport(reporte);
            }

            return {
                success: true,
                message: "Reporte creado exitosamente",
                reporte: {
                    id: reporte.id,
                    user_id: reporte.user_id,
                    is_anonymous: reporte.is_anonymous,
                    attack_type: reporte.attack_type,
                    incident_date: reporte.incident_date,
                    incident_time: reporte.incident_time,
                    attack_origin: reporte.attack_origin,
                    suspicious_url: reporte.suspicious_url,
                    message_content: reporte.message_content,
                    impact_level: reporte.impact_level,
                    description: reporte.description,
                    status: reporte.status,
                    created_at: reporte.created_at
                },
                victim_support: victimSupport
            };

        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Error interno del servidor",
                error: process.env.NODE_ENV === 'development' ? error : undefined
            };
        }
    }

    @Get('catalogs')
    @UseGuards(AnonymousAuthGuard)
    @ApiResponse({ status: 200, description: 'Datos de catálogos para formularios' })
    async getCatalogs() {
        try {
            const catalogs = await this.reportesService.getCatalogData();
            return {
                success: true,
                data: catalogs
            };
        } catch (error) {
            return {
                success: false,
                message: "Error al obtener catálogos",
                error: process.env.NODE_ENV === 'development' ? error : undefined
            };
        }
    }

    @Get('user/mis-reportes')
    @UseGuards(JwtAuthGuard) // Requires authentication
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Reportes del usuario obtenidos exitosamente' })
    @ApiResponse({ status: 401, description: 'Token de autenticación requerido' })
    async getUserReports(@Req() req: AuthenticatedRequest) {
        const userId = parseInt(req.user.userId);
        const reports = await this.reportesService.getUserReports(userId);

        // Convert is_anonymous from TINYINT(0/1) to Boolean
        const convertedReports = reports.map(reporte => ({
            ...reporte,
            is_anonymous: Boolean(reporte.is_anonymous)
        }));

        return {
            success: true,
            message: "Reportes obtenidos exitosamente",
            reportes: convertedReports,
            total: convertedReports.length
        };
    }

    @Get()
    @UseGuards(AnonymousAuthGuard) // Allow both anonymous and authenticated users
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'attack_type', required: false })
    @ApiQuery({ name: 'is_anonymous', required: false })
    @ApiQuery({ name: 'date_from', required: false })
    @ApiQuery({ name: 'date_to', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({ status: 200, description: 'Lista de todos los reportes obtenida exitosamente' })
    @ApiResponse({ status: 400, description: 'Parámetros de consulta inválidos' })
    async getAllReports(@Query() filters: ReportFilterDto) {
        const paginatedResult = await this.reportesService.getAllReports(filters);

        // Convert is_anonymous from TINYINT(0/1) to Boolean
        const convertedReports = paginatedResult.reports.map(reporte => ({
            ...reporte,
            is_anonymous: Boolean(reporte.is_anonymous)
        }));

        // Return in PaginatedResponse format expected by frontend
        return {
            data: convertedReports,  // Changed from 'reportes' to 'data'
            total: paginatedResult.total,
            page: paginatedResult.page,
            limit: paginatedResult.limit,
            totalPages: paginatedResult.totalPages
        };
    }

    @Get(':id')
    @UseGuards(AnonymousAuthGuard) // Allow anonymous access to view reports
    @ApiResponse({ status: 200, description: 'Reporte obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
    async getReporte(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        const reporteId = parseInt(id);
        const reporte = await this.reportesService.getReporteById(reporteId);

        if (!reporte) {
            return {
                success: false,
                message: "Reporte no encontrado"
            };
        }

        // Don't expose sensitive information in anonymous reports
        const safeReporte = {
            id: reporte.id,
            attack_type: reporte.attack_type,
            incident_date: reporte.incident_date,
            incident_time: reporte.incident_time,
            impact_level: reporte.impact_level,
            description: reporte.description,
            status: reporte.status,
            created_at: reporte.created_at,
            // Only show user info for identified reports and if user owns it
            user_info: reporte.is_anonymous ? null : (
                req.user.userId === reporte.user_id?.toString() ? {
                    email: reporte.user_email,
                    name: reporte.user_name
                } : null
            )
        };

        return {
            success: true,
            reporte: safeReporte
        };
    }
}