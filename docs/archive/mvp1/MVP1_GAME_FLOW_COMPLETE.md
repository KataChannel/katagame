# 🎮 KATAGAME MVP1 - LUỒNG CHƠI GAME & CƠ CHẾ HOẠT ĐỘNG

## 📊 TỔNG QUAN DỰ ÁN

**Công nghệ đang chạy:**
- **Frontend:** Next.js 15 (Port 11100) - React 19, TypeScript, Zustand, Tailwind
- **Backend:** Motia Framework v0.8.2 (Port 11101) - Node.js, PostgreSQL
- **Database:** PostgreSQL (Port 11103) - 25 tables, 63 tỉnh thành Việt Nam
- **Authentication:** JWT Token
- **API:** RESTful - 30+ endpoints MVP1

---

## 🎯 LUỒNG CHƠI GAME - STEP BY STEP

### 🌟 PHASE 1: KHỞI ĐẦU (Người chơi mới)

#### Step 1: Đăng ký tài khoản
```
POST /api/v1/auth/register
Body: { username, email, password }

→ Tự động nhận:
  ✅ 200 vàng (gold)
  ✅ 100 gạo (rice) 
  ✅ 50 gỗ (lumber)
  ✅ 30 đá (stone)
  ✅ 1500 ngọc (gems)
  ✅ 20 điểm văn hóa (culture)
```

#### Step 2: Đăng nhập
```
POST /api/v1/auth/login
Body: { username, password }

→ Nhận JWT token
→ Lưu vào localStorage: 'authToken'
```

#### Step 3: Tải dữ liệu game
```
Parallel API Calls:
1. GET /api/v1/game-data          → Game config (public)
2. GET /api/v1/stories            → 30 câu chuyện lịch sử
3. GET /api/v1/heroes             → 5 anh hùng khả dụng
4. GET /api/v1/provinces          → 63 tỉnh thành VN
5. GET /api/v1/resources          → 5 loại tài nguyên

Authenticated Calls:
6. GET /api/v1/provinces/my-provinces  → Tỉnh của player (rỗng ban đầu)
7. GET /api/v1/heroes/my-heroes        → Anh hùng đã sưu tầm (rỗng)
8. GET /api/v1/resources/my-resources  → Tài nguyên hiện tại
```

---

### 🗺️ PHASE 2: CHINH PHỤC TỈNH THÀNH

#### Step 4: Chọn tỉnh đầu tiên
```
Hiển thị: 63 tỉnh thành Việt Nam
Khuyến nghị: Hà Nội (provinceId: 1) hoặc Hồ Chí Minh

Frontend tự động tạo player_provinces khi click upgrade lần đầu
```

#### Step 5: Nâng cấp tỉnh (3 chiều độc lập)

##### 5.1. Nâng cấp Nông Dân (Farmer)
```
POST /api/v1/provinces/1/upgrade/farmer

Chi phí: 
  Level 1→2: 500 gold + 300 rice
  Level 2→3: 1000 gold + 600 rice
  Level n→n+1: 500*n gold + 300*n rice

Lợi ích: +5% tốc độ thu hoạch mỗi cấp (max 20)
```

##### 5.2. Nâng cấp Tài Nguyên (Resource)
```
POST /api/v1/provinces/1/upgrade/resource

Chi phí:
  Level 1→2: 800 gold + 400 rice + 200 wood
  Level n→n+1: (400*n) gold + (200*n) rice + (100*n) wood

Lợi ích: +10% sản lượng tài nguyên cụ thể (max 10)
```

##### 5.3. Nâng cấp Phát Triển (Development)
```
POST /api/v1/provinces/1/upgrade/development

Chi phí:
  Level 1→2: 1000 gold + 500 rice + 300 wood + 200 stone
  Level n→n+1: (500*n) gold + (250*n) rice + (150*n) wood + (100*n) stone

Lợi ích: +8% tăng trưởng tổng thể (max 15)
```

---

### 📚 PHASE 3: HỌC LỊCH SỬ - KIẾM ĐIỂM

#### Step 6: Đọc câu chuyện hàng ngày
```
GET /api/v1/stories/1   → Câu chuyện ngày 1 (Day 1)

30 stories total:
- Thời kỳ Hùng Vương
- Triều đại Lý - Trần - Lê
- Kháng chiến chống Mông Cổ
- Cách mạng 1945
- Đổi mới 1986
- Việt Nam hiện đại
```

