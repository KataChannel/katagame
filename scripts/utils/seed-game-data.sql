-- Seed game data for MVP1
-- Clear existing data
TRUNCATE TABLE heroes, provinces, resources, stories CASCADE;

-- Insert Heroes
INSERT INTO heroes (id, name_vietnamese, name_english, era, rarity, role, base_hp, base_attack, base_defense, base_speed, bonus_type, bonus_value, pet_name, pet_emoji, pet_bonus, is_available, is_premium, story_day) VALUES
('5ac7efe1-c88f-457d-87f4-740481f002b5', 'Thánh Gióng', 'Saint Giong', 'Hung Kings', 'legendary', 'attacker', 150, 80, 40, 75, 'fire_bonus', 25, 'Phoenix', '🔥', 15, true, false, 1),
('b36d2096-e68c-425f-a3ed-b8446ab29724', 'Trần Hưng Đạo', 'Tran Hung Dao', 'Tran Dynasty', 'legendary', 'commander', 140, 75, 50, 70, 'water_bonus', 20, 'Dragon', '🐉', 12, true, false, 2),
('33164973-d898-4587-84df-8a5e34772557', 'Quang Trung', 'Quang Trung', 'Tay Son', 'legendary', 'emperor', 145, 78, 48, 72, 'earth_bonus', 22, 'Earth Guardian', '🗻', 13, true, false, 3),
('96a8c2b2-abdd-41bf-a79c-5f859c607f0b', 'Bà Triệu', 'Ba Trieu', 'Wu Dynasty', 'legendary', 'warrior', 138, 76, 45, 68, 'wood_bonus', 18, 'Forest Spirit', '🌿', 11, true, false, 4),
('de71d3f4-e88a-4036-9710-c80ee37daf8d', 'Trúc Nhan', 'Truc Nhan', 'Le Dynasty', 'legendary', 'defender', 155, 72, 55, 65, 'metal_bonus', 20, 'Steel Guardian', '⚙️', 14, true, false, 5),
('967819ef-7f55-40cd-a72e-6a3fbbf32a95', 'Tô Hiệu', 'To Hieu', 'Modern', 'epic', 'strategist', 120, 68, 38, 60, 'fire_bonus', 15, 'Red Fox', '🦊', 8, true, false, 6),
('53f0c87c-e501-4c22-9c83-c483183ad2d5', 'Nguyễn Trãi', 'Nguyen Trai', 'Le Dynasty', 'epic', 'sage', 110, 60, 42, 55, 'water_bonus', 12, 'Blue Crane', '🦢', 7, true, false, 7),
('aea7d4cc-3d14-40e4-83df-fdbdc90a557a', 'Trương Định', 'Truong Dinh', 'Modern', 'epic', 'soldier', 125, 70, 40, 62, 'earth_bonus', 14, 'Brown Bear', '🐻', 9, true, false, 8),
('8a1b3b75-9c7b-4c21-889b-a5f6bd78d266', 'Phan Bội Châu', 'Phan Boi Chau', 'Modern', 'rare', 'scholar', 100, 55, 35, 50, 'wood_bonus', 10, 'Green Turtle', '🐢', 5, true, false, 9),
('7ed0d922-4871-4ef5-bb01-b36ca7f1dba9', 'Lý Thái Tông', 'Ly Thai Tong', 'Ly Dynasty', 'rare', 'ruler', 115, 65, 45, 58, 'metal_bonus', 11, 'Silver Snake', '🐍', 6, true, false, 10);

