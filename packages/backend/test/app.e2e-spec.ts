import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as main.ts
    app.enableCors({
      origin: true, // Allow all origins in test
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // No global prefix - routes at root level

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    it('should return API health status', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('SafeTrade API - Sistema de Reportes de Ciberseguridad');
    });
  });

  describe('/health (GET)', () => {
    it('should return health check', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('service', 'SafeTrade Backend API');
          expect(res.body).toHaveProperty('version', '1.0.0');
        });
    });
  });

  describe('Spanish Endpoints', () => {
    it('should have reportes endpoint available', () => {
      return request(app.getHttpServer())
        .get('/reportes')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should have comunidad/tendencias endpoint available', () => {
      return request(app.getHttpServer())
        .get('/comunidad/tendencias')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});