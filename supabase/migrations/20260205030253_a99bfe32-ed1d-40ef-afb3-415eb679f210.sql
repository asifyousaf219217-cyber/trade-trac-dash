-- Add customer_name column to conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS customer_name text;