# 🎮 KATAGAME - NEW FEATURES DETAILED DESIGN
**Document**: Thiết kế chi tiết các tính năng mới của KataGame  
**Date**: October 23, 2025  
**Status**: ✅ NEW CORE DESIGN

---

## 🎯 PROJECT VISION REVISED

### Project Goals (Mục tiêu dự án)

KataGame is now positioned as an **Educational Gaming Platform** with sustainable monetization:

1. **📚 Educational Mission**
   - Teach Vietnamese history, geography, culture
   - Showcase natural resources, minerals, agriculture
   - Build cultural pride and national identity
   - Create engaging learning through gameplay

2. **💰 Social Fundraising**
   - Support national programs and initiatives
   - Revenue sharing with educational foundations
   - Community-driven social impact
   - Sustainable business model with purpose

3. **🎮 Sustainable Gameplay Earning**
   - Players earn real rewards through engagement
   - Educational content = monetization value
   - No P2W mechanics that undermine learning
   - Skill-based progression and achievement

---

## 🗺️ GAME MAP SYSTEM - 63 PROVINCES

### Initial Launch: Only Hà Nội (Hanoi) Region Open

```
VIETNAM MAP - 63 PROVINCES
Starting: Hanoi (Thăng Long) - Modern Era

[Full Map Structure]
├─ Region 1: Red River Delta (5 provinces)
│  ├─ Hà Nội (UNLOCKED AT START)
│  ├─ Hải Dương
│  ├─ Hải Phòng
│  ├─ Hưng Yên
│  └─ Thái Bình
│
├─ Region 2: Northeast (12 provinces)
│  ├─ Lạng Sơn
│  ├─ Cao Bằng
│  ├─ Tuyên Quang
│  ├─ Hà Giang
│  ├─ Quảng Ninh
│  ├─ Bắc Kạn
│  ├─ Thái Nguyên
│  ├─ Bắc Giang
│  ├─ Phú Thọ
│  ├─ Yên Bái
│  ├─ Điện Biên
│  └─ Lai Châu
│
├─ Region 3: Northwest (7 provinces)
│  ├─ Sơn La
│  ├─ Hòa Bình
│  ├─ Ninh Bình
│  ├─ Thanh Hóa
│  ├─ Nghệ An
│  ├─ Hà Tĩnh
│  └─ Quảng Bình
│
├─ Region 4: Central (11 provinces)
│  └─ [...central provinces...]
│
├─ Region 5: Central Highlands (5 provinces)
│  └─ [...highland provinces...]
│
├─ Region 6: Southeast (6 provinces)
│  └─ [...southeast provinces...]
│
└─ Region 7: Mekong Delta (17 provinces)
   └─ [...mekong provinces...]
```

---

## ⏰ ERA SYSTEM - TIME PERIODS & UNLOCKING

### Historical Eras with Progressive Unlocking

Each province has multiple era versions that unlock as you progress:

#### Era 1: Khởi Nguyên Việt (2879-257 BCE) - Ancient Vietnam
- Characterized by ancient settlements
- Resource availability: Low, primitive tools
- Heroes: Ancient kings and founders
- Unlock Requirement: Complete tutorial

#### Era 2: Thăng Long Hồng Yên (938-1010 AD) - Early Dynasty
- Named "Thăng Long" for Hanoi region
- Resource availability: Moderate, agricultural society
- Heroes: Founding emperors, generals
- Unlock Requirement: Reach Farmer Level 5, Resource Level 3

#### Era 3: Đại Việt (1010-1858 AD) - Great Vietnam
- Territory expansion period (Nam Vị)
- Resource availability: High, established agriculture
- Heroes: Legendary emperors, national heroes
- Unlock Requirement: Control 5 provinces, Level 10

#### Era 4: Chiến Tranh (1858-1954) - War Period
- Colonial and independence struggle
- Resource availability: Unstable, conflict impact
- Heroes: Independence fighters, resistance leaders
- Unlock Requirement: Province Level 15, Alliance formation

#### Era 5: Hiện Đại (1954-Present) - Modern Era
- Contemporary development period
- Resource availability: Optimized, industrial society
- Heroes: Modern leaders, innovators
- Unlock Requirement: Complete all previous eras

