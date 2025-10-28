-- Insert MVP1 Heroes into heroes table
INSERT INTO heroes (name_vietnamese, name_english, era, rarity, role, base_hp, base_attack, base_defense, base_speed, bonus_type, bonus_value, pet_name, pet_emoji, pet_bonus, is_available, is_premium, story_day)
VALUES
('Thánh Gióng', 'Saint Giong', 'Hung Kings', 'legendary', 'attacker', 150, 80, 40, 75, 'fire_bonus', 25, 'Phoenix', '🔥', 15, true, false, 1),
('Trần Hưng Đạo', 'Tran Hung Dao', 'Tran Dynasty', 'legendary', 'commander', 140, 75, 50, 70, 'water_bonus', 20, 'Dragon', '🐉', 12, true, false, 2),
('Quang Trung', 'Quang Trung', 'Tay Son', 'legendary', 'emperor', 145, 78, 48, 72, 'earth_bonus', 22, 'Earth Guardian', '🗻', 13, true, false, 3),
('Bà Triệu', 'Ba Trieu', 'Wu Dynasty', 'legendary', 'warrior', 138, 76, 45, 68, 'wood_bonus', 18, 'Forest Spirit', '🌿', 11, true, false, 4),
('Trúc Nhan', 'Truc Nhan', 'Le Dynasty', 'legendary', 'defender', 155, 72, 55, 65, 'metal_bonus', 20, 'Steel Guardian', '⚙️', 14, true, false, 5),
('Tô Hiệu', 'To Hieu', 'Modern', 'epic', 'strategist', 120, 68, 38, 60, 'fire_bonus', 15, 'Red Fox', '🦊', 8, true, false, 6),
('Nguyễn Trãi', 'Nguyen Trai', 'Le Dynasty', 'epic', 'sage', 110, 60, 42, 55, 'water_bonus', 12, 'Blue Crane', '🦢', 7, true, false, 7),
('Trương Định', 'Truong Dinh', 'Modern', 'epic', 'soldier', 125, 70, 40, 62, 'earth_bonus', 14, 'Brown Bear', '🐻', 9, true, false, 8),
('Phan Bội Châu', 'Phan Boi Chau', 'Modern', 'rare', 'scholar', 100, 55, 35, 50, 'wood_bonus', 10, 'Green Turtle', '🢠', 5, true, false, 9),
('Lý Thái Tông', 'Ly Thai Tong', 'Ly Dynasty', 'rare', 'ruler', 115, 65, 45, 58, 'metal_bonus', 11, 'Silver Snake', '🐍', 6, true, false, 10);

-- Insert Resources
INSERT INTO resources (id, name_vietnamese, name_english, emoji, element_type, description, base_generation_rate, base_storage_capacity, value_points)
VALUES
('gold', 'Vàng', 'Gold', '💰', 'metal', 'Tiền tệ cơ bản của game', 1.0, 500, 1),
('rice', 'Lương thực', 'Rice', '🌾', 'earth', 'Hỗ trợ dân số và quân đội', 0.8, 400, 1),
('wood', 'Gỗ', 'Wood', '🌲', 'wood', 'Nguyên liệu xây dựng', 0.6, 300, 1),
('stone', 'Đá', 'Stone', '🪨', 'earth', 'Nguyên liệu xây dựng và pháo đài', 0.7, 350, 1),
('culture', 'Văn Hóa', 'Culture', '📚', 'water', 'Phát triển nền văn minh', 0.5, 250, 2),
('bazan', 'Bazán', 'Bazan', '⚡', 'fire', 'Nguyên liệu quý hiếm', 0.3, 150, 5);

