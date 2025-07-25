import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationStatusDto, AppliedMigrationDto } from '../../../../shared/migration.dto';
import { IDatabaseService } from './database.service.interface';

@Injectable()
export class DatabaseService implements IDatabaseService, OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  private postMigrationCallbacks: (() => Promise<void>)[] = [];

  async onModuleInit() {
    // Initialize database connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://homeaccount_user:homeaccount_password@localhost:5432/homeaccount',
      max: 10, // Maximum number of connections in the pool
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Timeout after 2 seconds if unable to connect
    });

    // Test the connection
    try {
      const client = await this.pool.connect();
      console.log('✅ Database connected successfully');
      client.release();
      
      // Run migrations on startup (can be disabled with env var)
      const autoMigrate = process.env.AUTO_MIGRATE !== 'false';
      if (autoMigrate) {
        await this.runMigrations();
        
        // Execute post-migration callbacks (like seeding)
        await this.executePostMigrationCallbacks();
      } else {
        console.log('⏭️ Auto-migrations disabled (AUTO_MIGRATE=false)');
      }
      
    } catch (error) {
      console.error('❌ Database connection failed:', (error as Error).message);
      throw error;
    }
  }

  async onModuleDestroy() {
    // Close database connection pool when module is destroyed
    await this.pool.end();
    console.log('🔌 Database connection pool closed');
  }

  /**
   * Register a callback to be executed after migrations are complete
   */
  registerPostMigrationCallback(callback: () => Promise<void>): void {
    this.postMigrationCallbacks.push(callback);
  }

  /**
   * Execute all registered post-migration callbacks
   */
  private async executePostMigrationCallbacks(): Promise<void> {
    if (this.postMigrationCallbacks.length === 0) {
      return;
    }

    console.log(`🔗 Executing ${this.postMigrationCallbacks.length} post-migration callback(s)...`);
    
    for (const callback of this.postMigrationCallbacks) {
      try {
        await callback();
      } catch (error) {
        console.error('❌ Post-migration callback failed:', (error as Error).message);
        // Continue with other callbacks even if one fails
      }
    }
  }

  /**
   * Get the migrations directory path from environment variable or default
   */
  private getMigrationsDirectory(): string {
    const envDir = process.env.MIGRATIONS_DIR;
    if (envDir) {
      // If it's an absolute path, use it as-is
      if (path.isAbsolute(envDir)) {
        return envDir;
      }
      // If it's relative, resolve it from project root
      return path.resolve(process.cwd(), envDir);
    }
    
    // Default: relative to this service file
    return path.join(__dirname, '../../../database/migrations');
  }

  /**
   * Execute a query with parameters
   */
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Health check method
   */
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health_check');
      return result.rowCount === 1;
    } catch (error) {
      console.error('Database health check failed:', (error as Error).message);
      return false;
    }
  }

  /**
   * Get all test data from the database
   */
  async getTestData(): Promise<any[]> {
    const result = await this.query(
      'SELECT id, name, message, value, is_active, created_at FROM test_data ORDER BY name'
    );
    return result.rows;
  }

  /**
   * Get active test data only
   */
  async getActiveTestData(): Promise<any[]> {
    const result = await this.query(
      'SELECT id, name, message, value, created_at FROM test_data WHERE is_active = true ORDER BY name'
    );
    return result.rows;
  }

  /**
   * Get migration status and version information
   */
  async getMigrationInfo(): Promise<MigrationStatusDto> {
    try {
      // Ensure migrations table exists
      await this.ensureMigrationsTable();

      // Get applied migrations with timestamps
      const appliedResult = await this.query(
        'SELECT migration_name, applied_at FROM migrations ORDER BY applied_at ASC'
      );
      
      const appliedMigrations: AppliedMigrationDto[] = appliedResult.rows.map((row: any) => ({
        name: row.migration_name,
        appliedAt: row.applied_at?.toISOString() || null
      }));

      // Get available migration files
      const allMigrations = this.getMigrationFiles();
      
      // Find pending migrations
      const appliedNames = appliedMigrations.map((m: AppliedMigrationDto) => m.name);
      const pendingMigrations = allMigrations.filter(
        migration => !appliedNames.includes(migration)
      );

      // Get latest migration info
      const latestApplied = appliedMigrations[appliedMigrations.length - 1];

      return {
        totalApplied: appliedMigrations.length,
        totalAvailable: allMigrations.length,
        latestMigration: latestApplied?.name || null,
        appliedAt: latestApplied?.appliedAt || null,
        pendingMigrations,
        appliedMigrations,
        status: pendingMigrations.length === 0 ? 'up-to-date' : 'pending'
      };

    } catch (error) {
      console.error('Failed to get migration info:', (error as Error).message);
      return {
        totalApplied: 0,
        totalAvailable: 0,
        latestMigration: null,
        appliedAt: null,
        pendingMigrations: [],
        appliedMigrations: [],
        status: 'unknown'
      };
    }
  }

  /**
   * Run database migrations on startup
   */
  private async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Running database migrations...');
      
      // Ensure migrations table exists
      await this.ensureMigrationsTable();
      
      // Get applied and available migrations
      const appliedMigrations = await this.getAppliedMigrations();
      const allMigrations = await this.getMigrationFiles();
      
      // Find pending migrations
      const pendingMigrations = allMigrations.filter(
        migration => !appliedMigrations.includes(migration)
      );
      
      if (pendingMigrations.length === 0) {
        console.log('✨ No pending migrations found');
        return;
      }
      
      console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`);
      
      // Run pending migrations
      for (const migration of pendingMigrations) {
        await this.runSingleMigration(migration);
      }
      
      console.log('🎉 All migrations completed successfully!');
      
    } catch (error) {
      console.error('💥 Migration failed:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Ensure migrations table exists
   */
  private async ensureMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(64)
      );
    `;
    
    await this.query(query);
    console.log('✅ Migrations table ready');
  }

  /**
   * Get list of applied migrations
   */
  private async getAppliedMigrations(): Promise<string[]> {
    const result = await this.query(
      'SELECT migration_name FROM migrations ORDER BY applied_at'
    );
    return result.rows.map((row: any) => row.migration_name);
  }

  /**
   * Get list of migration files
   */
  private getMigrationFiles(): string[] {
    const migrationsDir = this.getMigrationsDirectory();
    
    if (!fs.existsSync(migrationsDir)) {
      console.log(`📁 No migrations directory found at: ${migrationsDir}`);
      return [];
    }
    
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📂 Found ${files.length} migration files in: ${migrationsDir}`);
    return files;
  }

  /**
   * Run a single migration file
   */
  private async runSingleMigration(filename: string): Promise<void> {
    const filepath = path.join(this.getMigrationsDirectory(), filename);
    const sql = fs.readFileSync(filepath, 'utf8');
    
    console.log(`🚀 Running migration: ${filename}`);
    
    try {
      await this.query(sql);
      console.log(`✅ Completed: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed: ${filename} - ${(error as Error).message}`);
      throw error;
    }
  }
} 