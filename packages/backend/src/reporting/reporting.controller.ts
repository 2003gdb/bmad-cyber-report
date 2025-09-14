import { Controller } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reportes')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  // TODO: Implement reporting endpoints in future stories
}