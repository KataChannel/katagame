# 🎮 KATAGAME - COMPLETE GAME MECHANICS ROADMAP

**Last Updated:** October 31, 2025  
**Status:** MVP1 Complete ✅ | MVP2-5 Planned 📋

---

## 🎯 OVERVIEW - ALL PHASES

| Phase | Timeline | Provinces | Heroes | Stories | Core Mechanic | Revenue Model |
|-------|----------|-----------|--------|---------|---------------|---------------|
| **MVP1** | Oct-Nov 2025 | 63 (all) | 5 | 30 | Province Upgrades | Premium Pass |
| **MVP2** | Dec 2025-Jan 2026 | 63 | 20 | 100 | Battle Pass | Gacha System |
| **MVP3** | Feb-Apr 2026 | 63 | 50 | 200 | Guild Wars | Marketplace |
| **MVP4** | May-Jul 2026 | 63 | 100 | 300 | PvP Combat | Esports Events |
| **MVP5** | Aug 2026+ | 63+ SEA | 200+ | 500+ | International | Global Market |

---

## 📊 MVP1 - FOUNDATION (Oct-Nov 2025) ✅ COMPLETE

### Core Mechanics

#### 1. **Resource System** (5 Types)
```typescript
Resources {
  gold: 200,      // Kim (Metal) - Trading, recruitment
  rice: 100,      // Thủy (Water)  - Food, population  
  lumber: 50,     // Mộc (Wood)  - Construction
  stone: 30,      // Thổ (Earth) - Buildings
  culture: 20,    // Văn hóa     - Hero recruitment
  gems: 1500,     // Premium currency
  bazan: 0        // Hỏa (Fire)  - Rare resource
}

Storage: player.resources (JSON field in database)
Generation: Province base rates + upgrade bonuses
Earning: Quizzes (1250/perfect) + Harvests (500/30min) + Passive (100/hour/province)
```

#### 2. **Province Upgrade System** (3 Tracks)
```typescript
Track 1: Farmer (1-20)
├─ Cost: 500n gold + 300n rice per level
├─ Benefit: +5% harvest speed per level
└─ Total to max: 105,000 gold + 63,000 rice

Track 2: Resource (1-10)  
├─ Cost: 400n gold + 200n rice + 100n lumber
├─ Benefit: +10% resource output per level
└─ Total to max: 22,000 gold + 11,000 rice + 5,500 lumber

Track 3: Development (1-15)
├─ Cost: 500n gold + 250n rice + 150n lumber + 100n stone
├─ Benefit: +8% overall growth per level
└─ Total to max: 60,000 gold + 30,000 rice + 18,000 lumber + 12,000 stone

Province Complete: ~187K gold + 104K rice + 23.5K lumber + 12K stone (~20 days)
All 63 Provinces: ~11.8M gold (1+ year endgame content)
```

#### 3. **Hero System** (5 Legendary)
```typescript
Heroes {
  hung_vuong_1:    { rarity: "Rare", bonus: "+15% population", cost: "2K gold + 1K culture" }
  ly_thai_to:      { rarity: "Rare", bonus: "+20% gold", cost: "2K gold + 1K culture" }
  ly_thanh_tong:   { rarity: "Epic", bonus: "+25% culture", cost: "5K gold + 2.5K culture" }
  tran_hung_dao:   { rarity: "Legendary", bonus: "+30% combat", cost: "10K gold + 5K culture + 500 gems" }
  modern_leader:   { rarity: "Epic", bonus: "+20% admin", cost: "5K gold + 2.5K culture" }
}

Deploy: 1 hero per province → province inherits bonus
Level Up: Hero earns XP from province activities
Total Cost (all 5): 24K gold + 12K culture + 500 gems (~40-50 days)
```

#### 4. **Story & Quiz System** (30 Stories)
```typescript
Stories: 30 days of Vietnamese history (2879 BC - 2024 AD)
Quiz: 3 questions per story (90 total)

Scoring System:
├─ 3/3 correct: ×5 multiplier → 1250 gold + 1250 rice + 625 lumber
├─ 2/3 correct: ×3 multiplier → 750 gold + 750 rice + 375 lumber  
├─ 1/3 correct: ×2 multiplier → 500 gold + 500 rice + 250 lumber
└─ 0/3 correct: ×1 multiplier → 250 gold + 250 rice + 125 lumber

Total Rewards (perfect scores): 37,500 gold + 37,500 rice + 18,750 lumber
Daily Impact: 1 story = 3-5 province upgrades worth of resources
```

