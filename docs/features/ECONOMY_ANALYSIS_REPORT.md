# 📊 BÁO CÁO PHÂN TÍCH VÀ ĐÁNH GIÁ NỀN KINH TẾ (GAME ECONOMY & MONETIZATION LOOP)

**Người thực hiện:** Hệ thống AI (Antigravity)
**Ngày Đánh Giá:** 25/02/2026
**Mục tiêu:** Phân tích độ tối ưu của nền kinh tế (Economy) và vòng lặp kiếm tiền (Monetization Loop) trong dự án KataGame, đặc biệt cho Giai đoạn Kỷ Nguyên 1 (Khởi Nguyên Việt).

---

## 1. TỔNG QUAN HỆ THỐNG KINH TẾ HIỆN TẠI

Hệ thống kinh tế của KataCore hiện tại được xây dựng khá toàn diện với cấu hình cho 1 tựa game City-builder kết hợp Nhập vai (RPG) / Thẻ bài (Gacha/Hero). 

### 1.1 Các dòng tiền và tài nguyên (Currencies & Resources)
- **Tài nguyên cơ bản (Soft Currencies/Resources):** `Gold` (Vàng), `Rice` (Lúa), `Lumber` (Gỗ), `Stone` (Đá), `Bazan` (Đá Bazan), `Culture` (Điểm văn hóa). 
  - **Nguồn cấp (Source):** Nhận được từ việc sản xuất của Tỉnh (Province/Buildings), Đọc Truyện (Story), tham gia Trắc nghiệm (Quiz) và Nhiệm vụ hàng ngày (Daily Quests).
  - **Nơi tiêu hao (Sink):** Xây dựng và nâng cấp Building, Chế tác vật phẩm (Crafting), Đóng góp sự kiện (Event Contribution - VD: Sơn Tinh Thủy Tinh).
- **Tiền tệ cao cấp (Hard Currency):** `Gems` (Đá quý).
  - **Nguồn cấp:** Nạp tiền thật (thông qua bảng `transactions` bằng VND), Phần thưởng Battle pass.
  - **Nơi tiêu hao:** Nâng cấp tướng (Level-up cost có yêu cầu Gems), Mua vật phẩm Marketplace, Tham gia tính năng Premium.
- **Tiền tệ đặc thù / Giới hạn:** `Stamina` (Thể lực - tối đa khởi điểm là 100).

### 1.2 Vòng lặp Gameplay cốt lõi (Core Gameplay Loop)
1. Dùng `Stamina` để Đọc Truyện / Trọn Quest / Đánh Boss -> **Kiếm Tài Nguyên**.
2. Dùng **Tài nguyên** để Xây dựng, Nâng cấp Tỉnh & Hero -> **Tăng tốc độ đào Tài Nguyên & Sức mạnh**.
3. Khi hết `Stamina`, người chơi dùng **Tài Nguyên** đang có để **Chế tác (Craft)** Bánh Chưng / Bánh Giầy -> **Hồi phục Stamina** (Tiếp tục bước 1).

---

## 2. ĐÁNH GIÁ VÒNG LẶP KIẾM TIỀN (MONETIZATION LOOPS)

Hệ thống đã chuẩn bị sẵn các "móng" (Schema) cực tốt cho Monetization:
1. **Premium Pass / Battle Pass:** Tăng tỷ lệ giữ chân (Retention) và tạo thói quen nạp định kỳ (Subscription model).
2. **Premium Heroes / Premium Stories:** Nguồn doanh thu bán lẻ (Micro-transactions). Bán content độc quyền.
3. **Marketplace Trading (P2P):** Kích thích nền kinh tế mở. Phí giao dịch (Taxation / Fee) thu về cho hệ thống.

### Phân tích Điểm Sáng (Strengths):
* **Tính liên kết tốt qua hệ thống Crafting:** Việc bắt người chơi phải chuyển hóa tài nguyên mỏ (Gold, Rice, Lumber) thành Food để bơm Stamina giúp xả (burn) lượng tài nguyên dư thừa cực kì hiệu quả. Tránh lạm phát Lúa/Gỗ/Vàng.
* **Cơ chế Event hút tài nguyên:** Event "Sơn Tinh Thủy Tinh" bắt người chơi cống hiến Rice hoặc Stone. Việc tạo các Event đua top tiêu hao tài nguyên định kỳ là mô hình kinh điển để triệt tiêu lạm phát Soft Currency.

---

## 3. CÁC ĐIỂM CHƯA TỐI ƯU & KIẾN NGHỊ CẢI THIỆN (RECOMMENDATIONS)

