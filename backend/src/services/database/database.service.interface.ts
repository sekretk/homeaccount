import { MigrationStatusDto } from '../../../../shared/migration.dto';
import { ExpenseDto } from '../../../../shared/dto';

export interface IDatabaseService {
  /**
   * Health check method
   */
  isHealthy(): Promise<boolean>;

  /**
   * Get all test data from the database
   */
  getTestData(): Promise<any[]>;

  /**
   * Get active test data only
   */
  getActiveTestData(): Promise<any[]>;

  /**
   * Get migration status and version information
   */
  getMigrationInfo(): Promise<MigrationStatusDto>;

  /**
   * Get all expenses from the database
   */
  getExpenses(): Promise<ExpenseDto[]>;

  /**
   * Execute a query with parameters
   */
  query(text: string, params?: any[]): Promise<any>;
} 