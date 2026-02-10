# 📊 KATAGAME - FULL FEATURE SUMMARY & ERA ANALYSIS
**Document**: Tổng hợp toàn bộ tính năng và phân tích thời kỳ lịch sử  
**Status**: ✅ COMPLETED & COMPREHENSIVE  
**Date**: February 10, 2026

---

## 🎯 TỔNG QUAN DỰ ÁN (PROJECT VISION)
KataGame là nền tảng **Game Giáo dục (EdTech Gaming)** kết hợp chiến thuật quản lý, tập trung vào việc truyền tải lịch sử, địa lý và văn hóa Việt Nam thông qua trải nghiệm tương tác hiện đại.

---

## ⏳ PHÂN TÍCH HỆ THỐNG THỜI KỲ (ERA SYSTEM)
Dựa trên thiết kế cốt lõi, game trải qua **5 thời kỳ lịch sử chính**, mỗi thời kỳ sẽ thay đổi diện mạo tỉnh thành, loại tài nguyên và anh hùng có thể chiêu mộ:

| Thời kỳ (Era) | Tên gọi | Giai đoạn Lịch sử | Đặc điểm chính |
|:---:|:---:|:---:|:---|
| **1** | **Khởi Nguyên Việt** | 2879 - 257 TCN | Thời kỳ Hùng Vương dựng nước Văn Lang. Công cụ sơ khai, tập trung vào định cư. |
| **2** | **Thăng Long Hồng Yên** | 938 - 1010 AD | Thời kỳ đầu tự chủ. Định đô tại Thăng Long, phát triển nông nghiệp lúa nước. |
| **3** | **Đại Việt** | 1010 - 1858 AD | Thời kỳ hoàng kim, mở mang bờ cõi về phía Nam. Văn hóa và quân sự phát triển cực thịnh. |
| **4** | **Kháng Chiến Tư Tự** | 1858 - 1954 | Cuộc chiến chống thực dân và giành độc lập. Anh hùng là các chiến sĩ cách mạng. |
| **5** | **Hiện Đại** | 1954 - Nay | Thời kỳ xây dựng đất nước đương đại. Công nghiệp hóa, đô thị hóa và hội nhập. |

*Lưu ý: Trong giai đoạn triển khai code hiện tại (MVP), hệ thống tính điểm Era dựa trên số lượng câu chuyện đã hoàn thành (Mốc 20, 50, 80 stories).*

---

## 🗺️ CÁC TÍNH NĂNG CỐT LÕI (CORE FEATURES)

### 1. Hệ thống Bản đồ 63 Tỉnh Thành
- **Mở khóa theo tiến trình**: Bắt đầu tại khu vực **Hà Nội**. Người chơi mở khóa các tỉnh thành khác bằng cách hoàn thành các nhiệm vụ lịch sử.
- **Đa thời kỳ**: Một tỉnh (vd: Hà Nội) sẽ có hình ảnh và tài nguyên khác nhau ở Era 1 (Cổ đại) so với Era 5 (Hiện đại).

### 2. Tài nguyên Ngũ Hành (Wu Xing Resource System)
Hệ thống tài nguyên độc đáo dựa trên triết lý phương Đông, tạo sự tương sinh tương khắc:
- 🟡 **Vàng (Kim)**: Tài chính, giao thương, nâng cấp công trình.
- 🟢 **Lúa (Thủy)**: Lương thực, phát triển dân số và văn hóa.
- 🟫 **Gỗ (Mộc)**: Nguyên liệu xây dựng, chế tạo vũ khí.
- 🪨 **Đá (Thổ)**: Phòng thủ, kiên cố hóa tỉnh thành.
- 🔴 **Bazan (Hỏa)**: Tài nguyên hiếm, dùng cho các tính năng "đột phá".

### 3. Hệ thống Nâng cấp 3 Chiều (3D Upgrade System)
Mỗi tỉnh thành không chỉ nâng cấp chung chung mà có 3 nhánh chuyên sâu:
- **Nông dân (Farmer)**: Tăng dân số, sản lượng lúa và vàng cơ bản. (Max Lv.20)
- **Tài nguyên (Resource)**: Chuyên môn hóa khai thác (vd: mỏ vàng, rừng gỗ). (Max Lv.10)
- **Phát triển (Development)**: Hạ tầng, giảm thời gian xây dựng, tăng hạnh phúc. (Max Lv.15)
- **Milestone ẩn**: Đạt mốc Lv5, 10, 15 sẽ kích hoạt các Buff "Phù Trợ" (x2, x3, x5 sản lượng trong 1 giờ).

### 4. Anh hùng và Linh thú (Heroes & Pets)
- **Anh hùng (Heroes)**: Được triệu hồi theo thời kỳ. Có các chỉ số HP, Attack, Defense, Speed và các kỹ năng bị động (Passive Buff).
- **Linh thú (Pets)**: Mỗi anh hùng có linh thú đi kèm (Rồng, Phượng, Hổ, Hạc...). Linh thú cấp càng cao thì buff chỉ số cho anh hùng và tỉnh thành càng mạnh.
- **Rarity**: Common (Thường) ➔ Rare (Hiếm) ➔ Epic (Trường ca) ➔ Legendary (Huyền thoại) ➔ Mythic (Thần thoại).

---

## 🎓 HỆ THỐNG GIÁO DỤC (EDUTAINMENT)
Đây là "trái tim" của KataGame, giúp game khác biệt với các trò chơi chiến thuật thông thường:

### 1. Daily Historical Stories (Câu chuyện mỗi ngày)
- Mỗi ngày người chơi được đọc 1 câu chuyện về lịch sử hoặc văn hóa liên quan đến tỉnh thành mình đang sở hữu.
- Nội dung được biên soạn ngắn gọn (5-7 phút đọc), có tính giáo dục cao.

### 2. Quiz & Multiplier System
- Sau mỗi câu chuyện là **3 câu hỏi trắc nghiệm**.
- **Cơ chế thưởng x5**: Nếu trả lời đúng cả 3 câu hỏi (Perfect Score), toàn bộ phần thưởng tài nguyên thu hoạch trong ngày đó sẽ được **nhân 5**. 
- Đây là động lực thúc đẩy người chơi tìm hiểu kiến thức thay vì chỉ click bỏ qua.

---

## 🛠️ TÍNH NĂNG KỸ THUẬT & UX
- **Real-time Notification**: Thông báo ngay lập tức khi công trình hoàn tất hoặc tài nguyên đầy.
- **Data Management**: Cho phép xóa/reset dữ liệu để khám phá các hướng phát triển khác nhau.
- **Mobile First Design**: Giao diện tối ưu hoàn toàn cho thiết bị di động với menu điều hướng thông minh.

---
**KataGame - Học sử qua từng bước chân, xây dựng giang sơn qua từng kỷ nguyên.**
