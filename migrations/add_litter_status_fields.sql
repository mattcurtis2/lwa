-- Add isCurrentLitter and isPastLitter columns to the litters table
ALTER TABLE litters
ADD COLUMN is_current_litter BOOLEAN DEFAULT FALSE,
ADD COLUMN is_past_litter BOOLEAN DEFAULT FALSE;

-- Add isCurrentLitter and isPastLitter columns to the goat_litters table
ALTER TABLE goat_litters
ADD COLUMN is_current_litter BOOLEAN DEFAULT FALSE,
ADD COLUMN is_past_litter BOOLEAN DEFAULT FALSE;