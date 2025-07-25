# 🌱 Database Seeding System

This directory contains database seed files that populate the database with initial test data for development and testing purposes.

## 📋 Overview

The seeding system works alongside migrations to provide a complete database setup:

1. **Migrations** 📈 - Handle schema changes and structure
2. **Seeds** 🌱 - Handle data population and test scenarios

## 🚀 How It Works

### Automatic Seeding
Seeds run automatically after migrations when `AUTO_SEED=true`:
```bash
# Set in environment or docker-compose.yml
AUTO_SEED=true
SEEDS_DIR=/database/seeds  # Optional: custom seeds directory
```

### Manual Seeding
You can also run seeds manually via API endpoints:
```bash
# Get seeding status
curl http://localhost:3001/seeds

# Run pending seeds
curl -X POST http://localhost:3001/seeds/run

# Reset seeds (clears tracking, for testing)
curl -X POST http://localhost:3001/seeds/reset
```

## 📁 Seed Files

Seeds are numbered SQL files that run in sequence:

```
database/seeds/
├── 001_test_data.sql           # Basic test data for development
├── 002_user_scenarios.sql      # User workflow and scenario data
└── 003_your_seed.sql           # Add your own seeds here
```

### Naming Convention
- **Format**: `{number}_{description}.sql`
- **Numbers**: 3 digits, zero-padded (001, 002, 003)
- **Description**: Descriptive name using underscores

## 📝 Seed File Structure

Each seed file should follow this pattern:

```sql
-- Seed: 003_your_seed.sql
-- Description: Brief description of what this seed does
-- Created: YYYY-MM-DD

-- Your SQL INSERT statements here
INSERT INTO your_table (column1, column2) VALUES 
    ('value1', 'value2'),
    ('value3', 'value4')
ON CONFLICT (unique_column) DO NOTHING;

-- Optional: Log completion
DO $$
BEGIN
    RAISE NOTICE 'Your seed completed successfully!';
END $$;
```

## 🔄 Seed Tracking

The system tracks applied seeds in a `seeds` table:
- **seed_name**: Name of the seed file
- **applied_at**: When the seed was applied
- **checksum**: (Future) File integrity verification

## 🌱 Current Seeds

### 001_test_data.sql
Comprehensive test data including:
- **Development items** - Basic API testing data
- **UI test data** - Frontend component testing
- **Performance data** - Load testing scenarios
- **Edge cases** - Unicode, long text, special characters
- **Categories & priorities** - Full range of test scenarios

### 002_user_scenarios.sql
User workflow and scenario data:
- **Onboarding flows** - New user experience testing
- **Daily workflows** - Common user patterns
- **Error scenarios** - Exception handling tests
- **Performance tests** - Concurrent user simulation
- **Integration tests** - External API scenarios

## 🛠️ Development Workflow

### Adding New Seeds
1. Create a new numbered file: `003_my_new_seed.sql`
2. Add your INSERT statements with `ON CONFLICT` handling
3. Test locally with `curl -X POST http://localhost:3001/seeds/run`
4. Commit and deploy

### Testing Seeds
```bash
# Reset seeds to test from scratch
curl -X POST http://localhost:3001/seeds/reset

# Run seeds manually
curl -X POST http://localhost:3001/seeds/run

# Check status
curl http://localhost:3001/seeds
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTO_SEED` | `false` | Enable automatic seeding after migrations |
| `SEEDS_DIR` | `database/seeds` | Directory containing seed files |

## 🐳 Docker Integration

In docker-compose.yml:
```yaml
environment:
  - AUTO_MIGRATE=true     # Run migrations first
  - AUTO_SEED=true        # Then run seeds
  - SEEDS_DIR=/database/seeds
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/seeds` | GET | Get seeding status and information |
| `/seeds/run` | POST | Execute pending seeds |
| `/seeds/reset` | POST | Reset seed tracking (for testing) |

## 📊 Example API Response

```json
{
  "version": "002_user_scenarios.sql",
  "database": {
    "totalApplied": 2,
    "totalAvailable": 2,
    "latestSeed": "002_user_scenarios.sql",
    "appliedAt": "2025-07-25T10:30:00.000Z",
    "pendingSeeds": [],
    "appliedSeeds": [
      {
        "name": "001_test_data.sql",
        "appliedAt": "2025-07-25T10:25:00.000Z"
      },
      {
        "name": "002_user_scenarios.sql", 
        "appliedAt": "2025-07-25T10:30:00.000Z"
      }
    ],
    "status": "up-to-date"
  },
  "timestamp": "2025-07-25T10:35:00.000Z"
}
```

## 🎯 Best Practices

1. **Idempotent seeds** - Use `ON CONFLICT DO NOTHING` or similar
2. **Meaningful data** - Create realistic test scenarios
3. **Categorize data** - Use consistent categories and tags
4. **Document purpose** - Clear comments explaining each seed's purpose
5. **Test thoroughly** - Verify seeds work in clean database environments

## 🚀 Integration with Migrations

Seeds run automatically after migrations complete:
1. Migrations update schema ⏫
2. Post-migration callbacks execute 🔗
3. Seeds populate data 🌱
4. Application ready for use 🎉

This ensures your database always has both the latest schema AND relevant test data! 