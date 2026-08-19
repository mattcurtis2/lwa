-- Rows created before site_id had a column default were stored as NULL.
-- NULL does not match `site_id = 1`, so those records were missing from site-scoped lists.
UPDATE goats SET site_id = 1 WHERE site_id IS NULL;
UPDATE goat_litters SET site_id = 1 WHERE site_id IS NULL;

ALTER TABLE goats ALTER COLUMN site_id SET DEFAULT 1;
ALTER TABLE goat_litters ALTER COLUMN site_id SET DEFAULT 1;
