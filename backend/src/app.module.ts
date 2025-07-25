import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AppController } from './controllers/app.controller';
import { 
  DatabaseService, 
  MockDatabaseService, 
  DATABASE_SERVICE_TOKEN,
  DatabaseSeedingService,
  DATABASE_SEEDING_SERVICE_TOKEN,
  HealthService,
  MockHealthService,
  HEALTH_SERVICE_TOKEN,
  IDatabaseService,
  IHealthService,
  IDatabaseSeedingService} from './services';

@Module({
  controllers: [AppController],
  providers: [
    // Database service provider
    {
      provide: DATABASE_SERVICE_TOKEN,
      useFactory: () => {
        const useMockDatabase = process.env.USE_MOCK_DATABASE === 'true';
        return useMockDatabase ? new MockDatabaseService() : new DatabaseService();
      },
    },
    // Database seeding service provider
    {
      provide: DATABASE_SEEDING_SERVICE_TOKEN,
      useFactory: (databaseService: IDatabaseService) => {
        return new DatabaseSeedingService(databaseService);
      },
      inject: [DATABASE_SERVICE_TOKEN],
    },
    // Health service provider
    {
      provide: HEALTH_SERVICE_TOKEN,
      useFactory: (databaseService: IDatabaseService) => {
        const useMockServices = process.env.USE_MOCK_SERVICES === 'true';
        return useMockServices ? new MockHealthService() : new HealthService(databaseService);
      },
      inject: [DATABASE_SERVICE_TOKEN],
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    // Set up automatic seeding after migrations
    const autoSeed = process.env.AUTO_SEED === 'true';
    if (autoSeed) {
      try {
        const databaseService = this.moduleRef.get<IDatabaseService>(DATABASE_SERVICE_TOKEN, { strict: false });
        const seedingService = this.moduleRef.get<IDatabaseSeedingService>(DATABASE_SEEDING_SERVICE_TOKEN, { strict: false });

        // Register seeding as a post-migration callback if the method exists (real DatabaseService)
        if (databaseService.registerPostMigrationCallback) {
          databaseService.registerPostMigrationCallback(async () => {
            console.log('🌱 Auto-seeding enabled, running seeds...');
            await seedingService.runSeeds();
          });
        } else {
          console.log('🧪 Mock database service detected, skipping auto-seeding setup');
        }
      } catch (error) {
        console.error('❌ Failed to set up auto-seeding:', (error as Error).message);
      }
    }
  }
}