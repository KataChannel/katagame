# 🔄 Frontend Integration Status - MVP1 Real API

**Date**: October 29, 2025  
**Status**: 🟡 Partially Integrated

---

## ✅ Completed Updates

### 1. MVP1ApiClient Extended
**File**: `/frontend/lib/mvp1ApiClient.ts`

**New Methods Added**:
```typescript
// Pets
static async getPets()

// Achievements  
static async getAchievements()

// Battles
static async getBattles()
static async startBattle(opponentId, battleType)

// Guilds
static async getMyGuild()
static async createGuild(name, description)
static async joinGuild(guildId)
static async leaveGuild()
```

**Total Methods**: 33 methods (was 25)

### 2. useGameData Hook Enhanced
**File**: `/frontend/lib/useGameData.ts`

**New State Fields**:
```typescript
interface GameDataState {
  // ... existing fields
  playerPets: any[]           // ✅ NEW
  playerAchievements: any[]   // ✅ NEW
  playerBattles: any[]        // ✅ NEW
  playerGuild: any            // ✅ NEW
}
```

**Auto-loaded Data**:
- ✅ Pets from `/api/v1/pets/my-pets`
- ✅ Achievements from `/api/v1/achievements/my-achievements`
- ✅ Battles from `/api/v1/battles/my-battles`
- ✅ Guild from `/api/v1/guilds/my-guild`

---

## 🔴 Integration Gaps

### Problem: Components Use Local State Instead of API

**Current Architecture**:
```
Components → useGameStore (Zustand) → Local Mock Data ❌
```

**Target Architecture**:
```
Components → useGameData/useMVP1Api → Real Backend API ✅
```

### Affected Components

#### 1. **PetsTab.tsx**
- **Current**: Uses `useGameStore()` + `allPets` from `@/lib/petsData`
- **Should Use**: `useGameData().playerPets` from real API
- **Data Source**: `/api/v1/pets/my-pets`
- **Priority**: 🔴 HIGH

#### 2. **Achievements.tsx**
- **Current**: Uses `useGameStore()` + local achievements array
- **Should Use**: `useGameData().playerAchievements` from real API
- **Data Source**: `/api/v1/achievements/my-achievements`
- **Priority**: 🔴 HIGH

#### 3. **CombatTab.tsx**
- **Current**: Uses `useGameStore()` + simulated battles
- **Should Use**: `useGameData().playerBattles` + `MVP1ApiClient.startBattle()`
- **Data Source**: `/api/v1/battles/my-battles`
- **Priority**: 🟡 MEDIUM

#### 4. **GuildTab.tsx**
- **Current**: Uses `useGameStore()` + mock guild data
- **Should Use**: `useGameData().playerGuild` + `MVP1ApiClient` guild methods
- **Data Source**: `/api/v1/guilds/my-guild`
- **Priority**: 🟡 MEDIUM

---

## 📊 API Coverage Analysis

### Fully Integrated ✅
| Feature | Backend API | Frontend Client | Component | Status |
|---------|-------------|-----------------|-----------|--------|
| Stories | ✅ 4 endpoints | ✅ 4 methods | ✅ CultureCenter | ✅ Complete |
| Quizzes | ✅ 3 endpoints | ✅ 3 methods | ✅ CultureCenter | ✅ Complete |
| Resources | ✅ 4 endpoints | ✅ 4 methods | ✅ ResourceBar | ✅ Complete |
| Heroes | ✅ 5 endpoints | ✅ 5 methods | ✅ HeroesTab | ✅ Complete |
| Provinces | ✅ 6 endpoints | ✅ 6 methods | ✅ ProvincesTab | ✅ Complete |
| Config | ✅ 2 endpoints | ✅ 2 methods | ✅ Global | ✅ Complete |