#### 5. **Progression Loop**
```
Daily (15 min):
1. Read story → Take quiz → +1250 resources
2. Harvest 5 types → +2500 resources (if 30min cooldown ready)
3. Upgrade 1-2 province levels

Weekly (2 hours):
1. Complete 7 stories → "Week Learner" achievement
2. Accumulate 10K+ gold → Recruit 1 hero
3. Max 1 province track to level 10+

Monthly (30 days):
1. Complete all 30 stories → "Month Master" achievement  
2. Unlock 15+ provinces
3. Recruit 3-5 heroes
4. Rank top 100 in leaderboard
```

### Tech Stack (MVP1)
```
Backend:  NestJS 11 + GraphQL (Apollo 5.1) + Prisma 6.18 + PostgreSQL 16
Frontend: Next.js 16 + React 19 + Apollo Client 4.0.8 + Zustand 5.0.8
API:      32 GraphQL endpoints (20 queries + 12 mutations)
Database: 25 tables, 63 provinces seeded
Auth:     JWT + Google OAuth
```

---

## 📱 MVP2 - MOBILE REDESIGN (Dec 2025 - Jan 2026) 📋

### New Mechanics

#### 1. **Battle Pass** (90-Day Seasons)
```typescript
Free Track: 50 tiers (cosmetics + resources)
Premium: 99K VND → 100 tiers + instant 10-tier skip + exclusive skins
Premium+: 199K VND → 120 tiers + instant 20-tier skip + 5000 gems

Season Structure:
├─ Month 1: Launch hype (high spending)
├─ Month 2: Mid-season events (sustained engagement)
└─ Month 3: Season finale (FOMO purchases)

XP Sources: Quizzes (+100 XP), Upgrades (+50 XP), Harvests (+25 XP), Daily login (+200 XP)
Target: 30-40% conversion rate → 30-50M VND/season
```

#### 2. **Gacha System** (Hero Expansion)
```typescript
Total Heroes: 5 → 20 (add 15 new historical figures)

Rarity Distribution:
├─ Common: 50% (basic dynasty heroes)
├─ Rare: 30% (regional leaders)  
├─ Epic: 15% (legendary generals)
├─ Legendary: 4% (founding fathers)
└─ Mythic: 1% (godlike ancestors)

Pull Costs:
├─ 1x Pull: 100 gems or 49K VND
├─ 10x Pull: 900 gems or 490K VND (+1 guaranteed rare)
└─ Pity System: 100 pulls → guaranteed 5-star

Limited Banners: 2-week rotations with rate-up heroes
Target Revenue: 50-100M VND/month
```

#### 3. **Expanded Stories** (30 → 100)
```typescript
Era Coverage:
├─ Ancient (2879 BC - 258 BC): 20 stories - Hùng Vương, Văn Lang
├─ Dynasties (938 - 1945): 50 stories - Lý, Trần, Lê, Nguyễn  
├─ Modern (1945 - 2024): 30 stories - Independence, reunification, development

Quiz Difficulty: Easy (30%), Medium (50%), Hard (20%)
Rewards Scale: Hard quizzes give 2x rewards
Total Content: 100 stories × 5 min = 8+ hours educational content
```

#### 4. **Mobile-First UI**
```
Bottom Nav: Home | Provinces | Stories | Heroes | Shop
Gestures: Swipe between provinces, pinch-to-zoom map, pull-to-refresh
Optimization: 60 FPS, <100ms response, offline mode, battery saver
Performance: <50MB RAM, <500MB storage
```

---

## 🏰 MVP3 - SOCIAL & SCALING (Feb-Apr 2026) 📋

### New Mechanics

#### 1. **Guild System**
```typescript
Guild Creation: 99K VND (one-time)
Members: Max 50 players
Guild Levels: 1-30 (each level: +5% resources for all members)
Guild Bank: Shared storage (donate/withdraw resources)

Guild Buildings:
├─ Guild Hall: Level 1-10 (unlock features)
├─ Treasury: Level 1-5 (+storage capacity)
├─ Academy: Level 1-5 (+XP bonus)
└─ Barracks: Level 1-10 (+combat power)

Weekly Activities:
├─ Guild Quests: Collaborative objectives (+rewards)
├─ Territory Control: Hold provinces for bonuses
├─ Guild vs Guild Wars: Scheduled battles
└─ Leaderboard Ranking: Top 10 guilds get prestige rewards
```

#### 2. **Guild Wars** (Competitive PvE)
```typescript
War Declaration: 19K VND entry fee per attack
Format: 48-hour declaration → 72-hour battle window
Objectives:
├─ Capture enemy territory (provinces)
├─ Defend own provinces (tower defense style)
├─ Accumulate war points (kills, resources, objectives)
└─ Final score determines winner

Rewards:
├─ Winner: 500K resources + exclusive cosmetics + territory bonuses
├─ Loser: 100K resources (participation)
└─ Top 3 Guilds/Season: Legendary hero + 5M VND cash prize (esports)

War Cost: Average 200K VND/war → Revenue: 50-100M VND/month (500+ active guilds)
```

