-- Seeds for 004_add_tags_and_metadata.sql
-- This file contains seed data that uses the new 'tags' and 'metadata' columns

-- Insert seed data with rich tags and metadata
INSERT INTO test_data (name, message, value, is_active, category, priority, tags, metadata) VALUES
    ('Seed-Rich-1', 'Rich seed data with tags and metadata', 500, true, 'demo', 1, 
     ARRAY['seed', 'demo', 'rich'], 
     '{"type": "demo", "version": "1.0", "features": ["tags", "metadata"]}'::jsonb),
    
    ('Seed-Rich-2', 'Another rich seed record', 600, true, 'demo', 2,
     ARRAY['seed', 'demo', 'advanced'], 
     '{"type": "demo", "version": "1.1", "features": ["tags", "metadata", "priority"]}'::jsonb),
    
    ('Seed-Complex', 'Complex seed data for testing', 750, false, 'testing', 3,
     ARRAY['seed', 'testing', 'complex', 'inactive'], 
     '{"type": "testing", "complexity": "high", "test_scenarios": ["inactive", "complex"]}'::jsonb);

-- Update existing seed data to have tags and metadata
UPDATE test_data 
SET 
    tags = ARRAY['seed', 'legacy'],
    metadata = '{"migrated": true, "original_migration": "' || 
        CASE 
            WHEN name LIKE 'Seed-Basic-%' THEN '001'
            WHEN name LIKE 'Seed-Category-%' THEN '002'
            ELSE 'unknown'
        END || '"}'::jsonb
WHERE name LIKE 'Seed-%' AND tags IS NULL;

-- Log the seeding
DO $$
BEGIN
    RAISE NOTICE 'Applied seeds for migration 004_add_tags_and_metadata.sql';
    RAISE NOTICE 'Added rich seed data with tags and metadata';
    RAISE NOTICE 'Updated existing seed records with tags and metadata';
END $$; 