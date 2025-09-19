
import { Module } from "@nestjs/common";
import { ReportesController } from "./reportes.controller";
import { ReportesService } from "./reportes.service";
import { ReportesRepository } from "./reportes.repository";
import { AdjuntosRepository } from "./adjuntos.repository";
import { ComunidadRepository } from "src/comunidad/comunidad.repository";

@Module({
    controllers: [ReportesController],
    providers: [ReportesService, ReportesRepository, AdjuntosRepository, ComunidadRepository],
    exports: [ReportesService, ReportesRepository, AdjuntosRepository], // Export for comunidad module
})
export class ReportesModule {}