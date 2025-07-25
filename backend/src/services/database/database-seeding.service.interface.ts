export interface IDatabaseSeedingService {
  /**
   * Run all pending seeds
   */
  runSeeds(): Promise<void>;

  /**
   * Get seeding status information
   */
  getSeedingInfo(): Promise<SeedingStatusDto>;

  /**
   * Check if seeds have been applied
   */
  areSeedsApplied(): Promise<boolean>;

  /**
   * Reset all seed data (for testing)
   */
  resetSeeds(): Promise<void>;
}

export interface SeedingStatusDto {
  totalApplied: number;
  totalAvailable: number;
  latestSeed: string | null;
  appliedAt: string | null;
  pendingSeeds: string[];
  appliedSeeds: AppliedSeedDto[];
  status: 'up-to-date' | 'pending' | 'unknown';
}

export interface AppliedSeedDto {
  name: string;
  appliedAt: string | null;
} 