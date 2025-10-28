-- KataGame MVP1 Test Data
-- Seed data for testing MVP1 features

-- ============================================
-- 1. INSERT TEST PLAYER
-- ============================================
-- Password is: test123 (hashed with bcrypt)
INSERT INTO players (id, username, email, password_hash, level, experience, resources, status) 
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'testplayer',
  'test@katagame.com',
  '$2a$10$rZ3qPxL5EKvYWZJX5h6yJuYWxQqP0kGqXvKp8YwLxNJ5hYWZJX5h6',
  5,
  1200,
  '{"gold": 5000, "rice": 3000, "lumber": 2500, "stone": 2000, "culture": 1500, "gems": 100}'::jsonb,
  'active'
) ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 2. INSERT HEROES (MVP1 - 5 Heroes)
-- ============================================
INSERT INTO heroes (id, name_vietnamese, name_english, era, rarity, role, base_hp, base_attack, base_defense, base_speed, is_available) VALUES
  ('a1111111-1111-1111-1111-111111111111'::uuid, 'Hùng Vương I', 'Hung Vuong I', 'Ancient', 'legendary', 'leader', 500, 100, 80, 70, true),
  ('a2222222-2222-2222-2222-222222222222'::uuid, 'Lý Thái Tổ', 'Ly Thai To', 'Ly Dynasty', 'legendary', 'strategist', 450, 120, 75, 85, true),
  ('a3333333-3333-3333-3333-333333333333'::uuid, 'Lý Thánh Tông', 'Ly Thanh Tong', 'Ly Dynasty', 'legendary', 'scholar', 480, 110, 70, 80, true),
  ('a4444444-4444-4444-4444-444444444444'::uuid, 'Trần Hưng Đạo', 'Tran Hung Dao', 'Tran Dynasty', 'legendary', 'warrior', 550, 130, 90, 75, true),
  ('a5555555-5555-5555-5555-555555555555'::uuid, 'Modern Leader', 'Modern Leader', 'Modern', 'legendary', 'diplomat', 500, 115, 85, 90, true)
ON CONFLICT (name_vietnamese) DO NOTHING;

-- ============================================
-- 3. GIVE TEST PLAYER 2 HEROES
-- ============================================
INSERT INTO player_heroes (player_id, hero_id, level, experience) VALUES
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 3, 450),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'a4444444-4444-4444-4444-444444444444'::uuid, 5, 800)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. GIVE TEST PLAYER 2 HEROES
-- ============================================
INSERT INTO player_heroes (player_id, hero_id, level, experience) VALUES
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'h0000000-0000-0000-0000-000000000001'::uuid, 3, 450),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'h0000000-0000-0000-0000-000000000004'::uuid, 5, 800)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. SETUP PLAYER RESOURCES
-- ============================================
INSERT INTO player_resources (player_id, resource_type, amount) VALUES
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'gold', 5000),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'rice', 3000),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'lumber', 2500),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'stone', 2000),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'culture', 1500)
ON CONFLICT (player_id, resource_type) DO UPDATE 
  SET amount = EXCLUDED.amount;

-- ============================================
-- 5. SETUP PLAYER PROVINCES (Give 3 provinces)
-- ============================================
-- Note: Provinces 1, 2, 3 should already exist in provinces table
INSERT INTO player_provinces (player_id, province_id, farmer_level, resource_level, development_level) VALUES
  ('a0000000-0000-0000-0000-000000000001'::uuid, 1, 5, 3, 2),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 2, 3, 2, 1),
  ('a0000000-0000-0000-0000-000000000001'::uuid, 3, 2, 1, 1)
ON CONFLICT (player_id, province_id) DO UPDATE 
  SET farmer_level = EXCLUDED.farmer_level,
      resource_level = EXCLUDED.resource_level,
      development_level = EXCLUDED.development_level;

-- Verify data
SELECT 'Players:' as table_name, COUNT(*) as count FROM players WHERE username = 'testplayer'
UNION ALL
SELECT 'Heroes:', COUNT(*) FROM heroes WHERE is_available = true
UNION ALL
SELECT 'Player Heroes:', COUNT(*) FROM player_heroes WHERE player_id = 'a0000000-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT 'Player Resources:', COUNT(*) FROM player_resources WHERE player_id = 'a0000000-0000-0000-0000-000000000001'::uuid
UNION ALL
SELECT 'Player Provinces:', COUNT(*) FROM player_provinces WHERE player_id = 'a0000000-0000-0000-0000-000000000001'::uuid;

