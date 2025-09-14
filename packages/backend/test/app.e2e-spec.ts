import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  describe('/api/v1 (GET)', () => {
    it('should return API root with global prefix', () => {
      return request(app.getHttpServer())
        .get('/api/v1')
        .expect(200)
        .expect('SafeTrade API - Sistema de Reportes de Ciberseguridad');
    });
  });

  describe('Spanish Endpoints', () => {
    it('should have reportes endpoint available', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reportes')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should have tendencias-comunidad endpoint available', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tendencias-comunidad')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });
});