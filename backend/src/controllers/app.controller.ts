import { Controller, Get, Post, Inject } from '@nestjs/common';
import { CurrentDataDto, MigrationInfoResponseDto, VersionResponseDto } from '../../../shared/dto';
import { 
  IDatabaseService, 
  DATABASE_SERVICE_TOKEN, 
  IHealthService, 
  HEALTH_SERVICE_TOKEN,
  IDatabaseSeedingService,
  DATABASE_SEEDING_SERVICE_TOKEN
} from '../services';

@Controller()
export class AppController {
  constructor(
    @Inject(DATABASE_SERVICE_TOKEN) 
    private readonly databaseService: IDatabaseService,
    @Inject(HEALTH_SERVICE_TOKEN)
    private readonly healthService: IHealthService,
    @Inject(DATABASE_SEEDING_SERVICE_TOKEN)
    private readonly seedingService: IDatabaseSeedingService
  ) {}

  @Get('/current-data')
  getCurrentData(): CurrentDataDto {
    return {
      currentTime: new Date().toISOString(),
      message: 'Hello from NestJS backend!'
    };
  }

  @Get('/health')
  async getHealth(): Promise<{ status: string; database: boolean; timestamp: string }> {
    const healthResult = await this.healthService.checkApplicationHealth();
    const databaseCheck = healthResult.checks.find(check => check.name === 'database');
    
    return {
      status: healthResult.status,
      database: databaseCheck?.status === 'healthy',
      timestamp: healthResult.timestamp
    };
  }

  @Get('/health/detailed')
  async getDetailedHealth() {
    return this.healthService.checkApplicationHealth();
  }

  @Get('/test-data')
  async getTestData(): Promise<any[]> {
    return this.databaseService.getTestData();
  }

  @Get('/test-data/active')
  async getActiveTestData(): Promise<any[]> {
    return this.databaseService.getActiveTestData();
  }

  @Get('/migrations')
  async getMigrations(): Promise<MigrationInfoResponseDto> {
    const migrationInfo = await this.databaseService.getMigrationInfo();
    
    return {
      version: migrationInfo.latestMigration || 'none',
      database: migrationInfo,
      timestamp: new Date().toISOString()
    };
  }

  @Get('/seeds')
  async getSeeds() {
    const seedingInfo = await this.seedingService.getSeedingInfo();
    
    return {
      version: seedingInfo.latestSeed || 'none',
      database: seedingInfo,
      timestamp: new Date().toISOString()
    };
  }

  @Post('/seeds/run')
  async runSeeds() {
    await this.seedingService.runSeeds();
    const seedingInfo = await this.seedingService.getSeedingInfo();
    
    return {
      message: 'Seeds executed successfully',
      seedingInfo,
      timestamp: new Date().toISOString()
    };
  }

  @Post('/seeds/reset')
  async resetSeeds() {
    await this.seedingService.resetSeeds();
    
    return {
      message: 'Seeds reset successfully',
      timestamp: new Date().toISOString()
    };
  }

  @Get('/version')
  async getVersion(): Promise<VersionResponseDto> {
    const migrationInfo = await this.databaseService.getMigrationInfo();
    
    return {
      application: process.env.npm_package_version || '1.0.0',
      database: migrationInfo.latestMigration || 'none',
      migrations: {
        applied: migrationInfo.totalApplied,
        total: migrationInfo.totalAvailable,
        status: migrationInfo.status
      },
      timestamp: new Date().toISOString()
    };
  }
} 