### Province Unlocking by Era

```
HANOI EXAMPLE:

┌─────────────────────────────────────────────────────┐
│ HANOI - 63 PROVINCES SYSTEM                          │
├─────────────────────────────────────────────────────┤
│ Era 1: Cổ Đại (Ancient)                             │
│ └─ Province: Unknown Settlement                     │
│    └─ Unlocked: At Tutorial Complete               │
│    └─ Resources: 2x Gold, 1x Rice, 1x Stone        │
│                                                      │
│ Era 2: Thăng Long Hồng Yên (Early)                 │
│ └─ Province: Thăng Long (Hanoi)                    │
│    └─ Unlocked: Farmer Lv5 + Resource Lv3         │
│    └─ Resources: 3x Gold, 3x Rice, 2x Wood        │
│                                                      │
│ Era 3: Đại Việt (Middle)                           │
│ └─ Province: Hanoi (Đại Việt Period)              │
│    └─ Unlocked: Control 5 Provinces, Lv10         │
│    └─ Resources: 4x Gold, 4x Rice, 4x Wood        │
│                                                      │
│ Era 4: Chiến Tranh (War)                           │
│ └─ Province: Hanoi (Modern Infrastructure)        │
│    └─ Unlocked: Alliance + Province Lv15          │
│    └─ Resources: 5x Gold, 5x Rice, 5x Wood        │
│                                                      │
│ Era 5: Hiện Đại (Modern)                           │
│ └─ Province: Hà Nội (Contemporary)                │
│    └─ Unlocked: Complete All Previous Eras        │
│    └─ Resources: 10x Gold, 10x Rice, 10x Wood     │
│    └─ Bonus: +2% Resources from all sources       │
└─────────────────────────────────────────────────────┘
```

---

## 💎 RESOURCE SYSTEM - 5 ELEMENTAL RESOURCES

### Default Starting Resources (Level 1)

```
KATAGAME RESOURCE SYSTEM
═════════════════════════════════════════════

1. 🟡 GOLD (Kim - Metal Element)
   └─ Symbol: 💰 | Color: #FFD700
   └─ Initial: 10 Gold
   └─ Use: Building construction, upgrades
   └─ Source: Gold mines, aristocracy
   └─ History: Trade and commerce

2. 🟢 RICE (Thủy - Water Element)
   └─ Symbol: 🌾 | Color: #90EE90
   └─ Initial: 10 Rice
   └─ Use: Population feeding, culture
   └─ Source: Agricultural farms, water sources
   └─ History: Subsistence and agriculture

3. 🟫 WOOD (Mộc - Wood Element)
   └─ Symbol: 🪵 | Color: #8B4513
   └─ Initial: 10 Wood
   └─ Use: Building materials, crafting
   └─ Source: Forests, logging camps
   └─ History: Construction and shipbuilding

4. 🪨 STONE (Thổ - Earth Element)
   └─ Symbol: 🪨 | Color: #808080
   └─ Initial: 10 Stone
   └─ Use: Fortifications, defense
   └─ Source: Mountain quarries, stone mines
   └─ History: Defense and fortification

5. 🔴 BAZAN (Đất đỏ Bazalt - Fire Element)
   └─ Symbol: 🔥 | Color: #DC143C
   └─ Initial: 10 Bazan
   └─ Use: Special crafting, alchemy
   └─ Source: Volcanic regions, special areas
   └─ History: Ancient rituals and crafting
```

### Resource Characteristics

| Resource | Type | Rarity | Regen Rate | Max Stack | Strategic Use |
|----------|------|--------|-----------|-----------|---------------|
| Gold | Common | Normal | 1/hour | 500 | Economy |
| Rice | Common | Normal | 1.5/hour | 1000 | Culture |
| Wood | Normal | Normal | 0.8/hour | 800 | Construction |
| Stone | Normal | Normal | 1/hour | 600 | Defense |
| Bazan | Rare | Rare | 0.5/hour | 300 | Special |

---

## 🏘️ PROVINCE UPGRADE SYSTEM

### 3 Upgrade Dimensions Per Province

