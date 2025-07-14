-- Migration: Add category and description fields to product table
-- Run this script to add the new fields to existing product table

-- Add category column
ALTER TABLE product ADD COLUMN IF NOT EXISTS category VARCHAR(128);

-- Add description column
ALTER TABLE product ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing records to have default values if needed
UPDATE product SET category = 'Unknown' WHERE category IS NULL;
UPDATE product SET description = 'No description available' WHERE description IS NULL; 