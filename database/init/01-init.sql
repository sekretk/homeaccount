-- HomeAccount Database Initialization
-- This script runs when the PostgreSQL container starts for the first time
-- Schema creation is handled by migrations, this just sets up extensions

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Log that initialization is complete
DO $$
BEGIN
    RAISE NOTICE 'HomeAccount database initialized successfully!';
    RAISE NOTICE 'Extensions created: uuid-ossp, pg_stat_statements';
    RAISE NOTICE 'Schema will be created by migrations on application startup';
END $$; 