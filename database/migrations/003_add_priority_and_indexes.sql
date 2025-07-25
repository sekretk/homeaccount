-- Migration: 003_add_priority_and_indexes.sql
-- Description: Add priority column and performance indexes to test_data table
-- Created: 2025-07-24

-- Add priority column to test_data table
ALTER TABLE test_data
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;

-- Add constraint to ensure priority is between 1-5
ALTER TABLE test_data
ADD CONSTRAINT priority_range CHECK (priority >= 1 AND priority <= 5);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_test_data_priority ON test_data(priority);
CREATE INDEX IF NOT EXISTS idx_test_data_active_priority ON test_data(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_test_data_created_at ON test_data(created_at DESC);

-- Update existing records with different priorities
UPDATE test_data
SET priority = CASE
    WHEN name LIKE '%Test Item 1%' THEN 5  -- High priority
    WHEN name LIKE '%Test Item 2%' THEN 3  -- Medium priority
    WHEN name LIKE '%Test Item 3%' THEN 1  -- Low priority
    WHEN name LIKE '%Test Item 4%' THEN 4  -- High-medium priority
    ELSE 2  -- Default medium-low priority
END
WHERE priority = 1;  -- Only update records that still have default priority

-- Insert additional test data with priorities
INSERT INTO test_data (name, message, value, is_active, category, priority) VALUES
    ('Urgent Task', 'High priority item for testing', 999, true, 'urgent', 5),
    ('Normal Task', 'Standard priority task', 150, true, 'general', 3),
    ('Low Priority Task', 'Can be done later', 50, true, 'general', 1),
    ('Archive Item', 'Old completed task', 0, false, 'archive', 2)
ON CONFLICT DO NOTHING;

-- Insert this migration record
INSERT INTO migrations (migration_name, checksum)
VALUES ('003_add_priority_and_indexes.sql', 'priority_indexes_v1')
ON CONFLICT (migration_name) DO NOTHING;

-- Log migration completion
DO $$
DECLARE
    total_records INTEGER;
    high_priority_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_records FROM test_data;
    SELECT COUNT(*) INTO high_priority_count FROM test_data WHERE priority >= 4;
    
    RAISE NOTICE 'Migration 003: Added priority column and performance indexes';
    RAISE NOTICE 'Total records: %, High priority records: %', total_records, high_priority_count;
    RAISE NOTICE 'Created indexes: priority, active_priority, created_at';
END $$; 