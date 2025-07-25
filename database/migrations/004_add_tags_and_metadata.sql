-- Migration: 004_add_tags_and_metadata.sql
-- Description: Add tags and metadata JSON column to test_data table
-- Created: 2025-07-24

-- Add tags array column to test_data table
ALTER TABLE test_data
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add metadata JSON column for flexible data storage
ALTER TABLE test_data
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_test_data_tags ON test_data USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_test_data_metadata ON test_data USING GIN(metadata);

-- Update existing records with sample tags and metadata
UPDATE test_data
SET 
  tags = CASE
    WHEN name LIKE '%Test Item 1%' THEN ARRAY['sample', 'testing', 'important']
    WHEN name LIKE '%Test Item 2%' THEN ARRAY['demo', 'example', 'showcase']
    WHEN name LIKE '%Test Item 3%' THEN ARRAY['development', 'prototype', 'legacy']
    WHEN name LIKE '%Test Item 4%' THEN ARRAY['testing', 'validation', 'qa']
    WHEN name LIKE '%Urgent Task%' THEN ARRAY['urgent', 'critical', 'priority']
    WHEN name LIKE '%Normal Task%' THEN ARRAY['standard', 'routine', 'general']
    WHEN name LIKE '%Low Priority Task%' THEN ARRAY['backlog', 'future', 'optional']
    WHEN name LIKE '%Archive Item%' THEN ARRAY['archive', 'completed', 'historical']
    ELSE ARRAY['general', 'untagged']
  END,
  metadata = CASE
    WHEN name LIKE '%Test Item 1%' THEN '{"type": "test", "source": "migration", "version": "1.0", "author": "system"}'::jsonb
    WHEN name LIKE '%Test Item 2%' THEN '{"type": "demo", "complexity": "medium", "estimated_hours": 5, "department": "engineering"}'::jsonb
    WHEN name LIKE '%Test Item 3%' THEN '{"type": "prototype", "status": "deprecated", "replacement": "Test Item 4", "notes": "Legacy item"}'::jsonb
    WHEN name LIKE '%Test Item 4%' THEN '{"type": "test", "replaces": "Test Item 3", "improved": true, "benchmark": {"speed": "fast", "accuracy": "high"}}'::jsonb
    WHEN name LIKE '%Urgent Task%' THEN '{"type": "task", "urgency": "critical", "deadline": "2025-07-25", "assignee": "team-lead", "escalated": true}'::jsonb
    WHEN name LIKE '%Normal Task%' THEN '{"type": "task", "difficulty": "normal", "tools": ["typescript", "nodejs"], "estimated_days": 2}'::jsonb
    WHEN name LIKE '%Low Priority Task%' THEN '{"type": "task", "priority": "low", "can_defer": true, "related_to": ["future-planning"]}'::jsonb
    WHEN name LIKE '%Archive Item%' THEN '{"type": "archive", "completed": "2025-07-20", "archived_by": "auto-system", "original_value": 100}'::jsonb
    ELSE '{"type": "general", "auto_generated": true}'::jsonb
  END
WHERE tags = '{}' OR metadata = '{}';

-- Insert new test records with rich tags and metadata
INSERT INTO test_data (name, message, value, is_active, category, priority, tags, metadata) VALUES
    ('Feature Request', 'New feature for user dashboard', 500, true, 'feature', 4, 
     ARRAY['feature', 'dashboard', 'user-experience', 'frontend'], 
     '{"type": "feature", "complexity": "high", "team": "frontend", "epic": "dashboard-v2", "story_points": 8}'::jsonb),
    ('Bug Fix', 'Critical authentication bug', 999, true, 'bug', 5, 
     ARRAY['bug', 'critical', 'security', 'authentication'], 
     '{"type": "bug", "severity": "critical", "affected_users": 1500, "security_risk": true, "hotfix": true}'::jsonb),
    ('Research Task', 'Investigate new database options', 200, true, 'research', 2, 
     ARRAY['research', 'database', 'performance', 'investigation'], 
     '{"type": "research", "duration_weeks": 3, "deliverable": "technical-report", "stakeholders": ["engineering", "architecture"]}'::jsonb),
    ('Documentation', 'Update API documentation', 150, false, 'docs', 3, 
     ARRAY['documentation', 'api', 'maintenance', 'technical-writing'], 
     '{"type": "documentation", "pages": 25, "format": "markdown", "review_required": true, "outdated_since": "2025-06-01"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert this migration record
INSERT INTO migrations (migration_name, checksum)
VALUES ('004_add_tags_and_metadata.sql', 'tags_metadata_v1')
ON CONFLICT (migration_name) DO NOTHING;

-- Log migration completion with statistics
DO $$
DECLARE
    total_records INTEGER;
    tagged_records INTEGER;
    metadata_records INTEGER;
    avg_tags_per_record NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_records FROM test_data;
    SELECT COUNT(*) INTO tagged_records FROM test_data WHERE array_length(tags, 1) > 0;
    SELECT COUNT(*) INTO metadata_records FROM test_data WHERE metadata != '{}'::jsonb;
    SELECT AVG(array_length(tags, 1)) INTO avg_tags_per_record FROM test_data WHERE array_length(tags, 1) > 0;
    
    RAISE NOTICE 'Migration 004: Added tags and metadata support';
    RAISE NOTICE 'Total records: %, Tagged records: %, With metadata: %', total_records, tagged_records, metadata_records;
    RAISE NOTICE 'Average tags per record: %', COALESCE(ROUND(avg_tags_per_record, 2), 0);
    RAISE NOTICE 'Created GIN indexes for tags and metadata columns';
    RAISE NOTICE 'Added 4 new test records with rich metadata';
END $$; 