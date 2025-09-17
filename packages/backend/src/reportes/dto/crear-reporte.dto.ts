
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsDateString, IsIn } from "class-validator";

export class CrearReporteDto {
    @ApiProperty({
        example: true,
        description: "Si el reporte es anónimo o identificado",
        required: false,
        default: true
    })
    @IsOptional()
    @IsBoolean({ message: "is_anonymous debe ser un valor booleano" })
    is_anonymous?: boolean;

    @ApiProperty({
        example: "email",
        enum: ["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"],
        description: "Tipo de ataque cibernético",
        required: true
    })
    @IsString({ message: "El tipo de ataque debe ser una cadena válida" })
    @IsIn(["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"], { message: "Tipo de ataque no válido" })
    attack_type!: string;

    @ApiProperty({
        example: "2025-01-15",
        description: "Fecha cuando ocurrió el ataque (YYYY-MM-DD)",
        required: true
    })
    @IsDateString({}, { message: "La fecha debe tener formato válido (YYYY-MM-DD)" })
    incident_date!: string;

    @ApiProperty({
        example: "14:30:00",
        description: "Hora cuando ocurrió el ataque (HH:MM:SS)",
        required: false
    })
    @IsOptional()
    @IsString({ message: "La hora debe ser una cadena válida" })
    incident_time?: string;

    @ApiProperty({
        example: "scammer@fake.com",
        description: "Número de teléfono o correo electrónico del atacante",
        required: true
    })
    @IsString({ message: "El origen del ataque debe ser una cadena válida" })
    attack_origin!: string;

    @ApiProperty({
        example: "https://fake-bank.com/login",
        description: "URL sospechosa relacionada con el ataque",
        required: false
    })
    @IsOptional()
    @IsString({ message: "La URL sospechosa debe ser una cadena válida" })
    suspicious_url?: string;

    @ApiProperty({
        example: "Recibí un correo que decía que mi cuenta bancaria sería bloqueada...",
        description: "Contenido original del mensaje del atacante",
        required: false
    })
    @IsOptional()
    @IsString({ message: "El contenido del mensaje debe ser una cadena válida" })
    message_content?: string;

    @ApiProperty({
        example: "ninguno",
        enum: ["ninguno", "robo_datos", "robo_dinero", "cuenta_comprometida"],
        description: "Nivel de impacto sufrido",
        required: true
    })
    @IsString({ message: "El nivel de impacto debe ser una cadena válida" })
    @IsIn(["ninguno", "robo_datos", "robo_dinero", "cuenta_comprometida"], { message: "Nivel de impacto no válido" })
    impact_level!: string;

    @ApiProperty({
        example: "Intentaron robar mis credenciales bancarias mediante un correo de phishing muy convincente",
        description: "Descripción detallada del incidente",
        required: false
    })
    @IsOptional()
    @IsString({ message: "La descripción debe ser una cadena válida" })
    description?: string;
}