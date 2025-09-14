import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data from valid JWT payload', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
      });
    });

    it('should handle payload with different structure', async () => {
      const payload = {
        sub: 'admin-456',
        email: 'admin@safetrade.com',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe('admin-456');
      expect(result.email).toBe('admin@safetrade.com');
    });
  });
});