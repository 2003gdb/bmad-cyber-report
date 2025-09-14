import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getRoot', () => {
    it('should return root message', () => {
      const result = 'SafeTrade API - Sistema de Reportes de Ciberseguridad';
      jest.spyOn(appService, 'getRoot').mockImplementation(() => result);

      expect(appController.getRoot()).toBe(result);
    });
  });

  describe('getHealth', () => {
    it('should return health check object', () => {
      const mockHealthInfo = {
        status: 'ok',
        timestamp: '2025-01-14T12:00:00.000Z',
        service: 'SafeTrade Backend API',
        version: '1.0.0',
      };

      jest.spyOn(appService, 'getHealth').mockImplementation(() => mockHealthInfo);

      const result = appController.getHealth();
      expect(result).toEqual(mockHealthInfo);
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'SafeTrade Backend API');
    });
  });
});