import { Controller, Get } from '@nestjs/common';
import { AppService } from '../app.service';

// This controller handles the API root route
// It provides basic API information and health status
@Controller()
export class ApiController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiRoot(): string {
    return this.appService.getRoot();
  }
}