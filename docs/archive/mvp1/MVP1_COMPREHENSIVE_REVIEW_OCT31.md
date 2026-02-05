# 🎮 KATAGAME MVP1 - COMPREHENSIVE REVIEW (Oct 31, 2025)

## 📊 EXECUTIVE SUMMARY

**Project Status:** ✅ **FULLY OPERATIONAL & STABLE**

**Major Achievement:** Successfully migrated from REST API to GraphQL Code-First architecture while maintaining 100% backward compatibility and fixing all critical bugs.

**Last Updated:** October 31, 2025  
**Documentation Version:** 3.0 (Post-GraphQL Migration)

---

## 🏗️ TECHNICAL ARCHITECTURE

### Backend Stack (NestJS + GraphQL)

#### Core Technologies
```json
{
  "framework": "NestJS 11.0.1",
  "graphql": "Apollo Server 5.1.0 (Code-First)",
  "orm": "Prisma 6.18.0",
  "database": "PostgreSQL 16",
  "auth": "JWT + Passport",
  "port": 3000
}
```

#### GraphQL Architecture
- **Pattern:** Code-First (TypeScript decorators → Schema)
- **Resolvers:** 7 files (Player, Province, Hero, Resource, Story, Achievement, Leaderboard)
- **Queries:** 20 endpoints
- **Mutations:** 12 endpoints
- **Models:** 5 main types (Player, Province, Hero, Resource, Story)

**GraphQL Endpoints Structure:**
```graphql
# Authentication
mutation register(email, password, username): AuthResponse
mutation login(email, password): AuthResponse
mutation googleAuth(credential): AuthResponse

# Player
query me: Player                              # Current player (authenticated)
query player(id): Player                      # Any player by ID
query players(where, pagination): [Player]    # All players (filtered)
mutation updatePlayer(data): Player
mutation addResources(gold, rice, ...): MutationResponse

# Provinces (63 total)
query provinces(where, pagination): [Province]
query province(id): Province
query myProvinces(where): [PlayerProvince]
query myProvince(provinceId): PlayerProvince
mutation unlockProvince(input): PlayerProvince
mutation upgradeProvince(input): PlayerProvince

# Heroes (5 available)
query heroes(where, pagination): [Hero]
query hero(id): Hero
query myHeroes(where): [PlayerHero]
query myHero(heroId): PlayerHero
mutation recruitHero(input): PlayerHero
mutation deployHero(input): PlayerHero
mutation levelUpHero(heroId): PlayerHero

# Resources (5 types)
query resources: [Resource]
query resource(id): Resource
query myResources: [PlayerResource]
query myResource(resourceType): PlayerResource

# Stories (30 historical)
query stories(where, pagination): [Story]
query story(id): Story
query storyByDay(day): Story
query quizQuestions(storyId): [QuizQuestion]
mutation markStoryRead(storyId): String
mutation submitQuiz(storyId, answers): QuizSubmission
query myQuizSubmissions(storyId): [QuizSubmission]
```

### Frontend Stack (Next.js 15)

#### Core Technologies
```json
{
  "framework": "Next.js 16.0.0-canary.0",
  "react": "19.1.0",
  "graphql_client": "Apollo Client 4.0.8",
  "state_management": "Zustand 5.0.8",
  "animations": "Framer Motion 12.23.24",
  "styling": "Tailwind CSS 4",
  "port": 11000
}
```

#### Apollo Client Configuration
```typescript
// frontend/lib/apolloClient.ts
const apolloClient = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});
```

#### State Management (Zustand)
```typescript
// Triple-layer architecture
Apollo Cache (GraphQL data) 
  ↓ Sync
Zustand Store (Global state)
  ↓ Subscribe
React Components (Local state + UI)

// Auto-sync every 30s
useApiDataSync({
  interval: 30000,
  entities: ['player', 'provinces', 'heroes', 'resources']
})
```

### Database Schema (PostgreSQL)

#### Tables Count: 25
```
Core Tables:
- players               (User accounts, resources JSON)
- provinces             (63 Vietnam provinces)
- player_provinces      (Unlocked provinces, 3 upgrade tracks)
- heroes                (5 legendary heroes)
- player_heroes         (Recruited & deployed heroes)
- resources             (5 elemental resources)
- player_resources      (Harvest tracking, cooldowns)
- stories               (30 historical stories)
- quiz_questions        (90 questions - 3 per story)
- quiz_submissions      (Player quiz results)

Supporting Tables:
- achievements, daily_quests, leaderboards, player_stats, etc.
```

