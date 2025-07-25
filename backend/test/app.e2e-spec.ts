import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CurrentDataDto, MigrationInfoResponseDto, VersionResponseDto } from '../../shared/dto';
import { AppController } from '../src/controllers/app.controller';
import { IDatabaseService, DATABASE_SERVICE_TOKEN, DatabaseService } from '../src/services';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  // Mock DatabaseService for e2e tests
  const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    isHealthy: jest.fn(),
    getTestData: jest.fn(),
    getActiveTestData: jest.fn(),
    getMigrationInfo: jest.fn(),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DATABASE_SERVICE_TOKEN,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
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
      mockDatabaseService.isHealthy.mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('database', true);
      expect(response.body).toHaveProperty('timestamp');
      expect(mockDatabaseService.isHealthy).toHaveBeenCalledTimes(1);
    });

    it('should return 200 and unhealthy status when database is unhealthy', async () => {
      mockDatabaseService.isHealthy.mockResolvedValue(false);

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'unhealthy');
      expect(response.body).toHaveProperty('database', false);
      expect(response.body).toHaveProperty('timestamp');
      expect(mockDatabaseService.isHealthy).toHaveBeenCalledTimes(1);
    });
  });

  describe('/test-data (GET)', () => {
    it('should return test data from database', async () => {
      const mockData = [
        { id: 1, name: 'Test Item 1', message: 'Test message 1', is_active: true },
        { id: 2, name: 'Test Item 2', message: 'Test message 2', is_active: false }
      ];
      mockDatabaseService.getTestData.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer())
        .get('/test-data')
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(mockDatabaseService.getTestData).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no test data', async () => {
      mockDatabaseService.getTestData.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/test-data')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('/test-data/active (GET)', () => {
    it('should return only active test data', async () => {
      const mockActiveData = [
        { id: 1, name: 'Active Item 1', message: 'Active message 1', is_active: true }
      ];
      mockDatabaseService.getActiveTestData.mockResolvedValue(mockActiveData);

      const response = await request(app.getHttpServer())
        .get('/test-data/active')
        .expect(200);

      expect(response.body).toEqual(mockActiveData);
      expect(mockDatabaseService.getActiveTestData).toHaveBeenCalledTimes(1);
    });
  });

  describe('/migrations (GET)', () => {
    it('should return migration information with pending migrations', async () => {
      const mockMigrationInfo = {
        totalApplied: 4,
        totalAvailable: 5,
        latestMigration: '004_add_tags_and_metadata.sql',
        appliedAt: '2025-07-24T10:29:45Z',
        pendingMigrations: ['005_add_audit_fields.sql'],
        appliedMigrations: [
          { name: '001_create_migrations_table.sql', appliedAt: '2025-07-24T10:00:00Z' },
          { name: '002_add_category_to_test_data.sql', appliedAt: '2025-07-24T10:15:30Z' }
        ],
        status: 'pending' as const
      };
      mockDatabaseService.getMigrationInfo.mockResolvedValue(mockMigrationInfo);

      const response = await request(app.getHttpServer())
        .get('/migrations')
        .expect(200);

      const data: MigrationInfoResponseDto = response.body;
      expect(data).toHaveProperty('version', '004_add_tags_and_metadata.sql');
      expect(data).toHaveProperty('database', mockMigrationInfo);
      expect(data).toHaveProperty('timestamp');
      expect(mockDatabaseService.getMigrationInfo).toHaveBeenCalledTimes(1);
    });

    it('should handle no migrations scenario', async () => {
      const mockMigrationInfo = {
        totalApplied: 0,
        totalAvailable: 0,
        latestMigration: null,
        appliedAt: null,
        pendingMigrations: [],
        appliedMigrations: [],
        status: 'up-to-date' as const
      };
      mockDatabaseService.getMigrationInfo.mockResolvedValue(mockMigrationInfo);

      const response = await request(app.getHttpServer())
        .get('/migrations')
        .expect(200);

      expect(response.body.version).toBe('none');
      expect(response.body.database).toEqual(mockMigrationInfo);
    });
  });

  describe('/version (GET)', () => {
    it('should return version information', async () => {
      const mockMigrationInfo = {
        totalApplied: 4,
        totalAvailable: 4,
        latestMigration: '004_add_tags_and_metadata.sql',
        appliedAt: '2025-07-24T10:29:45Z',
        pendingMigrations: [],
        appliedMigrations: [],
        status: 'up-to-date' as const
      };
      mockDatabaseService.getMigrationInfo.mockResolvedValue(mockMigrationInfo);

      const response = await request(app.getHttpServer())
        .get('/version')
        .expect(200);

      const data: VersionResponseDto = response.body;
      expect(data).toHaveProperty('application');
      expect(data).toHaveProperty('database', '004_add_tags_and_metadata.sql');
      expect(data).toHaveProperty('migrations');
      expect(data.migrations).toHaveProperty('applied', 4);
      expect(data.migrations).toHaveProperty('total', 4);
      expect(data.migrations).toHaveProperty('status', 'up-to-date');
      expect(data).toHaveProperty('timestamp');
      expect(mockDatabaseService.getMigrationInfo).toHaveBeenCalledTimes(1);
    });

    it('should handle application version from environment', async () => {
      const originalVersion = process.env.npm_package_version;
      process.env.npm_package_version = '2.1.0';

      const mockMigrationInfo = {
        totalApplied: 2,
        totalAvailable: 2,
        latestMigration: '002_add_category_to_test_data.sql',
        appliedAt: '2025-07-24T10:15:30Z',
        pendingMigrations: [],
        appliedMigrations: [],
        status: 'up-to-date' as const
      };
      mockDatabaseService.getMigrationInfo.mockResolvedValue(mockMigrationInfo);

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