-- Insert Resources
INSERT INTO resources (id, name_vietnamese, name_english, emoji, element_type, description, base_generation_rate, base_storage_capacity, value_points) VALUES
('gold', 'Vàng', 'Gold', '💰', 'metal', 'Tiền tệ cơ bản của game', 1.0, 500, 1),
('rice', 'Lương thực', 'Rice', '🌾', 'earth', 'Hỗ trợ dân số và quân đội', 0.8, 400, 1),
('lumber', 'Gỗ', 'Wood', '🌲', 'wood', 'Nguyên liệu xây dựng', 0.6, 300, 1),
('stone', 'Đá', 'Stone', '🪨', 'earth', 'Nguyên liệu xây dựng và pháo đài', 0.7, 350, 1),
('culture', 'Văn Hóa', 'Culture', '📚', 'water', 'Phát triển nền văn minh', 0.5, 250, 2),
('bazan', 'Bazán', 'Bazan', '⚡', 'fire', 'Nguyên liệu quý hiếm', 0.3, 150, 5);

-- Insert Provinces
INSERT INTO provinces (id, name, name_english, region, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, unlock_order, unlock_story_day) VALUES
(1, 'Hà Nội', 'Hanoi', 'North', true, 150.00, 120.00, 100.00, 120.00, 30.00, 1, 0),
(2, 'Hồ Chí Minh', 'Ho Chi Minh City', 'South', true, 180.00, 130.00, 110.00, 130.00, 40.00, 2, 0),
(3, 'Huế', 'Hue', 'Central', false, 120.00, 140.00, 120.00, 140.00, 25.00, 3, 3),
(4, 'Hải Phòng', 'Hai Phong', 'North', false, 130.00, 110.00, 100.00, 110.00, 20.00, 4, 5),
(5, 'Đà Nẵng', 'Da Nang', 'Central', false, 140.00, 120.00, 110.00, 120.00, 28.00, 5, 7),
(6, 'Cần Thơ', 'Can Tho', 'South', false, 135.00, 145.00, 95.00, 100.00, 22.00, 6, 10),
(7, 'Nha Trang', 'Nha Trang', 'Central', false, 125.00, 115.00, 105.00, 125.00, 24.00, 7, 12),
(8, 'Quảng Ninh', 'Quang Ninh', 'North', false, 145.00, 105.00, 110.00, 135.00, 35.00, 8, 15);

