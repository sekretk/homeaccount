import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CurrentDataDto, MigrationInfoResponseDto, VersionResponseDto } from '../../shared/dto';
import { AppController } from '../src/controllers/app.controller';
import { 
  DATABASE_SERVICE_TOKEN, 
  HEALTH_SERVICE_TOKEN,
  MockDatabaseService,
  MockHealthService
} from '../src/services';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mockDatabaseService: MockDatabaseService;
  let mockHealthService: MockHealthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DATABASE_SERVICE_TOKEN,
          useClass: MockDatabaseService,
        },
        {
          provide: HEALTH_SERVICE_TOKEN,
          useClass: MockHealthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mockDatabaseService = moduleFixture.get<MockDatabaseService>(DATABASE_SERVICE_TOKEN);
    mockHealthService = moduleFixture.get<MockHealthService>(HEALTH_SERVICE_TOKEN);
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

  describe('/health (GET)', () => {
    it('should return 200 and healthy status when database is healthy', async () => {
      // MockHealthService returns healthy by default
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('database', true);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 200 and unhealthy status when database is unhealthy', async () => {
      // Override the mock health service to return unhealthy
      jest.spyOn(mockHealthService, 'checkApplicationHealth').mockResolvedValue({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: [
          {
            name: 'database',
            status: 'unhealthy',
            responseTime: 5000,
            message: 'Database connection failed'
          }
        ]
      });

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'unhealthy');
      expect(response.body).toHaveProperty('database', false);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 200 and degraded status when database is degraded', async () => {
      // Override the mock health service to return degraded
      jest.spyOn(mockHealthService, 'checkApplicationHealth').mockResolvedValue({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        checks: [
          {
            name: 'database',
            status: 'degraded',
            responseTime: 2000,
            message: 'Database connection slow'
          }
        ]
      });

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'degraded');
      expect(response.body).toHaveProperty('database', false);
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('/health/detailed (GET)', () => {
    it('should return detailed health information', async () => {
      // MockHealthService provides detailed health by default
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
      expect(Array.isArray(response.body.checks)).toBe(true);
      expect(response.body.checks.length).toBeGreaterThan(0);
    });
  });

  describe('/test-data (GET)', () => {
    it('should return test data from database', async () => {
      // MockDatabaseService provides default test data
      const response = await request(app.getHttpServer())
        .get('/test-data')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should return empty array when no test data', async () => {
      // Override the mock to return empty data
      jest.spyOn(mockDatabaseService, 'getTestData').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/test-data')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('/test-data/active (GET)', () => {
    it('should return only active test data', async () => {
      // MockDatabaseService filters for active data
      const response = await request(app.getHttpServer())
        .get('/test-data/active')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((item: any) => item.is_active === true)).toBe(true);
    });
  });

  describe('/migrations (GET)', () => {
    it('should return migration information with up-to-date status', async () => {
      // MockDatabaseService provides default migration info (up-to-date)
      const response = await request(app.getHttpServer())
        .get('/migrations')
        .expect(200);

      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.database).toHaveProperty('totalApplied');
      expect(response.body.database).toHaveProperty('totalAvailable');
      expect(response.body.database).toHaveProperty('status');
    });

    it('should return migration information with pending migrations', async () => {
      // Override mock to return pending migrations
      jest.spyOn(mockDatabaseService, 'getMigrationInfo').mockResolvedValue({
        totalApplied: 4,
        totalAvailable: 5,
        latestMigration: '004_add_tags_and_metadata.sql',
        appliedAt: '2025-07-25T10:00:00.000Z',
        pendingMigrations: ['005_add_audit_fields.sql'],
        appliedMigrations: [
          { name: '001_create_migrations_table.sql', appliedAt: '2025-07-25T09:00:00.000Z' },
          { name: '002_add_category_to_test_data.sql', appliedAt: '2025-07-25T09:15:00.000Z' },
          { name: '003_add_priority_and_indexes.sql', appliedAt: '2025-07-25T09:30:00.000Z' },
          { name: '004_add_tags_and_metadata.sql', appliedAt: '2025-07-25T10:00:00.000Z' }
        ],
        status: 'pending'
      });

      const response = await request(app.getHttpServer())
        .get('/migrations')
        .expect(200);

      expect(response.body).toHaveProperty('version', '004_add_tags_and_metadata.sql');
      expect(response.body.database.status).toBe('pending');
      expect(response.body.database.pendingMigrations.length).toBeGreaterThan(0);
    });

    it('should handle no migrations scenario', async () => {
      // Override mock to return no migrations
      jest.spyOn(mockDatabaseService, 'getMigrationInfo').mockResolvedValue({
        totalApplied: 0,
        totalAvailable: 0,
        latestMigration: null,
        appliedAt: null,
        pendingMigrations: [],
        appliedMigrations: [],
        status: 'up-to-date'
      });

      const response = await request(app.getHttpServer())
        .get('/migrations')
        .expect(200);

      expect(response.body.version).toBe('none');
      expect(response.body.database.totalApplied).toBe(0);
    });
  });

  describe('/version (GET)', () => {
    it('should return version information', async () => {
      // MockDatabaseService provides default migration info
      const response = await request(app.getHttpServer())
        .get('/version')
        .expect(200);

      expect(response.body).toHaveProperty('application');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('migrations');
      expect(response.body.migrations).toHaveProperty('applied');
      expect(response.body.migrations).toHaveProperty('total');
      expect(response.body.migrations).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle application version from environment', async () => {
      const originalVersion = process.env.npm_package_version;
      process.env.npm_package_version = '2.1.0';

      const response = await request(app.getHttpServer())
        .get('/version')
        .expect(200);

      expect(response.body.application).toBe('2.1.0');

      // Restore original environment
      if (originalVersion) {
        process.env.npm_package_version = originalVersion;
      } else {
        delete process.env.npm_package_version;
      }
    });
  });
}); 