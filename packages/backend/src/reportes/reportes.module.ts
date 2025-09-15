/* eslint-disable prettier/prettier */

import { Module } from "@nestjs/common";
import { ReportesController } from "./reportes.controller";
import { ReportesService } from "./reportes.service";
import { ReportesRepository } from "./reportes.repository";

@Module({
    controllers: [ReportesController],
    providers: [ReportesService, ReportesRepository],
    exports: [ReportesService, ReportesRepository], // Export for comunidad module
})
export class ReportesModule {}