Each province has **3 independent upgrade tracks** that work synergistically:

#### 1️⃣ FARMER UPGRADE (農民 - Nông Dân)
- **Max Level**: 20
- **Purpose**: Increase population and basic resource generation
- **Benefits per Level**:
  - +5% resource generation
  - +10 population capacity
  - Unlock new buildings
- **Cost**: Gold + Rice (increases with level)
- **Progression**: Linear, steady growth

#### 2️⃣ RESOURCE UPGRADE (資源 - Tài Nguyên)
- **Max Level**: 10
- **Purpose**: Enhance specific resource production in this province
- **Resource Types** (choose one per province):
  - Gold Node (Kim Khoáng)
  - Rice Field (Ruộng Lúa)
  - Forest (Rừng Gỗ)
  - Stone Mine (Mỏ Đá)
  - Bazan Site (Mỏ Bazalt)
- **Benefits per Level**:
  - +20% that specific resource's generation
  - +10% synergy resources (related elements)
  - Unlock advanced processing
- **Cost**: That specific resource + Wood
- **Progression**: Exponential, specialized focus

#### 3️⃣ DEVELOPMENT UPGRADE (發展 - Phát Triển)
- **Max Level**: 15
- **Purpose**: Province overall development, infrastructure
- **Benefits per Level**:
  - +3% all resources in province
  - +5% population happiness
  - Unlock special features
  - Faster building construction (-2% time)
- **Cost**: All resources combined
- **Progression**: Balanced, comprehensive growth

### Hidden Milestone System

At certain upgrade milestones, **hidden bonuses activate** (3 types):

```
HIDDEN MILESTONE TRIGGERS
═════════════════════════════════════════════

🎯 Level Thresholds that Trigger Hidden Bonuses:

Farmer Upgrades:
├─ Lv 5  → Unlock Passive Bonus #1
├─ Lv 10 → Unlock Passive Bonus #2
├─ Lv 15 → Unlock Active Bonus #1
└─ Lv 20 → Unlock Active Bonus #2

Resource Upgrades:
├─ Lv 3  → Unlock Passive Bonus (Synergy Resource)
├─ Lv 6  → Unlock Passive Bonus (+2% Main Resource)
├─ Lv 8  → Unlock Active Bonus (Random x2/x3/x5)
└─ Lv 10 → Max bonus: Active Bonus refreshes daily

Development Upgrades:
├─ Lv 5  → Infrastructure Bonus
├─ Lv 10 → Regional Bonus
└─ Lv 15 → Provincial Mastery
```

### Hidden Bonus Types

#### 🔄 PASSIVE BONUSES (Automatic, Always Active)

**Type 1: Single Resource Boost**
- Random chance: 15-25% per collection
- Effect: +X% to main resource of that province
- Duration: Permanent (stackable)
- Example: Hanoi Gold Mine gives +5% Gold permanently

**Type 2: Synergy Resource Boost**
- When you collect main resource, bonus synergy resource drops
- Synergy pairs (5 Elements):
  - Gold + Rice (Commerce)
  - Wood + Stone (Construction)
  - Bazan + Gold (Alchemy)
  - Rice + Wood (Agriculture)
  - Stone + Bazan (Crafting)
- Bonus: +2-5% of synergy resource per collection

#### 🎮 ACTIVE BONUSES (Triggered by Player Action)

**Type 1: Auto-Harvest Multiplier**
- Random multiplier: x2, x3, or x5 (weighted)
- Duration: 1 hour
- Cooldown: 1 day (resets daily at midnight)
- Activation: Automatic when hitting hidden trigger
- Effect: All resource harvests in that province multiplied
- Notification: "Đất Việt Phù Trợ! Tài nguyên ×3 trong 1 giờ tới!" (Land Blesses! Resources ×3 for next hour!)

**Type 2: Province-Specific Buff**
- Applied to all resources of that province only
- Multiplier: x2, x3, or x5 (selected randomly)
- Duration: 1 hour
- Cooldown: 1 day
- Example: "Hà Nội Thịnh Vượng" (Hanoi Prospers) - all Hanoi resources x3

### Example: Hanoi Province Upgrade Tree