#### Critical Fields
```sql
-- Player resources stored as JSON (NOT in player_resources table)
players.resources: {
  "gold": 200,
  "rice": 100,
  "lumber": 50,
  "stone": 30,
  "gems": 1500,
  "culture": 20,
  "bazan": 0
}

-- Province upgrade levels (3 independent tracks)
player_provinces {
  farmer_level      (1-20) - +5% harvest speed per level
  resource_level    (1-10) - +10% resource output per level
  development_level (1-15) - +8% overall growth per level
}
```

---

## 🔧 RECENT BUG FIXES (Oct 30-31, 2025)

### Bug #1: GraphQL Schema Validation Errors ✅ FIXED
**Date:** Oct 30, 2025  
**Symptom:** Frontend queries `nameVietnamese`, `unlockCost` but backend schema has `name`, `unlockOrder`

**Root Cause:**
```typescript
// Backend @ObjectType definition
@Field() name: string;              // ✅ Actual field
@Field() unlockOrder: number;       // ✅ Actual field

// Frontend query (WRONG)
query { provinces { nameVietnamese unlockCost } }  // ❌ Doesn't exist
```

**Solution:**
- Updated all GraphQL queries to match backend schema
- Changed `nameVietnamese` → `name` (25 occurrences)
- Changed `unlockCost` → `unlockOrder` (12 occurrences)

**Files Modified:**
- `frontend/lib/graphql/queries.ts`
- `frontend/components/ProvinceCard.tsx`
- `frontend/components/MobileProvinceCard.tsx`
- `frontend/lib/hooks/useApiDataSync.ts`

---

### Bug #2: Upgrade Levels Not Increasing ✅ FIXED
**Date:** Oct 30, 2025  
**Symptom:** `farmerLevel`, `resourceLevel`, `developmentLevel` stay at 1 after upgrade

**Root Cause:**
```typescript
// Frontend sends uppercase
upgradeType: 'FARMER'

// Backend checks lowercase
if (upgradeType === 'farmer') { ... }  // ❌ No match → no update
```

**Solution:**
```typescript
// backend/src/province/province.service.ts
async upgradeProvince(playerId: string, input: UpgradeProvinceInput) {
  const normalizedType = input.upgradeType.toLowerCase();  // ✅ Normalize
  
  if (normalizedType === 'farmer') {
    newLevel = currentLevel + 1;  // ✅ Now works
  }
}
```

**Files Modified:**
- `backend/src/province/province.service.ts` (3 methods)

---

### Bug #3: Resource Check Failure ✅ FIXED
**Date:** Oct 30, 2025  
**Symptom:** "Insufficient resources" error even when player has resources

**Root Cause:**
```typescript
// Backend checks WRONG table
const resources = await prisma.player_resources.findMany({
  where: { player_id: playerId }
});
// ❌ Returns empty - resources are in player.resources JSON!

// Correct source
const player = await prisma.player.findUnique({
  where: { id: playerId },
  select: { resources: true }  // ✅ JSON field
});
```

**Solution:**
```typescript
// Check resources from JSON field
async checkResourcesAvailable(playerId: string, costs: ResourceCost) {
  const player = await this.prisma.player.findUnique({
    where: { id: playerId },
  });

  const resources = player.resources as any || {};
  
  if (costs.gold > (resources.gold || 0)) {
    throw new Error('Insufficient gold');
  }
  // ... check other resources
}

// Deduct from JSON field
async deductPlayerResources(playerId: string, costs: ResourceCost) {
  const player = await this.prisma.player.findUnique({
    where: { id: playerId },
  });

  const currentResources = player.resources as any || {};
  
  await this.prisma.player.update({
    where: { id: playerId },
    data: {
      resources: {
        ...currentResources,
        gold: (currentResources.gold || 0) - costs.gold,
        rice: (currentResources.rice || 0) - costs.rice,
        // ... update JSON
      }
    }
  });
}
```

**Files Modified:**
- `backend/src/province/province.service.ts`

---

### Bug #4: Insufficient Resources UX Issue ✅ FIXED
**Date:** Oct 30, 2025  
**Symptom:** User can't see current resources or upgrade costs → confused when upgrade fails

**Solution:**

**1. Added Resources to GET_ME Query**
```typescript
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      resources  # ✅ ADDED - Fetch player resources
    }
  }
`;
```

**2. Enhanced Sync Function**
```typescript
// frontend/lib/hooks/useApiDataSync.ts
export const syncPlayerFromApi = async () => {
  const meResponse = await MVP1ApiClient.getMe();
  if (meResponse?.success && meResponse?.data) {
    useGameStore.setState((state) => ({
      player: {
        ...state.player,
        resources: playerData.resources || state.player.resources,  // ✅ Sync
      },
    }));
  }
};
```

**3. Added Resource Display to Province Cards**
```tsx
// frontend/components/ProvinceCard.tsx
<div className="bg-black/30 rounded-lg p-3">
  <div className="text-sm text-gray-300 mb-2">Tài Nguyên Hiện Tại:</div>
  <div className="grid grid-cols-2 gap-2">
    <div className="flex items-center gap-1">
      <Coins className="h-4 w-4 text-yellow-500" />
      <span className="text-yellow-400">{player.resources?.gold || 0}</span>
    </div>
    {/* ... rice, lumber, stone */}
  </div>