#### Step 7: Làm quiz kiểm tra
```
GET /api/v1/stories/story_day_01/quiz
→ Nhận 3 câu hỏi:
  1. Comprehension (hiểu nội dung)
  2. Context (bối cảnh lịch sử)
  3. Application (ứng dụng kiến thức)
```

#### Step 8: Nộp bài quiz
```
POST /api/v1/quizzes/story_day_01/submit
Body: { answers: [0, 1, 2] }  // Indexes của đáp án đúng

Hệ thống tính điểm:
- 3/3 đúng: ×5 multiplier → 1250 gold + 1250 rice + 625 wood
- 2/3 đúng: ×3 multiplier → 750 gold + 750 rice + 375 wood
- 1/3 đúng: ×2 multiplier → 500 gold + 500 rice + 250 wood
- 0/3 đúng: ×1 multiplier → 400 gold + 400 rice + 200 wood (an ủi)

→ Tài nguyên tự động cộng vào player.resources
```

---

### 🦸 PHASE 4: SƯU TẦM ANH HÙNG

#### Step 9: Xem danh sách anh hùng
```
GET /api/v1/heroes

5 anh hùng MVP1:
1. Hùng Vương I (Rare) - Bonus: +15% dân số
2. Lý Thái Tổ (Rare) - Bonus: +20% gold generation
3. Lý Thánh Tông (Epic) - Bonus: +25% văn hóa
4. Trần Hưng Đạo (Legendary) - Bonus: +30% combat power
5. Modern Leader (Epic) - Bonus: +20% hiệu suất hành chính
```

#### Step 10: Tuyển dụng anh hùng
```
POST /api/v1/heroes/recruit
Body: { heroType: "hung_vuong_1" }

Chi phí:
- Rare: 2000 gold + 1000 culture
- Epic: 5000 gold + 2500 culture
- Legendary: 10000 gold + 5000 culture + 500 gems

→ Thêm vào player_heroes table
```

#### Step 11: Triển khai anh hùng
```
POST /api/v1/heroes/deploy
Body: { 
  heroId: "uuid-of-hero",
  provinceId: 1 
}

→ Anh hùng cung cấp bonus cho tỉnh:
  - +15-30% tùy loại hero
  - Pet đi kèm: +5-10% bonus thêm
```

---

### 💰 PHASE 5: THU HOẠCH TÀI NGUYÊN

#### Step 12: Harvest với cooldown
```
POST /api/v1/resources/harvest
Body: { resourceType: "gold" }

Cooldown: 30 phút/resource type
Base amount: 50-200 tùy resource

Bonuses cộng dồn:
+ Province farmer level: +5% per level
+ Province resource level: +10% per level
+ Province development: +8% per level
+ Hero bonus: +15-30%
+ Pet bonus: +5-10%

→ Có thể nhận 500-1000 per harvest (với all bonuses)
```

#### Step 13: Xem leaderboard
```
GET /api/v1/resources/leaderboard?type=gold&limit=100

Top 100 players theo:
- Total gold earned
- Total rice earned
- Total wood earned
- Total stone earned
- Total bazan earned
```

---

### 🎯 PHASE 6: PROGRESSION LOOP (Vòng lặp game)

#### Daily Loop (Mỗi ngày):
```
1. Đọc 1 story mới (Day 1 → Day 30)
2. Làm quiz → Nhận 750-1250 resources
3. Harvest resources × 5 types (mỗi 30 phút)
4. Nâng cấp 1-2 provinces
5. Tiết kiệm để recruit hero mới
```

#### Weekly Goals:
```
Week 1: Đọc 7 stories → Achievement "First Week Learner"
Week 2: Recruit 2 heroes
Week 3: Nâng cấp 5 provinces lên level 5+
Week 4: Đọc hết 30 stories → Achievement "Month Learner"
```

#### Long-term Goals:
```
- Unlock all 63 provinces
- Max 3 provinces (Level 20/10/15)
- Collect all 5 heroes
- Perfect quiz master (3/3 × 10 times)
- Top 10 leaderboard any category
```

---

## 🏆 HỆ THỐNG ĐIỂM THƯỞNG

