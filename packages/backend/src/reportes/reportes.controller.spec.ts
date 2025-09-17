import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Reporte } from './reportes.repository';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request';
import { EnvValidationService } from '../common/config/env-validation.service';
import type { Express } from 'express';

describe('ReportesController', () => {
  let controller: ReportesController;
  let service: jest.Mocked<ReportesService>;

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

  const mockRecommendations = [
    'Verifica siempre la dirección del remitente',
    'No proporciones información personal por correo electrónico'
  ];

  const mockVictimSupport = {
    title: 'Pasos para proteger datos comprometidos',
    steps: ['Cambia inmediatamente todas las contraseñas'],
    resources: ['Generador de contraseñas seguras']
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [
        {
          provide: ReportesService,
          useValue: {
            createReporte: jest.fn(),
            getReporteById: jest.fn(),
            getUserReports: jest.fn(),
            generateRecommendations: jest.fn(),
            getVictimSupport: jest.fn(),
            addAttachment: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: EnvValidationService,
          useValue: {
            getJwtSecret: jest.fn(() => 'test-secret'),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportesController>(ReportesController);
    service = module.get(ReportesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReporte', () => {
    const validDto = {
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

    const mockAuthenticatedRequest = {
      user: { userId: '1' }
    } as AuthenticatedRequest;

    const mockAnonymousRequest = {
      user: { userId: 'anonymous' }
    } as AuthenticatedRequest;

    it('should create an identified report successfully', async () => {
      service.createReporte.mockResolvedValue(mockReporte);
      service.generateRecommendations.mockResolvedValue(mockRecommendations);
      service.getVictimSupport.mockResolvedValue(mockVictimSupport);

      const result = await controller.createReporte(validDto, mockAuthenticatedRequest);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Reporte creado exitosamente');
      expect(result.reporte).toEqual({
        id: mockReporte.id,
        attack_type: mockReporte.attack_type,
        incident_date: mockReporte.incident_date,
        impact_level: mockReporte.impact_level,
        status: mockReporte.status,
        created_at: mockReporte.created_at
      });
      expect(result.recommendations).toEqual(mockRecommendations);
      expect(result.victim_support).toEqual(mockVictimSupport);

      expect(service.createReporte).toHaveBeenCalledWith({
        user_id: 1,
        is_anonymous: false,
        attack_type: validDto.attack_type,
        incident_date: validDto.incident_date,
        incident_time: validDto.incident_time,
        attack_origin: validDto.attack_origin,
        suspicious_url: validDto.suspicious_url,
        message_content: validDto.message_content,
        impact_level: validDto.impact_level,
        description: validDto.description,
      });
    });

    it('should create an anonymous report successfully', async () => {
      const anonymousDto = { ...validDto, is_anonymous: true };
      const anonymousReporte = { ...mockReporte, user_id: null, is_anonymous: true };

      service.createReporte.mockResolvedValue(anonymousReporte);
      service.generateRecommendations.mockResolvedValue(mockRecommendations);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service.getVictimSupport.mockResolvedValue(undefined as any);

      const result = await controller.createReporte(anonymousDto, mockAnonymousRequest);

      expect(result.success).toBe(true);
      expect(service.createReporte).toHaveBeenCalledWith({
        user_id: null,
        is_anonymous: true,
        attack_type: anonymousDto.attack_type,
        incident_date: anonymousDto.incident_date,
        incident_time: anonymousDto.incident_time,
        attack_origin: anonymousDto.attack_origin,
        suspicious_url: anonymousDto.suspicious_url,
        message_content: anonymousDto.message_content,
        impact_level: anonymousDto.impact_level,
        description: anonymousDto.description,
      });
    });

    it('should default to anonymous for unauthenticated users', async () => {
      const dtoWithoutAnonymousFlag: Partial<typeof validDto> = { ...validDto };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (dtoWithoutAnonymousFlag as any).is_anonymous;

      service.createReporte.mockResolvedValue({ ...mockReporte, user_id: null, is_anonymous: true });
      service.generateRecommendations.mockResolvedValue(mockRecommendations);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await controller.createReporte(dtoWithoutAnonymousFlag as any, mockAnonymousRequest);

      expect(result.success).toBe(true);
      expect(service.createReporte).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: null,
          is_anonymous: true,
        })
      );
    });

    it('should not generate victim support for "ninguno" impact', async () => {
      const noImpactDto = { ...validDto, impact_level: 'ninguno' };
      const noImpactReporte = { ...mockReporte, impact_level: 'ninguno' as const };

      service.createReporte.mockResolvedValue(noImpactReporte);
      service.generateRecommendations.mockResolvedValue(mockRecommendations);

      const result = await controller.createReporte(noImpactDto, mockAuthenticatedRequest);

      expect(result.success).toBe(true);
      expect(result.victim_support).toBeNull();
      expect(service.getVictimSupport).not.toHaveBeenCalled();
    });

    it('should handle file attachments', async () => {
      const mockFiles = [
        {
          originalname: 'evidence.png',
          filename: 'uuid-evidence.png',
          path: '/uploads/uuid-evidence.png',
          size: 1024,
          mimetype: 'image/png'
        }
      ] as Express.Multer.File[];

      const mockAttachment = {
        id: 1,
        reporte_id: 1,
        file_path: '/uploads/uuid-evidence.png',
        file_hash: 'uuid-evidence.png',
        uploaded_at: new Date()
      };

      service.createReporte.mockResolvedValue(mockReporte);
      service.addAttachment.mockResolvedValue(mockAttachment);
      service.generateRecommendations.mockResolvedValue(mockRecommendations);
      service.getVictimSupport.mockResolvedValue(mockVictimSupport);

      const result = await controller.createReporte(validDto, mockAuthenticatedRequest, mockFiles);

      expect(result.success).toBe(true);
      expect(result.attachments).toHaveLength(1);
      expect(result.attachments![0]).toEqual({
        id: mockAttachment.id,
        filename: mockFiles[0].originalname,
        size: mockFiles[0].size,
        mimetype: mockFiles[0].mimetype
      });
      expect(result.files_uploaded).toBe(1);

      expect(service.addAttachment).toHaveBeenCalledWith({
        reporte_id: mockReporte.id,
        file_path: mockFiles[0].path,
        file_hash: mockFiles[0].filename
      });
    });

    it('should continue processing other files if one attachment fails', async () => {
      const mockFiles = [
        { originalname: 'good.png', filename: 'uuid-good.png', path: '/uploads/uuid-good.png', size: 1024, mimetype: 'image/png' },
        { originalname: 'bad.png', filename: 'uuid-bad.png', path: '/uploads/uuid-bad.png', size: 1024, mimetype: 'image/png' }
      ] as Express.Multer.File[];

      const mockAttachment = { id: 1, reporte_id: 1, file_path: '/uploads/uuid-good.png', file_hash: 'uuid-good.png', uploaded_at: new Date() };

      service.createReporte.mockResolvedValue(mockReporte);
      service.addAttachment
        .mockResolvedValueOnce(mockAttachment)  // First file succeeds
        .mockRejectedValueOnce(new Error('File processing failed'));  // Second file fails
      service.generateRecommendations.mockResolvedValue(mockRecommendations);
      service.getVictimSupport.mockResolvedValue(mockVictimSupport);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await controller.createReporte(validDto, mockAuthenticatedRequest, mockFiles);

      expect(result.success).toBe(true);
      expect(result.attachments).toHaveLength(1);  // Only successful attachment
      expect(result.files_uploaded).toBe(2);       // Still shows total files received
      expect(consoleSpy).toHaveBeenCalledWith('Error processing attachment:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should return error when report creation fails', async () => {
      service.createReporte.mockResolvedValue(null);

      const result = await controller.createReporte(validDto, mockAuthenticatedRequest);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error al crear el reporte');
    });

    it('should handle service errors gracefully', async () => {
      service.createReporte.mockRejectedValue(new Error('Database connection failed'));

      const result = await controller.createReporte(validDto, mockAuthenticatedRequest);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database connection failed');
    });

    it('should handle unknown errors', async () => {
      service.createReporte.mockRejectedValue('Unknown error');

      const result = await controller.createReporte(validDto, mockAuthenticatedRequest);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error interno del servidor');
    });

    it('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      service.createReporte.mockRejectedValue(error);

      const result = await controller.createReporte(validDto, mockAuthenticatedRequest);

      expect(result.error).toBe(error);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getReporte', () => {
    const mockRequest = {
      user: { userId: '1' }
    } as AuthenticatedRequest;

    it('should return report when found', async () => {
      service.getReporteById.mockResolvedValue(mockReporte);

      const result = await controller.getReporte('1', mockRequest);

      expect(result.success).toBe(true);
      expect(result.reporte).toEqual(
        expect.objectContaining({
          id: mockReporte.id,
          attack_type: mockReporte.attack_type,
          incident_date: mockReporte.incident_date,
        })
      );

      expect(service.getReporteById).toHaveBeenCalledWith(1);
    });

    it('should return error when report not found', async () => {
      service.getReporteById.mockResolvedValue(null);

      const result = await controller.getReporte('999', mockRequest);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Reporte no encontrado');
    });

    it('should not expose user info for anonymous reports', async () => {
      const anonymousReporte = { ...mockReporte, is_anonymous: true };
      service.getReporteById.mockResolvedValue(anonymousReporte);

      const result = await controller.getReporte('1', mockRequest);

      expect(result.success).toBe(true);
      expect(result.reporte!.user_info).toBeNull();
    });

    it('should show user info only for own identified reports', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reporteWithUserInfo = {
        ...mockReporte,
        is_anonymous: false,
        user_email: 'user@example.com',
        user_name: 'Test User'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      service.getReporteById.mockResolvedValue(reporteWithUserInfo);

      const result = await controller.getReporte('1', mockRequest);

      expect(result.success).toBe(true);
      expect(result.reporte!.user_info).toEqual({
        email: 'user@example.com',
        name: 'Test User'
      });
    });

    it('should hide user info for other users identified reports', async () => {
      const otherUserReporte = { ...mockReporte, user_id: 2, is_anonymous: false };
      service.getReporteById.mockResolvedValue(otherUserReporte);

      const result = await controller.getReporte('1', mockRequest);

      expect(result.success).toBe(true);
      expect(result.reporte!.user_info).toBeNull();
    });
  });

  describe('getUserReports', () => {
    const mockRequest = {
      user: { userId: '1' }
    } as AuthenticatedRequest;

    it('should return user reports', async () => {
      const mockReports = [mockReporte];
      service.getUserReports.mockResolvedValue(mockReports);

      const result = await controller.getUserReports(mockRequest);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Reportes obtenidos exitosamente');
      expect(result.reportes).toEqual(mockReports);
      expect(result.total).toBe(1);

      expect(service.getUserReports).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no reports found', async () => {
      service.getUserReports.mockResolvedValue([]);

      const result = await controller.getUserReports(mockRequest);

      expect(result.success).toBe(true);
      expect(result.reportes).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});