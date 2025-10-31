-- Migration: Update all players with default resources if they have null or empty resources
-- This fixes players created before the resource system was properly implemented

-- Update players who have NULL resources
UPDATE players
SET resources = jsonb_build_object(
  'gold', 1000,
  'rice', 1000,
  'lumber', 500,
  'stone', 500,
  'bazan', 100,
  'gems', 1500,
  'culture', 100
)
WHERE resources IS NULL;

-- Update players who have empty object {} resources
UPDATE players
SET resources = jsonb_build_object(
  'gold', 1000,
  'rice', 1000,
  'lumber', 500,
  'stone', 500,
  'bazan', 100,
  'gems', 1500,
  'culture', 100
)
WHERE resources = '{}'::jsonb;

-- Update players who have resources but missing gold or have 0 gold
UPDATE players
SET resources = resources || jsonb_build_object(
  'gold', 1000,
  'rice', 1000,
  'lumber', 500,
  'stone', 500,
  'bazan', 100,
  'gems', 1500,
  'culture', 100
)
WHERE 
  resources IS NOT NULL 
  AND resources != '{}'::jsonb
  AND (
    NOT (resources ? 'gold')
    OR (resources->>'gold')::numeric <= 0
  );

-- Verify the update
SELECT 
  id, 
  username, 
  resources->>'gold' as gold,
  resources->>'rice' as rice,
  resources->>'lumber' as lumber,
  resources->>'stone' as stone
FROM players
ORDER BY created_at DESC
LIMIT 10;