```
HANOI PROGRESSION EXAMPLE
═════════════════════════════════════════════

Starting State:
- Farmer Lv 1 (basic population)
- Gold Resource Lv 1 (weak mining)
- Development Lv 1 (primitive)

Growth Path:

Week 1: Farmer 1→5 (Basic Farming)
└─ Triggers: "Passive Bonus #1: +2% resource/harvest"

Week 2: Gold Resource 1→3 (Mining Start)
└─ Triggers: "Passive Bonus: +3% Gold + Synergy Bonus"

Week 3: Farmer 5→10 (Farming Expansion)
└─ Triggers: "Passive Bonus #2: +5% ALL resources"

Week 4: Gold Resource 3→8 (Mining Peak)
└─ Triggers: "Active Bonus: Next 24h = Random x2/x3/x5"

Week 5: Development 1→5 (Infrastructure)
└─ Triggers: "Infrastructure Bonus: Building -10% time"

Result After 5 Weeks:
- Resource generation: 2-3x starting
- Hidden bonuses: 2 passive + 1 active bonus
- Synergy resources: +10% from allies
- Infrastructure benefits: -10% construction time
- Next unlock: Farmer 15 → Active Bonus Tier 2
```

---

## 🦸 HEROES & PETS SYSTEM

### Heroes by Historical Era

Each era has unique heroes representing that period:

#### Era 1: Khởi Nguyên (Ancient Heroes)
```
Ancient Kingdom Founders
├─ Hung Vuong I (Hùng Vương I)
│  └─ Role: Farmer | Bonus: +15% Rice production
│  └─ Pet: Ancient Phoenix
│
├─ Hung Vuong II (Hùng Vương II)
│  └─ Role: Warrior | Bonus: +10% Defense
│  └─ Pet: Mythical Tiger
│
└─ Thuc Phan (Thục Phán)
   └─ Role: Leader | Bonus: +5% to all elements
   └─ Pet: Immortal Dragon
```

#### Era 2: Thăng Long (Establishment Period)
```
Dynasty Establishment
├─ Ly Thai To (Lý Thái Tổ)
│  └─ Role: Strategist | Bonus: +20% Economy (Gold/Rice)
│  └─ Pet: Palace Dragon
│
├─ Ly Thai Tong (Lý Thái Tông)
│  └─ Role: Scholar | Bonus: +15% Culture, Tech unlock speed
│  └─ Pet: Celestial Crane
│
└─ Ly Nhan Tong (Lý Nhân Tông)
   └─ Role: Builder | Bonus: +25% Building construction speed
   └─ Pet: Fortress Guardian
```

#### Era 3: Đại Việt (Expansion Period)
```
Vietnamese Expansion
├─ Tran Hung Dao (Trần Hưng Đạo)
│  └─ Role: Commander | Bonus: +30% Military Power, Leadership
│  └─ Pet: War Phoenix
│
├─ Le Loi (Lê Lợi)
│  └─ Role: Liberator | Bonus: +25% Alliance bonuses
│  └─ Pet: Freedom Dragon
│
└─ Mac Dang Dung (Mạc Đăng Dung)
   └─ Role: Defender | Bonus: +35% Defense structures
   └─ Pet: Stone Colossus
```

#### Era 4: Chiến Tranh (War & Independence)
```
Resistance & Independence
├─ Nguyen Hue (Nguyễn Huệ)
│  └─ Role: Revolutionary | Bonus: +40% Combat efficiency
│  └─ Pet: Liberation Tiger
│
├─ Ho Chi Minh (Hồ Chí Minh)
│  └─ Role: Unifier | Bonus: +30% People's support, +Unity
│  └─ Pet: Spirit Eagle
│
└─ Vo Nguyen Giap (Võ Nguyên Giáp)
   └─ Role: Strategist | Bonus: +45% Battle tactics, Alliance command
   └─ Pet: Strategic Phoenix
```

