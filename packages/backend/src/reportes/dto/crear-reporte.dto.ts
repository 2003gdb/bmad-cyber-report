/* eslint-disable prettier/prettier */

import { ApiProperty } from "@nestjs/swagger";

export class CrearReporteDto {
    @ApiProperty({
        example: true,
        description: "Si el reporte es anónimo o identificado",
        required: false,
        default: true
    })
    is_anonymous?: boolean;

    @ApiProperty({
        example: "email",
        enum: ["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"],
        description: "Tipo de ataque cibernético",
        required: true
    })
    attack_type: string;

    @ApiProperty({
        example: "2025-01-15",
        description: "Fecha cuando ocurrió el ataque (YYYY-MM-DD)",
        required: true
    })
    incident_date: string;

    @ApiProperty({
        example: "14:30:00",
        description: "Hora cuando ocurrió el ataque (HH:MM:SS)",
        required: false
    })
    incident_time?: string;

    @ApiProperty({
        example: "scammer@fake.com",
        description: "Número de teléfono o correo electrónico del atacante",
        required: true
    })
    attack_origin: string;

    @ApiProperty({
        example: "https://fake-bank.com/login",
        description: "URL sospechosa relacionada con el ataque",
        required: false
    })
    suspicious_url?: string;

    @ApiProperty({
        example: "Recibí un correo que decía que mi cuenta bancaria sería bloqueada...",
        description: "Contenido original del mensaje del atacante",
        required: false
    })
    message_content?: string;

    @ApiProperty({
        example: "ninguno",
        enum: ["ninguno", "robo_datos", "robo_dinero", "cuenta_comprometida"],
        description: "Nivel de impacto sufrido",
        required: true
    })
    impact_level: string;

    @ApiProperty({
        example: "Intentaron robar mis credenciales bancarias mediante un correo de phishing muy convincente",
        description: "Descripción detallada del incidente",
        required: false
    })
    description?: string;
}