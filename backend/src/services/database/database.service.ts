import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationStatusDto, AppliedMigrationDto } from '../../../../shared/migration.dto';
import { ExpenseDto } from '../../../../shared/dto';
import { IDatabaseService } from './database.service.interface';

@Injectable()
export class DatabaseService implements IDatabaseService, OnModuleInit, OnModuleDestroy {
  private pool!: Pool;

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
    if (this.pool) {
      await this.pool.end();
      console.log('🔌 Database connection pool closed');
    }
  }

  /**
   * Execute a query with parameters
   */
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', (error as Error).message);
      throw error;
    } finally {
      client.release();
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
   * Get all expenses from the database
   */
  async getExpenses(): Promise<ExpenseDto[]> {
    const result = await this.query(
      'SELECT id, description, amount, date FROM expenses ORDER BY date DESC'
    );
    return result.rows.map((row: any) => ({
      id: row.id,
      description: row.description,
      amount: parseFloat(row.amount),
      date: row.date.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
    }));
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
      .filter(file => file.endsWith('.sql') && !file.endsWith('.seeds.sql'))
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
      // Run the migration
      await this.query(sql);
      console.log(`✅ Migration completed: ${filename}`);
      
      // Record the migration as applied
      await this.query(
        'INSERT INTO migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
        [filename]
      );
      
      // Check if seeds should be applied
      const applySeeds = process.env.APPLY_SEEDS === 'true';
      if (applySeeds) {
        await this.runSeedsForMigration(filename);
      }
      
    } catch (error) {
      console.error(`❌ Failed: ${filename} - ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Run seed files for a specific migration
   */
  private async runSeedsForMigration(migrationFilename: string): Promise<void> {
    const seedFilename = this.getSeedFilename(migrationFilename);
    const seedFilepath = path.join(this.getMigrationsDirectory(), seedFilename);
    
    // Check if seed file exists
    if (!fs.existsSync(seedFilepath)) {
      console.log(`📝 No seed file found for ${migrationFilename} (looked for: ${seedFilename})`);
      return;
    }
    
    try {
      console.log(`🌱 Running seeds: ${seedFilename}`);
      const seedSql = fs.readFileSync(seedFilepath, 'utf8');
      await this.query(seedSql);
      console.log(`✅ Seeds completed: ${seedFilename}`);
    } catch (error) {
      console.error(`❌ Seed failed: ${seedFilename} - ${(error as Error).message}`);
      // Don't throw - seeds are optional and shouldn't break migrations
      console.warn(`⚠️  Continuing without seeds for ${migrationFilename}`);
    }
  }

  /**
   * Get the corresponding seed filename for a migration
   */
  private getSeedFilename(migrationFilename: string): string {
    // Convert "001_create_table.sql" to "001_create_table.seeds.sql"
    const baseName = migrationFilename.replace('.sql', '');
    return `${baseName}.seeds.sql`;
  }

  /**
   * Get list of available seed files
   */
  private getSeedFiles(): string[] {
    const migrationsDir = this.getMigrationsDirectory();
    
    if (!fs.existsSync(migrationsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.seeds.sql'))
      .sort();
    
    return files;
  }
} 