-- Insert Stories (First 10 days)
INSERT INTO stories (title, day_number, content, difficulty_level, story_day, province_id, created_at)
VALUES
('Sự tích Thánh Gióng', 1, 'Vị Thánh Gióng là biểu tượng sức mạnh của dân tộc Việt. Huyền thoại kể rằng cậu bé Gióng được một vị thần linh chỉ dạy...', 'easy', 1, 1, NOW()),
('Trần Hưng Đạo - Tướng quân vĩ đại', 2, 'Trong cuộc chiến chống quân Nguyên, Trần Hưng Đạo chỉ huy những trận chiến kinh điển tại sông Bạch Đằng...', 'medium', 2, 1, NOW()),
('Quang Trung - Vua hiền lành', 3, 'Quang Trung đã thống nhất đất nước bằng tài năng quân sự và từ bi. Ông xây dựng một đế chế phát triển...', 'medium', 3, 2, NOW()),
('Bà Triệu - Nữ tướng huyền thoại', 4, 'Bà Triệu là một phụ nữ phi thường lãnh đạo cuộc khởi nghĩa chống lại nhà Tùng...', 'hard', 4, 3, NOW()),
('Trúc Nhan - Chiến binh gan dạ', 5, 'Trúc Nhan đã chiến đấu bảo vệ độc lập của đất nước với tinh thần thép không lay chuyển...', 'medium', 5, 1, NOW()),
('Tô Hiệu - Nhân vật huyền thoại', 6, 'Tô Hiệu là biểu tượng của sự dũng cảm và cam kết trong cuộc đấu tranh giải phóng...', 'easy', 6, 4, NOW()),
('Nguyễn Trãi - Nhà hiền triết', 7, 'Nguyễn Trãi không chỉ là danh tướng mà còn là nhà tư tưởng vĩ đại...', 'medium', 7, 1, NOW()),
('Trương Định - Chiến sĩ bất khuất', 8, 'Trương Định chiến đấu bảo vệ lãnh thổ Việt Nam chống lại các kẻ xâm lược...', 'medium', 8, 5, NOW()),
('Phan Bội Châu - Yêu nước vô hạn', 9, 'Phan Bội Châu tiế dâng cuộc đời của mình cho sự độc lập của tổ quốc...', 'hard', 9, 2, NOW()),
('Lý Thái Tông - Vua tài ba', 10, 'Lý Thái Tông là vua lỗi lạc đã xây dựng một đế chế mạnh mẽ và phạm vi...', 'easy', 10, 1, NOW());

-- Insert Provinces with full data  
INSERT INTO provinces (id, name, name_english, region, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, unlock_order, unlock_story_day, created_at)
VALUES
(1, 'Hà Nội', 'Hanoi', 'North', true, 150.00, 120.00, 100.00, 120.00, 30.00, 1, 0, NOW()),
(2, 'Hồ Chí Minh', 'Ho Chi Minh City', 'South', true, 180.00, 130.00, 110.00, 130.00, 40.00, 2, 0, NOW()),
(3, 'Huế', 'Hue', 'Central', false, 120.00, 140.00, 120.00, 140.00, 25.00, 3, 3, NOW()),
(4, 'Hải Phòng', 'Hai Phong', 'North', false, 130.00, 110.00, 100.00, 110.00, 20.00, 4, 5, NOW()),
(5, 'Đà Nẵng', 'Da Nang', 'Central', false, 140.00, 120.00, 110.00, 120.00, 28.00, 5, 7, NOW())
ON CONFLICT (id) DO NOTHING;"Hỏa", "Nước", "Gỗ", "Kim loại"]',
  0,
  'Thánh Gióng là biểu tượng của ngũ hành Hỏa, sức mạnh hủy diệt',
  id,
  NOW()
FROM stories WHERE day_number = 1
LIMIT 1;

-- Insert Provinces with full data
INSERT INTO provinces (id, name, name_english, region, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, unlock_order, unlock_story_day, created_at)
VALUES
(1, 'Hà Nội', 'Hanoi', 'North', true, 150.00, 120.00, 100.00, 120.00, 30.00, 1, 0, NOW()),
(2, 'Hồ Chí Minh', 'Ho Chi Minh City', 'South', true, 180.00, 130.00, 110.00, 130.00, 40.00, 2, 0, NOW()),
(3, 'Huế', 'Hue', 'Central', false, 120.00, 140.00, 120.00, 140.00, 25.00, 3, 3, NOW()),
(4, 'Hải Phòng', 'Hai Phong', 'North', false, 130.00, 110.00, 100.00, 110.00, 20.00, 4, 5, NOW()),
(5, 'Đà Nẵng', 'Da Nang', 'Central', false, 140.00, 120.00, 110.00, 120.00, 28.00, 5, 7, NOW());

-- Insert Player Stats template
INSERT INTO player_stats (player_id, total_battles, total_wins, total_losses, total_heroes_recruited, total_provinces_controlled, highest_gold_earned, highest_score, created_at)
SELECT id, 0, 0, 0, 0, 0, 0, 0, NOW() FROM players LIMIT 1;

-- Verify inserts
SELECT 'Heroes inserted:' as check_item, COUNT(*) as count FROM heroes
UNION ALL
SELECT 'Provinces inserted:', COUNT(*) FROM provinces
UNION ALL
SELECT 'Stories inserted:', COUNT(*) FROM stories
UNION ALL
SELECT 'Quizzes inserted:', COUNT(*) FROM quizzes
UNION ALL
SELECT 'Resources inserted:', COUNT(*) FROM resources;
