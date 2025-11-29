-- ============================================================================
-- ADD 63 PROVINCES OF VIETNAM
-- Following unlock_order and historical progression
-- ============================================================================

-- DELETE existing test data (keep structure)
-- We'll reinsert with complete data
DELETE FROM player_provinces WHERE province_id IN (1,2,3,4,5,6,7,8);
DELETE FROM provinces WHERE id IN (1,2,3,4,5,6,7,8);

-- ============================================================================
-- MIỀN BẮC (NORTH) - 25 provinces
-- ============================================================================

-- Starting provinces (auto-unlock)
INSERT INTO provinces (id, name, name_english, region, description, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, historical_eras, unlock_order, unlock_story_day) VALUES
(1, 'Hà Nội', 'Hanoi', 'north', 'Thủ đô ngàn năm văn hiến, trung tâm chính trị - văn hóa', true, 150, 120, 90, 100, 40, '["Thời Hùng Vương", "Thời Bắc thuộc", "Nhà Lý", "Nhà Trần", "Nhà Lê", "Hiện đại"]', 1, 0);

-- Priority unlock (order 2-10)
INSERT INTO provinces (id, name, name_english, region, description, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, historical_eras, unlock_order, unlock_story_day) VALUES
(2, 'Hải Phòng', 'Hai Phong', 'north', 'Thành phố cảng lớn nhất miền Bắc, cửa ngõ biển Đông', false, 140, 100, 110, 120, 35, '["Nhà Lý", "Nhà Trần", "Hiện đại"]', 3, 1),
(3, 'Quảng Ninh', 'Quang Ninh', 'north', 'Vịnh Hạ Long - Di sản thiên nhiên thế giới, khai thác than đá', false, 180, 80, 100, 150, 45, '["Thời Hùng Vương", "Nhà Trần", "Hiện đại"]', 4, 2),
(4, 'Hải Dương', 'Hai Duong', 'north', 'Vùng đất nông nghiệp phát triển, văn hóa dân gian', false, 110, 140, 100, 90, 30, '["Nhà Lý", "Nhà Lê", "Hiện đại"]', 5, 2),
(5, 'Hưng Yên', 'Hung Yen', 'north', 'Quê hương anh hùng Giang Văn Minh, làng nghề truyền thống', false, 105, 135, 95, 85, 28, '["Thời Bắc thuộc", "Nhà Lê", "Hiện đại"]', 6, 3),
(6, 'Hà Nam', 'Ha Nam', 'north', 'Đất Phật chùa Tam Chúc, văn hóa Phật giáo', false, 100, 130, 90, 80, 25, '["Nhà Đinh", "Nhà Lý", "Hiện đại"]', 7, 3),
(7, 'Nam Định', 'Nam Dinh', 'north', 'Kinh đô của Đinh Tiên Hoàng, làng nghề dệt vải', false, 115, 145, 105, 95, 32, '["Nhà Đinh", "Nhà Lê", "Hiện đại"]', 8, 4),
(8, 'Thái Bình', 'Thai Binh', 'north', 'Đồng bằng trù phú, nghề muối và nông nghiệp', false, 100, 150, 85, 90, 30, '["Nhà Lý", "Nhà Trần", "Hiện đại"]', 9, 4),
(9, 'Ninh Bình', 'Ninh Binh', 'north', 'Cố đô Hoa Lư, Tràng An - Di sản thế giới', false, 125, 120, 100, 110, 38, '["Nhà Đinh", "Nhà Lê", "Hiện đại"]', 10, 5),
(10, 'Thanh Hóa', 'Thanh Hoa', 'north', 'Quê hương Lê Lợi, khởi nghĩa Lam Sơn', false, 130, 135, 110, 105, 40, '["Thời Bắc thuộc", "Nhà Lê", "Hiện đại"]', 11, 5);

