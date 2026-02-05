# ✅ Frontend Real Data Migration Checklist

**Goal**: Complete migration from mock data to real MVP1 backend data  
**Status**: Ready to implement  
**Total Tasks**: 28  
**Estimated Time**: 4-6 hours

---

## 📋 Pre-Implementation

### Setup Phase
- [ ] **Backup Current Code**
  - Run: `git checkout -b feature/real-data-migration`
  - Status: Create feature branch for safe development

- [ ] **Verify Backend is Running**
  - Run: `cd motia && bun dev`
  - Check: http://localhost:11001/api/v1/stories should return data
  - Status: All 24 endpoints responding

- [ ] **Verify API Client Exists**
  - File: `frontend/lib/mvp1ApiClient.ts`
  - Check: All 24 endpoint methods present
  - Status: Ready to use

- [ ] **Verify Data Hooks Exist**
  - File: `frontend/lib/useGameData.ts`
  - Check: useGameData, loadGameData, loadPlayerData exported
  - Status: Ready to use

---

## 🔧 Component Migration

### 1. ResourceBar Component
**Current State**: Mock hardcoded resources  
**Target State**: Real resources from MVP1 API

- [ ] **Import Real Data Hooks**
  - [ ] `import MVP1ApiClient from '@/lib/mvp1ApiClient'`
  - [ ] `import { useGameData } from '@/lib/useGameData'`

- [ ] **Load Player Resources**
  - [ ] Add: `const { playerResources, isLoading } = useGameData()`
  - [ ] Or use: `const resources = await MVP1ApiClient.getPlayerResources()`

- [ ] **Display Real Resources**
  - [ ] Replace hardcoded: `gold: 1000` → `playerResources?.gold`
  - [ ] Replace: `rice: 500` → `playerResources?.rice`
  - [ ] Replace: `lumber: 250` → `playerResources?.lumber`
  - [ ] Replace: `stone: 150` → `playerResources?.stone`
  - [ ] Replace: `culture: 100` → `playerResources?.culture`

- [ ] **Implement Harvest Function**
  ```typescript
  const harvestResources = async (type: string) => {
    const result = await MVP1ApiClient.harvestResources(type);
    if (result.success) {
      // Refresh resources
    }
  }
  ```

- [ ] **Add Error Handling**
  - [ ] Show error if harvest on cooldown
  - [ ] Show error if API fails
  - [ ] Show success notification

- [ ] **Test ResourceBar**
  - [ ] Verify real resource counts display
  - [ ] Verify harvest works
  - [ ] Check cooldown handling
  - [ ] Test error states

**Status**: ⏳ Not Started

---

### 2. ProvinceCard Component
**Current State**: Mock hardcoded provinces  
**Target State**: Real provinces from MVP1 API

- [ ] **Import Real Data Hooks**
  - [ ] `import MVP1ApiClient from '@/lib/mvp1ApiClient'`
  - [ ] `import { useGameData } from '@/lib/useGameData'`

- [ ] **Load Player Provinces**
  - [ ] Add: `const { playerProvinces, isLoading } = useGameData()`
  - [ ] Or use: `const provinces = await MVP1ApiClient.getPlayerProvinces()`

- [ ] **Display Real Province Data**
  - [ ] Replace hardcoded Hà Nội → real data from API
  - [ ] Replace hardcoded Hồ Chí Minh → real data from API
  - [ ] Replace hardcoded resource rates → real values
  - [ ] Replace hardcoded development levels → real values

- [ ] **Implement Upgrade Functions**
  ```typescript
  const upgradeFarmer = async (provinceId: string) => {
    const result = await MVP1ApiClient.upgradeFarmer(provinceId);
    if (result.success) {
      // Refresh provinces
    }
  }
  ```

- [ ] **Add Error Handling**
  - [ ] Show error if insufficient resources
  - [ ] Show error if max level reached
  - [ ] Show success notification

- [ ] **Test ProvinceCard**
  - [ ] Verify real province data displays
  - [ ] Verify real resource rates show
  - [ ] Verify upgrade buttons work
  - [ ] Test cost validation
  - [ ] Test error states

**Status**: ⏳ Not Started

---

### 3. CultureCenter Component
**Current State**: Mock hardcoded stories  
**Target State**: Real stories from MVP1 API

- [ ] **Import Real Data Hooks**
  - [ ] `import MVP1ApiClient from '@/lib/mvp1ApiClient'`
  - [ ] `import { useGameData } from '@/lib/useGameData'`

- [ ] **Load Stories**
  - [ ] Add: `const { stories, isLoading } = useGameData()`
  - [ ] Or use: `const stories = await MVP1ApiClient.getStories()`

- [ ] **Display Real Stories**
  - [ ] Replace hardcoded story list → real stories from API
  - [ ] Show story titles from real data
  - [ ] Show story descriptions from real data

