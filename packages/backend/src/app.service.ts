import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  getRoot(): string {
    return 'SafeTrade API - Sistema de Reportes de Ciberseguridad';
  }

  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'SafeTrade Backend API',
      version: '1.0.0',
    };
  }
}