-- Secondary unlock (order 11-20)
INSERT INTO provinces (id, name, name_english, region, description, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, historical_eras, unlock_order, unlock_story_day) VALUES
(11, 'Bắc Ninh', 'Bac Ninh', 'north', 'Kinh Bắc xưa, cái nôi của dân ca quan họ', false, 120, 125, 95, 100, 35, '["Nhà Lý", "Nhà Trần", "Hiện đại"]', 12, 6),
(12, 'Bắc Giang', 'Bac Giang', 'north', 'Vùng đất lịch sử Lục Nam, trồng vải thiều', false, 110, 130, 105, 95, 32, '["Nhà Lý", "Nhà Lê", "Hiện đại"]', 13, 7),
(13, 'Phú Thọ', 'Phu Tho', 'north', 'Đất tổ Hùng Vương, đền Hùng linh thiêng', false, 140, 110, 115, 120, 50, '["Thời Hùng Vương", "Nhà Lý", "Hiện đại"]', 14, 8),
(14, 'Vĩnh Phúc', 'Vinh Phuc', 'north', 'Tam Đảo, Di tích Đình Bảng, công nghiệp', false, 115, 120, 100, 105, 35, '["Nhà Lý", "Nhà Trần", "Hiện đại"]', 15, 8),
(15, 'Thái Nguyên', 'Thai Nguyen', 'north', 'Vùng đất cách mạng, trà Thái Nguyên nổi tiếng', false, 125, 100, 130, 110, 40, '["Nhà Lê", "Hiện đại"]', 16, 9),
(16, 'Tuyên Quang', 'Tuyen Quang', 'north', 'Căn cứ Tân Trào, khu ATK cách mạng', false, 100, 95, 140, 100, 35, '["Nhà Lê", "Hiện đại"]', 17, 10),
(17, 'Lạng Sơn', 'Lang Son', 'north', 'Cửa khẩu biên giới, chợ Đồng Đăng', false, 110, 90, 120, 130, 38, '["Nhà Trần", "Nhà Tây Sơn", "Hiện đại"]', 18, 11),
(18, 'Cao Bằng', 'Cao Bang', 'north', 'Biên giới phía Bắc, thác Bản Giốc', false, 105, 85, 135, 125, 40, '["Nhà Lê", "Hiện đại"]', 19, 12),
(19, 'Hà Giang', 'Ha Giang', 'north', 'Cao nguyên đá Đồng Văn, mùa hoa tam giác mạch', false, 100, 80, 140, 120, 42, '["Nhà Lê", "Hiện đại"]', 20, 13),
(20, 'Lào Cai', 'Lao Cai', 'north', 'Sa Pa, Fansipan - nóc nhà Đông Dương', false, 110, 90, 145, 115, 45, '["Nhà Lê", "Hiện đại"]', 21, 14);

-- Tertiary unlock (order 21-25)
INSERT INTO provinces (id, name, name_english, region, description, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, historical_eras, unlock_order, unlock_story_day) VALUES
(21, 'Yên Bái', 'Yen Bai', 'north', 'Ruộng bậc thang Mù Cang Chải', false, 95, 100, 135, 110, 38, '["Nhà Lê", "Hiện đại"]', 22, 15),
(22, 'Điện Biên', 'Dien Bien', 'north', 'Chiến thắng Điện Biên Phủ lừng lẫy', false, 105, 85, 130, 125, 50, '["Hiện đại"]', 23, 16),
(23, 'Lai Châu', 'Lai Chau', 'north', 'Vùng cao biên giới Tây Bắc', false, 90, 80, 140, 115, 40, '["Hiện đại"]', 24, 17),
(24, 'Sơn La', 'Son La', 'north', 'Cao nguyên Mộc Châu, sữa bò nổi tiếng', false, 100, 95, 125, 120, 38, '["Hiện đại"]', 25, 18),
(25, 'Hòa Bình', 'Hoa Binh', 'north', 'Hồ thủy điện Hòa Bình, văn hóa Mường', false, 105, 100, 120, 130, 35, '["Nhà Lê", "Hiện đại"]', 26, 19);

-- ============================================================================
-- MIỀN TRUNG (CENTRAL) - 19 provinces
-- ============================================================================

-- Priority central provinces (order 2, 27-35)
INSERT INTO provinces (id, name, name_english, region, description, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, historical_eras, unlock_order, unlock_story_day) VALUES
(26, 'Thừa Thiên Huế', 'Thua Thien Hue', 'central', 'Cố đô Huế, di sản văn hóa thế giới', false, 160, 110, 100, 105, 45, '["Nhà Nguyễn", "Hiện đại"]', 2, 0),
(27, 'Đà Nẵng', 'Da Nang', 'central', 'Thành phố đáng sống, cầu Rồng, Bà Nà Hills', false, 170, 90, 95, 110, 48, '["Nhà Nguyễn", "Hiện đại"]', 27, 1),
(28, 'Quảng Nam', 'Quang Nam', 'central', 'Hội An cổ kính, thánh địa Mỹ Sơn', false, 145, 120, 110, 100, 42, '["Nhà Trần", "Nhà Nguyễn", "Hiện đại"]', 28, 20),
(29, 'Quảng Ngãi', 'Quang Ngai', 'central', 'Quê hương Võ Nguyên Giáp, biển Mỹ Khê', false, 130, 115, 105, 95, 38, '["Nhà Nguyễn", "Hiện đại"]', 29, 21),
(30, 'Bình Định', 'Binh Dinh', 'central', 'Cố đô Tây Sơn, Hoàng đế Quang Trung', false, 135, 125, 100, 100, 40, '["Nhà Tây Sơn", "Hiện đại"]', 30, 22),
(31, 'Phú Yên', 'Phu Yen', 'central', 'Vũng Rô, cánh đồng điện gió, tỏi Đại Lãnh', false, 125, 120, 95, 90, 35, '["Nhà Tây Sơn", "Hiện đại"]', 31, 23),
(32, 'Khánh Hòa', 'Khanh Hoa', 'central', 'Nha Trang - Thành phố biển, tôm hùm, yến sào', false, 155, 100, 90, 105, 42, '["Nhà Nguyễn", "Hiện đại"]', 32, 24),
(33, 'Ninh Thuận', 'Ninh Thuan', 'central', 'Tháp Chăm Poklong Garai, nho và dê', false, 120, 95, 85, 110, 50, '["Nhà Trần", "Nhà Nguyễn", "Hiện đại"]', 33, 25),
(34, 'Bình Thuận', 'Binh Thuan', 'central', 'Mũi Né, đồi cát bay, nước mắm Phan Thiết', false, 140, 100, 90, 100, 48, '["Nhà Nguyễn", "Hiện đại"]', 34, 26);

