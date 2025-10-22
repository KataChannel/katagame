-- ============================================================================
-- KATAGAME - PostgreSQL Database Schema
-- Purpose: Production game database for KataGame Vietnam game
-- Version: 1.0
-- Date: 2025-10-22
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================================
-- 1. PLAYERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Game stats
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  experience INTEGER DEFAULT 0 CHECK (experience >= 0),
  total_power INTEGER DEFAULT 0 GENERATED ALWAYS AS (
    level * 100 + (experience / 1000)
  ) STORED,
  
  -- Resources (JSONB for flexibility)
  resources JSONB DEFAULT '{
    "gold": 200,
    "rice": 100,
    "lumber": 50,
    "stone": 30,
    "culture": 20,
    "gems": 1500
  }',
  
  -- Account status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'inactive')),
  region VARCHAR(20) DEFAULT 'global',
  
  -- Premium
  premium_pass_active BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  device_info JSONB,
  country VARCHAR(50)
);

CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_region ON players(region);
CREATE INDEX idx_players_level ON players(level);
CREATE INDEX idx_players_total_power ON players(total_power DESC);
CREATE INDEX idx_players_last_login ON players(last_login DESC);

-- ============================================================================
-- 2. GAME STATE & PROVINCES
-- ============================================================================

CREATE TABLE provinces (
  id SMALLINT PRIMARY KEY, -- Vietnam has 63 provinces
  name VARCHAR(100) NOT NULL UNIQUE,
  
  -- Control
  controlled_by_guild_id UUID,
  control_since TIMESTAMP,
  
  -- Resources
  base_gold_rate DECIMAL(10, 2) DEFAULT 100.00,
  base_culture_rate DECIMAL(10, 2) DEFAULT 50.00,
  
  -- Special properties
  is_capital BOOLEAN DEFAULT false,
  power_bonus INTEGER DEFAULT 0, -- % bonus for guild controlling it
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_provinces_controlled_by ON provinces(controlled_by_guild_id);

-- Player province state
CREATE TABLE player_provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  province_id SMALLINT NOT NULL REFERENCES provinces(id),
  
  level INTEGER DEFAULT 1,
  max_level INTEGER DEFAULT 30,
  resources JSONB DEFAULT '{"farmers": 0, "buildings": []}',
  
  discovered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(player_id, province_id)
);

CREATE INDEX idx_player_provinces_player ON player_provinces(player_id);
CREATE INDEX idx_player_provinces_province ON player_provinces(province_id);

-- ============================================================================
-- 3. HEROES & PETS
-- ============================================================================

CREATE TABLE heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  element VARCHAR(20),
  
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  experience INTEGER DEFAULT 0,
  
  -- Stats
  hp INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  speed INTEGER NOT NULL,
  
  skills JSONB, -- Array of skill IDs
  
  acquired_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_heroes_player ON heroes(player_id);
CREATE INDEX idx_heroes_rarity ON heroes(rarity);

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  pet_type VARCHAR(50),
  rarity VARCHAR(20),
  
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  
  acquired_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pets_player ON pets(player_id);

-- ============================================================================
-- 4. BATTLES & COMBAT
-- ============================================================================

CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  attacker_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  defender_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  battle_type VARCHAR(20) NOT NULL CHECK (battle_type IN ('pvp', 'pve', 'guild_war', 'arena')),
  
  result VARCHAR(20) CHECK (result IN ('attacker_win', 'defender_win', 'draw')),
  
  -- Battle details
  duration_seconds INTEGER,
  battle_log JSONB, -- Detailed turn-by-turn log
  
  -- Rewards
  attacker_reward JSONB,
  defender_reward JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_battles_attacker ON battles(attacker_id);
CREATE INDEX idx_battles_defender ON battles(defender_id);
CREATE INDEX idx_battles_type ON battles(battle_type);
CREATE INDEX idx_battles_created ON battles(created_at DESC);

-- ============================================================================
-- 5. MARKETPLACE & TRADING
-- ============================================================================

CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  seller_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  item_id VARCHAR(100) NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  item_data JSONB, -- Hero/Pet details
  
  price INTEGER NOT NULL CHECK (price > 0),
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
  
  auction_start TIMESTAMP DEFAULT NOW(),
  auction_end TIMESTAMP,
  
  buyer_id UUID REFERENCES players(id) ON DELETE SET NULL,
  sold_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_item_type ON marketplace_listings(item_type);
CREATE INDEX idx_listings_price ON marketplace_listings(price);
CREATE INDEX idx_listings_expires ON marketplace_listings(expires_at);

