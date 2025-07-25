import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { CurrentDataDto, MigrationInfoResponseDto, VersionResponseDto } from '../../../shared/dto';
import { IDatabaseService, DATABASE_SERVICE_TOKEN, IHealthService, HEALTH_SERVICE_TOKEN } from '../services';

describe('AppController', () => {
  let appController: AppController;
  let databaseService: IDatabaseService;
  let healthService: IHealthService;

  // Mock DatabaseService
  const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    isHealthy: jest.fn(),
    getTestData: jest.fn(),
    getActiveTestData: jest.fn(),
    getMigrationInfo: jest.fn(),
    query: jest.fn(),
  };

  // Mock HealthService
  const mockHealthService: jest.Mocked<IHealthService> = {
    checkApplicationHealth: jest.fn(),
    checkDatabaseHealth: jest.fn(),
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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

    appController = app.get<AppController>(AppController);
    databaseService = app.get<IDatabaseService>(DATABASE_SERVICE_TOKEN);
    healthService = app.get<IHealthService>(HEALTH_SERVICE_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      const mockHealthResult = {
        status: 'healthy' as const,
        timestamp: '2025-07-25T10:30:00.000Z',
        checks: [
          {
            name: 'database',
            status: 'healthy' as const,
            responseTime: 50,
            message: 'Database is healthy'
          }
        ]
      };
      mockHealthService.checkApplicationHealth.mockResolvedValue(mockHealthResult);

      const result = await appController.getHealth();

      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('database', true);
      expect(result).toHaveProperty('timestamp');
      expect(mockHealthService.checkApplicationHealth).toHaveBeenCalledTimes(1);
    });

    it('should return unhealthy status when health service reports unhealthy', async () => {
      const mockHealthResult = {
        status: 'unhealthy' as const,
        timestamp: '2025-07-25T10:30:00.000Z',
        checks: [
          {
            name: 'database',
            status: 'unhealthy' as const,
            responseTime: 5000,
            message: 'Database connection failed'
          }
        ]
      };
      mockHealthService.checkApplicationHealth.mockResolvedValue(mockHealthResult);

      const result = await appController.getHealth();

      expect(result).toHaveProperty('status', 'unhealthy');
      expect(result).toHaveProperty('database', false);
      expect(result).toHaveProperty('timestamp');
      expect(mockHealthService.checkApplicationHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health information', async () => {
      const mockHealthResult = {
        status: 'healthy' as const,
        timestamp: '2025-07-25T10:30:00.000Z',
        checks: [
          {
            name: 'database',
            status: 'healthy' as const,
            responseTime: 50,
            message: 'Database is healthy',
            details: { connectionPool: 'active' }
          },
          {
            name: 'memory',
            status: 'healthy' as const,
            message: 'Memory usage is normal',
            details: { usagePercent: 45 }
          }
        ]
      };
      mockHealthService.checkApplicationHealth.mockResolvedValue(mockHealthResult);

      const result = await appController.getDetailedHealth();

      expect(result).toEqual(mockHealthResult);
      expect(mockHealthService.checkApplicationHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTestData', () => {
    it('should return test data from database service', async () => {
      const mockData = [
        { id: 1, name: 'Test Item 1', message: 'Test message 1' },
        { id: 2, name: 'Test Item 2', message: 'Test message 2' }
      ];
      mockDatabaseService.getTestData.mockResolvedValue(mockData);

      const result = await appController.getTestData();

      expect(result).toEqual(mockData);
      expect(mockDatabaseService.getTestData).toHaveBeenCalledTimes(1);
    });
  });

  describe('getActiveTestData', () => {
    it('should return active test data from database service', async () => {
      const mockActiveData = [
        { id: 1, name: 'Active Item 1', message: 'Active message 1' }
      ];
      mockDatabaseService.getActiveTestData.mockResolvedValue(mockActiveData);

      const result = await appController.getActiveTestData();

      expect(result).toEqual(mockActiveData);
      expect(mockDatabaseService.getActiveTestData).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMigrations', () => {
    it('should return migration info with correct structure', async () => {
      const mockMigrationInfo = {
        totalApplied: 4,
        totalAvailable: 5,
        latestMigration: '004_add_tags_and_metadata.sql',
        appliedAt: '2025-07-24T10:29:45Z',
        pendingMigrations: ['005_add_audit_fields.sql'],
        appliedMigrations: [],
        status: 'pending' as const
      };
      mockDatabaseService.getMigrationInfo.mockResolvedValue(mockMigrationInfo);

      const result: MigrationInfoResponseDto = await appController.getMigrations();

      expect(result).toHaveProperty('version', '004_add_tags_and_metadata.sql');
      expect(result).toHaveProperty('database', mockMigrationInfo);
      expect(result).toHaveProperty('timestamp');
      expect(mockDatabaseService.getMigrationInfo).toHaveBeenCalledTimes(1);
    });

    it('should handle no migrations case', async () => {
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

      const result = await appController.getMigrations();

      expect(result.version).toBe('none');
      expect(result.database).toEqual(mockMigrationInfo);
    });
  });

  describe('getVersion', () => {
    it('should return version info with correct structure', async () => {
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

      const result: VersionResponseDto = await appController.getVersion();

      expect(result).toHaveProperty('application');
      expect(result).toHaveProperty('database', '004_add_tags_and_metadata.sql');
      expect(result).toHaveProperty('migrations');
      expect(result.migrations).toHaveProperty('applied', 4);
      expect(result.migrations).toHaveProperty('total', 4);
      expect(result.migrations).toHaveProperty('status', 'up-to-date');
      expect(result).toHaveProperty('timestamp');
      expect(mockDatabaseService.getMigrationInfo).toHaveBeenCalledTimes(1);
    });
  });
}); 