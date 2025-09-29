/**
 * Create Report DTO - Updated for Normalized Schema
 *
 * Handles both legacy enum values and new foreign key IDs
 * for backward compatibility during migration.
 */

import {
  IsBoolean,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
  ValidateIf,
  IsUrl
} from 'class-validator';

export class CrearReporteV2Dto {
  @IsBoolean()
  is_anonymous!: boolean;

  // Accept either legacy enum or new foreign key ID
  @ValidateIf((o) => typeof o.attack_type === 'string')
  @IsIn(['email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro'])
  @ValidateIf((o) => typeof o.attack_type === 'number')
  @IsNumber()
  attack_type!: string | number;

  @IsDateString()
  incident_date!: string;

  @IsOptional()
  @IsString()
  attack_origin?: string;

  @IsOptional()
  @IsUrl()
  evidence_url?: string; // URL to evidence files/screenshots

  @IsOptional()
  @IsUrl()
  suspicious_url?: string; // Malicious URL related to attack

  @IsOptional()
  @IsString()
  message_content?: string; // Original attack message

  @IsOptional()
  @IsString()
  description?: string;

  // Accept either legacy enum or new foreign key ID
  @ValidateIf((o) => typeof o.impact === 'string')
  @IsIn(['ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida'])
  @ValidateIf((o) => typeof o.impact === 'number')
  @IsNumber()
  impact!: string | number;
}

// Legacy DTO for backward compatibility
export class CrearReporteLegacyDto {
  @IsBoolean()
  is_anonymous!: boolean;

  @IsIn(['email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro'])
  attack_type!: string;

  @IsString()
  incident_date!: string;

  @IsOptional()
  @IsString()
  incident_time?: string;

  @IsString()
  attack_origin!: string;

  @IsOptional()
  @IsUrl()
  suspicious_url?: string;

  @IsOptional()
  @IsString()
  message_content?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida'])
  impact_level!: string;
}

// New normalized DTO
export class CrearReporteNormalizedDto {
  @IsBoolean()
  is_anonymous!: boolean;

  @IsNumber()
  attack_type!: number; // Foreign key to attack_types.id

  @IsDateString()
  incident_date!: string; // ISO timestamp

  @IsOptional()
  @IsString()
  attack_origin?: string;

  @IsOptional()
  @IsUrl()
  evidence_url?: string;

  @IsOptional()
  @IsUrl()
  suspicious_url?: string;

  @IsOptional()
  @IsString()
  message_content?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  impact!: number; // Foreign key to impacts.id
}

// Update DTO for admin modifications
export class UpdateReporteDto {
  @IsOptional()
  @IsNumber()
  attack_type?: number;

  @IsOptional()
  @IsDateString()
  incident_date?: string;

  @IsOptional()
  @IsString()
  attack_origin?: string;

  @IsOptional()
  @IsUrl()
  evidence_url?: string;

  @IsOptional()
  @IsUrl()
  suspicious_url?: string;

  @IsOptional()
  @IsString()
  message_content?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  impact?: number;

  @IsOptional()
  @IsNumber()
  status?: number; // Foreign key to status.id

  @IsOptional()
  @IsString()
  admin_notes?: string;
}

// Filter DTO for querying reports
export class ReportFilterDto {
  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsNumber()
  attack_type?: number;

  @IsOptional()
  @IsNumber()
  impact?: number;

  @IsOptional()
  @IsBoolean()
  is_anonymous?: boolean;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}