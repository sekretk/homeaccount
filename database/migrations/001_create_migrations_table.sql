-- Migration: 001_create_migrations_table.sql
-- Description: Create migrations table to track applied migrations
-- Created: 2025-07-24

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64)
);

-- Insert this migration as applied
INSERT INTO migrations (migration_name, checksum) 
VALUES ('001_create_migrations_table.sql', 'initial') 
ON CONFLICT (migration_name) DO NOTHING;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 001: Created migrations tracking table';
END $$; 