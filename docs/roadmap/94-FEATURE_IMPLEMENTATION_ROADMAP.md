# 🗺️ KATAGAME - FEATURE IMPLEMENTATION ROADMAP
**Tài liệu**: Chi tiết Timeline & Dependencies cho Các Tính Năng Kiếm Tiền  
**Ngày cập nhật**: October 23, 2025  
**Timeline**: Nov 2025 - May 2026+

---

## 📋 OVERVIEW - PHÂN LOẠI THEO PRIORITY

```
Priority Matrix (Revenue Impact vs Implementation Difficulty):

HIGH REVENUE + EASY IMPLEMENT:
├─ 🟢 Daily deals system
├─ 🟢 Premium Pass (tiers)
├─ 🟢 Gem packages
└─ 🟢 Login streak rewards

HIGH REVENUE + HARD IMPLEMENT:
├─ 🟡 Battle Pass (100 tier system)
├─ 🟡 Gacha system (pity mechanics)
├─ 🟡 Guild system
└─ 🟡 Marketplace with trading

MEDIUM REVENUE + EASY IMPLEMENT:
├─ 🟢 Limited-time offers
├─ 🟢 Cosmetics shop
└─ 🟢 Resource packs

MEDIUM REVENUE + HARD IMPLEMENT:
├─ 🟡 Payment gateway integration
├─ 🟡 VIP subscription system
├─ 🟡 Leaderboard cosmetics
└─ 🟡 Event system

LOW REVENUE + HARD IMPLEMENT:
├─ ⚠️ International localization
├─ ⚠️ Advanced analytics
└─ ⚠️ Esports tournament system
```

---

## 🚀 IMPLEMENTATION PHASES

### PHASE 1: MVP 1 FOUNDATION (NOV-DEC 2025) ✅ ACTIVE

**Duration**: 8 weeks  
**Start Date**: Nov 1, 2025  
**End Date**: Dec 31, 2025  
**Goal**: $0 → $100K VND daily revenue  
**Team**: 3-4 developers

#### Week 1-2: Premium Pass System
```
Timeline: Nov 1-15, 2025

Frontend Tasks:
├─ Subscription modal UI
│  ├─ 3 tier display cards
│  ├─ Feature comparison table
│  ├─ CTAs for each tier
│  └─ EST: 40 hours
│
├─ Premium benefits display
│  ├─ +50% XP indicator in quest
│  ├─ +50% resource gain in harvest
│  ├─ Daily gem counter (1000 gems)
│  └─ EST: 30 hours
│
└─ Settings page integration
   ├─ Manage subscription
   ├─ Upgrade/downgrade
   ├─ Cancel subscription
   └─ EST: 20 hours

Backend Tasks:
├─ Premium Pass database schema
│  ├─ users_premium_pass table
│  │  ├─ user_id
│  │  ├─ tier (1-3)
│  │  ├─ started_at
│  │  ├─ expires_at
│  │  └─ auto_renewal boolean
│  └─ EST: 10 hours
│
├─ Premium benefits calculation
│  ├─ XP multiplier logic
│  ├─ Resource multiplier logic
│  ├─ Daily gem distribution
│  └─ EST: 20 hours
│
├─ Subscription management API
│  ├─ POST /api/premium/subscribe (Tier 1-3)
│  ├─ POST /api/premium/upgrade
│  ├─ POST /api/premium/cancel
│  ├─ GET /api/premium/status
│  └─ EST: 25 hours
│
└─ Auto-renewal system
   ├─ Cron job for monthly billing
   ├─ Payment processing mock
   ├─ Renewal notifications
   └─ EST: 15 hours

QA & Testing:
├─ Unit tests for multiplier calculations
├─ Integration tests for subscription lifecycle
├─ Payment flow testing (with mock)
└─ EST: 20 hours

**Total Week 1-2**: ~180 hours (2-3 developers)
**Blockers**: Payment gateway not available (use mock)
**Deliverable**: Premium Pass system fully functional
```

