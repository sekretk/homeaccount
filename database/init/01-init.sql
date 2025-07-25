-- HomeAccount Database Initialization
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a simple test table for development
CREATE TABLE IF NOT EXISTS test_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    message TEXT,
    value INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some test data
INSERT INTO test_data (name, message, value, is_active) VALUES 
    ('Test Item 1', 'Hello from PostgreSQL!', 42, true),
    ('Test Item 2', 'Database is working correctly', 100, true),
    ('Test Item 3', 'Sample data for development', 250, false),
    ('Test Item 4', 'Another test record', 777, true)
ON CONFLICT DO NOTHING;

-- Log that initialization is complete
DO $$
BEGIN
    RAISE NOTICE 'HomeAccount test database initialized successfully!';
    RAISE NOTICE 'Test table created with % rows', (SELECT COUNT(*) FROM test_data);
END $$; 