### Partially Integrated 🟡
| Feature | Backend API | Frontend Client | Component | Status |
|---------|-------------|-----------------|-----------|--------|
| Pets | ✅ 1 endpoint | ✅ 1 method | ❌ Uses local | 🟡 Need update |
| Achievements | ✅ 1 endpoint | ✅ 1 method | ❌ Uses local | 🟡 Need update |
| Battles | ✅ 1 endpoint | ✅ 2 methods | ❌ Uses local | 🟡 Need update |
| Guilds | ✅ 1 endpoint | ✅ 4 methods | ❌ Uses local | 🟡 Need update |

---

## 🛠️ Required Actions

### Phase 1: Create Integration Hook (HIGH PRIORITY)

**Create**: `/frontend/lib/useMVP1Data.ts`

```typescript
/**
 * Custom hook for MVP1 real-time data
 * Combines useGameData with component-specific needs
 */
export function useMVP1Data() {
  const gameData = useGameData();
  
  return {
    // Existing integrated data
    stories: gameData.stories,
    resources: gameData.playerResources,
    heroes: gameData.playerHeroes,
    provinces: gameData.playerProvinces,
    
    // Newly available data
    pets: gameData.playerPets,
    achievements: gameData.playerAchievements,
    battles: gameData.playerBattles,
    guild: gameData.playerGuild,
    
    // Loading states
    isLoading: gameData.isLoading,
    error: gameData.error,
  };
}
```

### Phase 2: Update Components

#### PetsTab.tsx
```typescript
// OLD
const { pets: gamePets } = useGameStore();
const filteredPets = allPets.filter(...);

// NEW
const { pets, isLoading } = useMVP1Data();
const filteredPets = pets.filter(...);
```

#### Achievements.tsx
```typescript
// OLD
const { player, completeAchievement } = useGameStore();
const achievements = player.achievements;

// NEW
const { achievements, isLoading } = useMVP1Data();
```

#### CombatTab.tsx
```typescript
// OLD
const { player } = useGameStore();
// Simulated battles

// NEW
const { battles, isLoading } = useMVP1Data();
const handleStartBattle = async (opponentId) => {
  await MVP1ApiClient.startBattle(opponentId, 'pvp');
};
```

#### GuildTab.tsx
```typescript
// OLD
const { guild } = useGameStore();
// Mock guild data

// NEW
const { guild, isLoading } = useMVP1Data();
const handleCreateGuild = async (name) => {
  await MVP1ApiClient.createGuild(name);
};
```

---

## 📝 Database Schema Mapping

### Pets Table → Frontend
```sql
-- Database
CREATE TABLE pets (
  id UUID,
  player_id UUID,
  name VARCHAR(100),
  pet_type VARCHAR(50),
  rarity VARCHAR(20),
  level INTEGER,
  experience INTEGER
);
```

```typescript
// Frontend Type Needed
interface Pet {
  id: string;
  playerId: string;
  name: string;
  petType: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level: number;
  experience: number;
  // ... bonus stats from backend
}
```

### Achievements Table → Frontend
```sql
-- Database
CREATE TABLE achievements (
  id UUID,
  name VARCHAR(200),
  category VARCHAR(50),
  rarity VARCHAR(20),
  points INTEGER
);

CREATE TABLE user_achievements (
  player_id UUID,
  achievement_id UUID,
  progress INTEGER,
  unlocked_at TIMESTAMP
);
```

```typescript
// Frontend Type Needed
interface Achievement {
  id: string;
  name: string;
  category: string;
  rarity: string;
  points: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}
```

### Battles Table → Frontend
```sql
-- Database
CREATE TABLE battles (
  id UUID,
  attacker_id UUID,
  defender_id UUID,
  battle_type VARCHAR(20),
  result VARCHAR(20),
  battle_log JSONB,
  created_at TIMESTAMP
);
```

```typescript
// Frontend Type Needed
interface Battle {
  id: string;
  attackerId: string;
  defenderId: string;
  battleType: 'pvp' | 'pve' | 'guild_war' | 'arena';
  result: 'attacker_win' | 'defender_win' | 'draw';
  battleLog: any;
  createdAt: Date;
}
```