#### Week 3-4: In-App Shop & Cosmetics
```
Timeline: Nov 16-30, 2025

Frontend Tasks:
├─ Shop UI redesign
│  ├─ Product grid (gems, cosmetics)
│  ├─ Product detail modal
│  ├─ Purchase button with loading
│  ├─ Inventory display
│  └─ EST: 50 hours
│
├─ Gem package display
│  ├─ Package cards (100-2000 gems)
│  ├─ Bonus gem visualization
│  ├─ Price comparison
│  └─ EST: 25 hours
│
├─ Cosmetics showcase
│  ├─ Skins preview (3D model if possible)
│  ├─ Pet cosmetics preview
│  ├─ Title customization preview
│  └─ EST: 40 hours
│
└─ Purchase flow
   ├─ Confirm purchase modal
   ├─ Loading state
   ├─ Success notification
   ├─ Error handling
   └─ EST: 20 hours

Backend Tasks:
├─ Shop inventory management
│  ├─ products table
│  ├─ user_purchases table
│  ├─ user_inventory table
│  └─ EST: 15 hours
│
├─ Purchase API
│  ├─ POST /api/shop/purchase
│  ├─ GET /api/shop/products
│  ├─ GET /api/inventory
│  ├─ POST /api/shop/use-cosmetic
│  └─ EST: 30 hours
│
├─ Gem system
│  ├─ user_gems table
│  ├─ Gem balance tracking
│  ├─ Gem spending rules
│  └─ EST: 15 hours
│
└─ Cosmetics application
   ├─ Apply skin to hero
   ├─ Apply pet costume
   ├─ Apply title
   ├─ Track cosmetic stats
   └─ EST: 25 hours

QA & Testing:
├─ Purchase flow testing
├─ Gem balance verification
├─ Cosmetics application verification
└─ EST: 20 hours

**Total Week 3-4**: ~240 hours (2-3 developers)
**Blockers**: None
**Deliverable**: Shop fully operational with gem packages
```

#### Week 5-6: Resource Packs & Daily Deals
```
Timeline: Dec 1-15, 2025

Frontend Tasks:
├─ Resource pack modal
│  ├─ Gold package display
│  ├─ Energy package display
│  ├─ Bundle deals
│  └─ EST: 30 hours
│
├─ Daily deal UI
│  ├─ Deal of the day section
│  ├─ Countdown timer (HH:MM:SS)
│  ├─ "Limited quantity" indicator
│  ├─ Purchase button
│  └─ EST: 25 hours
│
└─ In-quest purchase prompts
   ├─ "Out of energy?" modal
   ├─ "Need more gold?" modal
   ├─ Quick purchase buttons
   └─ EST: 20 hours

Backend Tasks:
├─ Daily deal system
│  ├─ daily_deals table
│  ├─ Deal scheduling
│  ├─ Deal rotation logic
│  ├─ GET /api/deals/today
│  └─ EST: 25 hours
│
├─ Prompted purchases
│  ├─ Purchase trigger detection
│  ├─ Context-aware pricing
│  ├─ "Need resource?" logic
│  └─ EST: 20 hours
│
└─ Analytics for prompts
   ├─ Track shown prompts
   ├─ Track clicked prompts
   ├─ Conversion rate tracking
   └─ EST: 15 hours

**Total Week 5-6**: ~150 hours (2 developers)
**Blockers**: None
**Deliverable**: Daily deals running
```

#### Week 7-8: Analytics & Monitoring
```
Timeline: Dec 16-31, 2025

Backend Tasks:
├─ Revenue tracking system
│  ├─ revenue_transactions table
│  ├─ POST /api/admin/revenue/track
│  ├─ Daily revenue calculation
│  ├─ ARPU calculation (Revenue/DAU)
│  └─ EST: 30 hours
│
├─ User spending analytics
│  ├─ Total spend per user
│  ├─ Spending by cohort
│  ├─ Conversion funnel
│  └─ EST: 25 hours
│
├─ Feature performance
│  ├─ Battle Pass take rate
│  ├─ Premium tier distribution
│  ├─ Top-selling cosmetics
│  ├─ Deal conversion rates
│  └─ EST: 25 hours
│
└─ Admin dashboard endpoints
   ├─ GET /api/admin/revenue/daily
   ├─ GET /api/admin/revenue/monthly
   ├─ GET /api/admin/revenue/by-source
   └─ EST: 20 hours

Frontend (Admin Dashboard):
├─ Revenue chart (daily graph)
├─ ARPU trend line
├─ Conversion funnel visualization
├─ Top products list
└─ EST: 40 hours

**Total Week 7-8**: ~140 hours (2-3 developers)
**Blockers**: None
**Deliverable**: Complete revenue tracking ready
```

