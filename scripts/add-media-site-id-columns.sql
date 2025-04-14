-- Add siteId column to media tables
ALTER TABLE dog_media ADD COLUMN IF NOT EXISTS site_id INTEGER DEFAULT 1 REFERENCES sites(id);
ALTER TABLE dog_documents ADD COLUMN IF NOT EXISTS site_id INTEGER DEFAULT 1 REFERENCES sites(id);
ALTER TABLE goat_media ADD COLUMN IF NOT EXISTS site_id INTEGER DEFAULT 1 REFERENCES sites(id);
ALTER TABLE goat_documents ADD COLUMN IF NOT EXISTS site_id INTEGER DEFAULT 1 REFERENCES sites(id);

-- Update existing records
UPDATE dog_media SET site_id = 1 WHERE site_id IS NULL;
UPDATE dog_documents SET site_id = 1 WHERE site_id IS NULL;
UPDATE goat_media SET site_id = 1 WHERE site_id IS NULL;
UPDATE goat_documents SET site_id = 1 WHERE site_id IS NULL;