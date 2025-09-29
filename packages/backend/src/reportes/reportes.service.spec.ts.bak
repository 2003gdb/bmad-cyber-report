import { Test, TestingModule } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { ReportesRepository, CreateReporteData, Reporte } from './reportes.repository';
import { AdjuntosRepository, ReporteAdjunto } from './adjuntos.repository';

describe('ReportesService', () => {
  let service: ReportesService;
  let reportesRepository: jest.Mocked<ReportesRepository>;
  let _adjuntosRepository: jest.Mocked<AdjuntosRepository>;

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

  const _mockAdjunto: ReporteAdjunto = {
    id: 1,
    reporte_id: 1,
    file_path: '/uploads/test-file.png',
    file_hash: 'abc123',
    uploaded_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        {
          provide: ReportesRepository,
          useValue: {
            createReporte: jest.fn(),
            findById: jest.fn(),
            findUserReports: jest.fn(),
            findRecentReports: jest.fn(),
            getReportStats: jest.fn(),
            getTrendsByAttackType: jest.fn(),
            getTrendsByImpactLevel: jest.fn(),
          },
        },
        {
          provide: AdjuntosRepository,
          useValue: {
            createAdjunto: jest.fn(),
            findById: jest.fn(),
            findByReporteId: jest.fn(),
            deleteAdjunto: jest.fn(),
            getAdjuntoStats: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
    reportesRepository = module.get(ReportesRepository);
    _adjuntosRepository = module.get(AdjuntosRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReporte', () => {
    const validReporteData: CreateReporteData = {
      user_id: 1,
      is_anonymous: false,
      attack_type: 'email',
      incident_date: '2025-01-15',
      attack_origin: 'scammer@fake.com',
      impact_level: 'robo_datos',
      description: 'Test report',
    };

    it('should create a report successfully with valid data', async () => {
      reportesRepository.createReporte.mockResolvedValue(mockReporte);

      const result = await service.createReporte(validReporteData);

      expect(result).toEqual(mockReporte);
      expect(reportesRepository.createReporte).toHaveBeenCalledWith(validReporteData);
    });

    it('should throw error when required fields are missing', async () => {
      const invalidData: Partial<CreateReporteData> = { ...validReporteData };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (invalidData as any).attack_type;

      await expect(service.createReporte(invalidData as CreateReporteData))
        .rejects.toThrow('Campos requeridos: tipo de ataque, fecha del incidente, origen del ataque, nivel de impacto');
    });

    it('should throw error when attack type is invalid', async () => {
      const invalidData = { ...validReporteData, attack_type: 'invalid_type' };

      await expect(service.createReporte(invalidData))
        .rejects.toThrow('Tipo de ataque inválido');
    });

    it('should throw error when impact level is invalid', async () => {
      const invalidData = { ...validReporteData, impact_level: 'invalid_level' };

      await expect(service.createReporte(invalidData))
        .rejects.toThrow('Nivel de impacto inválido');
    });

    it('should validate all valid attack types', async () => {
      const validAttackTypes = ['email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro'];

      for (const attackType of validAttackTypes) {
        const data = { ...validReporteData, attack_type: attackType };
        reportesRepository.createReporte.mockResolvedValue(mockReporte);

        await expect(service.createReporte(data)).resolves.not.toThrow();
      }
    });

    it('should validate all valid impact levels', async () => {
      const validImpactLevels = ['ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida'];

      for (const impactLevel of validImpactLevels) {
        const data = { ...validReporteData, impact_level: impactLevel };
        reportesRepository.createReporte.mockResolvedValue(mockReporte);

        await expect(service.createReporte(data)).resolves.not.toThrow();
      }
    });
  });

  describe('getReporteById', () => {
    it('should return report when found', async () => {
      reportesRepository.findById.mockResolvedValue(mockReporte);

      const result = await service.getReporteById(1);

      expect(result).toEqual(mockReporte);
      expect(reportesRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when report not found', async () => {
      reportesRepository.findById.mockResolvedValue(null);

      const result = await service.getReporteById(999);

      expect(result).toBeNull();
      expect(reportesRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('getUserReports', () => {
    it('should return user reports', async () => {
      const mockReports = [mockReporte];
      reportesRepository.findUserReports.mockResolvedValue(mockReports);

      const result = await service.getUserReports(1);

      expect(result).toEqual(mockReports);
      expect(reportesRepository.findUserReports).toHaveBeenCalledWith(1);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for email attack', async () => {
      const emailReporte = { ...mockReporte, attack_type: 'email' as const };

      const recommendations = await service.generateRecommendations(emailReporte);

      expect(recommendations).toContain('Verifica siempre la dirección del remitente antes de abrir enlaces o archivos adjuntos');
      expect(recommendations).toContain('No proporciones información personal o financiera por correo electrónico');
      expect(recommendations).toContain('Utiliza un filtro de spam en tu cliente de correo');
    });

    it('should generate recommendations for WhatsApp attack', async () => {
      const whatsappReporte = { ...mockReporte, attack_type: 'whatsapp' as const };

      const recommendations = await service.generateRecommendations(whatsappReporte);

      expect(recommendations).toContain('No hagas clic en enlaces sospechosos enviados por WhatsApp');
      expect(recommendations).toContain('Verifica la identidad del remitente antes de compartir información');
      expect(recommendations).toContain('Activa la verificación en dos pasos en WhatsApp');
    });

    it('should generate recommendations for robo_dinero impact', async () => {
      const roboDineroReporte = { ...mockReporte, impact_level: 'robo_dinero' as const };

      const recommendations = await service.generateRecommendations(roboDineroReporte);

      expect(recommendations).toContain('Contacta inmediatamente a tu banco para reportar el incidente');
      expect(recommendations).toContain('Cambia las contraseñas de todas tus cuentas bancarias y financieras');
      expect(recommendations).toContain('Solicita el bloqueo temporal de tus tarjetas si es necesario');
    });

    it('should generate recommendations for robo_datos impact', async () => {
      const roboDatosReporte = { ...mockReporte, impact_level: 'robo_datos' as const };

      const recommendations = await service.generateRecommendations(roboDatosReporte);

      expect(recommendations).toContain('Cambia inmediatamente las contraseñas de las cuentas comprometidas');
      expect(recommendations).toContain('Activa la autenticación de dos factores donde sea posible');
      expect(recommendations).toContain('Monitorea tus cuentas regularmente en busca de actividad sospechosa');
    });

    it('should combine attack type and impact level recommendations', async () => {
      const emailRoboDineroReporte = {
        ...mockReporte,
        attack_type: 'email' as const,
        impact_level: 'robo_dinero' as const
      };

      const recommendations = await service.generateRecommendations(emailRoboDineroReporte);

      // Should include both email and robo_dinero recommendations
      expect(recommendations.length).toBeGreaterThan(3);
      expect(recommendations).toContain('Verifica siempre la dirección del remitente antes de abrir enlaces o archivos adjuntos');
      expect(recommendations).toContain('Contacta inmediatamente a tu banco para reportar el incidente');
    });

    it('should generate additional recommendations when suspicious URL is present', async () => {
      const reportWithUrl = {
        ...mockReporte,
        suspicious_url: 'https://fake-bank.com/login',
      };

      const recommendations = await service.generateRecommendations(reportWithUrl);

      expect(recommendations).toContain('Evita hacer clic en la URL reportada y comparte esta información con tu red');
      expect(recommendations).toContain('Considera reportar la URL maliciosa a servicios de seguridad como Google Safe Browsing');
    });

    it('should generate message content recommendations', async () => {
      const reportWithMessage = {
        ...mockReporte,
        message_content: 'Tu cuenta será bloqueada, responde URGENTE',
      };

      const recommendations = await service.generateRecommendations(reportWithMessage);

      expect(recommendations).toContain('Guarda el contenido del mensaje como evidencia para futuras investigaciones');
      expect(recommendations).toContain('Desconfía de mensajes que crean sensación de urgencia - es una táctica común de atacantes');
    });

    it('should generate urgency recommendations for urgent message content', async () => {
      const reportWithUrgentMessage = {
        ...mockReporte,
        message_content: 'Acción INMEDIATA requerida para tu cuenta',
      };

      const recommendations = await service.generateRecommendations(reportWithUrgentMessage);

      expect(recommendations).toContain('Desconfía de mensajes que crean sensación de urgencia - es una táctica común de atacantes');
    });

    it('should not generate urgency recommendations for non-urgent message content', async () => {
      const reportWithNormalMessage = {
        ...mockReporte,
        message_content: 'Mensaje normal sin palabras de urgencia',
      };

      const recommendations = await service.generateRecommendations(reportWithNormalMessage);

      expect(recommendations).toContain('Guarda el contenido del mensaje como evidencia para futuras investigaciones');
      expect(recommendations).not.toContain('Desconfía de mensajes que crean sensación de urgencia - es una táctica común de atacantes');
    });
  });

  describe('getVictimSupport', () => {
    it('should return victim support for robo_dinero impact', async () => {
      const roboDineroReporte = { ...mockReporte, impact_level: 'robo_dinero' as const };

      const support = await service.getVictimSupport(roboDineroReporte);

      expect(support.title).toBe('Pasos urgentes para víctimas de robo financiero');
      expect(support.steps).toContain('Contacta inmediatamente a tu banco (24/7)');
      expect(support.resources).toContain('Línea directa del banco: disponible 24/7');
    });

    it('should return victim support for robo_datos impact', async () => {
      const roboDatosReporte = { ...mockReporte, impact_level: 'robo_datos' as const };

      const support = await service.getVictimSupport(roboDatosReporte);

      expect(support.title).toBe('Pasos para proteger datos comprometidos');
      expect(support.steps).toContain('Cambia inmediatamente todas las contraseñas');
      expect(support.resources).toContain('Generador de contraseñas seguras');
    });

    it('should return general support for other impact levels', async () => {
      const ningunImpactoReporte = { ...mockReporte, impact_level: 'ninguno' as const };

      const support = await service.getVictimSupport(ningunImpactoReporte);

      expect(support.title).toBe('Pasos inmediatos para víctimas de ciberataques');
      expect(support.steps).toContain('Documenta el incidente con capturas de pantalla');
      expect(support.resources).toContain('Centro de ayuda de SafeTrade');
    });
  });

});