**MVP 1 Totals**:
- 📊 **Development**: ~710 hours (8-10 weeks)
- 👥 **Team**: 2-3 developers
- 💰 **Expected Daily Revenue**: 50-100K VND
- 📈 **Monthly Revenue**: 1.5-3M VND
- ✅ **Status**: Ready by Dec 31, 2025

---

### PHASE 2: MVP 2 MOBILE REDESIGN (JAN-FEB 2026) 📋 NEXT

**Duration**: 8 weeks  
**Start Date**: Jan 1, 2026  
**End Date**: Feb 28, 2026  
**Goal**: $100K → $1M VND daily revenue  
**Team**: 4-5 developers

#### Week 1-3: Battle Pass System
```
Timeline: Jan 1-21, 2026

Database Schema:
├─ battle_passes table
│  ├─ id, season, start_date, end_date
│  ├─ free_tier_count (50), premium_tier_count (50)
│  └─ EST: 5 hours
│
├─ user_battle_pass table
│  ├─ user_id, season_id, tier, premium_level
│  ├─ progress_percentage, tiers_skipped
│  ├─ created_at, expires_at
│  └─ EST: 5 hours
│
├─ battle_pass_rewards table
│  ├─ season_id, tier, reward_type, reward_amount
│  ├─ is_free, is_premium, is_premium_plus
│  └─ EST: 5 hours
│
└─ user_battle_pass_progress table
   ├─ user_id, season_id, daily_quest_completion
   ├─ weekly_challenge_completion, total_xp
   └─ EST: 5 hours

Frontend Tasks:
├─ Battle Pass overview screen
│  ├─ Season info (ends in 45 days)
│  ├─ Free vs Premium tier display
│  ├─ Current tier indicator
│  ├─ Progress bar
│  └─ EST: 40 hours
│
├─ Tier reward preview
│  ├─ Scroll through all 100 tiers
│  ├─ Reward item display (cosmetics, gems)
│  ├─ Locked/unlocked state
│  ├─ Free/premium indicator
│  └─ EST: 35 hours
│
├─ Purchase flow
│  ├─ Upgrade to Premium (99K)
│  ├─ Upgrade to Premium+ (199K)
│  ├─ Tier skip pack (49K for 10 tiers)
│  ├─ Confirmation modal
│  └─ EST: 25 hours
│
└─ Progress tracking
   ├─ Daily quest progress
   ├─ Weekly challenge progress
   ├─ Estimated tier at season end
   └─ EST: 20 hours

Backend Tasks:
├─ Battle Pass tier progression
│  ├─ POST /api/battlepass/claim-reward
│  ├─ PUT /api/battlepass/tier-skip
│  ├─ GET /api/battlepass/current
│  ├─ Logic: 1 tier per 1500 XP or manual purchase
│  └─ EST: 40 hours
│
├─ Battle Pass purchase flow
│  ├─ POST /api/battlepass/purchase
│  ├─ Verify season is active
│  ├─ Deduct gems or VND
│  ├─ Award instant tier skips (if Premium+)
│  └─ EST: 25 hours
│
├─ Daily quest system for BP
│  ├─ POST /api/battlepass/daily-quest/complete
│  ├─ Track quest completion
│  ├─ Award XP and BP progress
│  └─ EST: 20 hours
│
├─ Weekly challenge system for BP
│  ├─ POST /api/battlepass/weekly-challenge/complete
│  ├─ Harder than daily quests
│  ├─ +500 XP per challenge
│  └─ EST: 20 hours
│
└─ Reward claiming
   ├─ POST /api/battlepass/claim-reward/{tier}
   ├─ Add cosmetics to inventory
   ├─ Add gems to balance
   ├─ Mark tier as claimed
   └─ EST: 15 hours

QA & Testing:
├─ Tier progression calculations
├─ Reward claiming verification
├─ Purchase flow with multiple tiers
├─ Season end and reset
└─ EST: 30 hours

**Total Weeks 1-3**: ~305 hours (3-4 developers)
**Blockers**: None
**Deliverable**: Battle Pass fully functional
```

