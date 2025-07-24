import { Controller, Get } from '@nestjs/common';
import { CurrentDataDto } from '../../shared/dto';

@Controller()
export class AppController {
  @Get('/current-data')
  getCurrentData(): CurrentDataDto {
    return {
      currentTime: new Date().toISOString(),
      message: 'Hello from NestJS backend!'
    };
  }
} 