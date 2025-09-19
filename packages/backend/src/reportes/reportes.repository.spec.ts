import { Test, TestingModule } from '@nestjs/testing';
import { ReportesRepository, CreateReporteData, Reporte } from './reportes.repository';
import { DbService } from '../db/db.service';

describe('ReportesRepository', () => {
  let repository: ReportesRepository;
  let _dbService: jest.Mocked<DbService>; // eslint-disable-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPool: jest.Mocked<any>;

  const mockReporte: Reporte = {
    id: 1,
    user_id: 1,
    is_anonymous: false,
    attack_type: 'email',
    incident_date: '2025-01-15',
    incident_time: '14:30:00',
    attack_origin: 'scammer@fake.com',
    suspicious_url: 'https://fake-bank.com',
    message_content: 'Mensaje de phishing',
    impact_level: 'robo_datos',
    description: 'Intento de phishing',
    status: 'nuevo',
    admin_notes: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    mockPool = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesRepository,
        {
          provide: DbService,
          useValue: {
            getPool: jest.fn(() => mockPool),
          },
        },
      ],
    }).compile();

    repository = module.get<ReportesRepository>(ReportesRepository);
    _dbService = module.get(DbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createReporte', () => {
    const reporteData: CreateReporteData = {
      user_id: 1,
      is_anonymous: false,
      attack_type: 'email',
      incident_date: '2025-01-15',
      incident_time: '14:30:00',
      attack_origin: 'scammer@fake.com',
      suspicious_url: 'https://fake-bank.com',
      message_content: 'Mensaje de phishing',
      impact_level: 'robo_datos',
      description: 'Intento de phishing',
    };

    it('should create a report and return the created report', async () => {
      const insertResult = { insertId: 1 };
      mockPool.query
        .mockResolvedValueOnce([insertResult]) // For INSERT
        .mockResolvedValueOnce([[mockReporte]]); // For findById

      const result = await repository.createReporte(reporteData);

      expect(result).toEqual(mockReporte);
      expect(mockPool.query).toHaveBeenCalledTimes(2);

      // Verify INSERT query
      const insertCall = mockPool.query.mock.calls[0];
      expect(insertCall[0]).toContain('INSERT INTO reportes');
      expect(insertCall[1]).toEqual([
        reporteData.user_id,
        reporteData.is_anonymous,
        reporteData.attack_type,
        reporteData.incident_date,
        reporteData.incident_time,
        reporteData.attack_origin,
        reporteData.suspicious_url,
        reporteData.message_content,
        reporteData.impact_level,
        reporteData.description,
      ]);
    });

    it('should handle null values correctly', async () => {
      const dataWithNulls = {
        ...reporteData,
        user_id: null,
        incident_time: undefined,
        suspicious_url: undefined,
        message_content: undefined,
        description: undefined,
      };

      const insertResult = { insertId: 1 };
      mockPool.query
        .mockResolvedValueOnce([insertResult])
        .mockResolvedValueOnce([[mockReporte]]);

      await repository.createReporte(dataWithNulls);

      const insertCall = mockPool.query.mock.calls[0];
      expect(insertCall[1]).toEqual([
        null, // user_id
        dataWithNulls.is_anonymous,
        dataWithNulls.attack_type,
        dataWithNulls.incident_date,
        null, // incident_time
        dataWithNulls.attack_origin,
        null, // suspicious_url
        null, // message_content
        dataWithNulls.impact_level,
        null, // description
      ]);
    });

    it('should return null when database error occurs', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await repository.createReporte(reporteData);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('❌ Error creating reporte:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('findById', () => {
    it('should return report when found', async () => {
      mockPool.query.mockResolvedValue([[mockReporte]]);

      const result = await repository.findById(1);

      expect(result).toEqual(mockReporte);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT r.*'),
        [1]
      );
    });

    it('should return null when report not found', async () => {
      mockPool.query.mockResolvedValue([[]]);

      const result = await repository.findById(999);

      expect(result).toBeNull();
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT r.*'),
        [999]
      );
    });

    it('should include user information in query', async () => {
      mockPool.query.mockResolvedValue([[mockReporte]]);

      await repository.findById(1);

      const queryCall = mockPool.query.mock.calls[0];
      expect(queryCall[0]).toContain('LEFT JOIN users u ON r.user_id = u.id');
      expect(queryCall[0]).toContain('u.email as user_email');
      expect(queryCall[0]).toContain('u.name as user_name');
    });
  });

  describe('findUserReports', () => {
    it('should return user reports excluding anonymous ones', async () => {
      const mockReports = [mockReporte];
      mockPool.query.mockResolvedValue([mockReports]);

      const result = await repository.findUserReports(1);

      expect(result).toEqual(mockReports);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = ? AND is_anonymous = FALSE'),
        [1]
      );
    });

    it('should order results by created_at DESC', async () => {
      mockPool.query.mockResolvedValue([[]]);

      await repository.findUserReports(1);

      const queryCall = mockPool.query.mock.calls[0];
      expect(queryCall[0]).toContain('ORDER BY created_at DESC');
    });
  });

  describe('findRecentReports', () => {
    it('should return recent reports with default limit', async () => {
      const mockReports = [mockReporte];
      mockPool.query.mockResolvedValue([mockReports]);

      const result = await repository.findRecentReports();

      expect(result).toEqual(mockReports);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [10]
      );
    });

    it('should use custom limit when provided', async () => {
      mockPool.query.mockResolvedValue([[]]);

      await repository.findRecentReports(5);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        [5]
      );
    });

    it('should show anonymous reporter name as "Anónimo"', async () => {
      mockPool.query.mockResolvedValue([[]]);

      await repository.findRecentReports();

      const queryCall = mockPool.query.mock.calls[0];
      expect(queryCall[0]).toContain("WHEN r.is_anonymous = TRUE THEN 'Anónimo'");
      expect(queryCall[0]).toContain('ELSE u.name');
    });
  });

  describe('getTrendsByAttackType', () => {
    it('should return attack type trends for default 30 days', async () => {
      const mockTrends = [
        { attack_type: 'email', count: 15 },
        { attack_type: 'whatsapp', count: 8 },
      ];
      mockPool.query.mockResolvedValue([mockTrends]);

      const result = await repository.getTrendsByAttackType();

      expect(result).toEqual(mockTrends);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE_SUB(NOW(), INTERVAL ? DAY)'),
        [30]
      );
    });

    it('should use custom days when provided', async () => {
      mockPool.query.mockResolvedValue([[]]);

      await repository.getTrendsByAttackType(7);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE_SUB(NOW(), INTERVAL ? DAY)'),
        [7]
      );
    });

    it('should group by attack_type and order by count DESC', async () => {
      mockPool.query.mockResolvedValue([[]]);

      await repository.getTrendsByAttackType();

      const queryCall = mockPool.query.mock.calls[0];
      expect(queryCall[0]).toContain('GROUP BY attack_type');
      expect(queryCall[0]).toContain('ORDER BY count DESC');
    });
  });

  describe('getTrendsByImpactLevel', () => {
    it('should return impact level trends', async () => {
      const mockTrends = [
        { impact_level: 'ninguno', count: 20 },
        { impact_level: 'robo_datos', count: 5 },
      ];
      mockPool.query.mockResolvedValue([mockTrends]);

      const result = await repository.getTrendsByImpactLevel();

      expect(result).toEqual(mockTrends);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY impact_level'),
        [30]
      );
    });
  });

  describe('getReportStats', () => {
    it('should return comprehensive report statistics', async () => {
      // Mock multiple query results for different stats
      mockPool.query
        .mockResolvedValueOnce([[{ count: 100 }]]) // total
        .mockResolvedValueOnce([[{ count: 5 }]])   // today
        .mockResolvedValueOnce([[{ count: 25 }]])  // this week
        .mockResolvedValueOnce([[{ count: 60 }]])  // anonymous
        .mockResolvedValueOnce([[{ count: 40 }]]); // identified

      const result = await repository.getReportStats();

      expect(result).toEqual({
        total: 100,
        today: 5,
        this_week: 25,
        anonymous: 60,
        identified: 40,
      });

      expect(mockPool.query).toHaveBeenCalledTimes(5);

      // Verify each query type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queries = mockPool.query.mock.calls.map((call: any) => call[0]);
      expect(queries[0]).toContain('SELECT COUNT(*) as count FROM reportes');
      expect(queries[1]).toContain('DATE(created_at) = CURDATE()');
      expect(queries[2]).toContain('DATE_SUB(NOW(), INTERVAL 7 DAY)');
      expect(queries[3]).toContain('WHERE is_anonymous = TRUE');
      expect(queries[4]).toContain('WHERE is_anonymous = FALSE');
    });

    it('should handle zero counts correctly', async () => {
      // All queries return zero
      mockPool.query
        .mockResolvedValueOnce([[{ count: 0 }]])
        .mockResolvedValueOnce([[{ count: 0 }]])
        .mockResolvedValueOnce([[{ count: 0 }]])
        .mockResolvedValueOnce([[{ count: 0 }]])
        .mockResolvedValueOnce([[{ count: 0 }]]);

      const result = await repository.getReportStats();

      expect(result).toEqual({
        total: 0,
        today: 0,
        this_week: 0,
        anonymous: 0,
        identified: 0,
      });
    });
  });
});