-- Insert Stories (First 10 days)
INSERT INTO stories (id, day, title_vietnamese, title_english, content, category, era, province_id, hero_id, reading_time_minutes, word_count, base_gold_reward, base_rice_reward, base_wood_reward, is_available, is_premium) VALUES
('story-1', 1, 'Sự tích Thánh Gióng', 'Legend of Saint Giong', 'Thánh Gióng là biểu tượng sức mạnh của dân tộc Việt. Huyền thoại kể rằng cậu bé Gióng được một vị thần linh chỉ dạy chiến thuật để đánh bại giặc ngoại xâm. Với sức mạnh phi thường, Gióng đã cưỡi ngựa sắt, mặc áo giáp thần kỳ chiến đấu bảo vệ tổ quốc.', 'legend', 'Hung Kings', 1, '5ac7efe1-c88f-457d-87f4-740481f002b5', 5, 800, 100, 100, 50, true, false),
('story-2', 2, 'Trần Hưng Đạo - Tướng quân vĩ đại', 'Tran Hung Dao - Great General', 'Trong cuộc chiến chống quân Nguyên, Trần Hưng Đạo chỉ huy những trận chiến kinh điển tại sông Bạch Đằng. Với chiến thuật dùng cọc nhọn cắm dưới sông, ông đã đánh bại hơn 300,000 quân Nguyên, bảo vệ độc lập dân tộc.', 'history', 'Tran Dynasty', 1, 'b36d2096-e68c-425f-a3ed-b8446ab29724', 7, 1200, 150, 150, 75, true, false),
('story-3', 3, 'Quang Trung - Vua hiền lành', 'Quang Trung - Benevolent King', 'Quang Trung đã thống nhất đất nước bằng tài năng quân sự và lòng nhân từ. Ông xây dựng một đế chế phát triển, khuyến khích văn hóa và giáo dục, đồng thời bảo vệ vững chắc biên giới đất nước.', 'history', 'Tay Son', 2, '33164973-d898-4587-84df-8a5e34772557', 6, 950, 120, 120, 60, true, false),
('story-4', 4, 'Bà Triệu - Nữ tướng huyền thoại', 'Ba Trieu - Legendary Female General', 'Bà Triệu là một phụ nữ phi thường lãnh đạo cuộc khởi nghĩa chống lại nhà Tùng. Với tinh thần bất khuất và tài năng quân sự, bà đã trở thành biểu tượng của sức mạnh phụ nữ Việt Nam.', 'legend', 'Wu Dynasty', 3, '96a8c2b2-abdd-41bf-a79c-5f859c607f0b', 6, 900, 130, 130, 65, true, false),
('story-5', 5, 'Trúc Nhan - Chiến binh gan dạ', 'Truc Nhan - Brave Warrior', 'Trúc Nhan đã chiến đấu bảo vệ độc lập của đất nước với tinh thần thép không lay chuyển. Câu chuyện về sự dũng cảm của ông đã truyền cảm hứng cho nhiều thế hệ sau.', 'history', 'Le Dynasty', 1, 'de71d3f4-e88a-4036-9710-c80ee37daf8d', 5, 750, 110, 110, 55, true, false),
('story-6', 6, 'Tô Hiệu - Nhân vật huyền thoại', 'To Hieu - Legendary Figure', 'Tô Hiệu là biểu tượng của sự dũng cảm và cam kết trong cuộc đấu tranh giải phóng. Ông đã cống hiến cả cuộc đời mình cho độc lập và tự do của dân tộc.', 'modern', 'Modern', 4, '967819ef-7f55-40cd-a72e-6a3fbbf32a95', 5, 700, 100, 100, 50, true, false),
('story-7', 7, 'Nguyễn Trãi - Nhà hiền triết', 'Nguyen Trai - Great Philosopher', 'Nguyễn Trãi không chỉ là danh tướng mà còn là nhà tư tưởng vĩ đại. Tác phẩm của ông về chiến lược quân sự và trị quốc đã trở thành di sản quý giá của dân tộc.', 'history', 'Le Dynasty', 1, '53f0c87c-e501-4c22-9c83-c483183ad2d5', 7, 1100, 140, 140, 70, true, false),
('story-8', 8, 'Trương Định - Chiến sĩ bất khuất', 'Truong Dinh - Unyielding Warrior', 'Trương Định chiến đấu bảo vệ lãnh thổ Việt Nam chống lại các kẻ xâm lược. Tinh thần kiên cường của ông là biểu tượng của sự bất khuất trong lịch sử dân tộc.', 'modern', 'Modern', 5, 'aea7d4cc-3d14-40e4-83df-fdbdc90a557a', 6, 850, 120, 120, 60, true, false),
('story-9', 9, 'Phan Bội Châu - Yêu nước vô hạn', 'Phan Boi Chau - Boundless Patriotism', 'Phan Bội Châu cống hiến cuộc đời của mình cho sự độc lập của tổ quốc. Ông đã đi khắp thế giới tìm kiếm sự hỗ trợ cho phong trào giải phóng dân tộc.', 'modern', 'Modern', 2, '8a1b3b75-9c7b-4c21-889b-a5f6bd78d266', 8, 1300, 160, 160, 80, true, false),
('story-10', 10, 'Lý Thái Tông - Vua tài ba', 'Ly Thai Tong - Talented King', 'Lý Thái Tông là vua lỗi lạc đã xây dựng một đế chế mạnh mẽ và văn minh. Thời kỳ của ông được đánh giá là thời kỳ vàng son trong lịch sử Việt Nam.', 'history', 'Ly Dynasty', 1, '7ed0d922-4871-4ef5-bb01-b36ca7f1dba9', 6, 950, 130, 130, 65, true, false);

-- Success message
SELECT 'Database seeded successfully!' as message,
       (SELECT COUNT(*) FROM heroes) as heroes_count,
       (SELECT COUNT(*) FROM provinces) as provinces_count,
       (SELECT COUNT(*) FROM resources) as resources_count,
       (SELECT COUNT(*) FROM stories) as stories_count;