- [ ] **Implement Quiz Loading**
  ```typescript
  const loadQuiz = async (storyId: number) => {
    const quiz = await MVP1ApiClient.getStoryQuiz(storyId);
    setSelectedQuiz(quiz.data);
  }
  ```

- [ ] **Implement Quiz Submission**
  ```typescript
  const submitQuiz = async (answers: any[]) => {
    const result = await MVP1ApiClient.submitQuiz(storyId, answers);
    if (result.success) {
      // Show rewards, refresh stats
    }
  }
  ```

- [ ] **Load Quiz Stats**
  ```typescript
  const loadStats = async () => {
    const stats = await MVP1ApiClient.getQuizStats();
    setPlayerStats(stats.data);
  }
  ```

- [ ] **Add Error Handling**
  - [ ] Show error if quiz loading fails
  - [ ] Show error if submission fails
  - [ ] Show success notification

- [ ] **Test CultureCenter**
  - [ ] Verify real stories display
  - [ ] Verify quiz loads correctly
  - [ ] Verify submission works
  - [ ] Verify stats update
  - [ ] Test error states

**Status**: ⏳ Not Started

---

### 4. HeroesTab Component
**Current State**: Mock heroes in store  
**Target State**: Real heroes from MVP1 API

- [ ] **Import Real Data Hooks**
  - [ ] `import MVP1ApiClient from '@/lib/mvp1ApiClient'`
  - [ ] `import { useGameData } from '@/lib/useGameData'`

- [ ] **Load All Heroes and My Heroes**
  - [ ] Add: `const { heroes: allHeroes, playerHeroes, playerResources } = useGameData()`

- [ ] **Display Available Heroes**
  - [ ] Show: All heroes from MVP1 API
  - [ ] Show: Hero types, stats, recruitment costs
  - [ ] Filter: By type or rarity

- [ ] **Display My Heroes**
  - [ ] Show: Player's recruited heroes
  - [ ] Show: Hero levels, experience, deployment status

- [ ] **Implement Hero Recruitment**
  ```typescript
  const recruitHero = async (heroType: string) => {
    const result = await MVP1ApiClient.recruitHero(heroType);
    if (result.success) {
      // Refresh heroes and resources
      const updated = await MVP1ApiClient.getPlayerHeroes();
      setPlayerHeroes(updated.data);
    }
  }
  ```

- [ ] **Implement Hero Deployment**
  ```typescript
  const deployHero = async (heroId: string, provinceId: string) => {
    const result = await MVP1ApiClient.deployHero(heroId, provinceId);
    if (result.success) {
      // Refresh provinces
    }
  }
  ```

- [ ] **Add Error Handling**
  - [ ] Show error if insufficient resources
  - [ ] Show error if hero already deployed
  - [ ] Show error if province not available
  - [ ] Show success notification

- [ ] **Test HeroesTab**
  - [ ] Verify all heroes display
  - [ ] Verify recruitment works
  - [ ] Verify cost validation
  - [ ] Verify deployment works
  - [ ] Test error states

**Status**: ⏳ Not Started

---

### 5. LeaderboardTab Component (NEW)
**Current State**: Mock leaderboards  
**Target State**: Real leaderboards from MVP1 API

- [ ] **Create Component**
  - [ ] File: `frontend/components/LeaderboardTab.tsx`
  - [ ] Import: MVP1ApiClient

- [ ] **Load Quiz Leaderboard**
  ```typescript
  const quizLB = await MVP1ApiClient.getQuizLeaderboard(10, 0);
  ```

- [ ] **Load Resource Leaderboard**
  ```typescript
  const resourceLB = await MVP1ApiClient.getResourceLeaderboard('gold', 10, 0);
  ```

- [ ] **Load Hero Leaderboard**
  ```typescript
  const heroLB = await MVP1ApiClient.getHeroLeaderboard(10, 0);
  ```

- [ ] **Display All Leaderboards**
  - [ ] Quiz Leaders - top 10 by score
  - [ ] Richest Players - top 10 by resources
  - [ ] Hero Masters - top 10 by heroes

- [ ] **Add Refresh Functionality**
  - [ ] Auto-refresh every 1 minute
  - [ ] Manual refresh button

- [ ] **Add Error Handling**
  - [ ] Show error if loading fails
  - [ ] Retry button

- [ ] **Test LeaderboardTab**
  - [ ] Verify all leaderboards display
  - [ ] Verify real data shows
  - [ ] Verify auto-refresh works
  - [ ] Test error states

**Status**: ⏳ Not Started

---

### 6. PlayerStats Component
**Current State**: Mock stats  
**Target State**: Real stats from MVP1 API

- [ ] **Load Quiz Stats**
  ```typescript
  const stats = await MVP1ApiClient.getQuizStats();
  ```

