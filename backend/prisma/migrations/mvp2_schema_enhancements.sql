-- ============================================================================
-- MVP2 SCHEMA ENHANCEMENTS
-- Add fields for: passive/active skills, hero levels, resource synergy
-- ============================================================================

-- ============================================================================
-- 1. PROVINCE SKILLS SYSTEM
-- ============================================================================

-- Add skill fields to player_provinces table
ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS passive_buffs JSONB DEFAULT '[]';
ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS active_skill_level INT DEFAULT 0;
ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS active_skill_last_used TIMESTAMP(6);
ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS active_skill_cooldown_ends TIMESTAMP(6);

COMMENT ON COLUMN player_provinces.passive_buffs IS 'Array of passive buff objects unlocked at resource_level milestones: [{type: "production", value: 10, unlocked_at_level: 5}]';
COMMENT ON COLUMN player_provinces.active_skill_level IS 'Active skill level: 0=locked, 1=x2 (dev_level 3), 2=x3 (dev_level 6), 3=x5 (dev_level 10)';
COMMENT ON COLUMN player_provinces.active_skill_last_used IS 'Timestamp when active skill was last activated';
COMMENT ON COLUMN player_provinces.active_skill_cooldown_ends IS 'Timestamp when cooldown ends (24 hours from activation)';

-- ============================================================================
-- 2. HERO LEVELING SYSTEM (1-5)
-- ============================================================================

-- Modify player_heroes table for proper leveling
ALTER TABLE player_heroes ALTER COLUMN level SET DEFAULT 1;
ALTER TABLE player_heroes ADD COLUMN IF NOT EXISTS level_up_cost JSONB DEFAULT '{"gold": 0, "gems": 0}';
ALTER TABLE player_heroes ADD COLUMN IF NOT EXISTS current_hp INT;
ALTER TABLE player_heroes ADD COLUMN IF NOT EXISTS current_attack INT;
ALTER TABLE player_heroes ADD COLUMN IF NOT EXISTS current_defense INT;
ALTER TABLE player_heroes ADD COLUMN IF NOT EXISTS current_speed INT;

COMMENT ON COLUMN player_heroes.level IS 'Hero level: 1-5. Multipliers: Lv2=2x, Lv3=6x, Lv4=24x, Lv5=120x base stats';
COMMENT ON COLUMN player_heroes.level_up_cost IS 'Cost to level up: {gold: number, gems: number}';
COMMENT ON COLUMN player_heroes.current_hp IS 'Current HP after applying level multiplier';
COMMENT ON COLUMN player_heroes.current_attack IS 'Current Attack after applying level multiplier';
COMMENT ON COLUMN player_heroes.current_defense IS 'Current Defense after applying level multiplier';
COMMENT ON COLUMN player_heroes.current_speed IS 'Current Speed after applying level multiplier';

-- ============================================================================
-- 3. PET BONUS SYSTEM
-- ============================================================================

-- Add pet fields to player_heroes
ALTER TABLE player_heroes ADD COLUMN IF NOT EXISTS pet_level INT DEFAULT 1;
ALTER TABLE player_heroes ADD COLUMN IF NOT EXISTS pet_bonus_active BOOLEAN DEFAULT true;
ALTER TABLE player_heroes ADD COLUMN IF NOT EXISTS pet_evolution_stage INT DEFAULT 1;

COMMENT ON COLUMN player_heroes.pet_level IS 'Pet level: 1-5, follows hero level';
COMMENT ON COLUMN player_heroes.pet_bonus_active IS 'Whether pet bonus is currently applied';
COMMENT ON COLUMN player_heroes.pet_evolution_stage IS 'Pet evolution: 1=basic, 2=evolved, 3=ultimate';

-- ============================================================================
-- 4. RESOURCE SYNERGY SYSTEM (WU XING)
-- ============================================================================

-- Add synergy tracking to player table
ALTER TABLE players ADD COLUMN IF NOT EXISTS resource_synergy_bonuses JSONB DEFAULT '{}';

COMMENT ON COLUMN players.resource_synergy_bonuses IS 'Wu Xing synergy bonuses: {gold_to_rice: 0.1, rice_to_lumber: 0.15, ...}';

-- Add synergy config to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS synergy_gives_to VARCHAR(50) DEFAULT NULL;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS synergy_bonus_percent DECIMAL(5,2) DEFAULT 10.0;

COMMENT ON COLUMN resources.synergy_gives_to IS 'Which resource this boosts (Wu Xing cycle): gold->rice->lumber->bazan->stone->gold';
COMMENT ON COLUMN resources.synergy_bonus_percent IS 'Percentage bonus given to next resource (default 10%)';

-- Update resources with Wu Xing relationships
UPDATE resources SET synergy_gives_to = 'rice', synergy_bonus_percent = 10.0 WHERE id = 'gold';
UPDATE resources SET synergy_gives_to = 'lumber', synergy_bonus_percent = 10.0 WHERE id = 'rice';
UPDATE resources SET synergy_gives_to = 'bazan', synergy_bonus_percent = 10.0 WHERE id = 'lumber';
UPDATE resources SET synergy_gives_to = 'stone', synergy_bonus_percent = 10.0 WHERE id = 'bazan';
UPDATE resources SET synergy_gives_to = 'gold', synergy_bonus_percent = 10.0 WHERE id = 'stone';

