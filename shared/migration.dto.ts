export interface AppliedMigrationDto {
  name: string;
  appliedAt: string | null;
}

export interface MigrationStatusDto {
  totalApplied: number;
  totalAvailable: number;
  latestMigration: string | null;
  appliedAt: string | null;
  pendingMigrations: string[];
  appliedMigrations: AppliedMigrationDto[];
  status: 'up-to-date' | 'pending' | 'unknown';
}

export interface MigrationInfoResponseDto {
  version: string;
  database: MigrationStatusDto;
  timestamp: string;
}

export interface VersionResponseDto {
  application: string;
  database: string;
  migrations: {
    applied: number;
    total: number;
    status: string;
  };
  timestamp: string;
} 