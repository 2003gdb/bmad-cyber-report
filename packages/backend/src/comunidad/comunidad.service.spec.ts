import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadService } from './comunidad.service';
import { ComunidadRepository } from './comunidad.repository';
import { ReportesService } from '../reportes/reportes.service';

describe('ComunidadService', () => {
  let service: ComunidadService;
  let mockComunidadRepository: jest.Mocked<ComunidadRepository>;
  let _mockReportesService: jest.Mocked<ReportesService>;

  beforeEach(async () => {
    const mockRepository = {
      getAttackTypeTrends: jest.fn(),
      getImpactLevelTrends: jest.fn(),
      getTimeBasedTrends: jest.fn(),
      getCommunityStats: jest.fn(),
      getSimilarReports: jest.fn(),
      getTopSuspiciousOrigins: jest.fn(),
    };

    const mockReportsService = {
      getReporteById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunidadService,
        {
          provide: ComunidadRepository,
          useValue: mockRepository,
        },
        {
          provide: ReportesService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    service = module.get<ComunidadService>(ComunidadService);
    mockComunidadRepository = module.get(ComunidadRepository) as jest.Mocked<ComunidadRepository>;
    _mockReportesService = module.get(ReportesService) as jest.Mocked<ReportesService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTendencias', () => {
    it('should return comprehensive trends data', async () => {
      // Arrange
      const mockAttackTrends = [
        { attack_type: 'email', count: 15, percentage: 30.0 },
        { attack_type: 'SMS', count: 10, percentage: 20.0 },
      ];

      const mockImpactTrends = [
        { attack_type: 'robo_datos', count: 12, percentage: 24.0 },
        { attack_type: 'ninguno', count: 18, percentage: 36.0 },
      ];

      const mockTimeTrends = [
        { date: '2025-01-10', count: 5 },
        { date: '2025-01-11', count: 8 },
      ];

      const mockStats = {
        total_reports: 50,
        active_period: '30 días',
        most_common_attack: 'email',
        highest_impact_count: 12,
        anonymous_percentage: 60,
      };

      mockComunidadRepository.getAttackTypeTrends.mockResolvedValue(mockAttackTrends);
      mockComunidadRepository.getImpactLevelTrends.mockResolvedValue(mockImpactTrends);
      mockComunidadRepository.getTimeBasedTrends.mockResolvedValue(mockTimeTrends);
      mockComunidadRepository.getCommunityStats.mockResolvedValue(mockStats);

      // Act
      const result = await service.getTendencias('30days');

      // Assert
      expect(result.period).toBe('30days');
      expect(result.community_stats).toEqual(mockStats);
      expect(result.attack_trends).toHaveLength(2);
      expect(result.impact_trends).toHaveLength(2);
      expect(result.time_trends).toEqual(mockTimeTrends);
      expect(result.summary).toBeDefined();
      expect(result.summary.total_reports).toBe(50);
    });

    it('should handle high risk scenarios', async () => {
      // Arrange
      const mockAttackTrends = [
        { attack_type: 'email', count: 40, percentage: 80.0 },
      ];

      const mockImpactTrends = [
        { attack_type: 'robo_dinero', count: 30, percentage: 60.0 },
      ];

      const mockStats = {
        total_reports: 50,
        active_period: '30 días',
        most_common_attack: 'email',
        highest_impact_count: 30,
        anonymous_percentage: 40,
      };

      mockComunidadRepository.getAttackTypeTrends.mockResolvedValue(mockAttackTrends);
      mockComunidadRepository.getImpactLevelTrends.mockResolvedValue(mockImpactTrends);
      mockComunidadRepository.getTimeBasedTrends.mockResolvedValue([]);
      mockComunidadRepository.getCommunityStats.mockResolvedValue(mockStats);

      // Act
      const result = await service.getTendencias();

      // Assert
      expect(result.summary.community_alert_level).toBe('alto');
    });
  });

  describe('getAnalytics', () => {
    it('should return comprehensive community analytics', async () => {
      // Arrange
      const mockStats = {
        total_reports: 100,
        active_period: '30 días',
        most_common_attack: 'email',
        highest_impact_count: 25,
        anonymous_percentage: 70,
      };

      const mockTrends = [
        { attack_type: 'email', count: 30, percentage: 30.0 },
        { attack_type: 'SMS', count: 20, percentage: 20.0 },
      ];

      const mockOrigins = [
        { attack_origin: 'spam@malicious.com', report_count: 5, attack_types: 'email' },
        { attack_origin: '+5551234567', report_count: 3, attack_types: 'SMS' },
      ];

      mockComunidadRepository.getCommunityStats.mockResolvedValue(mockStats);
      mockComunidadRepository.getAttackTypeTrends.mockResolvedValue(mockTrends);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockComunidadRepository.getTopSuspiciousOrigins.mockResolvedValue(mockOrigins as any);

      // Act
      const result = await service.getAnalytics();

      // Assert
      expect(result.community_overview).toEqual(mockStats);
      expect(result.recent_trends).toHaveLength(2);
      expect(result.suspicious_origins).toEqual(mockOrigins);
      expect(result.insights).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
    });
  });

  describe('Translation functions', () => {
    it('should properly translate attack types to Spanish', async () => {
      // Arrange
      const mockTrends = [
        { attack_type: 'email', count: 10, percentage: 20.0 },
        { attack_type: 'SMS', count: 15, percentage: 30.0 },
        { attack_type: 'whatsapp', count: 8, percentage: 16.0 },
      ];

      mockComunidadRepository.getAttackTypeTrends.mockResolvedValue(mockTrends);
      mockComunidadRepository.getImpactLevelTrends.mockResolvedValue([]);
      mockComunidadRepository.getTimeBasedTrends.mockResolvedValue([]);
      mockComunidadRepository.getCommunityStats.mockResolvedValue({
        total_reports: 33,
        active_period: '30 días',
        most_common_attack: 'SMS',
        highest_impact_count: 5,
        anonymous_percentage: 50,
      });

      // Act
      const result = await service.getTendencias();

      // Assert
      expect(result.attack_trends[0].attack_type).toBe('Correo Electrónico'); // email translated
      expect(result.attack_trends[1].attack_type).toBe('Mensajes SMS'); // SMS translated
      expect(result.attack_trends[2].attack_type).toBe('WhatsApp'); // whatsapp translated
    });
  });

  describe('Error handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Arrange
      mockComunidadRepository.getAttackTypeTrends.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.getTendencias()).rejects.toThrow('Database connection failed');
    });
  });
});