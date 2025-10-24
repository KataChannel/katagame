# 🎮 Frontend Real Data Integration Guide - Step by Step

**Goal**: Replace all mock data in frontend components with real MVP1 backend data  
**Status**: Ready to implement  
**Time Estimate**: 2-4 hours for full implementation

---

## 📋 Phase 1: Initial Setup (15 minutes)

### Step 1: Update Environment Configuration
Edit `.env.local` in the `frontend` folder:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:11001/api/v1
NEXT_PUBLIC_DEBUG_API=true
```

### Step 2: Update Game Store Initialization
In `frontend/lib/gameStore.ts`, add function to sync with backend on startup:

```typescript
// Add this after your Zustand store creation
export async function initializeGameStore() {
  const token = localStorage.getItem('authToken');
  if (!token) return; // Wait for authentication
  
  // Set API token
  MVP1ApiClient.setAuthToken(token);
  
  // Load real game data
  const gameData = await loadGameData(true);
  
  // Update store with real data
  if (gameData) {
    // Provinces will be updated in next step
    // Stories, resources, heroes will be used in components
  }
}
```

---

## 📦 Phase 2: Replace Mock Data in Components

### ❌ BEFORE (Mock Data)

```typescript
// Old way - hardcoded mock data
const provinces = [
  { id: 'hanoi', name: 'Hà Nội', resources: { gold: 100, rice: 50 }, ... },
  { id: 'hochiminh', name: 'Hồ Chí Minh', resources: { gold: 150, rice: 75 }, ... }
];

const stories = [
  { id: 1, title: 'Story 1', description: '...', ... },
  { id: 2, title: 'Story 2', description: '...', ... }
];
```

### ✅ AFTER (Real Data)

```typescript
// New way - load from real backend
import { useGameData } from '@/lib/useGameData';
import MVP1ApiClient from '@/lib/mvp1ApiClient';

export function MyComponent() {
  const { stories, provinces, heroes, isLoading, error } = useGameData();
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <div>
      {/* Display real data */}
      {stories?.map(story => <StoryCard key={story.id} story={story} />)}
    </div>
  );
}
```

---

## 🎯 Phase 3: Component-by-Component Integration

### 1️⃣ **ProvinceCard Component** - Replace Mock Provinces

**Current Mock Data Location**: `app/page.tsx` - `initialProvinces` array

**Integration Steps**:

1. Import real data hook:
```typescript
import { useGameData } from '@/lib/useGameData';
```

2. In main game component, replace mock initialization:
```typescript
// OLD
const initialProvinces: Province[] = [
  { id: 'hanoi', name: 'Hà Nội', ... },
  { id: 'hochiminh', name: 'Hồ Chí Minh', ... },
  // ... 10+ hardcoded provinces
];

