import { Controller, Get } from '@nestjs/common';
import { CurrentDataDto, MigrationInfoResponseDto, VersionResponseDto } from '../../shared/dto';
import { DatabaseService } from './database.service';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('/current-data')
  getCurrentData(): CurrentDataDto {
    return {
      currentTime: new Date().toISOString(),
      message: 'Hello from NestJS backend!'
    };
  }

  @Get('/health')
  async getHealth(): Promise<{ status: string; database: boolean; timestamp: string }> {
    const isDatabaseHealthy = await this.databaseService.isHealthy();
    
    return {
      status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
      database: isDatabaseHealthy,
      timestamp: new Date().toISOString()
    };
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