#### Era 5: Hiện Đại (Modern Era)
```
Contemporary Leaders
├─ Tech Innovator
│  └─ Role: Developer | Bonus: +50% Tech trees, +Resource efficiency
│  └─ Pet: Digital Dragon
│
├─ Cultural Ambassador
│  └─ Role: Diplomat | Bonus: +40% Cultural spread, +Alliance rep
│  └─ Pet: Cultural Phoenix
│
└─ National Hero
   └─ Role: Leader | Bonus: +60% All bonuses, +Unity
   └─ Pet: National Guardian
```

### Hero Rarity & Level System

```
HERO RARITY TIERS
═════════════════════════════════════════════

⭐ Common (Green)
   └─ Drop Rate: 50%
   └─ Max Level: 20
   └─ Example: Basic Warrior (2x level 1 stats)

⭐⭐ Rare (Blue)
   └─ Drop Rate: 30%
   └─ Max Level: 30
   └─ Example: Legendary General (3x level 1 stats)

⭐⭐⭐ Epic (Purple)
   └─ Drop Rate: 15%
   └─ Max Level: 40
   └─ Example: Immortal Emperor (4x level 1 stats)

⭐⭐⭐⭐ Legendary (Gold)
   └─ Drop Rate: 4%
   └─ Max Level: 50
   └─ Example: Mythical Hero (5x level 1 stats)

⭐⭐⭐⭐⭐ Mythic (Rainbow)
   └─ Drop Rate: 1%
   └─ Max Level: 60
   └─ Example: Divine Being (6x level 1 stats)
```

### Hero Level Progression Formula

**Level System**: 1 (Weakest) to 5 (Strongest)

```
LEVEL PROGRESSION MULTIPLIER
═════════════════════════════════════════════

Level 1 (Recruit)
└─ Base Stats = 100%
└─ Cost: 100 Gold + 100 Rice
└─ Requirement: Hero unlocked

Level 2 (Veteran)
└─ Stats = 2x Level 1 (200%)
└─ Cost: 200 Gold + 200 Rice + 50 Wood
└─ Requirement: Level 1 Hero

Level 3 (Champion)
└─ Stats = 3x Level 2 (600%)
└─ Cost: 300 Gold + 300 Rice + 150 Wood + 100 Stone
└─ Requirement: Level 2 Hero

Level 4 (Legend)
└─ Stats = 4x Level 3 (2400%)
└─ Cost: 500 Gold + 500 Rice + 300 Wood + 300 Stone + 50 Bazan
└─ Requirement: Level 3 Hero + Era unlock

Level 5 (Immortal - MAX)
└─ Stats = 5x Level 4 (12000%)
└─ Cost: 1000 Gold + 1000 Rice + 500 Wood + 500 Stone + 200 Bazan
└─ Requirement: Level 4 Hero + Complete current era
└─ Bonus: Special title, unique abilities unlock

HERO POWER EXAMPLE:
├─ Level 1 Trần Hưng Đạo: 100 Attack
├─ Level 2 Trần Hưng Đạo: 200 Attack
├─ Level 3 Trần Hưng Đạo: 600 Attack
├─ Level 4 Trần Hưng Đạo: 2400 Attack
└─ Level 5 Trần Hưng Đạo: 12000 Attack (Legendary!)
```

### Pets System

Each hero has an associated **Pet** that provides passive bonuses:

```
PET SYSTEM
═════════════════════════════════════════════

Pet Types by Hero:
├─ Dragon Pets (Strategic bonuses)
│  └─ +10-20% Resource generation
│  └─ +5-15% Construction speed
│
├─ Phoenix Pets (Combat bonuses)
│  └─ +15-25% Attack power
│  └─ +10-20% Defense
│
├─ Tiger Pets (Warrior bonuses)
│  └─ +20-30% Damage output
│  └─ +15-25% Combat experience
│
├─ Crane Pets (Wisdom bonuses)
│  └─ +10-20% Tech research speed
│  └─ +15-25% Passive income
│
└─ Spirit Pets (Leadership bonuses)
   └─ +20-30% Alliance bonuses
   └─ +10-20% Population happiness

Pet Enhancement:
- Same leveling system as heroes
- Leveling pets also levels heroes
- Pets provide additional percentage bonuses
- Max pet level = Hero level

Example: Trần Hưng Đạo + War Phoenix
- Hero Level 5: 12000 Attack
- Phoenix Pet Level 5: +25% Attack = +3000
- Total Combat Power: 15000 Attack
```

