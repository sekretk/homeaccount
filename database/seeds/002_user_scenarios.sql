-- Seed: 002_user_scenarios.sql
-- Description: User scenario and workflow test data
-- Created: 2025-07-25

-- Insert user scenario test data
INSERT INTO test_data (name, message, value, is_active, category, priority, tags, metadata, created_by, updated_by) VALUES 
    -- User onboarding scenarios
    ('New User Welcome', 'Welcome message for new user onboarding', 1, true, 'onboarding', 1,
     ARRAY['onboarding', 'welcome', 'new-user'],
     '{"type": "onboarding", "step": 1, "user_type": "new", "show_tutorial": true, "next_action": "profile_setup"}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    ('Profile Setup Guide', 'Help users complete their profile', 2, true, 'onboarding', 1,
     ARRAY['onboarding', 'profile', 'setup'],
     '{"type": "onboarding", "step": 2, "required_fields": ["name", "email", "preferences"], "completion_rate": 0.85}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    ('Feature Introduction', 'Introduce key features to new users', 3, true, 'onboarding', 2,
     ARRAY['onboarding', 'features', 'tutorial'],
     '{"type": "onboarding", "step": 3, "features": ["dashboard", "reports", "settings"], "interactive": true}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    -- Daily workflow scenarios
    ('Morning Dashboard Check', 'Daily dashboard review workflow', 100, true, 'workflow', 1,
     ARRAY['workflow', 'daily', 'dashboard', 'review'],
     '{"type": "workflow", "frequency": "daily", "time": "morning", "duration": "5 minutes", "key_metrics": ["status", "alerts", "pending_tasks"]}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    ('Weekly Report Generation', 'Generate and review weekly reports', 200, true, 'workflow', 2,
     ARRAY['workflow', 'weekly', 'reports', 'analytics'],
     '{"type": "workflow", "frequency": "weekly", "day": "friday", "includes": ["metrics", "trends", "recommendations"]}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    ('Monthly Planning Session', 'Monthly planning and goal setting', 300, true, 'workflow', 2,
     ARRAY['workflow', 'monthly', 'planning', 'goals'],
     '{"type": "workflow", "frequency": "monthly", "participants": ["manager", "team"], "outcomes": ["goals", "roadmap", "resources"]}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    -- Error and edge case scenarios
    ('Network Timeout Simulation', 'Simulate network timeout scenarios', 0, false, 'error-scenario', 3,
     ARRAY['error', 'network', 'timeout', 'simulation'],
     '{"type": "error-scenario", "error_type": "network_timeout", "timeout_ms": 5000, "retry_count": 3, "fallback": "cached_data"}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    ('Invalid Data Handling', 'Test invalid data input handling', 0, false, 'error-scenario', 3,
     ARRAY['error', 'validation', 'input', 'handling'],
     '{"type": "error-scenario", "error_type": "invalid_input", "test_cases": ["null", "empty", "malformed", "oversized"]}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    ('Permission Denied Test', 'Test unauthorized access scenarios', 0, false, 'error-scenario', 3,
     ARRAY['error', 'permission', 'unauthorized', 'security'],
     '{"type": "error-scenario", "error_type": "permission_denied", "test_roles": ["guest", "user", "admin"], "protected_resources": ["/admin", "/private"]}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    -- Performance scenarios
    ('Large Dataset Processing', 'Process large amounts of data', 10000, true, 'performance', 1,
     ARRAY['performance', 'large-dataset', 'processing'],
     '{"type": "performance", "dataset_size": 10000, "processing_time": "< 2s", "memory_usage": "< 512MB", "concurrent_users": 100}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    ('Concurrent User Simulation', 'Simulate multiple concurrent users', 500, true, 'performance', 1,
     ARRAY['performance', 'concurrent', 'load-test'],
     '{"type": "performance", "concurrent_users": 500, "session_duration": "30 minutes", "actions_per_session": 50}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    -- Integration scenarios
    ('Third Party API Call', 'Test external API integration', 150, true, 'integration', 2,
     ARRAY['integration', 'api', 'external', 'third-party'],
     '{"type": "integration", "api_provider": "example-api", "endpoints": ["/data", "/sync"], "rate_limit": 1000, "timeout": 10000}'::jsonb,
     'user-scenarios', 'user-scenarios'),
    
    ('Webhook Processing', 'Handle incoming webhook data', 75, true, 'integration', 2,
     ARRAY['integration', 'webhook', 'incoming', 'processing'],
     '{"type": "integration", "webhook_source": "payment-provider", "events": ["payment.completed", "payment.failed"], "validation": "signature"}'::jsonb,
     'user-scenarios', 'user-scenarios')

ON CONFLICT (name) DO NOTHING;

-- Log completion
DO $$
DECLARE
    scenario_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO scenario_count FROM test_data WHERE created_by = 'user-scenarios';
    RAISE NOTICE 'User scenario seeding completed! Seeded % scenario rows', scenario_count;
END $$; 