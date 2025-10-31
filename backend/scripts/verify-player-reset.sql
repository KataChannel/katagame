-- Script to verify player data after reset
-- Replace 'PLAYER_ID_HERE' with actual player ID

-- 1. Check player basic info
SELECT 
  id,
  username,
  email,
  level,
  experience,
  resources,
  created_at,
  updated_at
FROM player
WHERE id = 'PLAYER_ID_HERE';

-- 2. Check player provinces (should be 0 after reset)
SELECT COUNT(*) as province_count
FROM player_province
WHERE player_id = 'PLAYER_ID_HERE';

-- 3. Check player heroes (should be 0 after reset)
SELECT COUNT(*) as hero_count
FROM player_hero
WHERE player_id = 'PLAYER_ID_HERE';

-- 4. Check quiz submissions (should be 0 after reset)
SELECT COUNT(*) as quiz_count
FROM quiz_submission
WHERE player_id = 'PLAYER_ID_HERE';

-- Expected results after reset:
-- - level: 1
-- - experience: 0
-- - resources: {"gold": 1000, "rice": 1000, "lumber": 500, "stone": 500, "bazan": 100, "gems": 1500, "culture": 100}
-- - province_count: 0
-- - hero_count: 0
-- - quiz_count: 0