#### Week 4-5: Gacha System
```
Timeline: Jan 22 - Feb 4, 2026

Database Schema:
├─ gacha_banners table
│  ├─ id, name, start_date, end_date
│  ├─ banner_type (limited/standard)
│  ├─ featured_hero_id, featured_rate (3%)
│  └─ EST: 5 hours
│
├─ gacha_heroes table
│  ├─ hero_id, rarity (3-5 star), gacha_rate
│  ├─ banner_id (which banner they appear in)
│  └─ EST: 5 hours
│
├─ user_gacha_history table
│  ├─ user_id, gacha_banner_id, result_hero_id
│  ├─ pull_count (1 or 10), created_at
│  └─ EST: 5 hours
│
├─ user_gacha_pity table
│  ├─ user_id, banner_id, pity_count
│  ├─ soft_pity_count, guaranteed_next_5star
│  └─ EST: 5 hours
│
└─ user_heroes_gacha table
   ├─ user_id, hero_id, count, rarity
   ├─ Track duplicates for resonance system
   └─ EST: 5 hours

Gacha Mechanics:
```
Rarity Distribution (5-star banner):
├─ 3-star: 75-80% (common)
├─ 4-star: 15-20% (rare)
├─ 5-star: 3% normal, 5% soft pity (80+), 100% hard pity (100)

Limited Banner (2 weeks):
├─ Featured 5-star: 3% base rate
├─ 50-50 system: First guaranteed is 50/50 (featured or standard)
├─ Won guarantee: Next 5-star guarantees featured
├─ Carries over to next banner

Standard Banner:
├─ All heroes available
├─ 3% 5-star with no guarantees
├─ "For collector" players
```

Frontend Tasks:
├─ Gacha banner display
│  ├─ Featured hero showcase
│  ├─ Rate-up information
│  ├─ Pity counter display
│  ├─ Pull history button
│  └─ EST: 35 hours
│
├─ Gacha pull animation
│  ├─ 1x pull animation (3-5 seconds)
│  ├─ 10x pull animation (10 seconds)
│  ├─ Result reveal animation
│  ├─ Rare pulls sparkle/glow effect
│  └─ EST: 40 hours
│
├─ Result display
│  ├─ Show pulled hero in detail
│  ├─ Show rarity with visual
│  ├─ Add to inventory confirmation
│  └─ EST: 20 hours
│
└─ Pull history UI
   ├─ List all past pulls
   ├─ Filter by banner
   ├─ Show rarity distribution stats
   └─ EST: 25 hours

Backend Tasks:
├─ Gacha pull calculation
│  ├─ POST /api/gacha/pull-1x
│  ├─ POST /api/gacha/pull-10x
│  ├─ Random hero selection based on rates
│  ├─ Pity system logic
│  ├─ EST: 40 hours
│
├─ Pity tracking
│  ├─ Track pulls since last 5-star
│  ├─ Track soft pity threshold
│  ├─ Guaranteed next 5-star logic
│  └─ EST: 25 hours
│
├─ Pull history
│  ├─ POST /api/gacha/record-pull
│  ├─ GET /api/gacha/pull-history
│  ├─ GET /api/gacha/pull-stats
│  └─ EST: 15 hours
│
├─ Limited banner rotation
│  ├─ Cron job to rotate banners
│  ├─ Start limited banner (2 weeks)
│  ├─ Return to standard banner
│  ├─ EST: 15 hours
│
└─ Gacha currency system
   ├─ 1x pull: 49K gems
   ├─ 10x pull: 490K gems (save 10%)
   ├─ Free daily pull: 1 per day
   └─ EST: 15 hours

QA & Testing:
├─ Gacha rate verification (10,000 pulls)
├─ Pity system correctness
├─ 50-50 guarantee system
├─ Pull history accuracy
└─ EST: 25 hours

**Total Weeks 4-5**: ~260 hours (3-4 developers)
**Blockers**: None
**Deliverable**: Gacha system fully functional
```

