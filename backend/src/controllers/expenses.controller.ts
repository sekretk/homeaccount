import { Controller, Get, Inject } from '@nestjs/common';
import { ExpensesListResponseDto } from '../../../shared/dto';
import { 
  IDatabaseService, 
  DATABASE_SERVICE_TOKEN
} from '../services';

@Controller('expenses')
export class ExpensesController {
  constructor(
    @Inject(DATABASE_SERVICE_TOKEN) 
    private readonly databaseService: IDatabaseService
  ) {}

  @Get()
  async getExpenses(): Promise<ExpensesListResponseDto> {
    const expenses = await this.databaseService.getExpenses();
    
    return {
      expenses,
      total: expenses.length,
      timestamp: new Date().toISOString()
    };
  }
}