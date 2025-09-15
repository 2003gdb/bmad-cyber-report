import { Controller, Get } from '@nestjs/common';
import { AppService } from '../app.service';

// This controller will be excluded from global prefix
@Controller()
export class HealthController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): string {
    return this.appService.getRoot();
  }

  @Get('health')
  getHealth(): object {
    return this.appService.getHealth();
  }
}