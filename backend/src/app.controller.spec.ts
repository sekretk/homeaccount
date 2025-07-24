import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { CurrentDataDto } from '../../shared/dto';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
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
}); 