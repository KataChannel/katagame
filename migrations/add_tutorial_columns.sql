-- Add tutorial tracking columns to player_stats table
-- Date: 2025-10-29

ALTER TABLE player_stats 
ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tutorial_step INTEGER DEFAULT 1;

-- Create index for faster tutorial queries
CREATE INDEX IF NOT EXISTS idx_player_stats_tutorial ON player_stats(player_id, tutorial_completed);

-- Update existing players to have tutorial_step = 10 (completed) if they have any activity
UPDATE player_stats 
SET tutorial_completed = TRUE, 
    tutorial_step = 10
WHERE player_id IN (
  SELECT id FROM players WHERE level >= 5
);

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added tutorial_completed and tutorial_step columns to player_stats';
END $$;
