-- ============================================================================
-- KATAGAME MVP1 - NEW TABLES FOR STORIES, QUIZZES, RESOURCES, BUILDINGS
-- Date: ${new Date().toISOString().split('T')[0]}
-- ============================================================================

-- ============================================================================
-- 1. RESOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(50) PRIMARY KEY,
  name_vietnamese VARCHAR(100) NOT NULL,
  name_english VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  
  element_type VARCHAR(20) NOT NULL CHECK (element_type IN ('gold', 'rice', 'wood', 'stone', 'bazan')),
  description TEXT,
  uses JSONB DEFAULT '[]', -- Array of use cases
  
  base_generation_rate DECIMAL(10, 2) NOT NULL DEFAULT 1.0, -- Per 30 seconds
  base_storage_capacity INTEGER NOT NULL DEFAULT 500,
  value_points INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resources_element_type ON resources(element_type);

-- ============================================================================
-- 2. BUILDINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS buildings (
  id VARCHAR(50) PRIMARY KEY,
  name_vietnamese VARCHAR(100) NOT NULL,
  name_english VARCHAR(100) NOT NULL,
  description TEXT,
  
  building_type VARCHAR(20) NOT NULL CHECK (building_type IN ('farm', 'mine', 'storage', 'market', 'temple', 'barracks')),
  produces_resource_id VARCHAR(50) REFERENCES resources(id) ON DELETE SET NULL,
  
  -- Construction costs
  base_gold_cost INTEGER DEFAULT 0,
  base_rice_cost INTEGER DEFAULT 0,
  base_wood_cost INTEGER DEFAULT 0,
  base_stone_cost INTEGER DEFAULT 0,
  base_bazan_cost INTEGER DEFAULT 0,
  
  construction_time_seconds INTEGER NOT NULL DEFAULT 60,
  max_level INTEGER NOT NULL DEFAULT 10,
  
  level_1_production INTEGER DEFAULT 0, -- For production buildings
  level_1_bonus INTEGER DEFAULT 0, -- For utility buildings (+storage, +efficiency)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_buildings_type ON buildings(building_type);
CREATE INDEX idx_buildings_produces ON buildings(produces_resource_id);

-- ============================================================================
-- 3. STORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS stories (
  id VARCHAR(50) PRIMARY KEY,
  day INTEGER NOT NULL UNIQUE CHECK (day >= 1 AND day <= 365),
  
  title_vietnamese VARCHAR(200) NOT NULL,
  title_english VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  
  category VARCHAR(50) NOT NULL CHECK (category IN ('history', 'geography', 'culture', 'resources', 'civilization')),
  era VARCHAR(100),
  
  province_id SMALLINT REFERENCES provinces(id) ON DELETE SET NULL,
  hero_id UUID REFERENCES heroes(id) ON DELETE SET NULL,
  
  reading_time_minutes INTEGER DEFAULT 5,
  word_count INTEGER DEFAULT 0,
  
  base_gold_reward INTEGER DEFAULT 100,
  base_rice_reward INTEGER DEFAULT 100,
  base_wood_reward INTEGER DEFAULT 50,
  
  is_premium BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stories_day ON stories(day);
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_province ON stories(province_id);
CREATE INDEX idx_stories_hero ON stories(hero_id);
CREATE INDEX idx_stories_available ON stories(is_available);

-- ============================================================================
-- 4. QUIZ QUESTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(100) PRIMARY KEY,
  story_id VARCHAR(50) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  
  question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 10),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer INTEGER NOT NULL, -- Index of correct option (0-3)
  
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  type VARCHAR(20) DEFAULT 'comprehension' CHECK (type IN ('comprehension', 'context', 'application')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(story_id, question_number)
);

CREATE INDEX idx_quiz_story ON quiz_questions(story_id);
CREATE INDEX idx_quiz_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_quiz_type ON quiz_questions(type);

-- ============================================================================
-- 5. PROVINCES UPDATE - ADD NEW COLUMNS
-- ============================================================================

ALTER TABLE provinces ADD COLUMN IF NOT EXISTS name_english VARCHAR(100);
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS historical_eras JSONB DEFAULT '[]';
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS base_rice_rate DECIMAL(10, 2) DEFAULT 100.00;
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS base_wood_rate DECIMAL(10, 2) DEFAULT 80.00;
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS base_stone_rate DECIMAL(10, 2) DEFAULT 100.00;
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS base_bazan_rate DECIMAL(10, 2) DEFAULT 30.00;
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS unlock_order INTEGER DEFAULT 99;
ALTER TABLE provinces ADD COLUMN IF NOT EXISTS unlock_story_day INTEGER DEFAULT 0;

-- ============================================================================
-- 6. HEROES UPDATE - ADD NEW COLUMNS
-- ============================================================================

ALTER TABLE heroes ADD COLUMN IF NOT EXISTS name_vietnamese VARCHAR(100);
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS name_english VARCHAR(100);
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS era VARCHAR(100);
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS role VARCHAR(50);
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS bonus_type VARCHAR(100);
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS bonus_value INTEGER DEFAULT 0;
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS pet_name VARCHAR(100);
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS pet_emoji VARCHAR(10);
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS pet_bonus INTEGER DEFAULT 0;
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS story_day INTEGER;
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS unlock_requirement TEXT;
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- ============================================================================
-- 7. PLAYER STATS UPDATE
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  
  -- Stories
  stories_read INTEGER DEFAULT 0,
  stories_completed INTEGER DEFAULT 0,
  
  -- Quizzes
  quizzes_taken INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  perfect_quizzes INTEGER DEFAULT 0, -- 3/3 correct
  
  -- Resources
  total_gold_earned INTEGER DEFAULT 0,
  total_rice_earned INTEGER DEFAULT 0,
  total_wood_earned INTEGER DEFAULT 0,
  total_stone_earned INTEGER DEFAULT 0,
  total_bazan_earned INTEGER DEFAULT 0,
  
  -- Heroes
  heroes_collected INTEGER DEFAULT 0,
  heroes_leveled_up INTEGER DEFAULT 0,
  
  -- Buildings
  buildings_built INTEGER DEFAULT 0,
  buildings_upgraded INTEGER DEFAULT 0,
  
  -- Learning
  culture_points INTEGER DEFAULT 0,
  learning_streak INTEGER DEFAULT 0,
  last_story_read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_player_stats_player ON player_stats(player_id);

-- ============================================================================
-- 8. PLAYER PROVINCE STATE UPDATE
-- ============================================================================

ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS farmer_level INTEGER DEFAULT 1;
ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS resource_level INTEGER DEFAULT 1;
ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS development_level INTEGER DEFAULT 1;
ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS buildings_count INTEGER DEFAULT 0;
ALTER TABLE player_provinces ADD COLUMN IF NOT EXISTS hero_id UUID REFERENCES heroes(id);

-- ============================================================================
-- 9. DAILY QUEST PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  quest_date DATE NOT NULL,
  story_id VARCHAR(50) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  
  story_read BOOLEAN DEFAULT false,
  quiz_attempted BOOLEAN DEFAULT false,
  quiz_score INTEGER DEFAULT 0, -- 0-3
  
  gold_earned INTEGER DEFAULT 0,
  rice_earned INTEGER DEFAULT 0,
  wood_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(player_id, quest_date, story_id)
);

CREATE INDEX idx_daily_quest_player ON daily_quest_progress(player_id);
CREATE INDEX idx_daily_quest_date ON daily_quest_progress(quest_date);
CREATE INDEX idx_daily_quest_story ON daily_quest_progress(story_id);

-- ============================================================================
-- End of Migration
-- ============================================================================