#### Week 6: Hero Packs
```
Timeline: Feb 5-11, 2026

Frontend Tasks:
├─ Hero pack display
│  ├─ Daily rotating hero packs
│  ├─ Hero preview (3D model if possible)
│  ├─ Gold/gems included in pack
│  ├─ Price display
│  └─ EST: 25 hours
│
└─ Purchase flow
   ├─ Confirm purchase modal
   ├─ "Get hero instantly" messaging
   ├─ Compare vs gacha cost
   └─ EST: 15 hours

Backend Tasks:
├─ Hero pack configuration
│  ├─ daily_hero_packs table
│  ├─ Pack rotation schedule
│  ├─ Hero selection per day
│  ├─ Price per pack
│  └─ EST: 10 hours
│
├─ Hero pack purchase
│  ├─ POST /api/heropacks/purchase
│  ├─ Verify pack is current
│  ├─ Add hero to inventory
│  ├─ Deduct gems/VND
│  └─ EST: 15 hours
│
└─ Analytics
   ├─ Track which packs sell best
   ├─ Compare to gacha conversions
   └─ EST: 10 hours

**Total Week 6**: ~75 hours (2 developers)
**Blockers**: None
**Deliverable**: Hero packs running
```

#### Week 7-8: Premium Features & Login Calendar
```
Timeline: Feb 12-28, 2026

Login Calendar:
├─ Day 7: 1,000 gems
├─ Day 14: 2,500 gems
├─ Day 21: 5,000 gems + exclusive cosmetic
├─ Day 28: 10,000 gems + seasonal title

Frontend Tasks:
├─ Calendar UI
│  ├─ 28-day calendar display
│  ├─ Reward preview for each day
│  ├─ Claimed/available state
│  ├─ Streak count display
│  └─ EST: 30 hours
│
├─ Reward claiming
│  ├─ One-click claim on login
│  ├─ Claim all available
│  ├─ Visual feedback
│  └─ EST: 15 hours
│
└─ Streak notification
   ├─ Break alert if missed day
   ├─ Countdown to next reward
   └─ EST: 10 hours

Backend Tasks:
├─ Login tracking
│  ├─ user_login_history table
│  ├─ Track daily logins
│  ├─ Calculate streak
│  └─ EST: 15 hours
│
├─ Streak system
│  ├─ POST /api/user/login
│  ├─ Calculate current streak
│  ├─ Award streak rewards
│  ├─ Premium Pass: offline login counts
│  └─ EST: 20 hours
│
├─ Calendar rewards
│  ├─ daily_login_rewards table
│  ├─ Reward schedule config
│  ├─ GET /api/user/login-calendar
│  ├─ POST /api/user/claim-streak-reward
│  └─ EST: 20 hours
│
└─ Premium feature expansion
   ├─ Premium Pass benefit tweaks
   ├─ New cosmetics for Premium+
   ├─ VIP perks preview
   └─ EST: 15 hours

**Total Weeks 7-8**: ~125 hours (2-3 developers)
**Blockers**: None
**Deliverable**: Login calendar and premium features
```

**MVP 2 Totals**:
- 📊 **Development**: ~765 hours (8 weeks)
- 👥 **Team**: 4-5 developers
- 💰 **Expected Daily Revenue**: 500K-1M VND
- 📈 **Monthly Revenue**: 15-40M VND
- ✅ **Status**: Ready by Feb 28, 2026

---

### PHASE 3: MVP 3 SOCIAL & SCALING (MAR-APR 2026) 📋 FUTURE

**Duration**: 8 weeks  
**Start Date**: Mar 1, 2026  
**End Date**: Apr 30, 2026  
**Goal**: $1M → $2-3M VND daily revenue  
**Team**: 5-6 developers

Key Features:
- Guild system (monetization)
- Marketplace with trading
- Leaderboard cosmetics
- Guild wars entry fees
- Advanced social features

