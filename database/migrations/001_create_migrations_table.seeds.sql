-- Seeds for 001_create_migrations_table.sql
-- This file contains initial test data that should be applied after the migration

-- Clear any existing test data to ensure clean state
DELETE FROM test_data WHERE name LIKE 'Seed-%';

-- Insert seed data for migration 001
INSERT INTO test_data (name, message, value, is_active) VALUES
    ('Seed-Basic-1', 'Basic seed data from migration 001', 10, true),
    ('Seed-Basic-2', 'Another basic seed record', 20, true),
    ('Seed-Inactive', 'This record should be inactive', 30, false);

-- Log the seeding
DO $$
BEGIN
    RAISE NOTICE 'Applied seeds for migration 001_create_migrations_table.sql';
    RAISE NOTICE 'Inserted % seed records', (SELECT COUNT(*) FROM test_data WHERE name LIKE 'Seed-%');
END $$; 