Mặc dù hệ thống đã có thiết kế rất tốt, nhưng phân tích source code (`crafting.service.ts`, `player.service.ts`, `schema.prisma`) cho thấy một số **khoảng trống cần tối ưu hóa để thực sự ép (squeeze) tối đa doanh thu** và giữ cân bằng:

### 3.1. Thiếu các Sink (Nơi xả) đủ sâu cho Gems (Premium Currency)
- **Vấn đề:** Hiện tại, người chơi tạo mới được tặng tới `1500 Gems`. Tuy nhiên, các service chưa thể hiện rõ tác dụng mang tính bắt buộc hoặc "quá hấp dẫn" của Gems.
- **Tối ưu hóa:** 
  1. **Time-skip (Đẩy nhanh thời gian):** Xây dựng Building, Chế tác mất thời gian. Cho phép dùng Gems để "Hoàn thành ngay". (Rất quan trọng cho dòng game city-builder).
  2. **Gacha Hero/Relic:** Relic (Trống Đồng, Di Vật) và Anh Hùng (Thánh Gióng, An Dương Vương) cần có một vòng lặp Gacha quay tướng bằng Gems.
  3. **Mua Stamina trực tiếp bằng Gems:** Có giới hạn số lần mua mỗi ngày với giá Gems tăng dần (VD: 50 -> 100 -> 200). 

### 3.2. Nguy cơ lạm phát Tài Nguyên (Hyperinflation)
- **Vấn đề:** Các Province có `base_gold_rate`, `base_rice_rate`, khi kết hợp cùng `resource_synergy_bonuses` (Ngũ Hành) sẽ tạo ra mức sản xuất tài nguyên khổng lồ (Exponential growth) ở giai đoạn giữa (Mid-game).
- **Tối ưu hóa:** 
  1. **Cap Level / Giới hạn Kho:** Cần đảm bảo Storage Rate và Production Rate có điểm nghẽn (Bottleneck). Nếu người chơi không nâng cấp kho, lượng tài nguyên đào ra sẽ bị lãng phí. 
  2. Áp dụng cơ chế **"Decay"** (Hao hụt) hoặc **Thuế Province** theo thời gian để hút bớt tài nguyên thặng dư.
  
### 3.3. Tối ưu Hệ thống Thể Lực (Stamina Monetization)
- **Vấn đề:** Cả `Player` và `Hero` đều chia rẽ phần sinh lực. Người chơi dùng Food hồi max 100 Stamina có thể khiến Game trở nên cày cuốc (Grindy) mà không nạp. Chế tác đồ Food bằng base cost lúa gạo quá rẻ sẽ làm mất giá trị của việc giới hạn thời gian chơi.
- **Tối ưu hóa:**
  1. Chế tác Food cần tỷ lệ **tạch (Fail rate)** hoặc **Crit (x2)** phụ thuộc vào level của người chế tác.
  2. Tách biệt `Stamina` (thể lực làm nhiệm vụ) và `Energy` (thăm ngàn/xây dựng) để tạo 2 vòng lặp (và 2 loại hình monetization) khác nhau.
  3. Bán Thẻ Tháng (Monthly Card) tăng `max_stamina` lên 120-150 và tự động hồi nhanh hơn 15%.

### 3.4 Tính Năng Bang Hội Tranh Đoạt (Guild Wars)
- **Vấn đề:** Schema có `guild_wars` và `battles`. Tuy nhiên vòng lặp Kiếm Tiền ở đây chưa rõ.
- **Tối ưu hóa:** Cuộc chiến của Cá rập (Whales) ở đây mới là nguồn doanh thu lớn nhất. Cần bổ sung Items hồi sinh lính, buff tấn công công thành giới hạn thời gian được mua bằng `Gems`.

---

## TỔNG KẾT
**Mức độ đánh giá:** 8/10 (Rất tốt ở cơ sở dữ liệu, cần code logic để vá thêm các điểm rỉ doanh thu).

**Hành động tiếp theo (Next Steps):**
1. Thêm API mua Stamina trực tiếp bằng Gems ở `crafting.service.ts` hoặc `shop.service.ts`.
2. Thiết kế Module Gacha / Lootbox cho Hệ thống Di vật (Relic) ở Kỷ Nguyên 1.
3. Rà soát lại công thức (Formula) của Ngũ Hành (Wu Xing Resource Synergy) để tránh việc buff sản lượng tài nguyên bị lỗi tính kép (Compound interest bug) gây nổ nền kinh tế.