-- Transaction history
CREATE TABLE marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
  buyer_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  price INTEGER NOT NULL,
  fee_amount INTEGER NOT NULL DEFAULT 0, -- 5% fee
  net_amount INTEGER NOT NULL DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'completed',
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_buyer ON marketplace_transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON marketplace_transactions(seller_id);
CREATE INDEX idx_transactions_created ON marketplace_transactions(created_at DESC);

-- ============================================================================
-- 6. GUILDS & GUILD WARS
-- ============================================================================

CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL UNIQUE,
  leader_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  description TEXT,
  logo_url VARCHAR(255),
  
  level INTEGER DEFAULT 1,
  
  total_power INTEGER DEFAULT 0,
  members_count INTEGER DEFAULT 1,
  
  treasury JSONB DEFAULT '{
    "gold": 0,
    "gems": 0,
    "guildCoins": 0
  }',
  
  status VARCHAR(20) DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guilds_leader ON guilds(leader_id);
CREATE INDEX idx_guilds_level ON guilds(level DESC);
CREATE INDEX idx_guilds_power ON guilds(total_power DESC);

-- Guild members
CREATE TABLE guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  rank VARCHAR(20) DEFAULT 'member' CHECK (rank IN ('leader', 'officer', 'member')),
  contribution_points INTEGER DEFAULT 0,
  
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(guild_id, player_id)
);

CREATE INDEX idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX idx_guild_members_player ON guild_members(player_id);

-- Guild wars
CREATE TABLE guild_wars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  attacker_guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  defender_guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  
  province_id SMALLINT NOT NULL REFERENCES provinces(id),
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  
  result VARCHAR(20) CHECK (result IN ('attacker_win', 'defender_win')),
  
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  
  attacker_participants JSONB, -- Player IDs
  defender_participants JSONB
);

CREATE INDEX idx_wars_attacker ON guild_wars(attacker_guild_id);
CREATE INDEX idx_wars_defender ON guild_wars(defender_guild_id);
CREATE INDEX idx_wars_province ON guild_wars(province_id);
CREATE INDEX idx_wars_status ON guild_wars(status);

-- ============================================================================
-- 7. ACHIEVEMENTS & BATTLE PASS
-- ============================================================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  
  points INTEGER NOT NULL DEFAULT 10,
  
  icon_url VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  
  progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP,
  
  UNIQUE(player_id, achievement_id)
);

CREATE INDEX idx_user_achievements_player ON user_achievements(player_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked_at);

-- Battle Pass
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  theme VARCHAR(50),
  
  number INTEGER NOT NULL UNIQUE,
  
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seasons_active ON seasons(is_active);
CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);

-- Player battle pass progress
CREATE TABLE battle_pass_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id),
  
  tier INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  
  has_premium BOOLEAN DEFAULT false,
  claimed_rewards JSONB DEFAULT '[]',
  
  UNIQUE(player_id, season_id)
);

CREATE INDEX idx_bp_progress_player ON battle_pass_progress(player_id);
CREATE INDEX idx_bp_progress_season ON battle_pass_progress(season_id);

-- ============================================================================
-- 8. EDUCATIONAL QUESTS
-- ============================================================================

CREATE TABLE educational_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50), -- historical_figure, dynasty, culture, etc.
  
  dynasty VARCHAR(50),
  historical_figure VARCHAR(100),
  
  content TEXT NOT NULL,
  description TEXT,
  
  quiz JSONB NOT NULL, -- Array of questions
  difficulty VARCHAR(20) DEFAULT 'normal',
  
  culture_points INTEGER NOT NULL DEFAULT 100,
  experience_reward INTEGER DEFAULT 50,
  
  icon_url VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quests_category ON educational_quests(category);
CREATE INDEX idx_quests_dynasty ON educational_quests(dynasty);
CREATE INDEX idx_quests_difficulty ON educational_quests(difficulty);

-- Quest progress
CREATE TABLE quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES educational_quests(id),
  
  attempts INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  
  UNIQUE(player_id, quest_id)
);

CREATE INDEX idx_quest_progress_player ON quest_progress(player_id);
CREATE INDEX idx_quest_progress_quest ON quest_progress(quest_id);
CREATE INDEX idx_quest_progress_completed ON quest_progress(completed_at);

-- ============================================================================
-- 9. LEADERBOARDS
-- ============================================================================

CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  board_type VARCHAR(20) NOT NULL CHECK (board_type IN ('power', 'pvp', 'wealth', 'culture', 'seasonal')),
  rank INTEGER NOT NULL,
  score INTEGER NOT NULL,
  
  region VARCHAR(20) DEFAULT 'global',
  timeframe VARCHAR(20) DEFAULT 'all_time' CHECK (timeframe IN ('weekly', 'monthly', 'all_time')),
  
  rank_change INTEGER DEFAULT 0,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_type_rank ON leaderboard_entries(board_type, rank);
