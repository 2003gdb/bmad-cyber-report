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
        .expect('SafeTrade API is running!');
    });
  });

  describe('/health (GET)', () => {
    it('should return health check', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect('SafeTrade API is running!');
    });
  });

  describe('/api/v1 (GET)', () => {
    it('should return API information', () => {
      return request(app.getHttpServer())
        .get('/api/v1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'SafeTrade API');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('environment');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Spanish Endpoints', () => {
    it('should have reportes endpoint available', () => {
      return request(app.getHttpServer())
        .get('/api/v1/reportes')
        .expect((res) => {
          // Should not return 404 - endpoint should exist
          expect(res.status).not.toBe(404);
        });
    });

    it('should have tendencias-comunidad endpoint available', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tendencias-comunidad')
        .expect((res) => {
          // Should not return 404 - endpoint should exist
          expect(res.status).not.toBe(404);
        });
    });
  });
});