---

## 📖 EDUCATIONAL SYSTEM - HISTORICAL STORIES & QUIZ

### Daily Story Unlock & Rewards

```
DAILY STORY PROGRESSION
═════════════════════════════════════════════

System: Each day, unlock 1 new historical story

Day 1: "Hùng Vương Lập Nước" (Hung Vuong Founds Nation)
├─ Story Length: 5-10 min read
├─ Characters: Hung Vuong I, Hung Vuong II
├─ Topics: Ancient Vietnam, mythology, nation founding
├─ Unlock Requirement: Tutorial complete
├─ Reward Package: 
│  ├─ Base: 100 Gold + 100 Rice + 50 Wood
│  └─ Quiz Bonus (if all 3 correct): ×5 multiplier = 500 Gold + 500 Rice + 250 Wood

Day 2: "Thăng Long Thích Đặt" (Ly Thai To Founds Thang Long)
├─ Story Topics: Dynasty establishment, capital founding, culture
├─ Quiz Reward: ×5 multiplier on daily rewards
├─ Unlock Requirement: Day 1 complete

Day 3: "Trần Hưng Đạo Chống Quân Mông" (Tran Hung Dao vs Mongols)
├─ Story Topics: Famous battles, military strategy, heroism
├─ Educational Focus: Vietnamese resistance history
├─ Quiz Reward: ×5 multiplier + Special badge

... Continue for 63 days (one per province) + seasonal events

Total Stories: 
- 63 daily stories (provinces)
- 12 monthly stories (special events)
- 4 seasonal stories (major holidays)
- Total: 79 stories in first year
```

### Quiz System - 3 Questions Per Story

```
QUIZ MECHANICS
═════════════════════════════════════════════

Format: 3 multiple-choice questions after reading story

Question Types:
1️⃣ Comprehension Question
   └─ "In the story, what did Hung Vuong do?"
   └─ 4 options, 1 correct
   └─ Reward: 1 point if correct

2️⃣ Historical Context Question
   └─ "What time period was this?"
   └─ 4 options, 1 correct
   └─ Reward: 1 point if correct

3️⃣ Application Question
   └─ "How did this event affect later Vietnam?"
   └─ 4 options, 1 correct
   └─ Reward: 1 point if correct

Scoring:
├─ 0 correct (0/3): ×1 reward (base only)
├─ 1 correct (1/3): ×2 reward
├─ 2 correct (2/3): ×3 reward
└─ 3 correct (3/3): ×5 reward (PERFECT QUIZ BONUS!)

Example Quiz - "Hùng Vương Lập Nước":

Question 1: What is the name of the first Hung Vuong?
A) Hung Vuong I (CORRECT) ✓
B) Hung Vuong II
C) Ly Thai To
D) Tran Hung Dao
Reward if correct: 50 Gold

Question 2: When was the nation founded?
A) 1000 AD
B) 2879 BCE (CORRECT) ✓
C) 1887 AD
D) 1954 AD
Reward if correct: 50 Gold

Question 3: What is Hung Vuong also known as?
A) Dragon King (CORRECT) ✓
B) Tiger Emperor
C) Phoenix Leader
D) Stone Guardian
Reward if correct: 50 Gold

Perfect Score (3/3) Bonus:
├─ Base Reward: 150 Gold + 150 Rice
├─ Perfect Bonus: ×5 multiplier
└─ Total: 750 Gold + 750 Rice + Educational Badge
```

### Story Content Categories

