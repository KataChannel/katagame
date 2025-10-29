-- ============================================================================
-- KATAGAME MVP1 - COMPLETE SCHEMA + NEW TABLES
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PLAYERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  experience INTEGER DEFAULT 0 CHECK (experience >= 0),
  
  resources JSONB DEFAULT '{
    "gold": 200,
    "rice": 100,
    "lumber": 50,
    "stone": 30,
    "culture": 20,
    "gems": 1500
  }',
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'inactive')),
  region VARCHAR(20) DEFAULT 'global',
  
  premium_pass_active BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP,
  
  last_login TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. PROVINCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS provinces (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  name_english VARCHAR(100),
  region VARCHAR(100),
  description TEXT,
  
  is_capital BOOLEAN DEFAULT false,
  
  base_gold_rate DECIMAL(10, 2) DEFAULT 100.00,
  base_rice_rate DECIMAL(10, 2) DEFAULT 100.00,
  base_wood_rate DECIMAL(10, 2) DEFAULT 80.00,
  base_stone_rate DECIMAL(10, 2) DEFAULT 100.00,
  base_bazan_rate DECIMAL(10, 2) DEFAULT 30.00,
  
  historical_eras JSONB DEFAULT '[]',
  unlock_order INTEGER DEFAULT 99,
  unlock_story_day INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 3. HEROES
-- ============================================================================

CREATE TABLE IF NOT EXISTS heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_vietnamese VARCHAR(100) NOT NULL,
  name_english VARCHAR(100),
  era VARCHAR(100),
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'epic', 'legendary')),
  role VARCHAR(50),
  
  base_hp INTEGER DEFAULT 100,
  base_attack INTEGER DEFAULT 10,
  base_defense INTEGER DEFAULT 5,
  base_speed INTEGER DEFAULT 8,
  
  bonus_type VARCHAR(100),
  bonus_value INTEGER DEFAULT 0,
  
  pet_name VARCHAR(100),
  pet_emoji VARCHAR(10),
  pet_bonus INTEGER DEFAULT 0,
  
  story_day INTEGER,
  unlock_requirement TEXT,
  
  is_available BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 4. PLAYER PROVINCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  province_id SMALLINT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  
  farmer_level INTEGER DEFAULT 1,
  resource_level INTEGER DEFAULT 1,
  development_level INTEGER DEFAULT 1,
  buildings_count INTEGER DEFAULT 0,
  hero_id UUID REFERENCES heroes(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(player_id, province_id)
);

-- ============================================================================
-- 5. RESOURCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(50) PRIMARY KEY,
  name_vietnamese VARCHAR(100) NOT NULL,
  name_english VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  
  element_type VARCHAR(20) NOT NULL CHECK (element_type IN ('gold', 'rice', 'wood', 'stone', 'bazan')),
  description TEXT,
  uses JSONB DEFAULT '[]',
  
  base_generation_rate DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
  base_storage_capacity INTEGER NOT NULL DEFAULT 500,
  value_points INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_resources_element_type;
CREATE INDEX idx_resources_element_type ON resources(element_type);