-- Secondary central provinces (order 36-44)
INSERT INTO provinces (id, name, name_english, region, description, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, historical_eras, unlock_order, unlock_story_day) VALUES
(35, 'Nghệ An', 'Nghe An', 'central', 'Quê Bác, xứ Nghệ anh hùng', false, 125, 130, 115, 105, 40, '["Nhà Lê", "Nhà Tây Sơn", "Hiện đại"]', 35, 27),
(36, 'Hà Tĩnh', 'Ha Tinh', 'central', 'Quê hương Nguyễn Du, Truyện Kiều', false, 115, 125, 110, 100, 35, '["Nhà Lê", "Hiện đại"]', 36, 28),
(37, 'Quảng Bình', 'Quang Binh', 'central', 'Động Phong Nha - Kẻ Bàng, hang Sơn Đoòng', false, 120, 110, 120, 130, 45, '["Nhà Nguyễn", "Hiện đại"]', 37, 29),
(38, 'Quảng Trị', 'Quang Tri', 'central', 'Thành cổ Quảng Trị, Đường Trường Sơn', false, 110, 105, 125, 120, 40, '["Nhà Nguyễn", "Hiện đại"]', 38, 30),
(39, 'Kon Tum', 'Kon Tum', 'central', 'Tây Nguyên, nhà rông Bahnar, cà phê', false, 105, 90, 135, 110, 55, '["Hiện đại"]', 39, 31),
(40, 'Gia Lai', 'Gia Lai', 'central', 'Biển hồ Tơ Nưng, cao nguyên xanh', false, 110, 95, 130, 115, 58, '["Hiện đại"]', 40, 32),
(41, 'Đắk Lắk', 'Dak Lak', 'central', 'Buôn Ma Thuột - Thủ phủ cà phê Việt Nam', false, 130, 100, 125, 120, 60, '["Hiện đại"]', 41, 33),
(42, 'Đắk Nông', 'Dak Nong', 'central', 'Vườn quốc gia Nam Cát Tiên, thác Dray Sáp', false, 100, 95, 130, 110, 52, '["Hiện đại"]', 42, 34),
(43, 'Lâm Đồng', 'Lam Dong', 'central', 'Đà Lạt - Thành phố ngàn hoa, rau và hoa', false, 135, 85, 120, 115, 45, '["Hiện đại"]', 43, 35),
(44, 'Đông Hà', 'Dong Ha', 'central', 'Thành phố Đông Hà - Cửa khẩu Lao Bảo, vùng đất anh hùng', false, 115, 100, 125, 125, 42, '["Nhà Nguyễn", "Hiện đại"]', 44, 36);

-- ============================================================================
-- MIỀN NAM (SOUTH) - 19 provinces
-- ============================================================================

