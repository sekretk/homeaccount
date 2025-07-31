-- Seeds for 006_create_expenses_table.sql
-- This file contains simple expense data for development and testing

-- Clear any existing seed expense data
DELETE FROM expenses WHERE description LIKE 'Seed-%';

-- Insert sample expense data
INSERT INTO expenses (description, amount, date) VALUES
    ('Seed-Office Supplies', 45.67, '2025-01-15'),
    ('Seed-Software License', 299.00, '2025-01-10'),
    ('Seed-Coffee for Office', 12.50, '2025-01-18'),
    ('Seed-Business Lunch', 85.40, '2025-01-14'),
    ('Seed-Taxi Fare', 35.50, '2025-01-12'),
    ('Seed-Internet Bill', 89.99, '2025-01-05'),
    ('Seed-Grocery Shopping', 78.45, '2025-01-17'),
    ('Seed-Gas Station', 42.30, '2025-01-16'),
    ('Seed-Movie Tickets', 28.00, '2025-01-18'),
    ('Seed-Laptop Repair', 125.00, '2025-01-11');

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Applied seeds for migration 006_create_expenses_table.sql';
    RAISE NOTICE 'Inserted % expense records', (SELECT COUNT(*) FROM expenses WHERE description LIKE 'Seed-%');
END $$; 