-- ============================================================================
-- 6. BUILDINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS buildings (
  id VARCHAR(50) PRIMARY KEY,
  name_vietnamese VARCHAR(100) NOT NULL,
  name_english VARCHAR(100) NOT NULL,
  description TEXT,
  
  building_type VARCHAR(20) NOT NULL CHECK (building_type IN ('farm', 'mine', 'storage', 'market', 'temple', 'barracks')),
  produces_resource_id VARCHAR(50) REFERENCES resources(id) ON DELETE SET NULL,
  
  base_gold_cost INTEGER DEFAULT 0,
  base_rice_cost INTEGER DEFAULT 0,
  base_wood_cost INTEGER DEFAULT 0,
  base_stone_cost INTEGER DEFAULT 0,
  base_bazan_cost INTEGER DEFAULT 0,
  
  construction_time_seconds INTEGER NOT NULL DEFAULT 60,
  max_level INTEGER NOT NULL DEFAULT 10,
  
  level_1_production INTEGER DEFAULT 0,
  level_1_bonus INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_buildings_type;
CREATE INDEX idx_buildings_type ON buildings(building_type);
DROP INDEX IF EXISTS idx_buildings_produces;
CREATE INDEX idx_buildings_produces ON buildings(produces_resource_id);

-- ============================================================================
-- 7. STORIES TABLE
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

DROP INDEX IF EXISTS idx_stories_day;
CREATE INDEX idx_stories_day ON stories(day);
DROP INDEX IF EXISTS idx_stories_category;
CREATE INDEX idx_stories_category ON stories(category);
DROP INDEX IF EXISTS idx_stories_province;
CREATE INDEX idx_stories_province ON stories(province_id);
DROP INDEX IF EXISTS idx_stories_hero;
CREATE INDEX idx_stories_hero ON stories(hero_id);
DROP INDEX IF EXISTS idx_stories_available;
CREATE INDEX idx_stories_available ON stories(is_available);

-- ============================================================================
-- 8. QUIZ QUESTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(100) PRIMARY KEY,
  story_id VARCHAR(50) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  
  question_number INTEGER NOT NULL CHECK (question_number >= 1 AND question_number <= 10),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  type VARCHAR(20) DEFAULT 'comprehension' CHECK (type IN ('comprehension', 'context', 'application')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(story_id, question_number)
);

DROP INDEX IF EXISTS idx_quiz_story;
CREATE INDEX idx_quiz_story ON quiz_questions(story_id);
DROP INDEX IF EXISTS idx_quiz_difficulty;
CREATE INDEX idx_quiz_difficulty ON quiz_questions(difficulty);
DROP INDEX IF EXISTS idx_quiz_type;
CREATE INDEX idx_quiz_type ON quiz_questions(type);

-- ============================================================================
-- 9. PLAYER STATS
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  
  stories_read INTEGER DEFAULT 0,
  stories_completed INTEGER DEFAULT 0,
  
  quizzes_taken INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  perfect_quizzes INTEGER DEFAULT 0,
  
  total_gold_earned INTEGER DEFAULT 0,
  total_rice_earned INTEGER DEFAULT 0,
  total_wood_earned INTEGER DEFAULT 0,
  total_stone_earned INTEGER DEFAULT 0,
  total_bazan_earned INTEGER DEFAULT 0,
  
  heroes_collected INTEGER DEFAULT 0,
  heroes_leveled_up INTEGER DEFAULT 0,
  
  buildings_built INTEGER DEFAULT 0,
  buildings_upgraded INTEGER DEFAULT 0,
  
  culture_points INTEGER DEFAULT 0,
  learning_streak INTEGER DEFAULT 0,
  last_story_read_at TIMESTAMP,
  
  tutorial_completed BOOLEAN DEFAULT FALSE,
  tutorial_step INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_player_stats_player;
CREATE INDEX idx_player_stats_player ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_tutorial ON player_stats(player_id, tutorial_completed);

-- ============================================================================
-- 10. DAILY QUEST PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  quest_date DATE NOT NULL,
  story_id VARCHAR(50) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  
  story_read BOOLEAN DEFAULT false,
  quiz_attempted BOOLEAN DEFAULT false,
  quiz_score INTEGER DEFAULT 0,
  
  gold_earned INTEGER DEFAULT 0,
  rice_earned INTEGER DEFAULT 0,
  wood_earned INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(player_id, quest_date, story_id)
);

DROP INDEX IF EXISTS idx_daily_quest_player;
CREATE INDEX idx_daily_quest_player ON daily_quest_progress(player_id);
DROP INDEX IF EXISTS idx_daily_quest_date;
CREATE INDEX idx_daily_quest_date ON daily_quest_progress(quest_date);
DROP INDEX IF EXISTS idx_daily_quest_story;
CREATE INDEX idx_daily_quest_story ON daily_quest_progress(story_id);

-- ============================================================================
-- End of MVP1 Schema
-- ============================================================================