#### 3. **Marketplace** (Player-to-Player Trading)
```typescript
Tradeable Items:
├─ Resources: Gold, rice, lumber, stone, bazan (10% tax)
├─ Heroes: Duplicate heroes can be sold (20% tax)
├─ Cosmetics: Skins, titles, emotes (15% tax)
└─ Province Deeds: Temporary ownership transfers (25% tax)

Transaction Fees:
├─ Buyer pays: Item price + 5% platform fee
├─ Seller receives: 95% of price (5% to game)
└─ VND or Gems: Both currencies accepted

Monthly Volume Target: 500M VND → 25M VND tax revenue
```

#### 4. **Leaderboards** (Expanded)
```typescript
Categories:
├─ Total Resources Earned (all-time)
├─ Province Count (most territories)
├─ Hero Collection (rarest heroes)
├─ Quiz Master (perfect scores)
├─ Guild Power (guild ranking)
├─ Combat Rating (PvP wins)
└─ Story Progress (completion %)

Rewards (Weekly Reset):
├─ Top 1: 100K gems + Legendary hero
├─ Top 10: 50K gems + Epic hero
├─ Top 100: 10K gems + Rare hero
└─ Top 1000: 1K gems + cosmetic
```

---

## ⚔️ MVP4 - MONETIZATION & PVP (May-Jul 2026) 📋

### New Mechanics

#### 1. **Real PvP Combat**
```typescript
Modes:
├─ 1v1 Ranked: Ladder system (Bronze → Challenger)
├─ 3v3 Team Battle: Guild-based
├─ 5v5 Territory Wars: Province conquest
└─ Battle Royale (50 players): Last province standing

Combat System:
├─ Turn-based strategy (like chess)
├─ Unit formations: Infantry, cavalry, archers, siege
├─ Hero abilities: Ultimate skills, passive bonuses
├─ Terrain advantages: Mountains, rivers, forests
└─ Weather effects: Rain (-archer range), fog (-visibility)

Entry Costs:
├─ Ranked: Free (unlimited)
├─ Tournament: 49K VND (prize pool)
├─ Championship: 199K VND (cash prizes)
└─ Esports League: 999K VND/team (1M+ VND prizes)

Revenue: 200-500M VND/month from tournaments
```

#### 2. **NFT Integration** (Optional - Blockchain)
```typescript
NFT Items:
├─ Unique Heroes: Mint legendary heroes as NFTs
├─ Rare Cosmetics: Limited edition skins (999 supply)
├─ Province Ownership: Own provinces on blockchain
└─ Historical Artifacts: In-game museum items

Trading: OpenSea integration (external marketplace)
Royalties: 10% royalty on secondary sales → passive income
Target: High-value collectors (not core gameplay)
```

#### 3. **Esports System**
```typescript
Tournaments:
├─ Weekly Tournaments: 100 players, 5M VND prize pool
├─ Monthly Championships: 500 players, 50M VND pool
├─ Seasonal Finals: Top 64, 200M VND pool + sponsorships
└─ International: SEA region, 1B VND pool

Sponsorship Revenue:
├─ Brand partnerships: 50-100M VND/season
├─ Streaming rights: YouTube/Facebook Gaming
├─ Merchandise: Team jerseys, collectibles
└─ In-game ads: Non-intrusive banners (5-10M VND/month)

Total Esports Revenue: 300-500M VND/year
```

---

## 🌏 MVP5 - INTERNATIONAL (Aug 2026+) 📋

### New Mechanics

#### 1. **SEA Expansion** (Southeast Asia)
```typescript
New Countries:
├─ Thailand: 77 provinces
├─ Philippines: 81 provinces  
├─ Indonesia: 34 provinces
├─ Malaysia: 13 states
├─ Singapore: 5 districts
└─ Cambodia, Laos, Myanmar: 50+ provinces

Total Map: 63 (VN) + 250+ (SEA) = 313+ provinces
Content: 500+ stories (regional histories)
Heroes: 200+ (all SEA legendary figures)

Localization:
├─ 6 languages: Vietnamese, Thai, Filipino, Indonesian, Malay, English
├─ Cultural adaptation: Local festivals, heroes, events
└─ Regional servers: <50ms latency
```

#### 2. **Cross-Server Wars**
```typescript
Format: Vietnam vs Thailand vs Philippines (3-way battles)
Rewards: National pride + exclusive country skins
Frequency: Monthly events (weekend-long battles)
Viewership: Live-streamed on regional platforms
Revenue: Donations, battle passes, limited skins (100-200M VND/event)
```