```
STORY CATEGORIES BY EDUCATIONAL VALUE
═════════════════════════════════════════════

📚 HISTORY STORIES (20 stories)
├─ Nation founding and dynasties
├─ Famous battles and conflicts
├─ Important emperors and leaders
├─ Key historical events
└─ Example: "Tây Sơn Chiến Tranh" (Tay Son Wars)

🗺️ GEOGRAPHY STORIES (15 stories)
├─ Natural features and landscapes
├─ Regional characteristics
├─ Mountain ranges and rivers
├─ Climate and ecosystems
└─ Example: "Mekong Delta - Cái Nôi Của Việt Nam" (Mekong - Cradle of Vietnam)

🎨 CULTURE STORIES (15 stories)
├─ Traditional arts and crafts
├─ Festivals and celebrations
├─ Religious beliefs and practices
├─ Daily life and traditions
└─ Example: "Tết Nguyên Đán - Tâm Linh Của Tổ Tiên" (Tet - Ancestral Spirit)

💎 NATURAL RESOURCES STORIES (8 stories)
├─ Mineral wealth (gold, coal, bauxite)
├─ Agricultural products (rice, coffee, rubber)
├─ Forest and marine resources
├─ Sustainable development
└─ Example: "Cơm Việt - Cây Lương Thực Vàng" (Vietnamese Rice - Golden Grain)

🏛️ CIVILIZATION STORIES (5 stories)
├─ Architectural achievements
├─ Scientific innovations
├─ Philosophical contributions
├─ Cultural exports
└─ Example: "Thăng Long Thành Phố Triệu Đô" (Thousand Year Capital)
```

### Rewards Structure

```
DAILY STORY REWARDS PROGRESSION
═════════════════════════════════════════════

Day 1 Story Reward: (Base)
├─ 100 Gold
├─ 100 Rice
├─ 50 Wood
└─ Quiz ×5 = 500G + 500R + 250W (if perfect)

Day 7 Milestone (1 Week):
├─ Base: Same as above
├─ Bonus: +50% extra from all sources
└─ Achievement: "Story Reader Badge"

Day 30 Milestone (1 Month):
├─ Base: Same as above (increased rates)
├─ Bonus: +100% extra from all sources
└─ Cumulative reward: Special cosmetic item

Day 63 Milestone (Complete All Provinces):
├─ Mega Reward: 10,000 Gold + 10,000 Rice
├─ Bonus: Unlock "National Hero" title
├─ Special: +20% to all resources permanently
└─ Achievement: "Master of Vietnam History"

Total Year 1 Educational Rewards:
- 365 stories read (1 per day)
- If all perfect quizzes (3/3): +1,825,000 Gold equivalent
- Cosmetics, badges, titles unlocked
- Deep historical knowledge gained
```

---

## 🎮 GAMEPLAY LOOP - EDUCATION + MONETIZATION

### Daily Engagement Loop with Learning

```
DAILY KATAGAME LOOP (Educational Focus)
═════════════════════════════════════════════

🌅 MORNING (Login & Story Phase - 15 min)
├─ Login → Collect resources (auto-harvested overnight)
├─ Read today's historical story (5-10 min read)
├─ Complete 3-question quiz on story
├─ Get base rewards + quiz bonus (up to ×5)
├─ Unlock today's historical knowledge
└─ Daily streak counter

🌤️ MID-DAY (Development Phase - 20 min)
├─ Upgrade Farmer level in chosen province
├─ Upgrade Resource production in province
├─ Upgrade Development infrastructure
├─ Check hidden milestone progress
├─ Craft items using resources
└─ Plan next province expansion

🌆 EVENING (Social & Competitive Phase - 15 min)
├─ Join or form alliance
├─ Help alliance members grow
├─ Participate in weekly story-themed events
├─ Compete for leaderboard position
├─ Share historical knowledge with friends
└─ Unlock cooperative bonuses

🌙 NIGHT (Planning Phase - 5 min)
├─ Set production queues
├─ Plan tomorrow's story reading
├─ Queue building/upgrade tasks
├─ Resources collect overnight
└─ Optional: Purchase premium pass for ×1.5x rewards

═════════════════════════════════════════════
TOTAL ENGAGEMENT: 45-60 min per day (Optional)
EDUCATIONAL VALUE: +1 historical story/day
SUSTAINABLE MODEL: Learning = rewards
```

---

## 💰 MONETIZATION WITH EDUCATIONAL FOCUS

### Premium Pass - Learning Enhancement