CREATE INDEX idx_leaderboard_player ON leaderboard_entries(player_id);
CREATE INDEX idx_leaderboard_region ON leaderboard_entries(region);
CREATE INDEX idx_leaderboard_updated ON leaderboard_entries(updated_at DESC);

-- ============================================================================
-- 10. ANALYTICS & EVENTS
-- ============================================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_type VARCHAR(50) NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  
  data JSONB,
  
  session_id VARCHAR(100),
  device_type VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_player ON analytics_events(player_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_type_created ON analytics_events(event_type, created_at DESC);

-- Daily metrics
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  metric_date DATE NOT NULL UNIQUE,
  
  dau INTEGER NOT NULL DEFAULT 0,
  mau INTEGER NOT NULL DEFAULT 0,
  
  d1_retention DECIMAL(5, 2) NOT NULL DEFAULT 0, -- percentage
  d7_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,
  d30_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,
  
  total_revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  arpu DECIMAL(10, 2) NOT NULL DEFAULT 0,
  arppu DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  paying_users INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_daily_metrics_date ON daily_metrics(metric_date DESC);

-- ============================================================================
-- 11. MODERATION
-- ============================================================================

CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES players(id) ON DELETE SET NULL,
  
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('warn', 'mute', 'suspend', 'ban')),
  reason TEXT NOT NULL,
  
  duration_days INTEGER,
  expires_at TIMESTAMP,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_moderation_player ON moderation_actions(player_id);
CREATE INDEX idx_moderation_active ON moderation_actions(is_active);
CREATE INDEX idx_moderation_expires ON moderation_actions(expires_at);

-- ============================================================================
-- 12. TRANSACTIONS & PAYMENTS
-- ============================================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  transaction_type VARCHAR(50) NOT NULL, -- gem_purchase, battle_pass, marketplace_fee
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  
  item_id VARCHAR(100),
  item_name VARCHAR(200),
  
  payment_method VARCHAR(50), -- momo, zalopay, vnpay, gem_conversion
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  external_reference VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_player ON transactions(player_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ============================================================================
-- 13. MATERIALIZED VIEWS
-- ============================================================================

-- Global leaderboard snapshot
CREATE MATERIALIZED VIEW v_global_leaderboard AS
SELECT 
  p.id,
  p.username,
  p.level,
  p.experience,
  p.total_power,
  ROW_NUMBER() OVER (ORDER BY p.total_power DESC) as rank,
  p.region
FROM players p
WHERE p.status = 'active'
ORDER BY p.total_power DESC
LIMIT 1000;

CREATE INDEX idx_v_leaderboard_rank ON v_global_leaderboard(rank);

-- ============================================================================
-- 14. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update player updated_at on any change
CREATE OR REPLACE FUNCTION update_player_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_player_timestamp
BEFORE UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION update_player_timestamp();

-- Auto-expire marketplace listings
CREATE OR REPLACE FUNCTION expire_marketplace_listings()
RETURNS void AS $$
BEGIN
  UPDATE marketplace_listings
  SET status = 'expired'
  WHERE status = 'active'
    AND auction_end IS NOT NULL
    AND auction_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- Calculate player total power
CREATE OR REPLACE FUNCTION calculate_player_power(p_player_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_power INTEGER;
BEGIN
  SELECT COALESCE(level, 1) * 100 + COALESCE(experience, 0) / 1000
  INTO v_power
  FROM players
  WHERE id = p_player_id;
  
  RETURN v_power;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 15. INITIAL DATA
-- ============================================================================

-- Insert 63 Vietnam provinces
INSERT INTO provinces (id, name, is_capital) VALUES
(1, 'Hà Nội', true),
(2, 'Hồ Chí Minh', true),
(3, 'Đà Nẵng', false),
(4, 'Hải Phòng', false),
(5, 'Cần Thơ', false),
-- ... (add remaining 58 provinces)
ON CONFLICT DO NOTHING;

-- Insert initial achievements
INSERT INTO achievements (name, description, category, rarity, points) VALUES
('First Victory', 'Win your first battle', 'combat', 'common', 10),
('Level 10', 'Reach level 10', 'progression', 'uncommon', 50),
('Rich Player', 'Accumulate 100,000 gold', 'wealth', 'rare', 100),
('Scholar', 'Complete 20 educational quests', 'education', 'epic', 150),
('Guild Master', 'Become a guild leader', 'guild', 'epic', 200),
('Legend', 'Reach level 100', 'progression', 'legendary', 500)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 16. PERMISSIONS & SECURITY
-- ============================================================================

-- Create read-only user for analytics
CREATE ROLE analytics_user LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE katagame TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Create application user (read-write)
CREATE ROLE app_user LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE katagame TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- End of Schema
-- ============================================================================
