import { Injectable } from '@nestjs/common';
import { MigrationStatusDto } from '../../../../shared/migration.dto';
import { ExpenseDto } from '../../../../shared/dto';
import { IDatabaseService } from './database.service.interface';

@Injectable()
export class MockDatabaseService implements IDatabaseService {
  private mockData = [
    {
      id: 1,
      name: 'Mock Test Item 1',
      message: 'This is mock test data 1',
      value: 100,
      is_active: true,
      created_at: new Date('2025-01-01T10:00:00Z'),
      category: 'test',
      priority: 1,
      tags: ['mock', 'test', 'data'],
      metadata: { type: 'mock', environment: 'test' }
    },
    {
      id: 2,
      name: 'Mock Test Item 2',
      message: 'This is mock test data 2',
      value: 200,
      is_active: false,
      created_at: new Date('2025-01-01T11:00:00Z'),
      category: 'test',
      priority: 2,
      tags: ['mock', 'test', 'inactive'],
      metadata: { type: 'mock', environment: 'test', archived: true }
    },
    {
      id: 3,
      name: 'Mock Active Item',
      message: 'This is an active mock item',
      value: 300,
      is_active: true,
      created_at: new Date('2025-01-01T12:00:00Z'),
      category: 'active',
      priority: 1,
      tags: ['mock', 'active', 'important'],
      metadata: { type: 'mock', environment: 'test', priority: 'high' }
    }
  ];

  private mockMigrationInfo: MigrationStatusDto = {
    totalApplied: 5,
    totalAvailable: 5,
    latestMigration: '005_add_audit_fields.sql',
    appliedAt: '2025-07-25T10:30:00.000Z',
    pendingMigrations: [],
    appliedMigrations: [
      { name: '001_create_migrations_table.sql', appliedAt: '2025-07-25T10:00:00.000Z' },
      { name: '002_add_category_to_test_data.sql', appliedAt: '2025-07-25T10:10:00.000Z' },
      { name: '003_add_priority_and_indexes.sql', appliedAt: '2025-07-25T10:15:00.000Z' },
      { name: '004_add_tags_and_metadata.sql', appliedAt: '2025-07-25T10:20:00.000Z' },
      { name: '005_add_audit_fields.sql', appliedAt: '2025-07-25T10:30:00.000Z' }
    ],
    status: 'up-to-date'
  };

  private mockExpenses: ExpenseDto[] = [
    {
      id: 'e1a2b3c4-d5e6-4f7a-8a9b-c0d1e2f3a4b5',
      description: 'Office Supplies',
      amount: 125.50,
      date: '2025-01-23'
    },
    {
      id: 'f2b3c4d5-e6f7-4a8b-9c0d-e1f2a3b4c5d6',
      description: 'Business Lunch',
      amount: 67.30,
      date: '2025-01-22'
    },
    {
      id: 'a3c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7',
      description: 'Software License',
      amount: 299.99,
      date: '2025-01-21'
    },
    {
      id: 'b4d5e6f7-a8b9-4c0d-1e2f-a3b4c5d6e7f8',
      description: 'Travel Expenses',
      amount: 450.75,
      date: '2025-01-20'
    }
  ];

  /**
   * Health check method - always returns true for mock
   */
  async isHealthy(): Promise<boolean> {
    console.log('🧪 Mock DatabaseService: Health check - always healthy');
    return true;
  }

  /**
   * Get all test data from mock data
   */
  async getTestData(): Promise<any[]> {
    console.log('🧪 Mock DatabaseService: Returning all test data');
    return [...this.mockData];
  }

  /**
   * Get active test data only from mock data
   */
  async getActiveTestData(): Promise<any[]> {
    console.log('🧪 Mock DatabaseService: Returning active test data');
    return this.mockData.filter(item => item.is_active);
  }

  /**
   * Get all expenses from mock data
   */
  async getExpenses(): Promise<ExpenseDto[]> {
    console.log('🧪 Mock DatabaseService: Returning mock expenses');
    return [...this.mockExpenses];
  }

