# Database Migration System

This document provides detailed guidance on working with the HomeAccount database migration system.

## Table of Contents

1. [How It Works](#how-it-works)
2. [Initial Setup & Values](#initial-setup--values)
3. [Creating New Migrations](#creating-new-migrations)
4. [Backend Service Integration](#backend-service-integration)
5. [CLI Usage](#cli-usage)
6. [Health Endpoint Reporting](#health-endpoint-reporting)
7. [Troubleshooting](#troubleshooting)

---

## How It Works

### Overview

The migration system uses **sequential SQL files** to evolve the database schema over time. Each migration:

1. **Has a unique number** (001, 002, 003, etc.)
2. **Contains pure SQL** with descriptive comments
3. **Is tracked** in a `migrations` table after execution
4. **Is idempotent** - safe to run multiple times

### Migration Lifecycle

```mermaid
graph TD
    A[New Migration File] --> B[Backend Startup]
    B --> C{AUTO_MIGRATE?}
    C -->|true| D[Scan migrations/]
    C -->|false| E[Skip Migrations]
    D --> F[Check migrations table]
    F --> G{Pending migrations?}
    G -->|yes| H[Execute SQL files]
    G -->|no| I[Already up-to-date]
    H --> J[Update migrations table]
    J --> K[Log Success]
    I --> K
    E --> K
```



## Initial Setup & Values

### Database Initialization

**First Docker Run:**
1. PostgreSQL container starts
2. `database/init/01-init.sql` runs automatically (Docker feature)
3. Creates base tables and inserts seed data
4. This happens **once** when the database volume is empty

**Subsequent Runs:**
1. Init scripts are **skipped** (volume already exists)
2. Only migrations are processed

### Initial Schema (`database/init/01-init.sql`)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create test_data table with seed data
CREATE TABLE IF NOT EXISTS test_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    message TEXT,
    value INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial test records
INSERT INTO test_data (name, message, value, is_active) VALUES
    ('Test Item 1', 'Hello from PostgreSQL!', 42, true),
    ('Test Item 2', 'Database is working correctly', 100, true),
    ('Test Item 3', 'Sample data for development', 250, false),
    ('Test Item 4', 'Another test record', 777, true)
ON CONFLICT DO NOTHING;
```

### Migration Tracking Table

**Migration 001** creates the tracking table:

```sql
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64)
);
```

---

## Creating New Migrations

### 1. Migration File Format

**Filename:** `XXX_descriptive_name.sql` (where XXX is next sequential number)

**Template:**
```sql
-- Migration: 005_add_user_preferences.sql
-- Description: Add user preferences table and default settings
-- Created: 2025-07-24

-- Add your SQL commands here
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Insert default preferences
INSERT INTO user_preferences (user_id, theme, language)
SELECT gen_random_uuid(), 'dark', 'en'
WHERE NOT EXISTS (SELECT 1 FROM user_preferences LIMIT 1);

-- Record this migration
INSERT INTO migrations (migration_name, checksum)
VALUES ('005_add_user_preferences.sql', 'user_prefs_v1')
ON CONFLICT (migration_name) DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 005: Added user preferences table';
END $$;
```

### 2. Best Practices

#### ✅ Safe Patterns
```sql
-- Use IF NOT EXISTS for tables
CREATE TABLE IF NOT EXISTS new_table (...);

-- Use IF NOT EXISTS for columns
ALTER TABLE existing_table 
ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);

-- Use IF NOT EXISTS for indexes
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- Use ON CONFLICT for data
INSERT INTO table (column) VALUES ('value')
ON CONFLICT (unique_column) DO NOTHING;
```

#### ❌ Avoid These
```sql
-- Don't use without IF NOT EXISTS
CREATE TABLE new_table (...);

-- Don't drop data without backup
DROP TABLE important_data;

-- Don't use without conflict handling
INSERT INTO table (column) VALUES ('value');
```

### 3. Development Workflow

```bash
# 1. Create new migration file
touch database/migrations/005_add_user_preferences.sql

# 2. Edit the migration file with your SQL

# 3. Test locally
npm run db:migrate:status    # Check current status
npm run db:migrate          # Apply new migration

# 4. Verify migration applied
npm run db:migrate:status    # Should show new migration

# 5. Test backend startup (with auto-migration)
npm run start:dev

# 6. Check API endpoints
curl http://localhost:3001/version
curl http://localhost:3001/migrations
```

---

## Backend Service Integration

### Automatic Migration Execution

**Location:** `backend/src/database.service.ts`

**Trigger:** On application startup (`onModuleInit`)

```typescript
async onModuleInit() {
  // Connect to database
  this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Auto-migrate if enabled
  const autoMigrate = process.env.AUTO_MIGRATE !== 'false';
  if (autoMigrate) {
    await this.runMigrations();
  } else {
    console.log('⏭️ Auto-migrations disabled (AUTO_MIGRATE=false)');
  }
}
```

### Migration Execution Process

```typescript
private async runMigrations(): Promise<void> {
  try {
    // 1. Ensure migrations table exists
    await this.ensureMigrationsTable();
    
    // 2. Get list of applied migrations
    const applied = await this.getAppliedMigrations();
    
    // 3. Get available migration files
    const available = this.getMigrationFiles();
    
    // 4. Find pending migrations
    const pending = available.filter(file => !applied.includes(file));
    
    // 5. Execute each pending migration
    for (const file of pending) {
      await this.runSingleMigration(file);
      console.log(`✅ Applied migration: ${file}`);
    }
    
    console.log(`🎉 Migrations complete: ${applied.length + pending.length} total`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}
```

### Environment Variables

```bash
# Enable/disable auto-migration (default: true)
AUTO_MIGRATE=true

# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/homeaccount

# Application environment
NODE_ENV=production
```

### Docker Integration

**docker-compose.yml:**
```yaml
backend:
  environment:
    - AUTO_MIGRATE=true                    # Enable auto-migration
    - DATABASE_URL=postgresql://...        # Database connection
  depends_on:
    database:
      condition: service_healthy           # Wait for DB to be ready
```

**Dockerfile:**
```dockerfile
# Copy migrations folder to container
COPY database /database

# Migrations are available at runtime in /database/migrations/
```

---

## CLI Usage

### Manual Migration Management

**Location:** `database/migrate.js`

### Available Commands

#### 1. Check Migration Status
```bash
# Via CLI script
cd database && node migrate.js status

# Via npm script
npm run db:migrate:status
```

**Output:**
```
🔍 Migration Status Check
📊 Applied: 4/4 migrations
✅ Status: up-to-date
📅 Latest: 004_add_tags_and_metadata.sql (2025-07-24T10:29:45Z)

Applied Migrations:
  ✅ 001_create_migrations_table.sql
  ✅ 002_add_category_to_test_data.sql  
  ✅ 003_add_priority_and_indexes.sql
  ✅ 004_add_tags_and_metadata.sql

🎉 Database is up to date!
```

#### 2. Run Pending Migrations
```bash
# Via CLI script
cd database && node migrate.js run

# Via npm script
npm run db:migrate
```

**Output:**
```
🚀 Running Migrations
📂 Scanning: database/migrations/
✅ Applied migration: 005_add_user_preferences.sql
🎉 Migration complete: 5 total migrations applied
```

### NPM Scripts

**Available in `backend/package.json`:**

```json
{
  "scripts": {
    "db:migrate": "cd ../database && node migrate.js run",
    "db:migrate:status": "cd ../database && node migrate.js status",
    "db:start": "docker compose up database -d",
    "db:stop": "docker compose stop database",
    "db:logs": "docker compose logs database",
    "db:shell": "docker compose exec database psql -U homeaccount_user -d homeaccount",
    "db:reset": "docker compose down -v && docker compose up database -d"
  }
}
```

### Docker Scripts

**Available in `docker-scripts.sh`:**

```bash
# Database management
./docker-scripts.sh db-start    # Start database only
./docker-scripts.sh db-stop     # Stop database
./docker-scripts.sh db-logs     # View database logs
./docker-scripts.sh db-shell    # Connect to PostgreSQL
./docker-scripts.sh db-reset    # Reset database (destroys data!)

# Migration management
./docker-scripts.sh db-migrate  # Run migrations
./docker-scripts.sh db-status   # Check migration status
```

---

## Health Endpoint Reporting

### API Endpoints

The backend exposes several endpoints for monitoring migration status:

#### 1. `GET /health` - Basic Health Check
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-07-24T10:30:00Z"
}
```

#### 2. `GET /version` - Summary Status
```bash
curl http://localhost:3001/version
```

**Response:**
```json
{
  "application": "HomeAccount v1.0.0",
  "database": "PostgreSQL 15.4",
  "migrations": {
    "applied": 4,
    "total": 4,
    "status": "up-to-date"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

#### 3. `GET /migrations` - Detailed Migration Info
```bash
curl http://localhost:3001/migrations
```

**Response:**
```json
{
  "version": "1.0.0",
  "database": {
    "totalApplied": 4,
    "totalAvailable": 4,
    "latestMigration": "004_add_tags_and_metadata.sql",
    "appliedAt": "2025-07-24T10:29:45Z",
    "pendingMigrations": [],
    "appliedMigrations": [
      {
        "name": "001_create_migrations_table.sql",
        "appliedAt": "2025-07-24T10:00:00Z"
      },
      {
        "name": "002_add_category_to_test_data.sql", 
        "appliedAt": "2025-07-24T10:15:30Z"
      }
    ],
    "status": "up-to-date"
  },
  "timestamp": "2025-07-24T10:30:00Z"
}
```

### Frontend Integration

**Migration Status Component** (`frontend/src/App.tsx`):

```typescript
function MigrationInfo() {
  const [migrationInfo, setMigrationInfo] = useState<VersionResponseDto | null>(null);
  
  useEffect(() => {
    const fetchMigrationInfo = async () => {
      const response = await axios.get<VersionResponseDto>('/api/version');
      setMigrationInfo(response.data);
    };
    fetchMigrationInfo();
  }, []);

  if (!migrationInfo) return <p>❌ Migrations: Failed to load</p>;

  const statusEmoji = migrationInfo.migrations.status === 'up-to-date' ? '✅' :
                     migrationInfo.migrations.status === 'pending' ? '⏳' : '❓';

  return (
    <p>
      {statusEmoji} <strong>Database:</strong> {migrationInfo.database}
      ({migrationInfo.migrations.applied}/{migrationInfo.migrations.total} migrations, {migrationInfo.migrations.status})
    </p>
  );
}
```

### Status Interpretation

| Status | Meaning | Action |
|--------|---------|--------|
| `up-to-date` | All migrations applied | ✅ Normal operation |
| `pending` | New migrations available | ⚠️ Restart backend or run CLI |
| `unknown` | Error checking status | 🚨 Check database connection |

---

## Troubleshooting

### Common Issues

#### 1. "Migration failed" on startup

**Symptoms:**
```
❌ Migration failed: relation "test_data" does not exist
```

**Causes:**
- Database not initialized with `database/init/01-init.sql`
- Migration trying to modify non-existent table

**Solutions:**
```bash
# Reset database (destroys data!)
npm run db:reset

# Or recreate from scratch
docker compose down -v
docker compose up -d
```

#### 2. "Migrations: Failed to load" in UI

**Symptoms:**
- Frontend shows "❌ Migrations: Failed to load"
- API returns 404 for `/api/version`

**Causes:**
- Backend container has old code without new endpoints
- Docker cache issues

**Solutions:**
```bash
# Force rebuild backend
docker compose down
docker compose build backend --no-cache
docker compose up -d
```

#### 3. Duplicate migration execution

**Symptoms:**
```
ERROR: duplicate key value violates unique constraint "migrations_migration_name_key"
```

**Causes:**
- Migration file executed manually and automatically
- Database state inconsistency

**Solutions:**
```bash
# Check migration table
npm run db:shell
homeaccount=# SELECT * FROM migrations ORDER BY applied_at;

# Remove duplicate entry if needed
homeaccount=# DELETE FROM migrations WHERE migration_name = 'problematic_migration.sql';
```

#### 4. Docker build issues

**Symptoms:**
```
ERROR: Cannot find module '/app/dist/main.js'
```

**Causes:**
- Dockerfile pointing to wrong compiled JavaScript location
- TypeScript compilation output mismatch

**Solutions:**
- Check container structure: `docker exec -it container ls -la /app/dist/`
- Update Dockerfile CMD path to match actual build output

### Debug Commands

```bash
# Check container file structure
docker exec homeaccount-backend find /app -name "*.js" | head -10

# Check migration table directly
docker compose exec database psql -U homeaccount_user -d homeaccount -c "SELECT * FROM migrations;"

# View backend logs
docker compose logs backend --tail=50

# Check endpoint availability
curl -s http://localhost:3001/version | jq .
```

### Manual Recovery

If migrations are stuck, you can manually fix:

```sql
-- Connect to database
\c homeaccount

-- Check current migrations
SELECT migration_name, applied_at FROM migrations ORDER BY applied_at;

-- Mark migration as applied (if it was run manually)
INSERT INTO migrations (migration_name, checksum) 
VALUES ('005_problem_migration.sql', 'manual_fix')
ON CONFLICT DO NOTHING;

-- Remove incorrectly marked migration
DELETE FROM migrations WHERE migration_name = 'wrong_migration.sql';
```

---

## Next Steps

- **Production Monitoring**: Set up alerts for migration failures
- **Rollback Migrations**: Create reverse migration procedures  
- **Performance Tracking**: Monitor migration execution times
- **Backup Integration**: Automated backups before major migrations

For questions or issues, check the [GitHub Issues](https://github.com/your-org/homeaccount/issues) or contact the development team. 