#### 3. **Global Marketplace**
```typescript
Currency Exchange:
├─ VND ↔ THB ↔ PHP ↔ IDR (real-time rates)
├─ Platform fee: 3% on all cross-border trades
└─ Monthly volume: 1B+ VND → 30M VND revenue

Cross-Region Trading:
├─ Rare Vietnamese heroes → High demand in Thailand
├─ Thai cosmetics → Popular in Vietnam
└─ Arbitrage opportunities (player-driven economy)
```

---

## 💰 REVENUE PROJECTIONS (All Phases)

| Phase | Monthly Revenue | Key Monetization | Conversion Rate |
|-------|----------------|------------------|-----------------|
| **MVP1** (Nov 2025) | 5-10M VND | Premium Pass (99-999K) | 20-30% |
| **MVP2** (Jan 2026) | 50-100M VND | Battle Pass + Gacha | 30-40% |
| **MVP3** (Apr 2026) | 200-300M VND | Guild Wars + Marketplace | 40-50% |
| **MVP4** (Jul 2026) | 500M-1B VND | Esports + NFTs | 50-60% |
| **MVP5** (2027+) | 2-5B VND | International + Ads | 60-70% |

**Year 1 Total:** ~1.5-2B VND  
**Year 2 Target:** 5-10B VND  
**Year 3 Goal:** 20B+ VND (IPO-ready)

---

## 🎯 PLAYER PROGRESSION (Across All MVPs)

### Beginner (Week 1) - MVP1
```
- Complete tutorial → Unlock Hà Nội
- Read 7 stories → 8750 gold earned
- Upgrade 5 province levels
- Recruit 1 rare hero
- Reach level 5
```

### Intermediate (Month 1) - MVP1/2
```
- Complete 30 stories → 37,500 gold earned
- Unlock 10 provinces
- Recruit 3 heroes (2 rare + 1 epic)
- Max 1 province (all tracks level 10+)
- Join a guild
- Rank top 100 in 1 leaderboard
```

### Advanced (Month 3) - MVP2/3
```
- Complete 100 stories
- Unlock 30 provinces
- Recruit 10+ heroes
- Max 5 provinces completely
- Guild officer role
- Top 10 in guild wars
- Battle Pass tier 100
```

### Expert (Month 6) - MVP3/4
```
- All 63 provinces unlocked
- 20+ heroes collected
- 10+ provinces maxed
- Guild leader
- Top 3 guild globally
- Ranked PvP (Diamond+)
- Own marketplace shop
```

### Master (Year 1+) - MVP4/5
```
- All 313+ provinces (SEA map)
- 50+ heroes (all rarities)
- 30+ maxed provinces
- Top 10 global leaderboard
- Esports competitor
- NFT collector
- International trader
```

---

## 📊 KEY METRICS (Target KPIs)

```
DAU (Daily Active Users):
├─ MVP1: 5K-10K
├─ MVP2: 50K-100K
├─ MVP3: 150K-300K
├─ MVP4: 500K-1M
└─ MVP5: 2M-5M

Retention:
├─ Day 1: 60%
├─ Day 7: 40%
├─ Day 30: 20%
└─ Day 365: 5-10%

Session Length:
├─ Beginner: 15-20 min
├─ Intermediate: 30-45 min
├─ Advanced: 1-2 hours
└─ Expert: 3+ hours (guild wars, PvP)

ARPU (Average Revenue Per User):
├─ MVP1: 50-100K VND/year
├─ MVP2: 200-500K VND/year
├─ MVP3: 500K-1M VND/year
├─ MVP4: 1-2M VND/year
└─ MVP5: 2-5M VND/year (whales: 10M+)
```

---

## 🚀 IMPLEMENTATION PRIORITY

**Phase 1 (Complete):** MVP1 Foundation ✅  
**Phase 2 (Next 2 months):** MVP2 Mobile + Battle Pass 📋  
**Phase 3 (Q1 2026):** MVP3 Guilds + Marketplace 📋  
**Phase 4 (Q2 2026):** MVP4 PvP + Esports 📋  
**Phase 5 (Q3 2026+):** MVP5 International 📋  

**Critical Path:** MVP1 → MVP2 (mobile users) → MVP3 (social/viral) → MVP4 (revenue spike) → MVP5 (scale)

---

**🎮 Status:** MVP1 Production Ready | GraphQL Complete | All Core Systems Operational  
**🏆 Next Milestone:** MVP2 Battle Pass (Dec 2025)  
**💎 Vision:** Leading SEA Educational Gaming Platform by 2027
