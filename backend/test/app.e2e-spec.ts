import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CurrentDataDto, MigrationInfoResponseDto, VersionResponseDto } from '../../shared/dto';
import { AppController } from '../src/controllers/app.controller';
import { 
  IDatabaseService, 
  DATABASE_SERVICE_TOKEN, 
  IHealthService,
  HEALTH_SERVICE_TOKEN
} from '../src/services';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  
  // Mock DatabaseService for e2e tests
  const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    isHealthy: jest.fn(),
    getTestData: jest.fn(),
    getActiveTestData: jest.fn(),
    getMigrationInfo: jest.fn(),
    query: jest.fn(),
  };

  // Mock HealthService for e2e tests
  const mockHealthService: jest.Mocked<IHealthService> = {
    checkApplicationHealth: jest.fn(),
    checkDatabaseHealth: jest.fn(),
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: DATABASE_SERVICE_TOKEN,
          useValue: mockDatabaseService,
        },
        {
          provide: HEALTH_SERVICE_TOKEN,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
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
      const mockHealthResult = {
        status: 'healthy' as const,
        timestamp: '2025-07-25T10:00:00.000Z',
        checks: [
          {
            name: 'database',
            status: 'healthy' as const,
            responseTime: 5,
            message: 'Database connection successful'
          }
        ]
      };
      mockHealthService.checkApplicationHealth.mockResolvedValue(mockHealthResult);

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('database', true);
      expect(response.body).toHaveProperty('timestamp');
      expect(mockHealthService.checkApplicationHealth).toHaveBeenCalledTimes(1);
    });

    it('should return 200 and unhealthy status when database is unhealthy', async () => {
      const mockHealthResult = {
        status: 'unhealthy' as const,
        timestamp: '2025-07-25T10:00:00.000Z',
        checks: [
          {
            name: 'database',
            status: 'unhealthy' as const,
            responseTime: 0,
            message: 'Database connection failed'
          }
        ]
      };
      mockHealthService.checkApplicationHealth.mockResolvedValue(mockHealthResult);

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'unhealthy');
      expect(response.body).toHaveProperty('database', false);
      expect(response.body).toHaveProperty('timestamp');
      expect(mockHealthService.checkApplicationHealth).toHaveBeenCalledTimes(1);
    });

    it('should return 200 and degraded status when database is degraded', async () => {
      const mockHealthResult = {
        status: 'degraded' as const,
        timestamp: '2025-07-25T10:00:00.000Z',
        checks: [
          {
            name: 'database',
            status: 'degraded' as const,
            responseTime: 2000,
            message: 'Database connection slow'
          }
        ]
      };
      mockHealthService.checkApplicationHealth.mockResolvedValue(mockHealthResult);

      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'degraded');
      expect(response.body).toHaveProperty('database', false);
      expect(response.body).toHaveProperty('timestamp');
      expect(mockHealthService.checkApplicationHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('/health/detailed (GET)', () => {
    it('should return detailed health information', async () => {
      const mockDetailedHealth = {
        status: 'healthy' as const,
        timestamp: '2025-07-25T10:00:00.000Z',
        checks: [
          {
            name: 'database',
            status: 'healthy' as const,
            responseTime: 5,
            message: 'Database connection successful'
          },
          {
            name: 'memory',
            status: 'healthy' as const,
            responseTime: 1,
            message: 'Memory usage normal',
            details: {
              used: 50.5,
              total: 100,
              percentage: '50.5%'
            }
          }
        ]
      };
      mockHealthService.checkApplicationHealth.mockResolvedValue(mockDetailedHealth);

      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toEqual(mockDetailedHealth);
      expect(mockHealthService.checkApplicationHealth).toHaveBeenCalledTimes(1);
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

      expect(response.body).toHaveProperty('version', '004_add_tags_and_metadata.sql');
      expect(response.body).toHaveProperty('database', mockMigrationInfo);
      expect(response.body).toHaveProperty('timestamp');
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

      expect(response.body).toHaveProperty('application');
      expect(response.body).toHaveProperty('database', '004_add_tags_and_metadata.sql');
      expect(response.body).toHaveProperty('migrations');
      expect(response.body.migrations).toHaveProperty('applied', 4);
      expect(response.body.migrations).toHaveProperty('total', 4);
      expect(response.body.migrations).toHaveProperty('status', 'up-to-date');
      expect(response.body).toHaveProperty('timestamp');
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