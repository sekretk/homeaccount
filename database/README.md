# 🗄️ Database Setup

This directory contains PostgreSQL database configuration and initialization scripts for the HomeAccount application.

## 📁 Directory Structure

```
database/
├── README.md              # This file
├── migrate.js             # Migration runner script
├── init/
│   └── 01-init.sql        # Database initialization script
└── migrations/
    ├── 001_create_migrations_table.sql
    └── 002_add_category_to_test_data.sql
```

## 🐘 PostgreSQL Configuration

### Database Details
- **Engine**: PostgreSQL 15 Alpine
- **Database Name**: `homeaccount`
- **Username**: `homeaccount_user`
- **Password**: `homeaccount_password`
- **Port**: `5432`

### Environment Variables
- **AUTO_MIGRATE**: Controls automatic migrations (default: `true`)
  - `true` - Run migrations on backend startup
  - `false` - Skip auto-migrations, run manually only

### Docker Volume
- **Volume Name**: `postgres_data`
- **Mount Point**: `/var/lib/postgresql/data`
- **Purpose**: Persistent data storage

## 🚀 Quick Start

### Start Database Only
```bash
# From project root
./docker-scripts.sh db-start

# Or with docker compose
docker compose up database -d
```

### Connect to Database
```bash
# Using helper script
./docker-scripts.sh db-shell

# Or directly with docker
docker compose exec database psql -U homeaccount_user -d homeaccount
```

### View Database Logs
```bash
./docker-scripts.sh db-logs
```

## 📊 Sample Data

The initialization script creates a simple test table with sample data:

### Tables Created
- **test_data**: Simple test table for development and database connectivity testing

### Sample Test Data
- Test Item 1: "Hello from PostgreSQL!" (value: 42, active)
- Test Item 2: "Database is working correctly" (value: 100, active)
- Test Item 3: "Sample data for development" (value: 250, inactive)
- Test Item 4: "Another test record" (value: 777, active)

## 🔧 Management Commands

### Backend npm Scripts
```bash
cd backend

npm run db:start          # Start database service
npm run db:stop           # Stop database service
npm run db:logs           # View database logs
npm run db:shell          # Connect to PostgreSQL shell
npm run db:reset          # Reset database (WARNING: deletes all data)
npm run db:migrate        # Run pending migrations
npm run db:migrate:status # Show migration status
```

### Docker Scripts
```bash
./docker-scripts.sh db-start    # Start database
./docker-scripts.sh db-stop     # Stop database
./docker-scripts.sh db-logs     # Show logs
./docker-scripts.sh db-shell    # Connect to shell
./docker-scripts.sh db-reset    # Reset database
./docker-scripts.sh db-migrate  # Run migrations
./docker-scripts.sh db-status   # Migration status
```

## 🗃️ Database Schema

### Test Data Table
```sql
CREATE TABLE test_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    message TEXT,
    value INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Column Descriptions:**
- `id`: Unique identifier (UUID)
- `name`: Item name/title
- `message`: Text message/description
- `value`: Integer value for testing
- `is_active`: Boolean flag for active/inactive status
- `created_at`: Timestamp when record was created

## 🔍 Common Queries

### List All Test Data
```sql
SELECT * FROM test_data ORDER BY name;
```

### Find Active Items
```sql
SELECT name, message, value FROM test_data WHERE is_active = true;
```

### Get Items by Value Range
```sql
SELECT name, message, value, created_at 
FROM test_data 
WHERE value BETWEEN 50 AND 200 
ORDER BY value DESC;
```

### Count Records by Status
```sql
SELECT 
    is_active,
    COUNT(*) as count,
    AVG(value) as avg_value
FROM test_data 
GROUP BY is_active;
```

## 🛠️ Troubleshooting

### Database Won't Start
1. Check if port 5432 is already in use
2. Verify Docker is running
3. Check Docker logs: `./docker-scripts.sh db-logs`

### Connection Issues
1. Ensure database is running: `./docker-scripts.sh status`
2. Verify credentials match docker-compose.yml
3. Check network connectivity between containers

### Data Loss Prevention
- Database data persists in Docker volume `postgres_data`
- To backup: `docker compose exec database pg_dump -U homeaccount_user homeaccount > backup.sql`
- To restore: `docker compose exec -T database psql -U homeaccount_user homeaccount < backup.sql`

## 🔄 Database Migrations

### Overview
Migrations provide version control for your database schema. They allow you to:
- Apply incremental changes to the database structure
- Track which changes have been applied
- Safely modify schema across different environments

### Migration Files
Migration files are stored in `migrations/` and follow naming convention:
- `001_create_migrations_table.sql` - Sets up migration tracking
- `002_add_category_to_test_data.sql` - Example: adds category column

### Running Migrations

#### Automatic (Default)
Migrations run automatically when the backend starts up. This ensures your database schema is always up-to-date.

```bash
# Backend will run migrations on startup by default
npm run dev  # or docker compose up
```

#### Manual
You can also run migrations manually or disable auto-migrations:

```bash
# Check migration status
./docker-scripts.sh db-status
npm run db:migrate:status

# Run pending migrations manually
./docker-scripts.sh db-migrate
npm run db:migrate

# Disable auto-migrations (set environment variable)
export AUTO_MIGRATE=false
npm run dev
```

### Creating New Migrations
1. Create new `.sql` file with incremental number: `003_your_migration.sql`
2. Include migration tracking at the end:
   ```sql
   INSERT INTO migrations (migration_name, checksum) 
   VALUES ('003_your_migration.sql', 'your_checksum') 
   ON CONFLICT (migration_name) DO NOTHING;
   ```
3. Run migrations to apply

### Migration Features
- **Automatic tracking**: Each migration is recorded when applied
- **Idempotent**: Safe to run multiple times
- **Ordered execution**: Migrations run in filename order
- **Status checking**: View applied vs pending migrations
- **Error handling**: Failed migrations stop the process
- **API endpoints**: Migration status available via REST API

### Migration API Endpoints

#### GET /version
Quick version and migration summary:
```json
{
  "application": "1.0.0",
  "database": "002_add_category_to_test_data.sql",
  "migrations": {
    "applied": 2,
    "total": 2,
    "status": "up-to-date"
  },
  "timestamp": "2024-07-24T12:30:00.000Z"
}
```

#### GET /migrations  
Detailed migration information:
```json
{
  "version": "002_add_category_to_test_data.sql",
  "database": {
    "totalApplied": 2,
    "totalAvailable": 2,
    "latestMigration": "002_add_category_to_test_data.sql",
    "appliedAt": "2024-07-24T12:00:00.000Z",
    "pendingMigrations": [],
    "appliedMigrations": [
      {
        "name": "001_create_migrations_table.sql",
        "appliedAt": "2024-07-24T11:59:00.000Z"
      },
      {
        "name": "002_add_category_to_test_data.sql", 
        "appliedAt": "2024-07-24T12:00:00.000Z"
      }
    ],
    "status": "up-to-date"
  },
  "timestamp": "2024-07-24T12:30:00.000Z"
}
```

## 🔮 Future Plans

- **TypeORM Integration**: Entity definitions and automated migrations
- **Rollback Support**: Down migrations for schema rollbacks
- **Seed Data Management**: More sophisticated data seeding
- **Performance Optimization**: Indexes and query optimization
- **Backup Automation**: Scheduled database backups 