// NEW
export default function Game() {
  const { provinces: realProvinces } = useGameData();
  const [provinces, setProvinces] = useState(realProvinces || []);
  
  useEffect(() => {
    if (realProvinces) {
      setProvinces(realProvinces);
    }
  }, [realProvinces]);
```

3. ProvinceCard now displays real data:
```typescript
{provinces.map(province => (
  <ProvinceCard 
    key={province.id}
    province={province}
    // These are now real values from backend
  />
))}
```

**Expected Result**: 
- ✅ Provinces displayed with real database values
- ✅ Real resource production rates
- ✅ Real upgrade costs and levels
- ✅ Real development progress

---

### 2️⃣ **Stories/CultureCenter Component** - Replace Mock Stories

**Current Mock Data Location**: `lib/gameStore.ts` or mock data files

**Integration Steps**:

1. Update CultureCenter component:
```typescript
import { useGameData } from '@/lib/useGameData';
import MVP1ApiClient from '@/lib/mvp1ApiClient';

export function CultureCenter() {
  const { stories, isLoading } = useGameData();
  const [selectedStory, setSelectedStory] = useState<any>(null);
  
  const handleStoryClick = async (storyId: number) => {
    // Load quiz for this story
    const quiz = await MVP1ApiClient.getStoryQuiz(storyId);
    setSelectedStory({ ...stories.find(s => s.id === storyId), quiz });
  };
  
  const handleSubmitQuiz = async (answers: any[]) => {
    const result = await MVP1ApiClient.submitQuiz(selectedStory.id, answers);
    
    if (result.success) {
      // Show reward notification
      // Refresh player stats
      const stats = await MVP1ApiClient.getQuizStats();
      updatePlayerStats(stats.data);
    }
  };
  
  return (
    <div>
      {/* Display real stories */}
      {stories?.map(story => (
        <StoryCard 
          key={story.id}
          story={story}
          onClick={() => handleStoryClick(story.id)}
        />
      ))}
    </div>
  );
}
```

**Expected Result**:
- ✅ Real stories from database
- ✅ Real quiz questions
- ✅ Real scoring and stats
- ✅ Real player progress

---

### 3️⃣ **Heroes System** - Replace Mock Heroes

**Current Mock Data Location**: `lib/gameStore.ts` - hero arrays

**Integration Steps**:

1. Update HeroesTab component:
```typescript
import { useGameData } from '@/lib/useGameData';
import MVP1ApiClient from '@/lib/mvp1ApiClient';

export function HeroesTab() {
  const { heroes: allHeroes, playerHeroes: myHeroes, isLoading } = useGameData();
  const [playerResources, setPlayerResources] = useState<any>(null);
  
  useEffect(() => {
    loadResources();
  }, []);
  
  const loadResources = async () => {
    const resources = await MVP1ApiClient.getPlayerResources();
    setPlayerResources(resources.data);
  };
  
  const recruitHero = async (heroType: string) => {
    const result = await MVP1ApiClient.recruitHero(heroType);
    
    if (result.success) {
      // Show success notification
      // Refresh data
      const updated = await MVP1ApiClient.getPlayerHeroes();
      setPlayerHeroes(updated.data);
      loadResources();
    } else {
      // Show error (not enough resources, etc.)
      showError(result.message);
    }
  };
  
  const deployHero = async (heroId: string, provinceId: string) => {
    const result = await MVP1ApiClient.deployHero(heroId, provinceId);
    
    if (result.success) {
      showSuccess('Hero deployed!');
      // Refresh player heroes
      const updated = await MVP1ApiClient.getPlayerHeroes();
      setPlayerHeroes(updated.data);
    }
  };
  
  return (
    <div>
      {/* Available Heroes */}
      <div className="heroes-market">
        {allHeroes?.map(hero => (
          <HeroCard 
            key={hero.id}
            hero={hero}
            onRecruit={() => recruitHero(hero.type)}
          />
        ))}
      </div>
      
      {/* My Heroes */}
      <div className="my-heroes">
        {myHeroes?.map(hero => (
          <MyHeroCard
            key={hero.id}
            hero={hero}
            onDeploy={(provinceId) => deployHero(hero.id, provinceId)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Expected Result**:
- ✅ Real heroes from database
- ✅ Real hero stats and abilities
- ✅ Real recruitment costs checked against inventory
- ✅ Real hero deployment tracking

---

### 4️⃣ **Resources System** - Replace Mock Resources

**Current Mock Data Location**: `lib/gameStore.ts` - resource objects

**Integration Steps**:

1. Update ResourceBar component:
```typescript
import { useGameData } from '@/lib/useGameData';
import MVP1ApiClient from '@/lib/mvp1ApiClient';

export function ResourceBar() {
  const [playerResources, setPlayerResources] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  useEffect(() => {
    loadResources();
    loadLeaderboard();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadResources, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadResources = async () => {
    const result = await MVP1ApiClient.getPlayerResources();
    setPlayerResources(result.data);
  };
  
  const loadLeaderboard = async () => {
    const result = await MVP1ApiClient.getResourceLeaderboard('gold', 10, 0);
    setLeaderboard(result.data);
  };
  
  const harvestResources = async (type: string) => {
    const result = await MVP1ApiClient.harvestResources(type);
    
    if (result.success) {
      showSuccess(`Harvested ${type}!`);
      loadResources(); // Refresh
    } else {
      showError(result.message); // e.g., "Cooldown active"
    }
  };
  
  return (
    <div className="resource-bar">
      {/* Display real resources */}
      <ResourceDisplay 
        gold={playerResources?.gold}
        rice={playerResources?.rice}
        lumber={playerResources?.lumber}
        stone={playerResources?.stone}
        culture={playerResources?.culture}
      />
      
      {/* Harvest buttons with real cooldown */}
      <HarvestButton 
        type="gold"
        lastHarvestTime={playerResources?.lastHarvestTimes?.gold}
        onHarvest={() => harvestResources('gold')}
      />
    </div>
  );
}
```

**Expected Result**:
- ✅ Real resource counts from database
- ✅ Real harvest cooldowns enforced
- ✅ Real leaderboard rankings
- ✅ Real production rates

---

### 5️⃣ **Provinces Upgrades** - Replace Mock Upgrade Logic

**Integration Steps**:

1. Update province upgrade handlers:
```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';

export function ProvinceUpgradePanel({ provinceId }: { provinceId: string }) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const upgradeFarmer = async () => {
    setIsUpgrading(true);
    const result = await MVP1ApiClient.upgradeFarmer(provinceId);
    
    if (result.success) {
      showSuccess('Farmer upgraded!');
      // Refresh province data
      refreshProvinceData();
    } else {
      setError(result.message); // e.g., insufficient resources
    }
    
    setIsUpgrading(false);
  };
  
  const upgradeResource = async () => {
    setIsUpgrading(true);
    const result = await MVP1ApiClient.upgradeResource(provinceId);
    
    if (result.success) {
      showSuccess('Resource production upgraded!');
      refreshProvinceData();
    } else {
      setError(result.message);
    }
    
    setIsUpgrading(false);
  };
  
  const upgradeDevelopment = async () => {
    setIsUpgrading(true);
    const result = await MVP1ApiClient.upgradeDevelopment(provinceId);
    
    if (result.success) {
      showSuccess('Development upgraded!');
      refreshProvinceData();
    } else {
      setError(result.message);
    }
    
    setIsUpgrading(false);
  };
  
  return (
    <div>
      <UpgradeButton 
        name="Farmer"
        onClick={upgradeFarmer}
        disabled={isUpgrading}
        error={error}
      />
      <UpgradeButton 
        name="Resource Production"
        onClick={upgradeResource}
        disabled={isUpgrading}
        error={error}
      />
      <UpgradeButton 
        name="Development"
        onClick={upgradeDevelopment}
        disabled={isUpgrading}
        error={error}
      />
    </div>
  );
}
```

**Expected Result**:
- ✅ Real upgrade costs validated
- ✅ Real upgrade requirements checked
- ✅ Real player resources deducted
- ✅ Real province levels updated

---

### 6️⃣ **Leaderboards** - Replace Mock Leaderboard Data

**Integration Steps**:

1. Create LeaderboardTab component:
```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';

export function LeaderboardTab() {
  const [quizLeaderboard, setQuizLeaderboard] = useState<any[]>([]);
  const [resourceLeaderboard, setResourceLeaderboard] = useState<any[]>([]);
  const [heroLeaderboard, setHeroLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadLeaderboards();
  }, []);
  
  const loadLeaderboards = async () => {
    setIsLoading(true);
    
    // Load all leaderboards in parallel
    const [quiz, resources, heroes] = await Promise.all([
      MVP1ApiClient.getQuizLeaderboard(10, 0),
      MVP1ApiClient.getResourceLeaderboard('gold', 10, 0),
      MVP1ApiClient.getHeroLeaderboard(10, 0),
    ]);
    
    setQuizLeaderboard(quiz.data);
    setResourceLeaderboard(resources.data);
    setHeroLeaderboard(heroes.data);
    setIsLoading(false);
  };
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="leaderboards">
      {/* Quiz Leaders */}
      <section>
        <h2>Quiz Masters</h2>
        <table>
          <tbody>
            {quizLeaderboard.map((player, idx) => (
              <tr key={idx}>
                <td>#{idx + 1}</td>
                <td>{player.playerName}</td>
                <td>{player.score} points</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Resource Leaders */}
      <section>
        <h2>Richest Players</h2>
        <table>
          <tbody>
            {resourceLeaderboard.map((player, idx) => (
              <tr key={idx}>
                <td>#{idx + 1}</td>
                <td>{player.playerName}</td>
                <td>💰 {player.totalResources}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Hero Leaders */}
      <section>
        <h2>Hero Masters</h2>
        <table>
          <tbody>
            {heroLeaderboard.map((player, idx) => (
              <tr key={idx}>
                <td>#{idx + 1}</td>
                <td>{player.playerName}</td>
                <td>🦸 {player.totalHeroes} heroes</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
```

**Expected Result**:
- ✅ Real leaderboard rankings from database
- ✅ Real player scores
- ✅ Real competition data

---

## 🔄 Phase 4: Authentication Flow Integration

### Update Login Handler
In your auth component, set API token after successful login:

```typescript
async function handleLogin(username: string, password: string) {
  try {
    // Authenticate with your backend
    const authResult = await authenticateUser(username, password);
    
    if (authResult.success) {
      const token = authResult.token;
      
      // Store token
      localStorage.setItem('authToken', token);
      
      // Set API client token for all future requests
      MVP1ApiClient.setAuthToken(token);
      
      // Initialize game with real data
      const gameData = await loadGameData(true);
      
      // Update app state
      setIsAuthenticated(true);
      setAuthToken(token);
    }
  } catch (error) {
    showError('Login failed');
  }
}
```

---

## ✅ Phase 5: Testing Checklist

### Backend Verification
- [ ] Motia server running: `cd motia && bun dev`
- [ ] API endpoints accessible: `http://localhost:11001/api/v1/stories`
- [ ] Database populated with test data
- [ ] Responses in correct format

### Frontend Verification
- [ ] Auth token stored after login
- [ ] API client initialized with token
- [ ] Stories loading from `/api/v1/stories`
- [ ] Provinces loading from `/api/v1/provinces`
- [ ] Heroes loading from `/api/v1/heroes`
- [ ] Resources loading from `/api/v1/resources/my-resources`
- [ ] Quiz submission working
- [ ] Upgrades working
- [ ] No console errors

### UI Verification
- [ ] Mock data NO LONGER displayed
- [ ] Real data displayed for all features
- [ ] Loading states show while fetching
- [ ] Error messages displayed properly
- [ ] Leaderboards showing real data
- [ ] Player stats updating correctly

---

## 🚀 Quick Implementation Order

### Day 1 - Core (4-6 hours)
1. ✅ Environment setup (15 min)
2. ✅ ProvinceCard → Real provinces (1 hour)
3. ✅ CultureCenter → Real stories (1 hour)
4. ✅ HeroesTab → Real heroes (1 hour)
5. ✅ ResourceBar → Real resources (1 hour)
6. ✅ Test all together (1 hour)

### Day 2 - Features (3-4 hours)
1. ✅ Province upgrades → Real backend (1 hour)
2. ✅ Leaderboards → Real data (1 hour)
3. ✅ All actions (quiz, harvest, etc.) (1 hour)
4. ✅ Polish & error handling (1 hour)

### Day 3 - Polish (2-3 hours)
1. ✅ Performance optimization
2. ✅ Loading states
3. ✅ Error recovery
4. ✅ End-to-end testing

---

## 📚 File Reference

**API Client Methods**:
- Stories: `getStories()`, `getStoryQuiz()`, `markStoryRead()`, `submitQuiz()`
- Resources: `getPlayerResources()`, `harvestResources()`, `getResourceLeaderboard()`
- Heroes: `getHeroes()`, `getPlayerHeroes()`, `recruitHero()`, `deployHero()`
- Provinces: `getPlayerProvinces()`, `upgradeFarmer()`, `upgradeResource()`, `upgradeDevelopment()`
- Leaderboards: `getQuizLeaderboard()`, `getResourceLeaderboard()`, `getHeroLeaderboard()`
- Config: `getGameData()`, `getConfig()`

**React Hooks**:
- `useGameData()` - Automatic loading on component mount
- `loadGameData(requiresAuth)` - Manual loading
- `loadPlayerData()` - Player-specific data only

**Documentation**:
- `MVP1_FRONTEND_INTEGRATION.md` - Detailed API documentation
- `INTEGRATION_EXAMPLES.md` - Code examples
- `mvp1ApiClient.ts` - Full client source

---

## 💡 Pro Tips

1. **Start Small**: Integrate ONE component at a time
2. **Test Frequently**: Test after each component change
3. **Handle Errors**: Always show errors to user
4. **Load Data Parallelly**: Use `Promise.all()` for multiple endpoints
5. **Cache Static Data**: Game config doesn't need frequent refresh
6. **Monitor Network**: DevTools Network tab to verify API calls
7. **Check Console**: Watch for errors and warnings
8. **Verify Types**: TypeScript will help catch mismatches

---

## 🎯 Success Criteria

✅ **After Integration**:
- All components display real MVP1 data
- No mock data hardcoded in components
- All API calls working correctly
- All errors handled gracefully
- Leaderboards updating in real-time
- Quiz submissions working
- Resource harvesting working
- Province upgrades working
- Heroes recruiting/deploying working

---

**Now you're ready to replace all mock data with real MVP1 endpoints! 🚀**

Start with ProvinceCard and work through each component systematically.