**Development Estimate**: ~900 hours (8 weeks)
**Expected Daily Revenue**: 1.5-3M VND
**Monthly Revenue**: 45-90M VND

---

### PHASE 4: MVP 4 MONETIZATION (MAY-JUL 2026) 📋 FUTURE

**Duration**: 10 weeks  
**Start Date**: May 1, 2026  
**End Date**: Jul 15, 2026  
**Goal**: $3M → $5M+ VND daily revenue  
**Team**: 6-8 developers

Key Features:
- Payment gateway integration (MoMo, ZaloPay, VNPay)
- VIP subscription tiers
- Advanced gem system
- Limited-time premium events
- Revenue dashboard

**Development Estimate**: ~1,200 hours (10 weeks)
**Expected Daily Revenue**: 3-5M VND
**Monthly Revenue**: 100-450M VND

---

## 🔧 DEPENDENCIES & BLOCKERS

### Critical Dependencies:
```
1. Premium Pass System (MVP1) → Required for:
   ├─ Battle Pass (MVP2)
   ├─ VIP Subscription (MVP4)
   └─ All other premium features

2. Gem System (MVP1) → Required for:
   ├─ Gacha (MVP2)
   ├─ Battle Pass tiers (MVP2)
   ├─ Cosmetics shop (MVP1-5)
   └─ All paid features

3. User Authentication (MVP1) → Required for:
   ├─ Purchase tracking
   ├─ Inventory management
   └─ All monetization

4. Payment Gateway (NOT YET) → Required for:
   ├─ MVP4 launch (May 2026)
   ├─ Real money transactions
   └─ All payment features

5. Analytics System (MVP1) → Required for:
   ├─ Revenue tracking
   ├─ Conversion rate tracking
   └─ Business intelligence
```

### Known Blockers:
```
BLOCKER 1: Payment Gateway Integration
├─ Status: ⏳ Pending
├─ Required: May 1, 2026
├─ Impact: MVP4 launch delay
├─ Solution: Start integration March 1, 2026
└─ Alternative: Mock payments for testing

BLOCKER 2: 3D Model Loading for Cosmetics
├─ Status: ⏳ Pending
├─ Required: MVP2 (Feb 2026)
├─ Impact: Gacha cosmetics display
├─ Solution: 2D portraits as fallback
└─ Timeline: 2-3 weeks

BLOCKER 3: Database Performance at Scale
├─ Status: ⏳ Research phase
├─ Required: MVP3 launch (Mar 2026)
├─ Impact: Marketplace, guild features
├─ Solution: Implement caching, indexes
└─ Timeline: 2 weeks optimization

BLOCKER 4: Mobile Optimization
├─ Status: 🟡 In Progress
├─ Required: MVP2 launch (Jan 2026)
├─ Impact: User experience
├─ Solution: Responsive design review
└─ Timeline: Ongoing
```

---

## 📊 FEATURE-BY-FEATURE IMPLEMENTATION ORDER

```
Rank  Feature                          MVP   Duration  Revenue  Priority
────────────────────────────────────────────────────────────────────────
1.    Premium Pass (3 tiers)           1     2 weeks   $50K     CRITICAL
2.    In-App Shop (gems)               1     2 weeks   $100K    CRITICAL
3.    Daily Deals System               1     2 weeks   $50K     HIGH
4.    Login Streak Calendar            2     2 weeks   $100K    HIGH
5.    Battle Pass (100 tiers)          2     3 weeks   $200K    HIGH
6.    Gacha System (Hero pulls)        2     2 weeks   $250K    HIGH
7.    Resource Packs                   1     2 weeks   $30K     MEDIUM
8.    Guild System (Basic)             3     3 weeks   $150K    MEDIUM
9.    Hero Packs (Daily)               2     1 week    $50K     MEDIUM
10.   Marketplace Trading              3     3 weeks   $100K    MEDIUM
11.   Leaderboard Cosmetics            3     2 weeks   $75K     MEDIUM
12.   Guild Wars Entry Fees            3     2 weeks   $100K    MEDIUM
13.   VIP Subscription (MVP4 version)  4     2 weeks   $200K    MEDIUM
14.   Payment Gateway Integration      4     3 weeks   $0       CRITICAL
15.   Admin Dashboard                  1+4   2 weeks   $0       HIGH
16.   Advanced Analytics               4     2 weeks   $0       MEDIUM
────────────────────────────────────────────────────────────────────────
TOTAL: 37 weeks average development time
```