### Resources Generated Per Day (Tối đa)
```
Stories/Quizzes: 
  30 stories × 1250 resources = 37,500 gold + 37,500 rice + 18,750 wood

Harvesting (48 harvests/day nếu 30min cooldown):
  Gold: 48 × 500 = 24,000
  Rice: 48 × 500 = 24,000
  Wood: 48 × 300 = 14,400
  Stone: 48 × 200 = 9,600
  Bazan: 48 × 150 = 7,200

Total có thể: 61,500 gold + 61,500 rice + 33,150 wood per day
```

### Province Upgrade Costs (3 tracks)
```
Farmer (1→20): ~200,000 gold + 120,000 rice
Resource (1→10): ~40,000 gold + 20,000 rice + 10,000 wood
Development (1→15): ~112,500 gold + 56,250 rice + 33,750 wood + 22,500 stone

Total for 1 province max: ~352,500 gold + 196,250 rice + 43,750 wood + 22,500 stone
```

---

## 📊 GAME MECHANICS CHI TIẾT

### Resource Types (5 Elemental)
```
🏅 Gold (Vàng):     Kim - Metal    - Trading, recruitment
🌾 Rice (Gạo):      Mộc - Wood     - Food, population
🪵 Lumber (Gỗ):     Mộc - Wood     - Construction
🪨 Stone (Đá):      Thổ - Earth    - Buildings
🌋 Bazan (Đất đỏ):  Hỏa - Fire     - Premium resource
```

### Province Stats
```
Each province has:
- Base generation rates (gold, rice, wood, stone, bazan)
- Historical eras (JSON array)
- Unlock order (1-63)
- Region (Bắc, Trung, Nam, Tây Nguyên)
- Is capital (true/false)
```

### Hero Stats
```
Base stats per hero:
- HP: 100-200
- Attack: 10-30
- Defense: 5-15
- Speed: 8-15
- Bonus type: population/gold/culture/combat/admin
- Bonus value: 15-30%
- Pet name & emoji
- Pet bonus: 5-10%
```

### Quiz Scoring
```
Correct answers → Multiplier:
3/3 → ×5 (Best)
2/3 → ×3 (Good)
1/3 → ×2 (Ok)
0/3 → ×1 (Participation reward)

Base rewards:
- 250 gold
- 250 rice
- 125 wood

Max reward (3/3): 1250 gold + 1250 rice + 625 wood
```

---

## 🎮 FRONTEND COMPONENTS

### Main Tabs
```
1. 🏠 Home - Game overview, resources
2. 🗺️ Provinces - 63 tỉnh thành, upgrade UI
3. 📚 Stories - 30 stories, quiz system
4. 🦸 Heroes - Hero collection, deployment
5. 🏆 Leaderboard - Rankings
```

### Data Flow
```
Frontend (Next.js) 
  ↓ (REST API calls)
Backend (Motia Framework)
  ↓ (SQL queries)
PostgreSQL Database
  ↓ (Auto-sync every 30s)
Zustand Store
  ↓ (Re-render)
React Components
```

### Auto-sync Hook
```typescript
useApiDataSync({
  interval: 30000,  // 30 seconds
  entities: ['provinces', 'heroes', 'resources']
})

→ Tự động refresh data mỗi 30s
→ Không cần manual refresh
→ Real-time-like experience
```

---

## 🚀 NEXT FEATURES (Planned)

### MVP1 → MVP2 Expansion
```
✅ Current: 30 stories
→ Target: 100 stories (Vietnamese history 1000-2024)

✅ Current: 5 heroes
→ Target: 20 heroes (all dynasties)

✅ Current: Single player
→ Target: Guilds, PvP, trading

✅ Current: Basic provinces
→ Target: Advanced buildings, special resources
```

---

## 📱 TECH STACK SUMMARY

```
Frontend:
  Next.js 15.5.6 (Turbopack)
  React 19.1.0
  TypeScript
  Zustand (state)
  Framer Motion (animations)
  Tailwind CSS 4

Backend:
  Motia v0.8.2-beta.139
  Node.js
  PostgreSQL (pg client)
  JWT authentication
  RESTful API

Database:
  PostgreSQL 16
  25 tables
  Indexed for performance
  JSONB for flexible data
```

---

**✅ Trạng thái: HOẠT ĐỘNG HOÀN TOÀN**  
**🎯 Mục tiêu: Giáo dục lịch sử + Giải trí**  
**🏆 Độ hoàn thiện MVP1: 100%**
