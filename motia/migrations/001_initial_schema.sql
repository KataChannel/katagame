-- KataGame MVP 1.0 Initial Schema
-- Created: 22 October 2025

-- ============================================
-- 1. PLAYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 100,
  gems INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_created_at ON players(created_at);

-- ============================================
-- 2. HEROES REFERENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  element VARCHAR(20) NOT NULL,
  rarity VARCHAR(20) NOT NULL,
  base_power INTEGER NOT NULL,
  skills JSONB DEFAULT '[]',
  lore TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_heroes_name ON heroes(name);
CREATE INDEX idx_heroes_element ON heroes(element);
CREATE INDEX idx_heroes_rarity ON heroes(rarity);

-- ============================================
-- 3. PLAYER HEROES (Inventory)
-- ============================================
CREATE TABLE IF NOT EXISTS player_heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  hero_id UUID NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  recruited_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (hero_id) REFERENCES heroes(id)
);

CREATE INDEX idx_player_heroes_player_id ON player_heroes(player_id);
CREATE INDEX idx_player_heroes_hero_id ON player_heroes(hero_id);

-- ============================================
-- 4. PLAYER RESOURCES
-- ============================================
CREATE TABLE IF NOT EXISTS player_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  amount BIGINT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE(player_id, resource_type)
);

CREATE INDEX idx_player_resources_player_id ON player_resources(player_id);

-- ============================================
-- 5. BATTLES
-- ============================================
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  enemy_id VARCHAR(100) NOT NULL,
  player_hero_id UUID,
  winner_id UUID,
  reward_gold INTEGER DEFAULT 0,
  reward_exp INTEGER DEFAULT 0,
  battle_log JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY (player_hero_id) REFERENCES player_heroes(id)
);

CREATE INDEX idx_battles_player_id ON battles(player_id);
CREATE INDEX idx_battles_created_at ON battles(created_at);

-- ============================================
-- 6. RESOURCES REFERENCE
-- ============================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  base_value INTEGER NOT NULL,
  rarity VARCHAR(20)
);

CREATE INDEX idx_resources_type ON resources(type);

-- ============================================
-- 7. QUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  reward_gold INTEGER DEFAULT 0,
  reward_exp INTEGER DEFAULT 0,
  difficulty VARCHAR(20) DEFAULT 'normal',
  is_daily BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quests_type ON quests(type);
CREATE INDEX idx_quests_difficulty ON quests(difficulty);

-- ============================================
-- 8. PLAYER ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE(player_id, achievement_id)
);

CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);

-- ============================================
-- 9. PROVINCES
-- ============================================
CREATE TABLE IF NOT EXISTS provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  level_required INTEGER DEFAULT 1,
  resources JSONB DEFAULT '{}',
  bonuses JSONB DEFAULT '{}',
  unlocked_at TIMESTAMP
);

CREATE INDEX idx_provinces_name ON provinces(name);
CREATE INDEX idx_provinces_level_required ON provinces(level_required);

-- ============================================
-- 10. SAVE GAMES (Cloud Save)
-- ============================================
CREATE TABLE IF NOT EXISTS player_save_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX idx_save_games_player_id ON player_save_games(player_id);
CREATE INDEX idx_save_games_created_at ON player_save_games(created_at);

-- ============================================
-- 11. GAME SESSIONS (Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_sessions_token ON game_sessions(token);
CREATE INDEX idx_sessions_expires_at ON game_sessions(expires_at);

-- ============================================
-- 12. AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_player_id ON audit_logs(player_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- SEED DATA
-- ============================================

-- Heroes (5 legendary Vietnamese heroes)
INSERT INTO heroes (name, element, rarity, base_power, lore) VALUES
  ('Hùng Vương', 'Earth', 'Legendary', 150, 'Vị vua sáng lập nước Việt'),
  ('Trần Hưng Đạo', 'Fire', 'Legendary', 140, 'Tướng quân vĩ đại'),
  ('Hai Bà Trưng', 'Light', 'Legendary', 130, 'Nữ anh hùng giải phóng'),
  ('Lý Thái Tổ', 'Wind', 'Epic', 110, 'Nhà sáng lập triều Lý'),
  ('Võ Nguyên Giáp', 'Dark', 'Legendary', 135, 'Tướng nhân dân')
ON CONFLICT (name) DO NOTHING;

-- Provinces (3 initial)
INSERT INTO provinces (name, level_required) VALUES
  ('Hà Nội', 1),
  ('Nghệ An', 10),
  ('Quảng Ninh', 20)
ON CONFLICT (name) DO NOTHING;

-- Resources
INSERT INTO resources (name, type, base_value, rarity) VALUES
  ('Gold', 'currency', 1, 'common'),
  ('Rice', 'food', 5, 'common'),
  ('Lumber', 'material', 10, 'uncommon'),
  ('Stone', 'material', 15, 'uncommon')
ON CONFLICT (name) DO NOTHING;

-- Quests
INSERT INTO quests (name, description, reward_gold, reward_exp, difficulty, is_daily) VALUES
  ('Harvest Rice', 'Collect rice from the fields', 50, 10, 'easy', true),
  ('Defeat Enemy', 'Win a battle against an enemy', 100, 25, 'medium', true),
  ('Collect Gems', 'Gather 100 gems from exploration', 150, 40, 'hard', true),
  ('Visit Province', 'Explore a new province', 75, 15, 'easy', true),
  ('Complete Challenge', 'Finish all daily missions', 200, 50, 'hard', false)
ON CONFLICT DO NOTHING;