- [ ] **Display Real Stats**
  - [ ] Quiz score from real data
  - [ ] Quiz completions from real data
  - [ ] Best streak from real data

- [ ] **Update on Quiz Submit**
  - [ ] Refresh stats after submission

- [ ] **Test PlayerStats**
  - [ ] Verify real stats display
  - [ ] Verify updates after actions
  - [ ] Test error states

**Status**: ⏳ Not Started

---

### 7. Game Config/Settings
**Current State**: Mock game configuration  
**Target State**: Real config from MVP1 API

- [ ] **Load Game Config**
  ```typescript
  const config = await MVP1ApiClient.getGameData();
  // or
  const config = await MVP1ApiClient.getConfig();
  ```

- [ ] **Use Real Configuration**
  - [ ] Hero recruitment costs from real config
  - [ ] Province upgrade costs from real config
  - [ ] Resource production rates from real config
  - [ ] Quiz point values from real config

- [ ] **Cache Config**
  - [ ] Store in localStorage after first load
  - [ ] Refresh every hour or on app start

- [ ] **Test Config**
  - [ ] Verify real config loads
  - [ ] Verify values used correctly
  - [ ] Test cache behavior

**Status**: ⏳ Not Started

---

### 8. Main Page Component Updates
**Current State**: Uses mock store data  
**Target State**: Uses real API data

- [ ] **Update app/page.tsx**
  - [ ] Import: `useGameData`, `MVP1ApiClient`
  - [ ] Call: `const { ... } = useGameData()`
  - [ ] Pass: Real data to child components
  - [ ] Remove: Hardcoded mock data

- [ ] **Update Authentication Flow**
  - [ ] Set API token after login: `MVP1ApiClient.setAuthToken(token)`
  - [ ] Load real data: `await loadGameData(true)`

- [ ] **Update Component Props**
  - [ ] ProvinceCard: Pass real `playerProvinces`
  - [ ] ResourceBar: Pass real `playerResources`
  - [ ] CultureCenter: Pass real `stories`
  - [ ] HeroesTab: Pass real `allHeroes`, `playerHeroes`

- [ ] **Add Error Handling**
  - [ ] Show loading spinner while fetching
  - [ ] Show error message if load fails
  - [ ] Retry button on error

- [ ] **Test Main Page**
  - [ ] Verify all real data loads
  - [ ] Verify components display correctly
  - [ ] Test loading states
  - [ ] Test error handling

**Status**: ⏳ Not Started

---

## 🧪 Testing & Validation

### Unit Tests
- [ ] ResourceBar: Test resource display
- [ ] ProvinceCard: Test upgrade calculations
- [ ] CultureCenter: Test quiz submission
- [ ] HeroesTab: Test recruitment logic
- [ ] LeaderboardTab: Test sorting

### Integration Tests
- [ ] **Login → Load Data → Display**
  - [ ] User logs in
  - [ ] Real data loads
  - [ ] Components display real data

- [ ] **Perform Action → Update Data**
  - [ ] User harvests resources
  - [ ] Backend updates
  - [ ] Frontend refreshes
  - [ ] New values display

- [ ] **Error Handling**
  - [ ] Network error → Show error message
  - [ ] Validation error → Show error message
  - [ ] Cooldown error → Show cooldown time

### Manual Testing Checklist
- [ ] [ ] **Startup Flow**
  - [ ] [ ] App loads with loading spinner
  - [ ] [ ] Real data loads after 2-3 seconds
  - [ ] [ ] Correct data displays for logged-in player

- [ ] [ ] **Resource Management**
  - [ ] [ ] Real resource counts show
  - [ ] [ ] Harvest works
  - [ ] [ ] Cooldown enforced
  - [ ] [ ] Error messages clear

- [ ] [ ] **Province Management**
  - [ ] [ ] Real provinces show with real levels
  - [ ] [ ] Real production rates display
  - [ ] [ ] Upgrades work with cost validation
  - [ ] [ ] Error messages clear

- [ ] [ ] **Story/Quiz System**
  - [ ] [ ] Real stories load
  - [ ] [ ] Quiz loads correctly
  - [ ] [ ] Submission works
  - [ ] [ ] Stats update
  - [ ] [ ] Points awarded correctly

- [ ] [ ] **Hero System**
  - [ ] [ ] All available heroes show
  - [ ] [ ] Recruitment works with cost check
  - [ ] [ ] My heroes list shows correctly
  - [ ] [ ] Deployment works
  - [ ] [ ] Error messages clear

- [ ] [ ] **Leaderboards**
  - [ ] [ ] Quiz leaders show
  - [ ] [ ] Resource leaders show
  - [ ] [ ] Hero leaders show
  - [ ] [ ] Rankings correct