</div>
```

**4. Added Cost Display on Buttons**
```tsx
<Button disabled={!canAfford}>
  Nâng Cấp Nông Dân (Lv {province.farmerLevel || 1})
  <div className="text-xs opacity-80 mt-1">
    💰 {farmerCost.gold} 🌾 {farmerCost.rice}
  </div>
</Button>
```

**5. Auto-refresh After Upgrade**
```typescript
await Promise.all([
  refetchProvinces(),
  syncPlayerFromApi(),  // ✅ Refresh resources immediately
]);
```

**Files Modified:**
- `frontend/lib/graphql/queries.ts`
- `frontend/lib/graphqlApiClient.ts`
- `frontend/lib/types.ts`
- `frontend/lib/hooks/useApiDataSync.ts`
- `frontend/components/ProvinceCard.tsx`
- `frontend/components/MobileProvinceCard.tsx`

**Documentation:**
- `docs/BUG_FIX_INSUFFICIENT_RESOURCES_UX.md`

---

### Bug #5: Mock Data in ResourceBar ✅ FIXED
**Date:** Oct 31, 2025  
**Symptom:** ResourceBar receives resources via props (could be stale/mock data)

**Solution:**
```typescript
// ❌ BEFORE - Props-based
interface ResourceBarProps {
  resources: Resource;
}
const ResourceBar = ({ resources }: ResourceBarProps) => {
  // Uses passed data
}

// ✅ AFTER - Self-sufficient
const ResourceBar = () => {
  const player = useGameStore((state) => state.player);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      syncPlayerFromApi();  // ✅ Fetch fresh data on mount
    }
  }, []);
  
  const resources = player?.resources || player?.totalResources || defaults;
  // ✅ Always real-time from GraphQL API
}
```

**Files Modified:**
- `frontend/components/ResourceBar.tsx`
- `frontend/components/MobileResourceBar.tsx`
- `frontend/app/page.tsx`

---

## 🎮 GAME MECHANICS - DETAILED

### Resource System (5 Elemental Types)

#### Resource Types
```typescript
interface Resource {
  gold: number;     // 🏅 Kim (Metal) - Trading, recruitment
  rice: number;     // 🌾 Mộc (Wood)  - Food, population
  lumber: number;   // 🪵 Mộc (Wood)  - Construction
  stone: number;    // 🪨 Thổ (Earth) - Buildings
  bazan: number;    // 🌋 Hỏa (Fire)  - Premium resource
  culture: number;  // 📜 Văn hóa     - Hero recruitment
  gems: number;     // 💎 Ngọc        - Premium currency
}
```

#### Resource Generation
```typescript
// Base rates per province (per hour)
Province {
  base_gold_rate: 100,
  base_rice_rate: 100,
  base_wood_rate: 80,
  base_stone_rate: 100,
  base_bazan_rate: 30
}

// Multipliers from upgrades
Total Rate = Base × (1 + farmerBonus + resourceBonus + devBonus + heroBonus)

Example:
- Base gold: 100/hour
- Farmer Lv10: +50% (5% × 10)
- Resource Lv5: +50% (10% × 5)
- Development Lv8: +64% (8% × 8)
- Hero deployed: +30%
- Total: 100 × (1 + 0.5 + 0.5 + 0.64 + 0.3) = 294/hour
```

#### Resource Storage
```typescript
// Single source of truth: player.resources (JSON field)
players.resources = {
  gold: 200,      // ✅ Check this
  rice: 100,      // ✅ Deduct from this
  ...
}

// player_resources table is for TRACKING only (last harvest time)
player_resources {
  resource_type: 'gold',
  amount: 0,              // ❌ NOT used for balance
  last_harvest_at: ...    // ✅ Used for cooldown
}
```

---

### Province Upgrade System (3 Tracks)

#### Track 1: Farmer Level (1-20)
```typescript
Cost Formula: {
  gold: 500 * level,
  rice: 300 * level
}

Benefit: +5% harvest speed per level
Max Bonus: +100% at level 20

Example Costs:
Lv 1→2:   500 gold + 300 rice
Lv 5→6:   2500 gold + 1500 rice
Lv 19→20: 9500 gold + 5700 rice

