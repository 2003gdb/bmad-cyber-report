import { Test, TestingModule } from '@nestjs/testing';
import { ComunidadRepository } from './comunidad.repository';
import { DbService } from '../db/db.service';

describe('ComunidadRepository', () => {
  let repository: ComunidadRepository;
  let mockDbService: jest.Mocked<DbService>;

  beforeEach(async () => {
    const mockDb = {
      getPool: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunidadRepository,
        {
          provide: DbService,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<ComunidadRepository>(ComunidadRepository);
    mockDbService = module.get(DbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAttackTypeTrends', () => {
    it('should return attack type trends for specified days', async () => {
      // Arrange
      const mockResults = [
        { attack_type: 'email', count: 15, percentage: 50.0 },
        { attack_type: 'whatsapp', count: 10, percentage: 33.33 },
        { attack_type: 'SMS', count: 5, percentage: 16.67 },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockResults]),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getAttackTypeTrends(30);

      // Assert
      expect(result).toEqual(mockResults);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('attack_type'),
        [30, 30]
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE_SUB(NOW(), INTERVAL ? DAY)'),
        [30, 30]
      );
    });

    it('should use default 30 days when no parameter provided', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getAttackTypeTrends();

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [30, 30]
      );
    });

    it('should handle different time periods correctly', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getAttackTypeTrends(7);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [7, 7]
      );
    });
  });

  describe('getImpactLevelTrends', () => {
    it('should return impact level trends with correct aliasing', async () => {
      // Arrange
      const mockResults = [
        { attack_type: 'robo_datos', count: 12, percentage: 40.0 },
        { attack_type: 'robo_dinero', count: 8, percentage: 26.67 },
        { attack_type: 'ninguno', count: 10, percentage: 33.33 },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockResults]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getImpactLevelTrends(30);

      // Assert
      expect(result).toEqual(mockResults);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('impact_level as attack_type'),
        [30, 30]
      );
    });

    it('should group by impact_level correctly', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getImpactLevelTrends(30);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY impact_level'),
        [30, 30]
      );
    });
  });

  describe('getTimeBasedTrends', () => {
    it('should return daily trends for specified period', async () => {
      // Arrange
      const mockResults = [
        { date: '2025-01-15', count: 5 },
        { date: '2025-01-16', count: 8 },
        { date: '2025-01-17', count: 12 },
        { date: '2025-01-18', count: 6 },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockResults]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getTimeBasedTrends(7);

      // Assert
      expect(result).toEqual(mockResults);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(created_at) as date'),
        [7]
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY date ASC'),
        [7]
      );
    });

    it('should use default 7 days for time trends', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getTimeBasedTrends();

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [7]
      );
    });
  });

  describe('getCommunityStats', () => {
    it('should return comprehensive community statistics', async () => {
      // Arrange
      const mockTotalResult = [{ total: 150 }];
      const mockMostCommonResult = [{ attack_type: 'email', count: 60 }];
      const mockHighImpactResult = [{ count: 45 }];
      const mockAnonymousResult = [{ anonymous_count: 105, total_count: 150 }];

      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce([mockTotalResult])
          .mockResolvedValueOnce([mockMostCommonResult])
          .mockResolvedValueOnce([mockHighImpactResult])
          .mockResolvedValueOnce([mockAnonymousResult]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getCommunityStats(30);

      // Assert
      expect(result).toEqual({
        total_reports: 150,
        active_period: '30 días',
        most_common_attack: 'email',
        highest_impact_count: 45,
        anonymous_percentage: 70, // 105/150 * 100 = 70%
      });

      expect(mockPool.query).toHaveBeenCalledTimes(4);
    });

    it('should handle zero reports gracefully', async () => {
      // Arrange
      const mockTotalResult = [{ total: 0 }];
      const mockMostCommonResult: { attack_type: string; count: number }[] = [];
      const mockHighImpactResult = [{ count: 0 }];
      const mockAnonymousResult = [{ anonymous_count: 0, total_count: 0 }];

      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce([mockTotalResult])
          .mockResolvedValueOnce([mockMostCommonResult])
          .mockResolvedValueOnce([mockHighImpactResult])
          .mockResolvedValueOnce([mockAnonymousResult]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getCommunityStats(30);

      // Assert
      expect(result.total_reports).toBe(0);
      expect(result.most_common_attack).toBe('N/A');
      expect(result.anonymous_percentage).toBe(0);
    });

    it('should calculate anonymous percentage correctly', async () => {
      // Arrange
      const mockTotalResult = [{ total: 200 }];
      const mockMostCommonResult = [{ attack_type: 'whatsapp', count: 80 }];
      const mockHighImpactResult = [{ count: 30 }];
      const mockAnonymousResult = [{ anonymous_count: 170, total_count: 200 }];

      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce([mockTotalResult])
          .mockResolvedValueOnce([mockMostCommonResult])
          .mockResolvedValueOnce([mockHighImpactResult])
          .mockResolvedValueOnce([mockAnonymousResult]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getCommunityStats(30);

      // Assert
      expect(result.anonymous_percentage).toBe(85); // 170/200 * 100 = 85%
    });

    it('should filter high impact levels correctly', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn()
          .mockResolvedValueOnce([[{ total: 100 }]])
          .mockResolvedValueOnce([[{ attack_type: 'email', count: 40 }]])
          .mockResolvedValueOnce([[{ count: 25 }]])
          .mockResolvedValueOnce([[{ anonymous_count: 80, total_count: 100 }]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getCommunityStats(30);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("impact_level IN ('robo_datos', 'robo_dinero', 'cuenta_comprometida')"),
        [30]
      );
    });
  });

  describe('getSimilarReports', () => {
    it('should return similar reports with anonymization', async () => {
      // Arrange
      const mockResults = [
        {
          id: 2,
          attack_type: 'email',
          impact_level: 'robo_datos',
          description: 'Similar attack description',
          created_at: '2025-01-15',
          reporter_type: 'Anónimo',
        },
        {
          id: 3,
          attack_type: 'email',
          impact_level: 'robo_datos',
          description: 'Another similar attack',
          created_at: '2025-01-14',
          reporter_type: 'Usuario registrado',
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockResults]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getSimilarReports('email', 'robo_datos', 5);

      // Assert
      expect(result).toEqual(mockResults);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE attack_type = ? AND impact_level = ?'),
        ['email', 'robo_datos', 5]
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        ['email', 'robo_datos', 5]
      );
    });

    it('should use default limit of 5', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getSimilarReports('SMS', 'ninguno');

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['SMS', 'ninguno', 5]
      );
    });

    it('should filter by last 90 days', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getSimilarReports('whatsapp', 'robo_dinero', 3);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)'),
        ['whatsapp', 'robo_dinero', 3]
      );
    });

    it('should anonymize reporter information correctly', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getSimilarReports('email', 'robo_datos');

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("CASE WHEN is_anonymous = TRUE THEN 'Anónimo' ELSE 'Usuario registrado' END as reporter_type"),
        expect.any(Array)
      );
    });
  });

  describe('getTopSuspiciousOrigins', () => {
    it('should return top suspicious origins with aggregated data', async () => {
      // Arrange
      const mockResults = [
        {
          attack_origin: 'banco-falso.com',
          report_count: 15,
          attack_types: 'email,SMS,whatsapp',
        },
        {
          attack_origin: '+1234567890',
          report_count: 8,
          attack_types: 'llamada',
        },
        {
          attack_origin: 'phishing-site.org',
          report_count: 6,
          attack_types: 'email,redes_sociales',
        },
      ];

      const mockPool = {
        query: jest.fn().mockResolvedValue([mockResults]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getTopSuspiciousOrigins(30, 10);

      // Assert
      expect(result).toEqual(mockResults);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('GROUP_CONCAT(DISTINCT attack_type)'),
        [30, 10]
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('HAVING report_count > 1'),
        [30, 10]
      );
    });

    it('should use default parameters', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getTopSuspiciousOrigins();

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [30, 10]
      );
    });

    it('should filter out null origins', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getTopSuspiciousOrigins(30, 5);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('attack_origin IS NOT NULL'),
        [30, 5]
      );
    });

    it('should order by report count descending', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getTopSuspiciousOrigins(30, 5);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY report_count DESC'),
        [30, 5]
      );
    });

    it('should require minimum 2 reports per origin', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      await repository.getTopSuspiciousOrigins(30, 5);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('HAVING report_count > 1'),
        [30, 5]
      );
    });
  });

  describe('Error handling', () => {
    it('should propagate database errors', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act & Assert
      await expect(repository.getAttackTypeTrends(30)).rejects.toThrow('Database connection failed');
    });

    it('should handle empty result sets gracefully', async () => {
      // Arrange
      const mockPool = {
        query: jest.fn().mockResolvedValue([[]]),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockDbService.getPool.mockReturnValue(mockPool as any);

      // Act
      const result = await repository.getAttackTypeTrends(30);

      // Assert
      expect(result).toEqual([]);
    });
  });
});