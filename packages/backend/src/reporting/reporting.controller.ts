import { Controller, Get } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reportes')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get()
  getReportes() {
    return { message: 'Reportes endpoint - Coming soon' };
  }

  // TODO: Implement additional reporting endpoints in future stories
}