### Guilds Table → Frontend
```sql
-- Database
CREATE TABLE guilds (
  id UUID,
  name VARCHAR(100),
  leader_id UUID,
  level INTEGER,
  total_power INTEGER,
  members_count INTEGER,
  treasury JSONB
);
```

```typescript
// Frontend Type Needed
interface Guild {
  id: string;
  name: string;
  leaderId: string;
  level: number;
  totalPower: number;
  membersCount: number;
  treasury: {
    gold: number;
    gems: number;
    guildCoins: number;
  };
}
```

---

## 🎯 Implementation Checklist

### Step 1: Type Definitions
- [ ] Create `/frontend/lib/types/mvp1.types.ts`
- [ ] Define Pet, Achievement, Battle, Guild interfaces
- [ ] Export all types

### Step 2: Integration Hook
- [ ] Create `/frontend/lib/useMVP1Data.ts`
- [ ] Implement data fetching logic
- [ ] Add refresh methods
- [ ] Add loading/error states

### Step 3: Component Updates
- [ ] Update PetsTab.tsx to use real API
- [ ] Update Achievements.tsx to use real API
- [ ] Update CombatTab.tsx to use real API
- [ ] Update GuildTab.tsx to use real API

### Step 4: Testing
- [ ] Test Pets display with real data
- [ ] Test Achievements progress tracking
- [ ] Test Battle history display
- [ ] Test Guild information display
- [ ] Test error handling
- [ ] Test loading states

### Step 5: Data Sync
- [ ] Add auto-refresh for pets
- [ ] Add auto-refresh for achievements
- [ ] Add real-time battle updates
- [ ] Add guild data sync

---

## 🚨 Current Risks

### 1. Data Structure Mismatch
- **Risk**: Backend response format differs from frontend expectations
- **Mitigation**: Add response type validation
- **Priority**: HIGH

### 2. Missing Fields
- **Risk**: Components expect fields not returned by API
- **Mitigation**: Add default values and null checks
- **Priority**: MEDIUM

### 3. Performance
- **Risk**: Too many API calls on mount
- **Mitigation**: Implement caching and debouncing
- **Priority**: LOW

---

## 📈 Progress Tracking

**Current State**: 24/29 endpoints integrated (82.76%)

**Remaining Work**:
- 4 endpoints have client methods but components not updated
- 0 endpoints completely missing

**Estimated Time**:
- Type definitions: 1 hour
- Integration hook: 2 hours
- Component updates: 4 hours
- Testing: 2 hours
- **Total**: ~9 hours

---

## 🎓 Best Practices

### 1. Always Check Loading State
```typescript
const { pets, isLoading, error } = useMVP1Data();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!pets.length) return <EmptyState />;
```

### 2. Handle API Errors Gracefully
```typescript
try {
  await MVP1ApiClient.getPets();
} catch (error) {
  console.error('Failed to load pets:', error);
  // Show user-friendly error
  showNotification('Không thể tải thú cưng', 'error');
}
```

### 3. Cache API Responses
```typescript
// Use SWR or React Query for caching
const { data: pets } = useSWR('/api/v1/pets/my-pets', fetcher);
```

### 4. Optimistic Updates
```typescript
// Update UI immediately, rollback on error
const optimisticPets = [...pets, newPet];
setPets(optimisticPets);
try {
  await MVP1ApiClient.recruitPet(newPet.id);
} catch {
  setPets(pets); // Rollback
}
```

---

## 📚 Related Documentation
- `/docs/65-MVP1_API_COMPARISON.md` - API endpoint comparison
- `/katagame_database_schema.sql` - Database schema
- `/frontend/lib/mvp1ApiClient.ts` - API client implementation
- `/frontend/lib/useGameData.ts` - Data loading hook

---

**Next Action**: Create `useMVP1Data` hook and update PetsTab component first as proof of concept.