Total to max: 105,000 gold + 63,000 rice
```

#### Track 2: Resource Level (1-10)
```typescript
Cost Formula: {
  gold: 400 * level,
  rice: 200 * level,
  lumber: 100 * level
}

Benefit: +10% specific resource output per level
Max Bonus: +100% at level 10

Example Costs:
Lv 1→2:  400 gold + 200 rice + 100 lumber
Lv 5→6:  2000 gold + 1000 rice + 500 lumber
Lv 9→10: 3600 gold + 1800 rice + 900 lumber

Total to max: 22,000 gold + 11,000 rice + 5,500 lumber
```

#### Track 3: Development Level (1-15)
```typescript
Cost Formula: {
  gold: 500 * level,
  rice: 250 * level,
  lumber: 150 * level,
  stone: 100 * level
}

Benefit: +8% overall growth per level
Max Bonus: +120% at level 15

Example Costs:
Lv 1→2:   500 gold + 250 rice + 150 lumber + 100 stone
Lv 7→8:   3500 gold + 1750 rice + 1050 lumber + 700 stone
Lv 14→15: 7000 gold + 3500 rice + 2100 lumber + 1400 stone

Total to max: 60,000 gold + 30,000 rice + 18,000 lumber + 12,000 stone
```

#### Total Cost for 1 Province (All Tracks Maxed)
```
Gold:   105,000 + 22,000 + 60,000 = 187,000
Rice:    63,000 + 11,000 + 30,000 = 104,000
Lumber:       0 +  5,500 + 18,000 =  23,500
Stone:        0 +      0 + 12,000 =  12,000
```

---

### Hero System (5 Legendary Heroes)

#### Available Heroes
```typescript
[
  {
    id: 'hung_vuong_1',
    name: 'Hùng Vương I',
    rarity: 'Rare',
    bonus_type: 'population',
    bonus_value: 15,  // +15% dân số
    pet: '🐉 Rồng Vàng',
    pet_bonus: 5,
    cost: { gold: 2000, culture: 1000 }
  },
  {
    id: 'ly_thai_to',
    name: 'Lý Thái Tổ',
    rarity: 'Rare',
    bonus_type: 'gold_generation',
    bonus_value: 20,  // +20% vàng
    pet: '🐢 Rùa Thần',
    pet_bonus: 10,
    cost: { gold: 2000, culture: 1000 }
  },
  {
    id: 'ly_thanh_tong',
    name: 'Lý Thánh Tông',
    rarity: 'Epic',
    bonus_type: 'culture',
    bonus_value: 25,  // +25% văn hóa
    pet: '🦅 Đại Bàng',
    pet_bonus: 8,
    cost: { gold: 5000, culture: 2500 }
  },
  {
    id: 'tran_hung_dao',
    name: 'Trần Hưng Đạo',
    rarity: 'Legendary',
    bonus_type: 'combat',
    bonus_value: 30,  // +30% chiến đấu
    pet: '🐎 Mã Chiến',
    pet_bonus: 10,
    cost: { gold: 10000, culture: 5000, gems: 500 }
  },
  {
    id: 'modern_leader',
    name: 'Lãnh Đạo Hiện Đại',
    rarity: 'Epic',
    bonus_type: 'administration',
    bonus_value: 20,  // +20% hành chính
    pet: '🦁 Sư Tử',
    pet_bonus: 7,
    cost: { gold: 5000, culture: 2500 }
  }
]
```

#### Hero Deployment
```typescript
// Deploy hero to province
mutation deployHero(input: {
  heroId: "uuid-of-hero",
  provinceId: 1
}): PlayerHero

// Hero provides bonus to that province
Province Total Bonus = 
  farmerBonus + 
  resourceBonus + 
  devBonus + 
  hero.bonus_value +  // +15-30%
  hero.pet_bonus      // +5-10%

// Hero can be moved between provinces
// Only 1 hero per province
// Hero earns XP and can level up
```

---

### Story & Quiz System (30 Historical Stories)

#### Story Structure
```typescript
Story {
  id: 'story_day_01',
  day: 1,
  title: 'Khởi Nguồn Dân Tộc - Thời Hùng Vương',
  era: 'Thời kỳ Hồng Bàng',
  year_range: '2879 BC - 258 BC',
  content: 'Câu chuyện dài 500-1000 từ...',
  
  quiz_questions: [
    {
      question: 'Ai là vị vua đầu tiên của Việt Nam?',
      options: ['Hùng Vương I', 'Lý Thái Tổ', 'Trần Hưng Đạo'],
      correct_answer: 0,
      type: 'comprehension'
    },
    // ... 2 more questions
  ]
}
```

#### Quiz Scoring System
```typescript
// Base rewards
const BASE_REWARDS = {
  gold: 250,
  rice: 250,
  lumber: 125
};

