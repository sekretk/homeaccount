import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ExpensesListResponseDto, ExpenseDto } from '../../shared/dto';
import { ExpensesController } from '../src/controllers/expenses.controller';
import { 
  DATABASE_SERVICE_TOKEN,
  MockDatabaseService
} from '../src/services';

describe('ExpensesController (e2e)', () => {
  let app: INestApplication;
  let mockDatabaseService: MockDatabaseService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: DATABASE_SERVICE_TOKEN,
          useClass: MockDatabaseService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mockDatabaseService = moduleFixture.get<MockDatabaseService>(DATABASE_SERVICE_TOKEN);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/expenses (GET)', () => {
    it('should return 200 status', () => {
      return request(app.getHttpServer())
        .get('/expenses')
        .expect(200);
    });

    it('should return valid ExpensesListResponseDto', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      
      expect(data).toHaveProperty('expenses');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('timestamp');
      expect(Array.isArray(data.expenses)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.timestamp).toBe('string');
    });

    it('should return JSON content type', () => {
      return request(app.getHttpServer())
        .get('/expenses')
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should return current timestamp in ISO format', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      
      // Validate ISO string format
      const date = new Date(data.timestamp);
      expect(date.toISOString()).toBe(data.timestamp);
    });

    it('should return recent timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      const resultTime = new Date(data.timestamp);
      const now = new Date();
      
      // Should be within 2 seconds of current time
      const timeDiff = Math.abs(now.getTime() - resultTime.getTime());
      expect(timeDiff).toBeLessThan(2000);
    });

    it('should return mock expenses data with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      
      expect(data.expenses.length).toBeGreaterThan(0);
      expect(data.total).toBe(data.expenses.length);

      // Check first expense structure
      const expense = data.expenses[0];
      expect(expense).toHaveProperty('id');
      expect(expense).toHaveProperty('description');
      expect(expense).toHaveProperty('amount');
      expect(expense).toHaveProperty('date');
      
      expect(typeof expense.id).toBe('string');
      expect(typeof expense.description).toBe('string');
      expect(typeof expense.amount).toBe('number');
      expect(typeof expense.date).toBe('string');
    });

    it('should return expenses with valid data formats', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      
      data.expenses.forEach((expense: ExpenseDto) => {
        // Validate ID format (should be UUID-like string)
        expect(expense.id).toMatch(/^[a-f0-9-]+$/);
        
        // Validate description is non-empty
        expect(expense.description.length).toBeGreaterThan(0);
        
        // Validate amount is positive number
        expect(expense.amount).toBeGreaterThan(0);
        expect(Number.isFinite(expense.amount)).toBe(true);
        
        // Validate date format (YYYY-MM-DD)
        expect(expense.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Validate date is a valid date
        const date = new Date(expense.date);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });

    it('should return expenses sorted by date descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      
      if (data.expenses.length > 1) {
        for (let i = 0; i < data.expenses.length - 1; i++) {
          const currentDate = new Date(data.expenses[i].date);
          const nextDate = new Date(data.expenses[i + 1].date);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }
      }
    });

    it('should return consistent total count', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      expect(data.total).toBe(data.expenses.length);
    });

    it('should handle empty expenses list', async () => {
      // Override the mock to return empty expenses
      jest.spyOn(mockDatabaseService, 'getExpenses').mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      expect(data.expenses).toEqual([]);
      expect(data.total).toBe(0);
      expect(data).toHaveProperty('timestamp');
    });

    it('should handle database error gracefully', async () => {
      // Override the mock to throw an error
      jest.spyOn(mockDatabaseService, 'getExpenses').mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(500);

      // Should return error response
      expect(response.body).toHaveProperty('statusCode', 500);
    });

    it('should return expected mock expense data', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      
      // Check for expected mock data (based on MockDatabaseService)
      expect(data.expenses.length).toBe(4);
      
      const descriptions = data.expenses.map(e => e.description);
      expect(descriptions).toContain('Office Supplies');
      expect(descriptions).toContain('Business Lunch');
      expect(descriptions).toContain('Software License');
      expect(descriptions).toContain('Travel Expenses');
      
      const amounts = data.expenses.map(e => e.amount);
      expect(amounts).toContain(125.50);
      expect(amounts).toContain(67.30);
      expect(amounts).toContain(299.99);
      expect(amounts).toContain(450.75);
    });

    it('should return expenses with decimal precision maintained', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data: ExpensesListResponseDto = response.body;
      
      data.expenses.forEach((expense: ExpenseDto) => {
        // Check that decimal amounts are properly formatted
        const amountStr = expense.amount.toString();
        if (amountStr.includes('.')) {
          const decimalPart = amountStr.split('.')[1];
          expect(decimalPart.length).toBeLessThanOrEqual(2);
        }
      });
    });

    it('should maintain data consistency across multiple requests', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      const data1: ExpensesListResponseDto = response1.body;
      const data2: ExpensesListResponseDto = response2.body;
      
      // Data should be consistent (same expenses, same order for mock data)
      expect(data1.expenses.length).toBe(data2.expenses.length);
      expect(data1.total).toBe(data2.total);
      
      // Compare expense IDs to ensure same data
      const ids1 = data1.expenses.map(e => e.id).sort();
      const ids2 = data2.expenses.map(e => e.id).sort();
      expect(ids1).toEqual(ids2);
    });
  });
});