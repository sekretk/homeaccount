import { MigrationStatusDto } from '../../../../shared/migration.dto';

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
   * Execute a query with parameters
   */
  query(text: string, params?: any[]): Promise<any>;
} 