---

## 🎯 MILESTONE CHECKLIST

### MVP 1 Milestones (Nov-Dec 2025):
- [ ] Week 1-2: Premium Pass ✅ (if done)
- [ ] Week 3-4: In-App Shop ✅ (if done)
- [ ] Week 5-6: Daily Deals ✅ (if done)
- [ ] Week 7-8: Analytics ✅ (if done)
- [ ] **Daily Revenue**: 50-100K VND ✅

### MVP 2 Milestones (Jan-Feb 2026):
- [ ] Week 1-3: Battle Pass
- [ ] Week 4-5: Gacha System
- [ ] Week 6: Hero Packs
- [ ] Week 7-8: Login Calendar
- [ ] **Daily Revenue**: 500K-1M VND

### MVP 3 Milestones (Mar-Apr 2026):
- [ ] Week 1-3: Guild System
- [ ] Week 4-5: Marketplace
- [ ] Week 6-7: Leaderboard Cosmetics
- [ ] Week 8: Integration testing
- [ ] **Daily Revenue**: 1.5-3M VND

### MVP 4 Milestones (May-Jul 2026):
- [ ] Week 1: Payment Gateway Integration
- [ ] Week 2-3: VIP Subscription
- [ ] Week 4-6: Event System
- [ ] Week 7-10: Testing & Optimization
- [ ] **Daily Revenue**: 3-5M VND

---

## 💼 RESOURCE ALLOCATION

### Team Structure:

```
MVP 1 (Nov-Dec):
├─ Frontend Lead: 1
├─ Backend Lead: 1
├─ QA: 1
└─ Total: 3 developers

MVP 2 (Jan-Feb):
├─ Frontend: 2
├─ Backend: 2
├─ QA: 1
└─ Total: 5 developers

MVP 3 (Mar-Apr):
├─ Frontend: 2
├─ Backend: 3
├─ QA/DevOps: 1
└─ Total: 6 developers

MVP 4 (May-Jul):
├─ Frontend: 2
├─ Backend: 4
├─ QA/DevOps/Analytics: 2
└─ Total: 8 developers
```

### Time Distribution:
```
Backend Development: 60% of effort
├─ APIs, database, business logic
└─ Most complex systems (gacha, pity, payment)

Frontend Development: 30% of effort
├─ UI/UX, animations, user flows
└─ Cosmetics display, gacha animations

QA & DevOps: 10% of effort
├─ Testing, deployment, monitoring
└─ Analytics, error tracking
```

---

## ✅ SUCCESS METRICS FOR EACH PHASE

### MVP 1 Success Criteria:
- [ ] 50-100K VND daily revenue by Dec 31
- [ ] 5-10% conversion rate (users → payers)
- [ ] 0.5-1M VND monthly revenue
- [ ] Premium Pass adoption: 5-10% of DAU
- [ ] All systems stable & bug-free

### MVP 2 Success Criteria:
- [ ] 500K-1M VND daily revenue by Feb 28
- [ ] 25-35% conversion rate
- [ ] 15-40M VND monthly revenue
- [ ] Battle Pass take rate: 25-35%
- [ ] Gacha conversion: 15-25%

### MVP 3 Success Criteria:
- [ ] 1.5-3M VND daily revenue by Apr 30
- [ ] 35-45% conversion rate
- [ ] 45-90M VND monthly revenue
- [ ] Guild participation: 70%+
- [ ] Marketplace GMV: 500M-1B VND/month

### MVP 4 Success Criteria:
- [ ] 3-5M VND daily revenue by Jul 31
- [ ] 45-55% conversion rate
- [ ] 100-450M VND monthly revenue
- [ ] Payment systems 99.9% uptime
- [ ] 0% fraud rate

This roadmap is ready for implementation! 🚀
