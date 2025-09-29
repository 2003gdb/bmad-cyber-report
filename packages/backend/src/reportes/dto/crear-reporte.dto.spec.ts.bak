import { validate } from 'class-validator';
import { CrearReporteDto } from './crear-reporte.dto';

describe('CrearReporteDto', () => {
  let dto: CrearReporteDto;

  beforeEach(() => {
    dto = new CrearReporteDto();
    dto.attack_type = 'email';
    dto.incident_date = '2025-01-15';
    dto.attack_origin = 'scammer@fake.com';
    dto.impact_level = 'ninguno';
  });

  describe('URL validation', () => {
    it('should accept valid HTTP URLs', async () => {
      dto.suspicious_url = 'http://fake-bank.com/login';

      const errors = await validate(dto);
      const urlErrors = errors.filter(error => error.property === 'suspicious_url');

      expect(urlErrors).toHaveLength(0);
    });

    it('should accept valid HTTPS URLs', async () => {
      dto.suspicious_url = 'https://fake-bank.com/login';

      const errors = await validate(dto);
      const urlErrors = errors.filter(error => error.property === 'suspicious_url');

      expect(urlErrors).toHaveLength(0);
    });

    it('should accept URLs with basic domain structure', async () => {
      dto.suspicious_url = 'suspicious-site.com';

      const errors = await validate(dto);
      const urlErrors = errors.filter(error => error.property === 'suspicious_url');

      expect(urlErrors).toHaveLength(0);
    });

    it('should accept URLs without protocol', async () => {
      dto.suspicious_url = 'fake-bank.com/login';

      const errors = await validate(dto);
      const urlErrors = errors.filter(error => error.property === 'suspicious_url');

      expect(urlErrors).toHaveLength(0);
    });

    it('should reject URLs that are too long', async () => {
      dto.suspicious_url = 'https://' + 'a'.repeat(2048);

      const errors = await validate(dto);
      const urlErrors = errors.filter(error => error.property === 'suspicious_url');

      expect(urlErrors).toHaveLength(1);
      expect(urlErrors[0].constraints?.maxLength).toBe('La URL no puede exceder 2048 caracteres');
    });

    it('should reject text without domain structure', async () => {
      dto.suspicious_url = 'clearly-not-a-url';

      const errors = await validate(dto);
      const urlErrors = errors.filter(error => error.property === 'suspicious_url');

      expect(urlErrors).toHaveLength(1);
      expect(urlErrors[0].constraints?.matches).toBe('La URL sospechosa debe contener al menos un dominio (ej: sitio.com)');
    });

    it('should allow empty suspicious URL (optional field)', async () => {
      dto.suspicious_url = '';

      const errors = await validate(dto);
      const urlErrors = errors.filter(error => error.property === 'suspicious_url');

      expect(urlErrors).toHaveLength(0);
    });

    it('should allow undefined suspicious URL (optional field)', async () => {
      dto.suspicious_url = undefined;

      const errors = await validate(dto);
      const urlErrors = errors.filter(error => error.property === 'suspicious_url');

      expect(urlErrors).toHaveLength(0);
    });
  });

  describe('Message content validation', () => {
    it('should accept message content under 5000 characters', async () => {
      dto.message_content = 'A'.repeat(4999);

      const errors = await validate(dto);
      const messageErrors = errors.filter(error => error.property === 'message_content');

      expect(messageErrors).toHaveLength(0);
    });

    it('should accept message content exactly 5000 characters', async () => {
      dto.message_content = 'A'.repeat(5000);

      const errors = await validate(dto);
      const messageErrors = errors.filter(error => error.property === 'message_content');

      expect(messageErrors).toHaveLength(0);
    });

    it('should reject message content over 5000 characters', async () => {
      dto.message_content = 'A'.repeat(5001);

      const errors = await validate(dto);
      const messageErrors = errors.filter(error => error.property === 'message_content');

      expect(messageErrors).toHaveLength(1);
      expect(messageErrors[0].constraints?.maxLength).toBe('El contenido del mensaje no puede exceder 5000 caracteres');
    });

    it('should allow empty message content (optional field)', async () => {
      dto.message_content = '';

      const errors = await validate(dto);
      const messageErrors = errors.filter(error => error.property === 'message_content');

      expect(messageErrors).toHaveLength(0);
    });

    it('should allow undefined message content (optional field)', async () => {
      dto.message_content = undefined;

      const errors = await validate(dto);
      const messageErrors = errors.filter(error => error.property === 'message_content');

      expect(messageErrors).toHaveLength(0);
    });
  });

  describe('Required field validation', () => {
    it('should require attack_type', async () => {
      dto.attack_type = undefined as unknown as string;

      const errors = await validate(dto);
      const attackTypeErrors = errors.filter(error => error.property === 'attack_type');

      expect(attackTypeErrors.length).toBeGreaterThan(0);
    });

    it('should require incident_date', async () => {
      dto.incident_date = undefined as unknown as string;

      const errors = await validate(dto);
      const dateErrors = errors.filter(error => error.property === 'incident_date');

      expect(dateErrors.length).toBeGreaterThan(0);
    });

    it('should require attack_origin', async () => {
      dto.attack_origin = undefined as unknown as string;

      const errors = await validate(dto);
      const originErrors = errors.filter(error => error.property === 'attack_origin');

      expect(originErrors.length).toBeGreaterThan(0);
    });

    it('should require impact_level', async () => {
      dto.impact_level = undefined as unknown as string;

      const errors = await validate(dto);
      const impactErrors = errors.filter(error => error.property === 'impact_level');

      expect(impactErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Attack type validation', () => {
    const validAttackTypes = ['email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro'];

    validAttackTypes.forEach(attackType => {
      it(`should accept valid attack type: ${attackType}`, async () => {
        dto.attack_type = attackType;

        const errors = await validate(dto);
        const attackTypeErrors = errors.filter(error => error.property === 'attack_type');

        expect(attackTypeErrors).toHaveLength(0);
      });
    });

    it('should reject invalid attack type', async () => {
      dto.attack_type = 'invalid_type';

      const errors = await validate(dto);
      const attackTypeErrors = errors.filter(error => error.property === 'attack_type');

      expect(attackTypeErrors).toHaveLength(1);
      expect(attackTypeErrors[0].constraints?.isIn).toBe('Tipo de ataque no válido');
    });
  });

  describe('Impact level validation', () => {
    const validImpactLevels = ['ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida'];

    validImpactLevels.forEach(impactLevel => {
      it(`should accept valid impact level: ${impactLevel}`, async () => {
        dto.impact_level = impactLevel;

        const errors = await validate(dto);
        const impactErrors = errors.filter(error => error.property === 'impact_level');

        expect(impactErrors).toHaveLength(0);
      });
    });

    it('should reject invalid impact level', async () => {
      dto.impact_level = 'invalid_level';

      const errors = await validate(dto);
      const impactErrors = errors.filter(error => error.property === 'impact_level');

      expect(impactErrors).toHaveLength(1);
      expect(impactErrors[0].constraints?.isIn).toBe('Nivel de impacto no válido');
    });
  });

  describe('Date validation', () => {
    it('should accept valid date format (YYYY-MM-DD)', async () => {
      dto.incident_date = '2025-01-15';

      const errors = await validate(dto);
      const dateErrors = errors.filter(error => error.property === 'incident_date');

      expect(dateErrors).toHaveLength(0);
    });

    it('should reject invalid date format', async () => {
      dto.incident_date = '15/01/2025';

      const errors = await validate(dto);
      const dateErrors = errors.filter(error => error.property === 'incident_date');

      expect(dateErrors).toHaveLength(1);
      expect(dateErrors[0].constraints?.isDateString).toBe('La fecha debe tener formato válido (YYYY-MM-DD)');
    });

    it('should reject invalid date', async () => {
      dto.incident_date = 'not-a-date';

      const errors = await validate(dto);
      const dateErrors = errors.filter(error => error.property === 'incident_date');

      expect(dateErrors).toHaveLength(1);
    });
  });

  describe('Optional fields validation', () => {
    it('should allow undefined incident_time', async () => {
      dto.incident_time = undefined;

      const errors = await validate(dto);
      const timeErrors = errors.filter(error => error.property === 'incident_time');

      expect(timeErrors).toHaveLength(0);
    });

    it('should allow valid incident_time (HH:MM:SS)', async () => {
      dto.incident_time = '14:30:00';

      const errors = await validate(dto);
      const timeErrors = errors.filter(error => error.property === 'incident_time');

      expect(timeErrors).toHaveLength(0);
    });

    it('should allow valid incident_time (HH:MM)', async () => {
      dto.incident_time = '14:30';

      const errors = await validate(dto);
      const timeErrors = errors.filter(error => error.property === 'incident_time');

      expect(timeErrors).toHaveLength(0);
    });

    it('should reject invalid time format', async () => {
      dto.incident_time = '25:70:90';

      const errors = await validate(dto);
      const timeErrors = errors.filter(error => error.property === 'incident_time');

      expect(timeErrors).toHaveLength(1);
      expect(timeErrors[0].constraints?.matches).toBe('La hora debe tener formato HH:MM o HH:MM:SS');
    });

    it('should reject time with invalid characters', async () => {
      dto.incident_time = 'abc:def';

      const errors = await validate(dto);
      const timeErrors = errors.filter(error => error.property === 'incident_time');

      expect(timeErrors).toHaveLength(1);
    });

    it('should allow undefined description', async () => {
      dto.description = undefined;

      const errors = await validate(dto);
      const descErrors = errors.filter(error => error.property === 'description');

      expect(descErrors).toHaveLength(0);
    });

    it('should allow valid description', async () => {
      dto.description = 'Detailed description of the incident';

      const errors = await validate(dto);
      const descErrors = errors.filter(error => error.property === 'description');

      expect(descErrors).toHaveLength(0);
    });
  });

  describe('Complete valid DTO', () => {
    it('should pass validation with all valid fields', async () => {
      dto.is_anonymous = true;
      dto.attack_type = 'email';
      dto.incident_date = '2025-01-15';
      dto.incident_time = '14:30:00';
      dto.attack_origin = 'scammer@fake.com';
      dto.suspicious_url = 'https://fake-bank.com/login';
      dto.message_content = 'Tu cuenta será bloqueada si no actúas inmediatamente';
      dto.impact_level = 'robo_datos';
      dto.description = 'Received a phishing email attempting to steal bank credentials';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});