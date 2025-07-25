-- Migration: 005_add_audit_fields.sql
-- Description: Add audit fields to test_data table for tracking changes
-- Created: 2025-07-24

-- Add audit fields to track who created and updated records
ALTER TABLE test_data
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) DEFAULT 'system',
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255) DEFAULT 'system', 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a trigger function to automatically update updated_at and updated_by
CREATE OR REPLACE FUNCTION update_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- If updated_by is not explicitly set, keep the current value
    IF NEW.updated_by IS NULL THEN
        NEW.updated_by = OLD.updated_by;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update audit fields on UPDATE
DROP TRIGGER IF EXISTS trigger_update_audit_fields ON test_data;
CREATE TRIGGER trigger_update_audit_fields
    BEFORE UPDATE ON test_data
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_fields();

-- Update existing records with default audit values
UPDATE test_data 
SET 
    created_by = 'migration',
    updated_by = 'migration',
    updated_at = NOW()
WHERE created_by IS NULL OR updated_by IS NULL;

-- Add some test data to demonstrate the audit functionality
INSERT INTO test_data (name, message, value, is_active, category, priority, tags, metadata, created_by, updated_by)
VALUES 
    ('Audit Test Item 1', 'Test item created by migration', 999, true, 'test', 1, 
     ARRAY['audit', 'test', 'migration'], 
     '{"type": "audit-test", "migration": "005", "purpose": "testing audit functionality"}'::jsonb,
     'migration-script', 'migration-script'),
    ('Audit Test Item 2', 'Another test item with audit fields', 888, true, 'test', 2,
     ARRAY['audit', 'tracking', 'demo'],
     '{"type": "audit-demo", "features": ["created_by", "updated_by", "updated_at"], "auto_trigger": true}'::jsonb,
     'migration-script', 'migration-script')
ON CONFLICT DO NOTHING;

-- Create index on audit fields for better query performance
CREATE INDEX IF NOT EXISTS idx_test_data_created_by ON test_data(created_by);
CREATE INDEX IF NOT EXISTS idx_test_data_updated_by ON test_data(updated_by);
CREATE INDEX IF NOT EXISTS idx_test_data_updated_at ON test_data(updated_at DESC);

-- Add comment to document the audit functionality
COMMENT ON COLUMN test_data.created_by IS 'Username or system that originally created this record';
COMMENT ON COLUMN test_data.updated_by IS 'Username or system that last updated this record';  
COMMENT ON COLUMN test_data.updated_at IS 'Timestamp when this record was last updated (auto-managed by trigger)';
COMMENT ON FUNCTION update_audit_fields() IS 'Trigger function to automatically update audit fields on record changes'; 