-- Insert Vietnam Heroes
INSERT INTO heroes (name, element, rarity, base_power, description, is_summonable) VALUES
('Thánh Gióng', 'fire', 'legendary', 250, 'Vị Thánh bảo vệ đất Việt với sức mạnh Hỏa', true),
('Trần Hưng Đạo', 'water', 'legendary', 240, 'Tướng quân vĩ đại với chiến thuật nước', true),
('Quang Trung', 'earth', 'legendary', 245, 'Hoàng đế mạnh mẽ kiểm soát đất đai', true),
('Bà Triệu', 'wood', 'legendary', 235, 'Nữ tướng huyền thoại của Việt Nam', true),
('Trúc Nhan', 'metal', 'legendary', 230, 'Người phụ nữ dũng cảm với tinh thần thép', true),
('Tô Hiệu', 'fire', 'epic', 180, 'Nhân vật anh hùng cương quyết', true),
('Nguyễn Trãi', 'water', 'epic', 175, 'Nhà nước gia thông thái', true),
('Trương Định', 'earth', 'epic', 185, 'Vị tướng can đảm chống xâm lược', true),
('Phan Bội Châu', 'metal', 'epic', 172, 'Yêu nước và hiến dâng cho tổ quốc', true),
('Nguyễn ÁGeorges Cardona', 'wood', 'rare', 140, 'Nhân vật lịch sử với tài năng quân sự', true);

-- Insert Provinces (Vietnam)
INSERT INTO provinces (id, name, is_capital, base_gold_rate, base_culture_rate, region) VALUES
(1, 'Hà Nội', true, 1.5, 2.0, 'North'),
(2, 'Hồ Chí Minh', true, 1.8, 1.8, 'South'),
(3, 'Huế', false, 1.2, 2.5, 'Central'),
(4, 'Hải Phòng', false, 1.3, 1.0, 'North'),
(5, 'Đà Nẵng', false, 1.4, 1.5, 'Central'),
(6, 'Cần Thơ', false, 1.2, 1.0, 'South'),
(7, 'Hà Giang', false, 0.8, 0.5, 'North'),
(8, 'Cao Bằng', false, 0.9, 0.6, 'North'),
(9, 'Bắc Kạn', false, 0.8, 0.5, 'North'),
(10, 'Tuyên Quang', false, 0.9, 0.6, 'North'),
(11, 'Lào Cai', false, 0.85, 0.7, 'North'),
(12, 'Yên Bái', false, 0.9, 0.5, 'North'),
(13, 'Thái Nguyên', false, 1.0, 0.8, 'North'),
(14, 'Bắc Giang', false, 1.1, 0.9, 'North'),
(15, 'Phú Thọ', false, 1.0, 1.0, 'North'),
(16, 'Vĩnh Phúc', false, 1.2, 1.1, 'North'),
(17, 'Quảng Ninh', false, 1.4, 0.9, 'North'),
(18, 'Bắc Ninh', false, 1.3, 1.0, 'North'),
(19, 'Hải Dương', false, 1.2, 0.9, 'North'),
(20, 'Hưng Yên', false, 1.1, 0.9, 'North');

-- Insert Resources
INSERT INTO resources (name, resource_type, description, base_value) VALUES
('Vàng', 'gold', 'Tiền tệ cơ bản', 1),
('Văn Hóa', 'culture', 'Phát triển nền văn minh', 2),
('Lương thực', 'food', 'Hỗ trợ dân số', 1),
('Gỗ', 'wood', 'Nguyên liệu xây dựng', 1),
('Đá', 'stone', 'Nguyên liệu xây dựng', 1),
('Sắt', 'iron', 'Kim loại quý giá', 2);

-- Insert Sample Stories  
INSERT INTO stories (title, day_number, content, quiz_id, difficulty_level) VALUES
('Sự tích Thánh Gióng', 1, 'Vị Thánh Gióng là biểu tượng sức mạnh và dũng cảm của dân tộc Việt. Huyền thoại kể rằng cậu bé Gióng được một vị thần linh chỉ dạy, sau đó mặc áo giáp vàng, cỡi ngựa sắt và đánh tan quân thù...', NULL, 'easy'),
('Trần Hưng Đạo và Trận Bạch Đằng', 2, 'Trong cuộc đấu tranh chống quân Nguyên xâm lược, Trần Hưng Đạo đã chỉ huy những trận chiến huyền thoại. Chiến dịch Bạch Đằng nổi tiếng với kỹ thuật quân sự tài tình, dùng gỗ nhọn để làm bẫy...', NULL, 'medium'),
('Quang Trung - Vị vua lỗi lạc', 3, 'Quang Trung là vị vua tài ba đã thống nhất đất nước. Ông đã chỉ huy cuộc Tây Sơn và xây dựng một đế chế mạnh mẽ. Tham vọng của ông là mở rộng lãnh thổ và bảo vệ độc lập của Việt Nam...', NULL, 'medium'),
('Bà Triệu - Nữ tướng huyền thoại', 4, 'Bà Triệu là một phụ nữ phi thường, lãnh đạo cuộc khởi nghĩa chống lại sự thống trị của nhà Tùng. Tuy cuối cùng cuộc khởi nghĩa không thành công nhưng Bà Triệu vẫn được tôn vinh...', NULL, 'hard'),
('Nguyễn Trãi - Nhà cải cách tài ba', 5, 'Nguyễn Trãi không chỉ là một danh tướng mà còn là nhà tư tưởng, nhà cải cách. Ông đã đóng góp lớn vào việc xây dựng quốc gia độc lập và phát triển kinh tế...', NULL, 'medium');

-- Insert Quizzes
INSERT INTO quizzes (question, answer_options, correct_answer, explanation) VALUES
('Thánh Gióng được biết đến với yếu tố nào?', '["Hỏa", "Nước", "Gỗ", "Kim loại"]', 0, 'Thánh Gióng là vị thánh của ngũ hành Hỏa, biểu tượng sức mạnh hủy diệt'),
('Ai là người chỉ huy trận Bạch Đằng nổi tiếng?', '["Trần Hưng Đạo", "Quang Trung", "Bà Triệu", "Nguyễn Trãi"]', 0, 'Trần Hưng Đạo đã chỉ huy trận Bạch Đằng chống quân Nguyên'),
('Quang Trung thống nhất đất nước khi nào?', '["Thế kỷ 11", "Thế kỷ 17-18", "Thế kỷ 19", "Thế kỷ 20"]', 1, 'Quang Trung thống nhất đất nước vào thế kỷ 17-18, giai đoạn Tây Sơn'),
('Bà Triệu khởi nghĩa chống lại ai?', '["Trung Quốc", "Nhà Tùng", "Nhà Nguyễn", "Người Pháp"]', 1, 'Bà Triệu khởi nghĩa chống lại sự thống trị của nhà Tùng'),
('Nguyễn Trãi là ai?', '["Tướng quân", "Nhà cải cách và danh tướng", "Vua nhà Trần", "Thương nhân"]', 1, 'Nguyễn Trãi là nhà cải cách, tư tưởng gia, và danh tướng vĩ đại');
