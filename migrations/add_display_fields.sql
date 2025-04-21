-- Add display column to dogs table
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS display BOOLEAN NOT NULL DEFAULT TRUE;

-- Add display column to goats table
ALTER TABLE goats ADD COLUMN IF NOT EXISTS display BOOLEAN NOT NULL DEFAULT TRUE;

-- Set display to true for all existing dogs and goats
UPDATE dogs SET display = TRUE WHERE display IS NULL;
UPDATE goats SET display = TRUE WHERE display IS NULL;