```
PREMIUM PASS TIERS
═════════════════════════════════════════════

🥉 BRONZE PASS - 29,900 VND/month
├─ +20% resource generation
├─ +50% story reward bonus
├─ 1 free story re-read per day
└─ Basic cosmetics

🥈 SILVER PASS - 59,900 VND/month
├─ +30% resource generation
├─ +75% story reward bonus
├─ 2 free story re-reads per day
├─ Skip 1 story quiz per day
└─ Advanced cosmetics

🥇 GOLD PASS - 99,900 VND/month
├─ +50% resource generation
├─ +100% story reward bonus (×2)
├─ Unlimited story re-reads
├─ Skip all quizzes if needed
├─ Story research mode (deep learning)
└─ Exclusive cosmetics

VALUE PROPOSITION:
- Players learn about Vietnam at own pace
- Premium = better rewards for learning
- No P2W mechanics, just accelerated learning
- Educational content is core feature
```

---

## 📊 SUCCESS METRICS - EDUCATION FOCUSED

```
MVP1 SUCCESS CRITERIA (Educational Edition)
═════════════════════════════════════════════

Learning Metrics:
├─ 40%+ of players read daily story
├─ 60%+ quiz completion rate
├─ 3+ correct answers average (learning retention)
├─ 10+ hours avg story content per player/month

Engagement Metrics:
├─ 50-100K DAU (daily active users)
├─ 40%+ D7 retention (people return to learn)
├─ 60%+ story read rate (educational focus)
├─ 30+ min avg session (learning content)

Monetization Metrics:
├─ 50-100K VND/day revenue
├─ 5-8% conversion to Premium Pass
├─ 15-20K ARPU (story enhancers buy passes)
└─ LTV:CAC = 3:1 (sustainable)

Social Impact Metrics:
├─ Cultural knowledge spread: +20% baseline
├─ National pride increase: Measured via surveys
├─ School partnership inquiries
├─ Media coverage of educational game
```

---

## 🚀 IMPLEMENTATION ROADMAP

### MVP1 Phase (Nov-Dec 2025)

**Must-Have Features**:
- ✅ 63 provinces visible, only Hanoi unlocked
- ✅ 5 resource system (Gold, Rice, Wood, Stone, Bazan)
- ✅ 3 upgrade tracks per province
- ✅ 5 heroes (Hung Vuong eras)
- ✅ 5 pets (each hero's companion)
- ✅ 30 daily stories (first month)
- ✅ 3-question quiz system
- ✅ ×5 bonus for perfect quizzes
- ✅ Premium Pass with learning bonuses

**Nice-to-Have**:
- Historical database (expandable)
- Story categories and filtering
- Knowledge tree visualization
- Learning achievements

### MVP2-5 Progression

**MVP2** (Jan-Feb 2026):
- +50 more stories (60 total)
- Mobile-first story reader UX
- Seasonal story events
- Research tree mechanics

**MVP3** (Mar-Apr 2026):
- 63 provinces all partially unlocked
- 63 unique stories per province per era
- Community learning guilds
- Leaderboard for quiz scores

**MVP4** (May-Jul 2026):
- Payment system for subscriptions
- VIP learning packages
- Advanced educational analytics
- School integration program

**MVP5** (Aug 2026+):
- International stories (6+ languages)
- Regional customization
- Esports knowledge competitions
- Academic partnerships

---

## 📁 FILE LOCATION

All files saved in: `/chikiet/kataoffical/katagame/`

Related documents:
- `MVP1_GAME_FEATURES_SUMMARY.md` (updated)
- `EDUCATIONAL_CONTENT_SYSTEM.md` (new)
- `NEW_FEATURES_DETAILED_DESIGN.md` (this file)

---

## ✅ SUMMARY

This new design transforms KataGame into:

1. **Educational Platform**: Learning Vietnamese history, geography, culture as core gameplay
2. **Resource Strategy**: 5-element system with 63 provinces, era-based unlocking
3. **Character-Driven**: Heroes and pets from each historical period
4. **Knowledge Rewards**: Daily stories + 3-question quizzes with ×5 perfect bonus
5. **Sustainable Monetization**: Learning enhancements, not P2W mechanics

**Result**: A game that teaches, engages, and earns sustainably.

---

**Created**: October 23, 2025  
**Status**: ✅ READY FOR MVP1 IMPLEMENTATION  
**Next**: Update all MVP documents with new features
