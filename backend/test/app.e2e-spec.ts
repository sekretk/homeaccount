import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CurrentDataDto } from '../../shared/dto';

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

  describe('/current-data (GET)', () => {
    it('should return 200 status', () => {
      return request(app.getHttpServer())
        .get('/current-data')
        .expect(200);
    });

    it('should return valid CurrentDataDto', async () => {
      const response = await request(app.getHttpServer())
        .get('/current-data')
        .expect(200);

      const data: CurrentDataDto = response.body;
      
      expect(data).toHaveProperty('currentTime');
      expect(data).toHaveProperty('message');
      expect(typeof data.currentTime).toBe('string');
      expect(typeof data.message).toBe('string');
    });

    it('should return current time in ISO format', async () => {
      const response = await request(app.getHttpServer())
        .get('/current-data')
        .expect(200);

      const data: CurrentDataDto = response.body;
      
      // Validate ISO string format
      const date = new Date(data.currentTime);
      expect(date.toISOString()).toBe(data.currentTime);
    });

    it('should return expected message content', async () => {
      const response = await request(app.getHttpServer())
        .get('/current-data')
        .expect(200);

      const data: CurrentDataDto = response.body;
      expect(data.message).toBe('Hello from NestJS backend!');
    });

    it('should return recent timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get('/current-data')
        .expect(200);

      const data: CurrentDataDto = response.body;
      const resultTime = new Date(data.currentTime);
      const now = new Date();
      
      // Should be within 2 seconds of current time (allowing for request time)
      const timeDiff = Math.abs(now.getTime() - resultTime.getTime());
      expect(timeDiff).toBeLessThan(2000);
    });

    it('should return JSON content type', () => {
      return request(app.getHttpServer())
        .get('/current-data')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });
}); 