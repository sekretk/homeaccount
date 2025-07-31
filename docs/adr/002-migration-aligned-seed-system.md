# ADR-002: Migration-Aligned Seed System

## Status
Accepted

## Context
The application needs test and development data for local development and testing environments. Previously, we considered maintaining database snapshots, but this approach creates maintenance overhead as the schema evolves - snapshots become outdated and require constant updates to stay compatible with new migrations.

## Decision
We will implement a migration-aligned seed system that:

1. **Co-locates seeds with migrations** using the same numbering (`001_migration.sql` + `001_migration.seeds.sql`)
2. **Eliminates snapshot maintenance** by keeping seeds synchronized with schema versions
3. **Implements via DatabaseService** with automatic seed execution after migrations (when enabled)
4. **Provides CLI controls** for enabling/disabling seeds independently

Seeds are optional, disabled by default (`APPLY_SEEDS=false`), and run automatically after their corresponding migration when enabled.

## Consequences

### Positive
- **No snapshot maintenance burden** - seeds evolve with schema automatically
- **Always compatible data** - seeds match the exact schema version
- **Environment control** - production-safe with explicit opt-in
- **Developer convenience** - automatic execution with migrations

### Negative
- **Coupling** - seeds are tied to migration lifecycle
- **Limited flexibility** - cannot run seeds independently of migrations

## Implementation
- `DatabaseService.runSingleMigration()` checks for corresponding `.seeds.sql` files
- CLI commands (`./docker-scripts.sh seeds-on/off`) control the `APPLY_SEEDS` environment variable
- Seeds fail gracefully without blocking migrations 