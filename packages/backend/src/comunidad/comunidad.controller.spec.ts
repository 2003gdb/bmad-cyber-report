import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ComunidadController } from './comunidad.controller';
import { ComunidadService } from './comunidad.service';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request';

describe('ComunidadController', () => {
  let controller: ComunidadController;
  let mockComunidadService: jest.Mocked<ComunidadService>;

  beforeEach(async () => {
    const mockService = {
      getTendencias: jest.fn(),
      getAnalytics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComunidadController],
      providers: [
        {
          provide: ComunidadService,
          useValue: mockService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ComunidadController>(ComunidadController);
    mockComunidadService = module.get(ComunidadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTendencias', () => {
    const mockRequest = {
      user: {
        userId: 'anonymous',
        profile: { id: 1, email: 'test@example.com', name: 'Test User' },
        raw: { sub: 'anonymous', type: 'access' as const, profile: { id: 1, email: 'test@example.com', name: 'Test User' } }
      },
    } as AuthenticatedRequest;

    it('should return trends data successfully', async () => {
      // Arrange
      const mockTrendsData = {
        period: '30days' as const,
        community_stats: {
          total_reports: 150,
          active_period: '30 días',
          most_common_attack: 'email',
          highest_impact_count: 30,
          anonymous_percentage: 75,
        },
        attack_trends: [],
        impact_trends: [],
        time_trends: [],
        summary: {
          main_threat: 'Correo Electrónico',
          main_impact: 'Robo de Datos',
          total_reports: 150,
          community_alert_level: 'medio' as const,
          key_insight: 'Test insight',
        },
      };

      mockComunidadService.getTendencias.mockResolvedValue(mockTrendsData);

      // Act
      const result = await controller.getTendencias('30days', mockRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Tendencias comunitarias de los últimos 30 días');
      expect(result.data).toEqual(mockTrendsData);
      expect(result.user_context?.access_type).toBe('anónimo');
      expect(mockComunidadService.getTendencias).toHaveBeenCalledWith('30days');
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      mockComunidadService.getTendencias.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await controller.getTendencias('30days', mockRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Error al obtener tendencias comunitarias');
    });
  });


  describe('getAnalytics', () => {
    const mockRequest = {
      user: {
        userId: 'anonymous',
        profile: { id: 1, email: 'test@example.com', name: 'Test User' },
        raw: { sub: 'anonymous', type: 'access' as const, profile: { id: 1, email: 'test@example.com', name: 'Test User' } }
      },
    } as AuthenticatedRequest;

    it('should return analytics successfully', async () => {
      // Arrange
      const mockAnalytics = {
        community_overview: {
          total_reports: 200,
          active_period: '30 días',
          most_common_attack: 'email',
          highest_impact_count: 50,
          anonymous_percentage: 80,
        },
        recent_trends: [],
        suspicious_origins: [],
        insights: ['Community is active'],
      };

      mockComunidadService.getAnalytics.mockResolvedValue(mockAnalytics);

      // Act
      const result = await controller.getAnalytics(mockRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Analytics comunitarios obtenidos exitosamente');
      expect(result.data).toEqual(mockAnalytics);
    });
  });

  describe('getAlertaComunitaria', () => {
    it('should return community alert successfully', async () => {
      // Arrange
      const mockTendencias = {
        period: '7days' as const,
        community_stats: {
          total_reports: 100,
          active_period: '7 días',
          most_common_attack: 'email',
          highest_impact_count: 25,
          anonymous_percentage: 70,
        },
        attack_trends: [{ attack_type: 'email', count: 40, percentage: 40.0 }],
        impact_trends: [],
        time_trends: [],
        summary: {
          main_threat: 'Correo Electrónico',
          main_impact: 'Robo de Datos',
          total_reports: 100,
          community_alert_level: 'medio' as const,
          key_insight: 'Test insight',
        },
      };

      const mockAnalytics = {
        community_overview: {
          total_reports: 100,
          active_period: '30 días',
          most_common_attack: 'email',
          highest_impact_count: 25,
          anonymous_percentage: 70,
        },
        recent_trends: [],
        suspicious_origins: [],
        insights: [],
      };

      mockComunidadService.getTendencias.mockResolvedValue(mockTendencias);
      mockComunidadService.getAnalytics.mockResolvedValue(mockAnalytics);

      // Act
      const result = await controller.getAlertaComunitaria();

      // Assert
      expect(result.success).toBe(true);
      expect(result.alerta).toBeDefined();
      expect(result.alerta?.nivel).toBeDefined();
      expect(result.alerta?.mensaje).toBeDefined();
      expect(result.stats?.reportes_recientes).toBe(100);
    });
  });
});