- [ ] [ ] **Error Scenarios**
  - [ ] [ ] Network disconnected → Error message
  - [ ] [ ] Invalid token → Redirect to login
  - [ ] [ ] API error → Retry button
  - [ ] [ ] Insufficient resources → Clear error message

---

## 📊 Verification Commands

### Backend Verification
```bash
# Check Motia is running
curl http://localhost:11001/api/v1/stories

# Check provinces
curl http://localhost:11001/api/v1/provinces

# Check heroes
curl http://localhost:11001/api/v1/heroes

# Check with auth
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:11001/api/v1/resources/my-resources
```

### Frontend Verification
```bash
# Check API client file exists
ls -la frontend/lib/mvp1ApiClient.ts

# Check hooks file exists
ls -la frontend/lib/useGameData.ts

# Build frontend
cd frontend && npm run build

# Check for TypeScript errors
cd frontend && npm run type-check
```

### Browser DevTools Verification
1. Open DevTools → Network tab
2. Look for API calls to: `http://localhost:11001/api/v1/`
3. Verify responses contain real data
4. Check response status codes (200 = success)
5. Look for any 4xx or 5xx errors

---

## 🎯 Success Criteria

### ✅ Migration Complete When:

**Backend**:
- [ ] All 24 endpoints responding correctly
- [ ] Real data in database
- [ ] Authentication working
- [ ] Error responses properly formatted

**Frontend**:
- [ ] useGameData hook working
- [ ] mvp1ApiClient initialized
- [ ] No hardcoded mock data in components
- [ ] Real data displaying in all components

**UI**:
- [ ] ResourceBar shows real resources
- [ ] ProvinceCard shows real provinces
- [ ] CultureCenter shows real stories
- [ ] HeroesTab shows real heroes
- [ ] LeaderboardTab shows real rankings
- [ ] All stats are real

**Functionality**:
- [ ] Harvest resources works
- [ ] Province upgrades work
- [ ] Submit quizzes work
- [ ] Recruit heroes works
- [ ] Deploy heroes works
- [ ] All error messages clear

**Testing**:
- [ ] No console errors
- [ ] No compilation errors
- [ ] All API calls successful
- [ ] Loading states work
- [ ] Error states work

---

## 📝 Commit Strategy

### Commit 1: Setup & Utilities
```
git commit -m "feat: Add real data integration setup

- Import useGameData hook
- Import MVP1ApiClient
- Set up API token management
- Add error handling utilities
```

### Commit 2: ResourceBar Migration
```
git commit -m "feat: Replace mock resources with real MVP1 data

- Load player resources from API
- Implement harvest functionality
- Add error handling for cooldowns
```

### Commit 3: ProvinceCard Migration
```
git commit -m "feat: Replace mock provinces with real MVP1 data

- Load player provinces from API
- Implement upgrade functions
- Add cost validation
```

### Commit 4: Stories & Quizzes
```
git commit -m "feat: Replace mock stories with real MVP1 data

- Load stories from API
- Implement quiz loading and submission
- Add stats tracking
```

### Commit 5: Heroes System
```
git commit -m "feat: Replace mock heroes with real MVP1 data

- Load all heroes and player heroes
- Implement recruitment with validation
- Implement deployment
```

### Commit 6: Leaderboards
```
git commit -m "feat: Add real leaderboards from MVP1 API

- Create LeaderboardTab component
- Load quiz, resource, and hero leaderboards
- Add auto-refresh functionality
```

### Commit 7: Testing & Polish
```
git commit -m "test: Complete real data integration testing

- Test all endpoints
- Verify error handling
- Test loading states
- Polish UI with real data
```

---

## 🚀 Go-Live Checklist

Before deploying to production:

- [ ] All components use real data
- [ ] No mock data in components
- [ ] All error scenarios tested
- [ ] Loading states working
- [ ] Leaderboards updating correctly
- [ ] Stats tracking correctly
- [ ] Resource harvesting working
- [ ] Province upgrades working
- [ ] Hero recruitment working
- [ ] Quiz submission working
- [ ] No console errors
- [ ] No API errors
- [ ] Performance acceptable
- [ ] Mobile UI working
- [ ] Desktop UI working
- [ ] Auth flow working
- [ ] Database queries optimized

---

## 💾 Rollback Plan

If issues occur:

```bash
# Create backup branch
git checkout -b backup/before-real-data

# Revert to previous version
git revert <commit-hash>

# Or checkout specific file
git checkout main -- frontend/app/page.tsx
```

---

**Ready to start the migration! 🎉**

**Recommended Order:**
1. Start with ResourceBar (simplest)
2. Then ProvinceCard
3. Then CultureCenter
4. Then HeroesTab
5. Create LeaderboardTab
6. Finally update main page.tsx

Each component takes ~20-30 minutes to migrate.