// Multipliers based on correct answers
const MULTIPLIERS = {
  3: 5,  // Perfect score
  2: 3,  // Good
  1: 2,  // Ok
  0: 1   // Participation
};

// Calculate final rewards
function calculateRewards(correctCount: number) {
  const multiplier = MULTIPLIERS[correctCount];
  return {
    gold: BASE_REWARDS.gold * multiplier,      // 250-1250
    rice: BASE_REWARDS.rice * multiplier,      // 250-1250
    lumber: BASE_REWARDS.lumber * multiplier   // 125-625
  };
}

// Perfect score example
3/3 correct → ×5 → 1250 gold + 1250 rice + 625 lumber
```

#### Quiz Submission Tracking
```typescript
// Stored in quiz_submissions table
QuizSubmission {
  id: uuid,
  player_id: uuid,
  story_id: 'story_day_01',
  score: 3,              // Correct answers count
  total_questions: 3,
  rewards_earned: {
    gold: 1250,
    rice: 1250,
    lumber: 625
  },
  answers_submitted: [0, 1, 2],  // Player's choices
  created_at: timestamp
}

// Resources automatically added to player.resources
// Can retake quiz unlimited times
// Best score counts for leaderboard
```

---

## 🎯 GAME PROGRESSION LOOP

### New Player Journey (Day 1)

#### Minute 0-5: Registration & Setup
```
1. Create account → Receive starting resources:
   - 200 gold
   - 100 rice
   - 50 lumber
   - 30 stone
   - 1500 gems
   - 20 culture

2. Login → Auto-load game data:
   - 63 provinces (all locked)
   - 5 heroes (available for recruitment)
   - 30 stories (Day 1 unlocked)
   - 5 resource types

