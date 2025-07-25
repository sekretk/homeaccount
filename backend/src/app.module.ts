import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { 
  DatabaseService, 
  MockDatabaseService, 
  DATABASE_SERVICE_TOKEN,
  HealthService,
  MockHealthService,
  HEALTH_SERVICE_TOKEN,
  IDatabaseService,
  IHealthService} from './services';

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
export class AppModule {}