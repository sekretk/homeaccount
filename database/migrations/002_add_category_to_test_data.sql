-- Migration: 002_add_category_to_test_data.sql
-- Description: Add category column to test_data table
-- Created: 2025-07-24

-- Add category column to test_data table
ALTER TABLE test_data 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';

-- Add index on category for better query performance
CREATE INDEX IF NOT EXISTS idx_test_data_category ON test_data(category);

-- Update existing records with sample categories
UPDATE test_data 
SET category = CASE 
    WHEN name LIKE '%Test Item 1%' THEN 'sample'
    WHEN name LIKE '%Test Item 2%' THEN 'demo'
    WHEN name LIKE '%Test Item 3%' THEN 'development'
    WHEN name LIKE '%Test Item 4%' THEN 'sample'
    ELSE 'general'
END
WHERE category = 'general';

-- Insert this migration record
INSERT INTO migrations (migration_name, checksum) 
VALUES ('002_add_category_to_test_data.sql', 'category_column_v1') 
ON CONFLICT (migration_name) DO NOTHING;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 002: Added category column to test_data table';
    RAISE NOTICE 'Updated % existing records with categories', (SELECT COUNT(*) FROM test_data WHERE category != 'general');
END $$; 