-- Priority southern provinces (order 2, 45-53)
INSERT INTO provinces (id, name, name_english, region, description, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, historical_eras, unlock_order, unlock_story_day) VALUES
(45, 'Hồ Chí Minh', 'Ho Chi Minh City', 'south', 'Thành phố lớn nhất Việt Nam, trung tâm kinh tế', true, 200, 100, 80, 90, 35, '["Nhà Nguyễn", "Hiện đại"]', 2, 0),
(46, 'Cần Thơ', 'Can Tho', 'south', 'Thủ phủ miền Tây, chợ nổi Cái Răng', false, 140, 160, 90, 70, 30, '["Nhà Nguyễn", "Hiện đại"]', 45, 37),
(47, 'Đồng Nai', 'Dong Nai', 'south', 'Khu công nghiệp lớn, Nam Cát Tiên', false, 150, 120, 105, 95, 38, '["Hiện đại"]', 46, 38),
(48, 'Bình Dương', 'Binh Duong', 'south', 'Khu công nghiệp phát triển, thu hút FDI', false, 165, 110, 95, 90, 32, '["Hiện đại"]', 47, 39),
(49, 'Bà Rịa - Vũng Tàu', 'Ba Ria - Vung Tau', 'south', 'Biển Vũng Tàu, dầu khí, du lịch', false, 175, 95, 85, 100, 40, '["Hiện đại"]', 48, 40),
(50, 'Tây Ninh', 'Tay Ninh', 'south', 'Núi Bà Đen, Tòa thánh Cao Đài', false, 135, 125, 110, 85, 35, '["Hiện đại"]', 49, 41),
(51, 'Bình Phước', 'Binh Phuoc', 'south', 'Cao su, điều, rừng cao su xanh ngát', false, 120, 100, 125, 80, 40, '["Hiện đại"]', 50, 42),
(52, 'Long An', 'Long An', 'south', 'Đồng Tháp Mười, lúa gạo dồi dào', false, 125, 155, 95, 70, 28, '["Nhà Nguyễn", "Hiện đại"]', 51, 43),
(53, 'Tiền Giang', 'Tien Giang', 'south', 'Mỹ Tho, cồn Phụng, trái cây miệt vườn', false, 130, 150, 100, 75, 30, '["Nhà Nguyễn", "Hiện đại"]', 52, 44);

-- Secondary southern provinces (order 54-63)
INSERT INTO provinces (id, name, name_english, region, description, is_capital, base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate, historical_eras, unlock_order, unlock_story_day) VALUES
(54, 'Bến Tre', 'Ben Tre', 'south', 'Xứ dừa, kẹo dừa Ben Tre nổi tiếng', false, 115, 145, 105, 70, 28, '["Nhà Nguyễn", "Hiện đại"]', 53, 45),
(55, 'Vĩnh Long', 'Vinh Long', 'south', 'Cù lao, cồn, trái cây nhiệt đới', false, 120, 150, 100, 72, 30, '["Nhà Nguyễn", "Hiện đại"]', 54, 46),
(56, 'Trà Vinh', 'Tra Vinh', 'south', 'Đất đồng bằng, chùa Khmer, lúa gạo', false, 110, 155, 95, 68, 28, '["Nhà Nguyễn", "Hiện đại"]', 55, 47),
(57, 'Đồng Tháp', 'Dong Thap', 'south', 'Sen Đồng Tháp, vườn Quốc gia Tràm Chim', false, 115, 160, 100, 70, 30, '["Nhà Nguyễn", "Hiện đại"]', 56, 48),
(58, 'An Giang', 'An Giang', 'south', 'Núi Cấm, núi Sam, chợ Châu Đốc', false, 125, 150, 105, 80, 35, '["Nhà Nguyễn", "Hiện đại"]', 57, 49),
(59, 'Kiên Giang', 'Kien Giang', 'south', 'Phú Quốc - Đảo Ngọc, Hà Tiên biên giới', false, 145, 130, 90, 85, 38, '["Nhà Nguyễn", "Hiện đại"]', 58, 50),
(60, 'Sóc Trăng', 'Soc Trang', 'south', 'Đất Khmer, bánh Pía, chùa Dơi', false, 110, 145, 95, 70, 28, '["Nhà Nguyễn", "Hiện đại"]', 59, 51),
(61, 'Bạc Liêu', 'Bac Lieu', 'south', 'Quê hương công tử Bạc Liêu, điện gió', false, 120, 140, 90, 75, 32, '["Nhà Nguyễn", "Hiện đại"]', 60, 52),
(62, 'Cà Mau', 'Ca Mau', 'south', 'Mũi Cà Mau - cực Nam Tổ quốc, tôm rừng', false, 130, 135, 85, 70, 30, '["Nhà Nguyễn", "Hiện đại"]', 61, 53),
(63, 'Hậu Giang', 'Hau Giang', 'south', 'Vùng đất trẻ, lúa gạo và trái cây', false, 115, 148, 95, 72, 30, '["Hiện đại"]', 62, 54);

-- ============================================================================
-- Update unlock_story_day for existing provinces to match unlock_order
-- ============================================================================

COMMIT;

-- Verify count
SELECT COUNT(*) as total_provinces FROM provinces;
-- Expected: 63

SELECT region, COUNT(*) as count FROM provinces GROUP BY region ORDER BY region;
-- Expected: north=25, central=19, south=19
