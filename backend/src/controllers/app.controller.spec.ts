import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { CurrentDataDto, MigrationInfoResponseDto, VersionResponseDto } from '../../../shared/dto';
import { 
  DATABASE_SERVICE_TOKEN, 
  HEALTH_SERVICE_TOKEN,
  MockDatabaseService,
  MockHealthService
} from '../services';

describe('AppController', () => {
  let appController: AppController;
  let databaseService: MockDatabaseService;
  let healthService: MockHealthService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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

    appController = app.get<AppController>(AppController);
    databaseService = app.get<MockDatabaseService>(DATABASE_SERVICE_TOKEN);
    healthService = app.get<MockHealthService>(HEALTH_SERVICE_TOKEN);
  });

  describe('getCurrentData', () => {
    it('should return current data with correct structure', () => {
      const result: CurrentDataDto = appController.getCurrentData();
      
      expect(result).toHaveProperty('currentTime');
      expect(result).toHaveProperty('message');
      expect(typeof result.currentTime).toBe('string');
      expect(typeof result.message).toBe('string');
    });

    it('should return current time in ISO format', () => {
      const result: CurrentDataDto = appController.getCurrentData();
      
      // Check if currentTime is a valid ISO string
      const date = new Date(result.currentTime);
      expect(date.toISOString()).toBe(result.currentTime);
    });

    it('should return expected message', () => {
      const result: CurrentDataDto = appController.getCurrentData();
      
      expect(result.message).toBe('Hello from NestJS backend!');
    });

    it('should return recent timestamp', () => {
      const result: CurrentDataDto = appController.getCurrentData();
      const resultTime = new Date(result.currentTime);
      const now = new Date();
      
      // Should be within 1 second of current time
      const timeDiff = Math.abs(now.getTime() - resultTime.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe('getHealth', () => {
    it('should return healthy status when health service reports healthy', async () => {
      // MockHealthService returns healthy by default
      const result = await appController.getHealth();

      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('database', true);
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should return unhealthy status when health service reports unhealthy', async () => {
      // Override the mock health service to return unhealthy
      jest.spyOn(healthService, 'checkApplicationHealth').mockResolvedValue({
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

      const result = await appController.getHealth();

      expect(result).toHaveProperty('status', 'unhealthy');
      expect(result).toHaveProperty('database', false);
      expect(result).toHaveProperty('timestamp');
    });

    it('should return degraded status when database check is degraded', async () => {
      // Override the mock health service to return degraded
      jest.spyOn(healthService, 'checkApplicationHealth').mockResolvedValue({
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

      const result = await appController.getHealth();

      expect(result).toHaveProperty('status', 'degraded');
      expect(result).toHaveProperty('database', false);
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health information', async () => {
      // MockHealthService provides detailed health by default
      const result = await appController.getDetailedHealth();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(Array.isArray(result.checks)).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
    });
  });

  describe('getTestData', () => {
    it('should return test data from database service', async () => {
      // MockDatabaseService provides default test data
      const result = await appController.getTestData();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('message');
    });

    it('should handle empty test data', async () => {
      // Override the mock to return empty data
      jest.spyOn(databaseService, 'getTestData').mockResolvedValue([]);

      const result = await appController.getTestData();

      expect(result).toEqual([]);
    });
  });

  describe('getActiveTestData', () => {
    it('should return active test data from database service', async () => {
      // MockDatabaseService filters for active data
      const result = await appController.getActiveTestData();

      expect(Array.isArray(result)).toBe(true);
      expect(result.every(item => item.is_active === true)).toBe(true);
    });
  });

  describe('getMigrations', () => {
    it('should return migration info with correct structure', async () => {
      // MockDatabaseService provides default migration info
      const result: MigrationInfoResponseDto = await appController.getMigrations();

      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('timestamp');
      expect(result.database).toHaveProperty('totalApplied');
      expect(result.database).toHaveProperty('totalAvailable');
      expect(result.database).toHaveProperty('status');
    });

    it('should handle pending migrations case', async () => {
      // Override mock to return pending migrations
      jest.spyOn(databaseService, 'getMigrationInfo').mockResolvedValue({
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

      const result = await appController.getMigrations();

      expect(result.database.status).toBe('pending');
      expect(result.database.pendingMigrations.length).toBeGreaterThan(0);
    });

    it('should handle no migrations case', async () => {
      // Override mock to return no migrations
      jest.spyOn(databaseService, 'getMigrationInfo').mockResolvedValue({
        totalApplied: 0,
        totalAvailable: 0,
        latestMigration: null,
        appliedAt: null,
        pendingMigrations: [],
        appliedMigrations: [],
        status: 'up-to-date'
      });

      const result = await appController.getMigrations();

      expect(result.version).toBe('none');
      expect(result.database.totalApplied).toBe(0);
    });
  });

  describe('getVersion', () => {
    it('should return version info with correct structure', async () => {
      // MockDatabaseService provides default migration info
      const result: VersionResponseDto = await appController.getVersion();

      expect(result).toHaveProperty('application');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('migrations');
      expect(result.migrations).toHaveProperty('applied');
      expect(result.migrations).toHaveProperty('total');
      expect(result.migrations).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
    });

    it('should handle application version from environment', async () => {
      const originalVersion = process.env.npm_package_version;
      process.env.npm_package_version = '2.1.0';

      const result = await appController.getVersion();

      expect(result.application).toBe('2.1.0');

      // Restore original environment
      if (originalVersion) {
        process.env.npm_package_version = originalVersion;
      } else {
        delete process.env.npm_package_version;
      }
    });
  });
}); 