-- Seed: 001_test_data.sql
-- Description: Initial test data for development and testing
-- Created: 2025-07-25

-- Insert comprehensive test data for development
INSERT INTO test_data (name, message, value, is_active, category, priority, tags, metadata, created_by, updated_by) VALUES 
    -- Basic test items
    ('Development Test Item', 'Sample data for development environment', 100, true, 'development', 1, 
     ARRAY['development', 'test', 'sample'], 
     '{"type": "development", "environment": "local", "purpose": "testing API endpoints"}'::jsonb,
     'seed-script', 'seed-script'),
    
    ('User Interface Test', 'Data for testing frontend components', 250, true, 'ui', 2,
     ARRAY['ui', 'frontend', 'component'],
     '{"type": "ui-test", "component": "data-table", "interactions": ["view", "edit", "delete"]}'::jsonb,
     'seed-script', 'seed-script'),
    
    ('Performance Test Item', 'Large dataset for performance testing', 1000, true, 'performance', 1,
     ARRAY['performance', 'load-test', 'optimization'],
     '{"type": "performance", "size": "large", "queries": 1000, "expected_response_time": "< 100ms"}'::jsonb,
     'seed-script', 'seed-script'),
    
    -- Inactive items for testing filters
    ('Archived Test Item', 'This item is archived for testing', 500, false, 'archive', 3,
     ARRAY['archived', 'test', 'inactive'],
     '{"type": "archive", "reason": "testing inactive filters", "archived_date": "2025-01-01"}'::jsonb,
     'seed-script', 'seed-script'),
    
    ('Deprecated Feature', 'Old feature that is no longer active', 75, false, 'deprecated', 3,
     ARRAY['deprecated', 'legacy', 'removed'],
     '{"type": "deprecated", "replacement": "New Feature API", "sunset_date": "2025-01-15"}'::jsonb,
     'seed-script', 'seed-script'),
    
    -- Priority testing items
    ('Critical System Alert', 'High priority system notification', 999, true, 'system', 1,
     ARRAY['critical', 'system', 'alert', 'monitoring'],
     '{"type": "system-alert", "severity": "critical", "requires_action": true, "escalate_after": "5 minutes"}'::jsonb,
     'seed-script', 'seed-script'),
    
    ('Low Priority Task', 'Background task with low priority', 25, true, 'task', 3,
     ARRAY['background', 'low-priority', 'maintenance'],
     '{"type": "background-task", "can_defer": true, "max_delay": "24 hours", "resources_required": "minimal"}'::jsonb,
     'seed-script', 'seed-script'),
    
    -- Category variety
    ('API Integration Test', 'Testing external API integrations', 300, true, 'integration', 2,
     ARRAY['api', 'integration', 'external', 'webhooks'],
     '{"type": "integration", "provider": "external-api", "endpoints": ["/users", "/orders"], "auth_type": "bearer"}'::jsonb,
     'seed-script', 'seed-script'),
    
    ('Database Migration', 'Schema update and data migration', 200, true, 'database', 2,
     ARRAY['database', 'migration', 'schema', 'upgrade'],
     '{"type": "migration", "from_version": "1.0", "to_version": "2.0", "backup_required": true}'::jsonb,
     'seed-script', 'seed-script'),
    
    ('Security Audit Item', 'Security compliance and audit data', 750, true, 'security', 1,
     ARRAY['security', 'audit', 'compliance', 'review'],
     '{"type": "security", "audit_type": "compliance", "standards": ["SOC2", "GDPR"], "next_review": "2025-07-01"}'::jsonb,
     'seed-script', 'seed-script'),
    
    -- Edge cases and special characters
    ('Special Chars Test: åäö!@#$%', 'Testing unicode and special characters: 你好 🌟', 42, true, 'unicode', 2,
     ARRAY['unicode', 'special-chars', 'internationalization'],
     '{"type": "unicode-test", "languages": ["en", "sv", "zh"], "emoji": "🌟", "special_chars": "!@#$%^&*()"}'::jsonb,
     'seed-script', 'seed-script'),
    
    ('Very Long Title That Tests The Maximum Length Handling Of The Name Field In Our Database Schema', 
     'This is a very long message to test how our system handles large text content. It includes multiple sentences, various punctuation marks, and should help identify any issues with text truncation or display limitations in our user interface components.', 
     1234, true, 'edge-case', 2,
     ARRAY['long-text', 'edge-case', 'ui-testing', 'validation'],
     '{"type": "edge-case", "test_purpose": "long text handling", "character_count": 500, "includes": ["punctuation", "spaces", "long_words"]}'::jsonb,
     'seed-script', 'seed-script'),
    
    -- JSON metadata variety
    ('JSON Complex Test', 'Testing complex JSON metadata structures', 600, true, 'json', 2,
     ARRAY['json', 'complex', 'nested', 'data-structures'],
     '{"type": "complex-json", "nested": {"level1": {"level2": {"value": 123}}, "array": [1, 2, 3]}, "boolean": true, "null_value": null, "array_of_objects": [{"id": 1, "name": "item1"}, {"id": 2, "name": "item2"}]}'::jsonb,
     'seed-script', 'seed-script')

ON CONFLICT (name) DO NOTHING;

-- Log seeding completion
DO $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM test_data WHERE created_by = 'seed-script';
    RAISE NOTICE 'Test data seeding completed! Seeded % rows total', total_count;
END $$; 