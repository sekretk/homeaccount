-- Seeds for 002_add_category_to_test_data.sql
-- This file contains seed data that uses the new 'category' column

-- Insert seed data that leverages the new category field
INSERT INTO test_data (name, message, value, is_active, category) VALUES
    ('Seed-Category-Development', 'Development category seed data', 100, true, 'development'),
    ('Seed-Category-Testing', 'Testing category seed data', 200, true, 'testing'),
    ('Seed-Category-Production', 'Production category seed data', 300, false, 'production');

-- Update existing seed data to have categories
UPDATE test_data 
SET category = 'basic' 
WHERE name LIKE 'Seed-Basic-%' AND category IS NULL;

-- Log the seeding
DO $$
BEGIN
    RAISE NOTICE 'Applied seeds for migration 002_add_category_to_test_data.sql';
    RAISE NOTICE 'Added category-specific seed data and updated existing records';
END $$; 