-- ============================================================================
-- 5. DAILY STORY UNLOCK SYSTEM
-- ============================================================================

-- Add registration date tracking for daily unlocks
ALTER TABLE players ADD COLUMN IF NOT EXISTS registration_date DATE DEFAULT CURRENT_DATE;

COMMENT ON COLUMN players.registration_date IS 'Date player registered (used for daily story unlocks)';

-- Backfill registration_date for existing players
UPDATE players SET registration_date = DATE(created_at) WHERE registration_date IS NULL;

-- ============================================================================
-- 6. QUIZ REWARD MULTIPLIER
-- ============================================================================

-- Already exists in quiz_submissions.multiplier, just update comment
COMMENT ON COLUMN quiz_submissions.multiplier IS 'Reward multiplier: 1.0 for wrong answers, 5.0 for all correct (x5)';

-- Add tracking for perfect quizzes
ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS quiz_perfect_streak INT DEFAULT 0;
ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS quiz_best_streak INT DEFAULT 0;

COMMENT ON COLUMN player_stats.quiz_perfect_streak IS 'Current streak of perfect quizzes (all correct)';
COMMENT ON COLUMN player_stats.quiz_best_streak IS 'Best ever streak of perfect quizzes';

-- ============================================================================
-- 7. HISTORICAL ERA PROGRESSION
-- ============================================================================

-- Add era tracking to player
ALTER TABLE players ADD COLUMN IF NOT EXISTS current_era VARCHAR(100) DEFAULT 'Thời Hùng Vương';
ALTER TABLE players ADD COLUMN IF NOT EXISTS unlocked_eras JSONB DEFAULT '["Thời Hùng Vương"]';

COMMENT ON COLUMN players.current_era IS 'Current historical era player is in';
COMMENT ON COLUMN players.unlocked_eras IS 'Array of unlocked eras: ["Thời Hùng Vương", "Thời Bắc thuộc", ...]';

-- ============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Province skills indexes
CREATE INDEX IF NOT EXISTS idx_player_provinces_active_skill ON player_provinces(active_skill_level) WHERE active_skill_level > 0;
CREATE INDEX IF NOT EXISTS idx_player_provinces_cooldown ON player_provinces(active_skill_cooldown_ends) WHERE active_skill_cooldown_ends > NOW();

-- Hero leveling indexes
CREATE INDEX IF NOT EXISTS idx_player_heroes_level ON player_heroes(level);
CREATE INDEX IF NOT EXISTS idx_player_heroes_pet_level ON player_heroes(pet_level);

-- Story unlock indexes  
CREATE INDEX IF NOT EXISTS idx_stories_day_order ON stories(day) WHERE is_available = true;

-- Quiz multiplier indexes
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_multiplier ON quiz_submissions(multiplier) WHERE multiplier >= 5.0;

-- ============================================================================
-- 9. VALIDATION CONSTRAINTS
-- ============================================================================

-- Hero level constraint
ALTER TABLE player_heroes ADD CONSTRAINT chk_hero_level CHECK (level >= 1 AND level <= 5);

-- Pet level constraint
ALTER TABLE player_heroes ADD CONSTRAINT chk_pet_level CHECK (pet_level >= 1 AND pet_level <= 5);

-- Pet evolution constraint
ALTER TABLE player_heroes ADD CONSTRAINT chk_pet_evolution CHECK (pet_evolution_stage >= 1 AND pet_evolution_stage <= 3);

-- Active skill level constraint
ALTER TABLE player_provinces ADD CONSTRAINT chk_active_skill_level CHECK (active_skill_level >= 0 AND active_skill_level <= 3);

-- Development level milestones (for active skills)
-- Level 3 -> x2, Level 6 -> x3, Level 10 -> x5
ALTER TABLE player_provinces ADD CONSTRAINT chk_active_skill_unlock CHECK (
  (active_skill_level = 0) OR
  (active_skill_level = 1 AND development_level >= 3) OR
  (active_skill_level = 2 AND development_level >= 6) OR
  (active_skill_level = 3 AND development_level >= 10)
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all new columns added
SELECT 
  table_name, 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('player_provinces', 'player_heroes', 'players', 'resources', 'player_stats')
  AND column_name IN (
    'passive_buffs', 'active_skill_level', 'active_skill_last_used', 'active_skill_cooldown_ends',
    'level_up_cost', 'current_hp', 'current_attack', 'current_defense', 'current_speed',
    'pet_level', 'pet_bonus_active', 'pet_evolution_stage',
    'resource_synergy_bonuses', 'synergy_gives_to', 'synergy_bonus_percent',
    'registration_date', 'current_era', 'unlocked_eras',
    'quiz_perfect_streak', 'quiz_best_streak'
  )
ORDER BY table_name, column_name;

COMMIT;
