# Database Seeds Documentation

## Overview

The HomeAccount application uses a **migration-aligned seed system** that keeps test and development data synchronized with database schema changes. Seeds are optional SQL files that run automatically after their corresponding migrations when enabled.

## 🎯 Key Concepts

### Migration-Aligned Design
- **One-to-One Relationship**: Each seed file corresponds to exactly one migration
- **Same Numbering**: Seeds use identical numbering as their migrations
- **Optional**: Not every migration needs a seed file
- **Automatic Execution**: Seeds run immediately after their migration (when enabled)

### File Naming Convention
```
001_create_table.sql        ← Migration
001_create_table.seeds.sql  ← Corresponding seed file
```

## 📁 File Structure

```
database/migrations/
├── 001_create_migrations_table.sql
├── 001_create_migrations_table.seeds.sql
├── 002_add_category_to_test_data.sql
├── 002_add_category_to_test_data.seeds.sql
├── 003_add_priority_and_indexes.sql
├── 004_add_tags_and_metadata.sql
├── 004_add_tags_and_metadata.seeds.sql
└── 005_add_audit_fields.sql
    (no 005 seed file - seeds are optional)
```

## ⚙️ Configuration

### Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `APPLY_SEEDS` | `true`/`false` | `false` | Enable/disable automatic seed application |
| `MIGRATIONS_DIR` | path | `/database/migrations` | Directory containing migrations and seeds |

### Docker Compose
```yaml
backend:
  environment:
    - APPLY_SEEDS=false  # Production-safe default
```

## 🚀 Usage

### Starting with Seeds Enabled

```bash
# Start all services with seeds enabled
./docker-scripts.sh up-with-seeds

# Restart backend with seeds enabled
./docker-scripts.sh restart-with-seeds
```

### Managing Seed Configuration

```bash
# Enable seeds permanently
./docker-scripts.sh seeds-on

# Disable seeds permanently  
./docker-scripts.sh seeds-off
```

### Manual Environment Variable
```bash
# One-time enable for current startup
APPLY_SEEDS=true docker compose up -d

# Check current setting
docker compose exec backend env | grep APPLY_SEEDS
```

## 📝 Writing Seed Files

### Basic Structure
```sql
-- Seeds for 001_create_table.sql
-- This file contains initial data for the table created in migration 001

-- Clear existing seed data (for idempotency)
DELETE FROM my_table WHERE name LIKE 'Seed-%';

-- Insert seed data
INSERT INTO my_table (name, value, is_active) VALUES
    ('Seed-Example-1', 100, true),
    ('Seed-Example-2', 200, false);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Applied seeds for migration 001_create_table.sql';
    RAISE NOTICE 'Inserted % seed records', (SELECT COUNT(*) FROM my_table WHERE name LIKE 'Seed-%');
END $$;
```

### Best Practices

#### 1. **Use Prefixed Names**
```sql
-- Good: Clearly identifies seed data
INSERT INTO users (username, email) VALUES 
    ('seed-admin', 'admin@example.dev'),
    ('seed-user', 'user@example.dev');

-- Avoid: Hard to distinguish from real data
INSERT INTO users (username, email) VALUES 
    ('admin', 'admin@example.com');
```

#### 2. **Make Seeds Idempotent**
```sql
-- Clear previous seed data first
DELETE FROM products WHERE sku LIKE 'SEED-%';

-- Then insert fresh data
INSERT INTO products (sku, name, price) VALUES
    ('SEED-WIDGET-1', 'Test Widget', 9.99);
```

#### 3. **Use Schema-Appropriate Data**
```sql
-- For migration 004_add_tags_and_metadata.sql
INSERT INTO test_data (name, tags, metadata) VALUES
    ('Seed-Rich-Data', 
     ARRAY['demo', 'test'], 
     '{"version": "1.0", "features": ["tags", "metadata"]}'::jsonb);
```

#### 4. **Handle Evolutionary Changes**
```sql
-- Update existing seed data for new columns
UPDATE test_data 
SET category = 'legacy'
WHERE name LIKE 'Seed-%' AND category IS NULL;

-- Add new seed data using new schema
INSERT INTO test_data (name, category, priority) VALUES
    ('Seed-Categorized', 'demo', 1);
```

## 🔄 How It Works

### Execution Flow
1. **Migration Runs**: Normal migration SQL executes
2. **Migration Recorded**: Entry added to `migrations` table
3. **Seed Check**: System looks for corresponding `.seeds.sql` file
4. **Seed Execution**: If found and `APPLY_SEEDS=true`, seed runs
5. **Continue**: Process continues to next migration

### Error Handling
- **Migration Failure**: Stops entire process (standard behavior)
- **Seed Failure**: Logs error but continues migrations
- **Missing Seeds**: No error - seeds are optional

### Logging Example
```
🚀 Running migration: 002_add_category_to_test_data.sql
✅ Migration completed: 002_add_category_to_test_data.sql
🌱 Running seeds: 002_add_category_to_test_data.seeds.sql
✅ Seeds completed: 002_add_category_to_test_data.seeds.sql
```

## 🛡️ Safety Features

### Production Safety
- **Disabled by Default**: `APPLY_SEEDS=false` prevents accidental data insertion
- **Explicit Enable**: Must consciously enable seeds
- **Environment Isolation**: Different settings per environment

### Failure Isolation
- **Non-blocking**: Seed failures don't prevent migrations
- **Transactional**: Each seed runs in its own transaction
- **Logged**: All seed operations are clearly logged

### Development Convenience
- **Optional**: Create seeds only when needed
- **Evolutionary**: Update existing seed data as schema evolves
- **Versioned**: Seeds automatically stay in sync with schema

## 🎯 Use Cases

### Development Environment
```bash
# Start with fresh data for development
./docker-scripts.sh seeds-on
./docker-scripts.sh restart
```

### Testing Environment
```bash
# Enable seeds for comprehensive test data
APPLY_SEEDS=true docker compose up -d
```

### Production Environment
```bash
# Seeds disabled by default - no action needed
docker compose up -d
```

### Demo Environment
```bash
# Enable seeds for demonstration data
./docker-scripts.sh seeds-on
```

## ❓ FAQ

### Q: Can I run seeds without migrations?
**A:** No. Seeds are designed to run with their corresponding migrations only. This ensures schema compatibility.

### Q: What happens if a seed file is missing?
**A:** Nothing - seeds are optional. The system logs that no seed file was found and continues.

### Q: Can I have migration without seeds?
**A:** Yes! Seeds are completely optional. Only create them when you need test/development data.

### Q: How do I update existing seed data?
**A:** Modify the seed file and include UPDATE statements for existing data, then add new INSERT statements.

### Q: Can seeds reference data from previous migrations?
**A:** Yes! Seeds can reference and modify data created by previous migrations, making them ideal for evolutionary changes.

### Q: What if I want different seed data for different environments?
**A:** Use environment variables or conditional SQL within seed files:
```sql
-- Different data based on environment
INSERT INTO users (username) VALUES 
    (CASE WHEN current_setting('app.environment', true) = 'production' 
     THEN 'prod-seed-user' 
     ELSE 'dev-seed-user' END);
```

## 🔗 Related Documentation
- [Database Migrations](migrations.md) - Core migration system
- [ADR-002: Migration-Aligned Seed System](adr/002-migration-aligned-seed-system.md) - Design decisions 