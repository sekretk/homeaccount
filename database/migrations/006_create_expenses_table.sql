-- Migration 006: Create expenses table for accounting
-- This migration creates a simple expenses table with basic fields

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_expenses_date ON expenses(date);

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 006: Created expenses table';
    RAISE NOTICE 'Table columns: id, description, amount, date';
END $$; 