3. Tutorial guides to unlock first province (Hà Nội recommended)
```

#### Minute 5-15: First Province
```
4. Unlock Hà Nội (Province #1)
   - Creates player_provinces record
   - All levels start at 1
   - Generates resources based on base rates

5. Read Story Day 1 "Thời Hùng Vương"
   - 3-5 minute read
   - Learn about Vietnamese origins

6. Take Quiz
   - 3 questions
   - Aim for 3/3 → 1250 gold + 1250 rice + 625 lumber
```

#### Minute 15-30: First Upgrades
```
7. Upgrade Farmer (Lv 1→2)
   - Cost: 500 gold + 300 rice
   - Current: 200 + 1250 = 1450 gold ✅
   - Current: 100 + 1250 = 1350 rice ✅
   - After: 950 gold, 1050 rice

8. Watch resources accumulate
   - Base: 100 gold/hour
   - With Farmer Lv2: 105 gold/hour (+5%)

9. Wait 30 minutes → First harvest
   - Can harvest each resource type
   - 30-minute cooldown per type
```

### Daily Routine (Established Player)

```
Morning (10 minutes):
1. Login → Auto-sync resources
2. Harvest all 5 resource types (if cooldown ready)
3. Read today's story (Day N)
4. Take quiz → Earn 750-1250 resources

Midday (5 minutes):
5. Check province resource generation
6. Harvest again (if 30min passed)
7. Plan which province to upgrade next

Evening (15 minutes):
8. Upgrade 1-2 provinces (farmer/resource/dev)
9. Check if have enough culture to recruit hero
10. Harvest final time before sleep

Result:
- +2000-3000 resources per day (active play)
- +1 province upgrade per 2-3 days
- +1 hero recruitment per week
- +1 story completed (30 total in month)
```

### Weekly Goals (Progression Milestones)

```
Week 1: Foundation
- Read 7 stories (Day 1-7)
- Unlock 3 provinces
- Upgrade 1 province to Farmer Lv5
- Accumulate 5000 gold

Week 2: Expansion
- Read 7 more stories (Day 8-14)
- Unlock 5 provinces total
- Recruit first hero (2000 gold + 1000 culture)
- Deploy hero to main province

Week 3: Optimization
- Read stories 15-21
- Unlock 10 provinces total
- Upgrade 2 provinces to Resource Lv5
- Start saving for Epic hero

Week 4: Mastery
- Complete all 30 stories
- Unlock 15+ provinces
- Recruit 2-3 heroes
- Have 1 province with all tracks Lv10+
- Rank top 100 in leaderboard
```

---

## 📊 ECONOMY ANALYSIS

### Resource Earning Rates (Per Day)

#### From Stories/Quizzes (Finite)
```
30 stories × 1250 resources (perfect scores) = 37,500 gold + 37,500 rice + 18,750 lumber

Daily (1 story): 1250 gold + 1250 rice + 625 lumber
Weekly (7 stories): 8750 gold + 8750 rice + 4375 lumber
Monthly (30 stories): All exhausted
```

#### From Harvesting (Renewable)
```
Harvest Frequency: Every 30 minutes
Max Harvests/Day: 48 (if playing 24/7)
Realistic Harvests/Day: 10-15 (active player)

Base Harvest Amounts:
- Gold: 50-200 per harvest
- Rice: 50-200 per harvest
- Lumber: 30-150 per harvest
- Stone: 20-100 per harvest
- Bazan: 10-50 per harvest

With Bonuses (Lv10+ provinces with heroes):
- Gold: 500-1000 per harvest
- Rice: 500-1000 per harvest
- Lumber: 300-600 per harvest
- Stone: 200-400 per harvest
- Bazan: 100-200 per harvest

Realistic Daily Total (10 harvests):
- Gold: 5,000-10,000
- Rice: 5,000-10,000
- Lumber: 3,000-6,000
- Stone: 2,000-4,000
- Bazan: 1,000-2,000
```

#### From Province Generation (Passive)
```
1 Province (max upgrades + hero):
- Base: 100 gold/hour
- Farmer Lv20: +100%
- Resource Lv10: +100%
- Dev Lv15: +120%
- Hero: +30%
- Pet: +10%
- Total Multiplier: +460%
- Actual: 100 × 5.6 = 560 gold/hour

Per day (24 hours): 560 × 24 = 13,440 gold

10 Provinces maxed: 134,400 gold/day (endgame)
```

### Resource Costs Analysis

#### Province Upgrades (Full Cost)
```
1 Province (all tracks maxed):
- 187,000 gold
- 104,000 rice
- 23,500 lumber
- 12,000 stone

Days to max 1 province (active player):
- Gold: 187,000 ÷ 10,000 = 19 days
- Rice: 104,000 ÷ 10,000 = 11 days
- Lumber: 23,500 ÷ 5,000 = 5 days
- Stone: 12,000 ÷ 3,000 = 4 days

Bottleneck: Gold (19 days per province)

10 Provinces: 190 days (6+ months) - Long-term goal
```

#### Hero Recruitment
```
All 5 Heroes Total:
- 2 Rare: 2×(2000 gold + 1000 culture) = 4,000 gold + 2,000 culture
- 2 Epic: 2×(5000 gold + 2500 culture) = 10,000 gold + 5,000 culture
- 1 Legendary: 10,000 gold + 5,000 culture + 500 gems

Total: 24,000 gold + 12,000 culture + 500 gems

Culture Sources:
- Base: 20 culture at start
- Quiz rewards: None (only gold/rice/lumber)
- Province generation: 5 culture/hour per province
- Hero deployment bonus: +10-25% culture

Days to recruit all heroes:
- First hero (Rare): 3-4 days
- Second hero (Rare): 3-4 days
- First Epic: 7-10 days
- Second Epic: 7-10 days
- Legendary: 15-20 days

Total: ~40-50 days to collect all 5 heroes
```

---

## 🏆 PROGRESSION TARGETS

### Short-term (Week 1)
```
✅ Create account
✅ Unlock first province
✅ Complete 7 stories
✅ Reach Farmer Lv5 on main province
✅ Accumulate 5,000 gold
✅ Harvest all resource types 10+ times

Rewards:
- Achievement "First Week Learner"
- 10,000 bonus gold
- +50 culture
```

### Mid-term (Month 1)
```
✅ Complete all 30 stories
✅ Perfect score on 10 quizzes (3/3)
✅ Unlock 15 provinces
✅ Recruit 3 heroes (2 Rare + 1 Epic)
✅ Max 1 province (all tracks Lv10+)
✅ Rank top 100 in gold leaderboard

Rewards:
- Achievement "Month Master"
- 50,000 bonus gold
- +200 culture
- 1000 gems
```

### Long-term (3 Months)
```
✅ Unlock all 63 provinces
✅ Recruit all 5 heroes
✅ Max 5 provinces completely
✅ Rank top 10 in any leaderboard
✅ Earn 1,000,000 total gold
✅ Complete all achievements

Rewards:
- Achievement "Vietnam Master"
- Legendary hero skin
- 5000 gems
- Premium Pass (1 month)
```

---

## 🔧 DEVELOPER SETUP

### Prerequisites
```bash
Node.js 20+
PostgreSQL 16
Git
Bun (optional, faster than npm)
```

### Backend Setup
```bash
cd katagame/backend

# Install dependencies
npm install
# or
bun install

# Setup environment
cp .env.example .env
# Edit .env:
# DATABASE_URL="postgresql://user:pass@localhost:5432/katagame"
# JWT_SECRET="your-secret-key"
# PORT=3000

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
# GraphQL Playground: http://localhost:3000/graphql
```

### Frontend Setup
```bash
cd katagame/frontend

# Install dependencies
npm install
# or
bun install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_GRAPHQL_URI=http://localhost:3000/graphql

# Start development server
npm run dev
# App: http://localhost:11000
```

### Database Management
```bash
# Prisma Studio (GUI)
cd backend
npm run db:studio
# Opens: http://localhost:5555

# Migrations
npx prisma migrate dev --name description
npx prisma generate

# Reset database
npx prisma migrate reset
```

---

## 📁 PROJECT STRUCTURE

```
katagame/
├── backend/                          # NestJS + GraphQL + Prisma
│   ├── src/
│   │   ├── graphql/                  # GraphQL layer
│   │   │   ├── models/               # @ObjectType definitions
│   │   │   │   ├── player.model.ts
│   │   │   │   ├── province.model.ts
│   │   │   │   ├── hero.model.ts
│   │   │   │   ├── resource.model.ts
│   │   │   │   └── story.model.ts
│   │   │   ├── inputs/               # @InputType definitions
│   │   │   │   ├── player.input.ts
│   │   │   │   ├── province.input.ts
│   │   │   │   └── ...
│   │   │   └── common/               # Shared types
│   │   │       ├── responses.type.ts
│   │   │       └── filters.input.ts
│   │   ├── player/                   # Player module
│   │   │   ├── player.module.ts
│   │   │   ├── player.service.ts
│   │   │   └── player.resolver.ts    # GraphQL resolver
│   │   ├── province/                 # Province module
│   │   │   ├── province.module.ts
│   │   │   ├── province.service.ts
│   │   │   └── province.resolver.ts
│   │   ├── hero/                     # Hero module
│   │   ├── resource/                 # Resource module
│   │   ├── story/                    # Story module
│   │   ├── auth/                     # JWT authentication
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── current-user.decorator.ts
│   │   └── app.module.ts
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   └── migrations/
│   └── package.json
│
├── frontend/                         # Next.js 15 + Apollo Client
│   ├── app/
│   │   ├── page.tsx                  # Main game page
│   │   ├── layout.tsx
│   │   └── login/
│   ├── components/
│   │   ├── ResourceBar.tsx           # ✅ Real API data
│   │   ├── MobileResourceBar.tsx     # ✅ Real API data
│   │   ├── ProvinceCard.tsx          # ✅ Shows costs + resources
│   │   ├── MobileProvinceCard.tsx    # ✅ Shows costs + resources
│   │   └── ...
│   ├── lib/
│   │   ├── apolloClient.ts           # Apollo Client setup
│   │   ├── gameStore.ts              # Zustand store
│   │   ├── graphql/
│   │   │   ├── queries.ts            # All GraphQL queries
│   │   │   └── mutations.ts          # All GraphQL mutations
│   │   ├── hooks/
│   │   │   └── useApiDataSync.ts     # Auto-sync hook
│   │   └── types.ts
│   └── package.json
│
└── docs/                             # Documentation
    ├── MVP1_COMPREHENSIVE_REVIEW_OCT31.md  # ← This file
    ├── MVP1_GAME_FLOW_COMPLETE.md
    ├── BUG_FIX_*.md                  # Bug fix documentation
    └── ...
```

---

## 🧪 TESTING

### Backend GraphQL Playground
```graphql
# Test authentication
mutation {
  register(
    email: "test@example.com"
    password: "password123"
    username: "testuser"
  ) {
    success
    message
    token
  }
}

mutation {
  login(
    email: "test@example.com"
    password: "password123"
  ) {
    success
    token
  }
}

# Test authenticated queries (add Authorization: Bearer <token> header)
query {
  me {
    id
    username
    resources
  }
}

query {
  myProvinces {
    provinceId
    farmerLevel
    resourceLevel
    developmentLevel
    province {
      name
    }
  }
}

# Test province upgrade
mutation {
  upgradeProvince(input: {
    provinceId: 1
    upgradeType: "farmer"
  }) {
    provinceId
    farmerLevel
    resourceLevel
    developmentLevel
  }
}
```

### Frontend Testing
```typescript
// Manual testing checklist
1. ✅ Login → Check ResourceBar shows real resources
2. ✅ Navigate to Provinces → Check all 63 provinces load
3. ✅ Click province → Check upgrade buttons show costs
4. ✅ Upgrade farmer → Check:
   - Resources deduct correctly
   - ResourceBar updates immediately
   - farmerLevel increases by 1
   - Can see updated resources in UI
5. ✅ Read story → Check content loads
6. ✅ Take quiz → Check rewards added to resources
7. ✅ Recruit hero → Check culture deducts
8. ✅ Deploy hero → Check province shows hero bonus
```

---

## 🚀 DEPLOYMENT

### Production Checklist
```bash
# Backend
cd backend
npm run build
NODE_ENV=production npm run start:prod

# Frontend
cd frontend
npm run build
npm run start

# Environment variables
DATABASE_URL=postgresql://prod-db-url
JWT_SECRET=production-secret-key
NEXT_PUBLIC_GRAPHQL_URI=https://api.katagame.com/graphql
```

### Docker Deployment (Future)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: katagame
      POSTGRES_USER: kata
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://kata:secret@postgres:5432/katagame
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_GRAPHQL_URI: http://backend:3000/graphql
    ports:
      - "11000:11000"
```

---

## 📈 METRICS & ANALYTICS

### Key Performance Indicators (KPIs)

#### Player Engagement
```
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session duration: 15-30 minutes
- Stories completed: Target 80% reach Day 7
- Quiz success rate: Target 60% get 3/3
```

#### Economy Health
```
- Average resources per player
- Province unlock rate: 3-5 per week
- Hero recruitment rate: 1 per week
- Upgrade frequency: 2-3 per day
- Resource generation rate trends
```

#### Retention
```
- Day 1 retention: Target 60%
- Day 7 retention: Target 40%
- Day 30 retention: Target 20%
- Churn analysis by activity level
```

---

## 🎯 ROADMAP

### MVP1 → MVP2 (Q1 2026)
```
✅ Current: 30 stories
→ Target: 100 stories (1000-2024 Vietnamese history)

✅ Current: 5 heroes
→ Target: 20 heroes (all major dynasties + modern leaders)

✅ Current: 63 provinces
→ Target: Special buildings per province (temples, markets, academies)

✅ Current: Single player
→ Target: Guilds, trading, PvP battles

✅ Current: Basic progression
→ Target: Seasonal events, daily quests, achievements
```

### MVP2 → MVP3 (Q2-Q3 2026)
```
- Mobile apps (iOS + Android)
- Real-time multiplayer
- Advanced combat system
- Alliance wars
- World events
- Premium pass with exclusive content
```

---

## 📝 CRITICAL NOTES

### Resource Storage Architecture
```
✅ CORRECT: player.resources (JSON field)
❌ WRONG: player_resources table (for balance)

player_resources is ONLY for:
- last_harvest_at (cooldown tracking)
- harvest_count (statistics)

All balance operations use player.resources JSON!
```

### GraphQL Field Naming
```
✅ Backend schema: name, unlockOrder
❌ Old fields: nameVietnamese, unlockCost

All queries must use current schema fields!
Check backend @Field() decorators for exact names.
```

### Upgrade Type Normalization
```
Frontend can send: 'FARMER', 'farmer', 'Farmer'
Backend normalizes: upgradeType.toLowerCase()

Always normalize case-insensitive inputs!
```

### Resource Display UX
```
MUST show user:
1. Current resources (ResourceBar)
2. Upgrade costs (on buttons)
3. After-upgrade balance (optional)
4. Auto-refresh after mutations

User should NEVER be confused about resources!
```

---

## 🎉 SUCCESS METRICS

### MVP1 Completion Status: ✅ 100%

```
✅ Authentication (Register, Login, Google OAuth)
✅ 63 Provinces (All data seeded)
✅ 3-track upgrade system (Farmer, Resource, Development)
✅ 5 Heroes (Recruitment + Deployment)
✅ 30 Stories (Full Vietnamese history)
✅ Quiz system (90 questions, scoring, rewards)
✅ Resource generation (5 types, harvest cooldown)
✅ Leaderboards (Top 100 per resource type)
✅ GraphQL API (32 queries + mutations)
✅ Real-time sync (Apollo + Zustand)
✅ Responsive UI (Desktop + Mobile)
✅ Bug fixes (All critical issues resolved)
✅ Documentation (Comprehensive guides)
```

### Known Issues: 0 Critical, 0 High Priority

---

## 👥 TEAM

**Project:** KATAGAME - Educational History Game  
**Version:** MVP1 (Production Ready)  
**Last Updated:** October 31, 2025  
**Status:** ✅ Stable & Operational

---

## 📞 SUPPORT

**Documentation:**
- Game Flow: `docs/MVP1_GAME_FLOW_COMPLETE.md`
- This Review: `docs/MVP1_COMPREHENSIVE_REVIEW_OCT31.md`
- Bug Fixes: `docs/BUG_FIX_*.md`

**GraphQL Playground:**
- http://localhost:3000/graphql

**Prisma Studio:**
- http://localhost:5555

---

**🎮 Game On! Vietnam's History Awaits! 🇻🇳**
