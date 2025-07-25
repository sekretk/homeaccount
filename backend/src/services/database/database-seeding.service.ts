import { Injectable, Inject } from '@nestjs/common';
import { IDatabaseSeedingService, SeedingStatusDto, AppliedSeedDto } from './database-seeding.service.interface';
import { IDatabaseService } from './database.service.interface';
import { DATABASE_SERVICE_TOKEN } from '../index';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseSeedingService implements IDatabaseSeedingService {
  constructor(
    @Inject(DATABASE_SERVICE_TOKEN)
    private readonly databaseService: IDatabaseService
  ) {}

  /**
   * Get the seeds directory path from environment variable or default
   */
  private getSeedsDirectory(): string {
    const envDir = process.env.SEEDS_DIR;
    if (envDir) {
      // If it's an absolute path, use it as-is
      if (path.isAbsolute(envDir)) {
        return envDir;
      }
      // If it's relative, resolve it from project root
      return path.resolve(process.cwd(), envDir);
    }
    
    // Default: relative to this service file
    return path.join(__dirname, '../../../database/seeds');
  }

  /**
   * Run all pending seeds
   */
  async runSeeds(): Promise<void> {
    try {
      console.log('🌱 Running database seeds...');
      
      // Ensure seeds table exists
      await this.ensureSeedsTable();
      
      // Get applied and available seeds
      const appliedSeeds = await this.getAppliedSeeds();
      const allSeeds = await this.getSeedFiles();
      
      // Find pending seeds
      const pendingSeeds = allSeeds.filter(
        seed => !appliedSeeds.includes(seed)
      );
      
      if (pendingSeeds.length === 0) {
        console.log('🌱 No pending seeds found');
        return;
      }
      
      console.log(`🌱 Found ${pendingSeeds.length} pending seed(s)`);
      
      // Run pending seeds
      for (const seed of pendingSeeds) {
        await this.runSingleSeed(seed);
      }
      
      console.log('🎉 All seeds completed successfully!');
      
    } catch (error) {
      console.error('💥 Seeding failed:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Get seeding status information
   */
  async getSeedingInfo(): Promise<SeedingStatusDto> {
    try {
      // Ensure seeds table exists
      await this.ensureSeedsTable();

      // Get applied seeds with timestamps
      const appliedResult = await this.databaseService.query(
        'SELECT seed_name, applied_at FROM seeds ORDER BY applied_at ASC'
      );
      
      const appliedSeeds: AppliedSeedDto[] = appliedResult.rows.map((row: any) => ({
        name: row.seed_name,
        appliedAt: row.applied_at?.toISOString() || null
      }));

      // Get available seed files
      const allSeeds = this.getSeedFiles();
      
      // Find pending seeds
      const appliedNames = appliedSeeds.map((s: AppliedSeedDto) => s.name);
      const pendingSeeds = allSeeds.filter(
        seed => !appliedNames.includes(seed)
      );

      // Get latest seed info
      const latestApplied = appliedSeeds[appliedSeeds.length - 1];

      return {
        totalApplied: appliedSeeds.length,
        totalAvailable: allSeeds.length,
        latestSeed: latestApplied?.name || null,
        appliedAt: latestApplied?.appliedAt || null,
        pendingSeeds,
        appliedSeeds,
        status: pendingSeeds.length === 0 ? 'up-to-date' : 'pending'
      };

    } catch (error) {
      console.error('Failed to get seeding info:', (error as Error).message);
      return {
        totalApplied: 0,
        totalAvailable: 0,
        latestSeed: null,
        appliedAt: null,
        pendingSeeds: [],
        appliedSeeds: [],
        status: 'unknown'
      };
    }
  }

  /**
   * Check if seeds have been applied
   */
  async areSeedsApplied(): Promise<boolean> {
    try {
      const seedInfo = await this.getSeedingInfo();
      return seedInfo.status === 'up-to-date' && seedInfo.totalApplied > 0;
    } catch (error) {
      console.error('Failed to check seed status:', (error as Error).message);
      return false;
    }
  }

  /**
   * Reset all seed data (for testing)
   */
  async resetSeeds(): Promise<void> {
    try {
      console.log('🔄 Resetting seed data...');
      
      // Clear the seeds tracking table
      await this.databaseService.query('DELETE FROM seeds');
      
      // Here you could also add logic to reset specific seeded data
      // For now, we'll just clear the tracking
      
      console.log('✅ Seed data reset completed');
    } catch (error) {
      console.error('Failed to reset seeds:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Ensure seeds table exists
   */
  private async ensureSeedsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS seeds (
        id SERIAL PRIMARY KEY,
        seed_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        checksum VARCHAR(64)
      );
    `;
    
    await this.databaseService.query(query);
    console.log('✅ Seeds table ready');
  }

  /**
   * Get list of applied seeds
   */
  private async getAppliedSeeds(): Promise<string[]> {
    const result = await this.databaseService.query(
      'SELECT seed_name FROM seeds ORDER BY applied_at'
    );
    return result.rows.map((row: any) => row.seed_name);
  }

  /**
   * Get list of seed files
   */
  private getSeedFiles(): string[] {
    const seedsDir = this.getSeedsDirectory();
    
    if (!fs.existsSync(seedsDir)) {
      console.log(`🌱 No seeds directory found at: ${seedsDir}`);
      return [];
    }
    
    const files = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`🌱 Found ${files.length} seed files in: ${seedsDir}`);
    return files;
  }

  /**
   * Run a single seed file
   */
  private async runSingleSeed(filename: string): Promise<void> {
    const filepath = path.join(this.getSeedsDirectory(), filename);
    const sql = fs.readFileSync(filepath, 'utf8');
    
    console.log(`🌱 Running seed: ${filename}`);
    
    try {
      // Execute the seed SQL
      await this.databaseService.query(sql);
      
      // Record that this seed was applied
      await this.databaseService.query(
        'INSERT INTO seeds (seed_name) VALUES ($1)',
        [filename]
      );
      
      console.log(`✅ Completed: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed: ${filename} - ${(error as Error).message}`);
      throw error;
    }
  }
} 