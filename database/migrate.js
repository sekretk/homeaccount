#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://homeaccount_user:homeaccount_password@localhost:5432/homeaccount',
});

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function ensureMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      checksum VARCHAR(64)
    );
  `;
  
  await pool.query(query);
  log('✅ Migrations table ready', 'green');
}

async function getAppliedMigrations() {
  const result = await pool.query(
    'SELECT migration_name FROM migrations ORDER BY applied_at'
  );
  return result.rows.map(row => row.migration_name);
}

async function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  return files;
}

async function runMigration(filename) {
  const filepath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  
  log(`🚀 Running migration: ${filename}`, 'blue');
  
  try {
    await pool.query(sql);
    log(`✅ Completed: ${filename}`, 'green');
  } catch (error) {
    log(`❌ Failed: ${filename} - ${error.message}`, 'red');
    throw error;
  }
}

async function runMigrations() {
  try {
    log('🔍 Starting database migrations...', 'yellow');
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get applied and available migrations
    const appliedMigrations = await getAppliedMigrations();
    const allMigrations = await getMigrationFiles();
    
    // Find pending migrations
    const pendingMigrations = allMigrations.filter(
      migration => !appliedMigrations.includes(migration)
    );
    
    if (pendingMigrations.length === 0) {
      log('✨ No pending migrations found', 'green');
      return;
    }
    
    log(`📋 Found ${pendingMigrations.length} pending migration(s)`, 'yellow');
    
    // Run pending migrations
    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }
    
    log('🎉 All migrations completed successfully!', 'green');
    
  } catch (error) {
    log(`💥 Migration failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function showStatus() {
  try {
    await ensureMigrationsTable();
    
    const appliedMigrations = await getAppliedMigrations();
    const allMigrations = await getMigrationFiles();
    
    log('📊 Migration Status:', 'blue');
    log('================', 'blue');
    
    for (const migration of allMigrations) {
      const isApplied = appliedMigrations.includes(migration);
      const status = isApplied ? '✅ Applied' : '⏳ Pending';
      const color = isApplied ? 'green' : 'yellow';
      log(`${status} ${migration}`, color);
    }
    
    const pendingCount = allMigrations.length - appliedMigrations.length;
    log(`\n📈 Total: ${allMigrations.length} migrations, ${pendingCount} pending`, 'blue');
    
  } catch (error) {
    log(`💥 Status check failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'run':
  case 'migrate':
    runMigrations();
    break;
  case 'status':
    showStatus();
    break;
  default:
    log('Usage:', 'blue');
    log('  node migrate.js run     - Run pending migrations', 'yellow');
    log('  node migrate.js status  - Show migration status', 'yellow');
    process.exit(1);
} 