  /**
   * Get mock migration status information
   */
  async getMigrationInfo(): Promise<MigrationStatusDto> {
    console.log('🧪 Mock DatabaseService: Returning mock migration info');
    return { ...this.mockMigrationInfo };
  }

  /**
   * Mock query execution - returns different responses based on query
   */
  async query(text: string, params?: any[]): Promise<any> {
    console.log(`🧪 Mock DatabaseService: Executing query: ${text.substring(0, 50)}...`);
    
    // Simulate different query responses
    if (text.includes('SELECT 1 as health_check')) {
      return { rowCount: 1, rows: [{ health_check: 1 }] };
    }
    
    if (text.includes('SELECT id, name, message, value, is_active, created_at FROM test_data')) {
      if (text.includes('WHERE is_active = true')) {
        return { rowCount: 2, rows: this.mockData.filter(item => item.is_active) };
      }
      return { rowCount: this.mockData.length, rows: this.mockData };
    }
    
    if (text.includes('SELECT migration_name, applied_at FROM migrations')) {
      return {
        rowCount: this.mockMigrationInfo.appliedMigrations.length,
        rows: this.mockMigrationInfo.appliedMigrations.map(m => ({
          migration_name: m.name,
          applied_at: new Date(m.appliedAt!)
        }))
      };
    }
    
    if (text.includes('SELECT id, description, amount, date FROM expenses')) {
      return {
        rowCount: this.mockExpenses.length,
        rows: this.mockExpenses.map(expense => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount.toString(), // Simulate decimal type from DB
          date: new Date(expense.date + 'T00:00:00.000Z') // Simulate date type from DB
        }))
      };
    }
    
    // Default response for unknown queries
    return { rowCount: 0, rows: [] };
  }

  /**
   * Add a new mock data item (for testing purposes)
   */
  addMockData(item: any): void {
    const newItem = {
      ...item,
      id: Math.max(...this.mockData.map(d => d.id)) + 1,
      created_at: new Date()
    };
    this.mockData.push(newItem);
    console.log(`🧪 Mock DatabaseService: Added new mock data item with id ${newItem.id}`);
  }

  /**
   * Clear all mock data (for testing purposes)
   */
  clearMockData(): void {
    this.mockData = [];
    console.log('🧪 Mock DatabaseService: Cleared all mock data');
  }

  /**
   * Reset mock data to default state (for testing purposes)
   */
  resetMockData(): void {
    this.mockData = [
      {
        id: 1,
        name: 'Mock Test Item 1',
        message: 'This is mock test data 1',
        value: 100,
        is_active: true,
        created_at: new Date('2025-01-01T10:00:00Z'),
        category: 'test',
        priority: 1,
        tags: ['mock', 'test', 'data'],
        metadata: { type: 'mock', environment: 'test' }
      },
      {
        id: 2,
        name: 'Mock Test Item 2',
        message: 'This is mock test data 2',
        value: 200,
        is_active: false,
        created_at: new Date('2025-01-01T11:00:00Z'),
        category: 'test',
        priority: 2,
        tags: ['mock', 'test', 'inactive'],
        metadata: { type: 'mock', environment: 'test', archived: true }
      },
      {
        id: 3,
        name: 'Mock Active Item',
        message: 'This is an active mock item',
        value: 300,
        is_active: true,
        created_at: new Date('2025-01-01T12:00:00Z'),
        category: 'active',
        priority: 1,
        tags: ['mock', 'active', 'important'],
        metadata: { type: 'mock', environment: 'test', priority: 'high' }
      }
    ];
    console.log('🧪 Mock DatabaseService: Reset mock data to default state');
  }

  /**
   * Set mock migration info (for testing different migration states)
   */
  setMockMigrationInfo(migrationInfo: Partial<MigrationStatusDto>): void {
    this.mockMigrationInfo = { ...this.mockMigrationInfo, ...migrationInfo };
    console.log('🧪 Mock DatabaseService: Updated mock migration info');
  }
} 