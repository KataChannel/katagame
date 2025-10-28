# Frontend Integration with MVP1 Real Data - Guide

## Overview

The frontend now has two new files for integrating with real MVP1 backend data:

1. **`lib/mvp1ApiClient.ts`** - API client for all MVP1 endpoints
2. **`lib/useGameData.ts`** - Data loading hooks and utilities

## API Client Usage

### Setting Authentication Token

```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';

// After successful login
MVP1ApiClient.setAuthToken(token);
```

### Fetching Game Data

#### Stories
```typescript
// Get all stories with pagination
const storiesData = await MVP1ApiClient.getStories(1, 10);

// Get stories for a specific day
const dayStories = await MVP1ApiClient.getStoriesByDay(1);

// Get quiz for a story
const quiz = await MVP1ApiClient.getStoryQuiz(storyId);

// Mark story as read (requires auth)
await MVP1ApiClient.markStoryRead(storyId);
```

#### Quizzes
```typescript
// Submit quiz answers (requires auth)
const result = await MVP1ApiClient.submitQuiz(storyId, [
  { questionId: 'q1', selectedOption: 1 },
  { questionId: 'q2', selectedOption: 2 }
]);

// Get player quiz stats (requires auth)
const stats = await MVP1ApiClient.getQuizStats();

// Get quiz leaderboard
const leaderboard = await MVP1ApiClient.getQuizLeaderboard(10, 0);
```

#### Resources
```typescript
// Get resource definitions
const resources = await MVP1ApiClient.getResources();

// Get player resources (requires auth)
const playerResources = await MVP1ApiClient.getPlayerResources();

// Harvest resources (requires auth)
const harvest = await MVP1ApiClient.harvestResources('gold');

// Get resource leaderboard
const leaderboard = await MVP1ApiClient.getResourceLeaderboard('gold', 10, 0);
```

#### Heroes
```typescript
// Get all heroes
const heroes = await MVP1ApiClient.getHeroes();

// Get player heroes (requires auth)
const myHeroes = await MVP1ApiClient.getPlayerHeroes();

// Recruit a hero (requires auth)
const newHero = await MVP1ApiClient.recruitHero('warrior');

// Deploy hero to province (requires auth)
await MVP1ApiClient.deployHero(heroId, provinceId);

// Get hero leaderboard
const leaderboard = await MVP1ApiClient.getHeroLeaderboard(10, 0);
```

#### Provinces
```typescript
// Get all provinces
const provinces = await MVP1ApiClient.getProvinces();

// Get province details
const province = await MVP1ApiClient.getProvinceDetail(provinceId);

// Get player provinces (requires auth)
const myProvinces = await MVP1ApiClient.getPlayerProvinces();

// Upgrade farmer (requires auth)
const result = await MVP1ApiClient.upgradeFarmer(provinceId);

// Upgrade resource production (requires auth)
const result = await MVP1ApiClient.upgradeResource(provinceId);

// Upgrade development level (requires auth)
const result = await MVP1ApiClient.upgradeDevelopment(provinceId);
```

#### Game Configuration
```typescript
// Get full game configuration
const config = await MVP1ApiClient.getGameData();

// Get simplified configuration
const simpleConfig = await MVP1ApiClient.getConfig();
```

## Data Loading Hooks

### useGameData Hook

Load all game data (both public and player-specific):

```typescript
import { useGameData } from '@/lib/useGameData';

export function MyComponent() {
  const { 
    stories, 
    quizzes, 
    resources, 
    heroes, 
    provinces,
    playerResources,
    playerHeroes,
    playerProvinces,
    gameConfig,
    isLoading, 
    error 
  } = useGameData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Stories: {stories.length}</h2>
      <h2>Resources: {resources.length}</h2>
      <h2>Heroes: {heroes.length}</h2>
      <h2>My Resources: {playerResources?.gold}</h2>
    </div>
  );
}
```

### loadGameData Function

Load game data programmatically:

```typescript
import { loadGameData } from '@/lib/useGameData';

// Load public data only
const publicData = await loadGameData(false);

// Load public + player data (if authenticated)
const allData = await loadGameData(true);

// Access data
console.log(allData.provinces);
console.log(allData.playerResources);
```

### loadPlayerData Function

Load only player-specific data after login:

```typescript
import { loadPlayerData } from '@/lib/useGameData';

// This requires authentication token to be set
const playerData = await loadPlayerData();

console.log(playerData.playerResources);
console.log(playerData.playerHeroes);
console.log(playerData.playerProvinces);
```

## Response Format

All API responses follow this format:

```typescript
{
  success: boolean,
  data?: any,           // Contains the actual response data
  message?: string      // Error message if success is false
}
```

### Example Response

```json
{
  "success": true,
  "data": {
    "provinces": [
      {
        "provinceId": 1,
        "name": "Hà Nội",
        "region": "Northern",
        "icon": "hanoi.png"
      }
    ]
  }
}
```

## Integration with GameStore

To integrate real data with the existing Zustand store:

```typescript
import { useGameStore } from '@/lib/gameStore';
import { loadGameData } from '@/lib/useGameData';
import MVP1ApiClient from '@/lib/mvp1ApiClient';

// In your component or hook
useEffect(() => {
  async function initializeGame() {
    // Set auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      MVP1ApiClient.setAuthToken(token);
    }

    // Load real data
    const realData = await loadGameData(!!token);
    
    // Update store with real data
    // (This would need new actions in gameStore)
    // For now, you can access the data directly from realData
  }

  initializeGame();
}, []);
```

## Common Patterns

### Fetch and Display Stories
```typescript
const storiesData = await MVP1ApiClient.getStories();
const stories = storiesData.data?.stories || [];
```

### Fetch with Error Handling
```typescript
try {
  const result = await MVP1ApiClient.submitQuiz(storyId, answers);
  if (result.success) {
    console.log('Quiz submitted:', result.data);
  } else {
    console.error('Quiz submission failed:', result.message);
  }
} catch (error) {
  console.error('API error:', error);
}
```

### Paginated Leaderboard
```typescript
const leaderboard = await MVP1ApiClient.getQuizLeaderboard(20, 0);
const nextPage = await MVP1ApiClient.getQuizLeaderboard(20, 20);
```

## Environment Configuration

The API base URL can be configured via environment variables:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:11001/api/v1
```

Default: `http://localhost:11001/api/v1`

## Authentication

### Bearer Token Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

The `MVP1ApiClient` automatically adds this header when set:

```typescript
MVP1ApiClient.setAuthToken(token);
```

### Token Persistence

Tokens are automatically stored in `localStorage`:

```typescript
const token = MVP1ApiClient.getAuthToken(); // From localStorage if not in memory
```

## Error Handling

The API client throws errors for failed requests. Handle them appropriately:

```typescript
try {
  const data = await MVP1ApiClient.getStories();
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to fetch stories:', error.message);
  }
}
```

## Real Data Endpoints (24 Total)

### ✅ Stories (4 endpoints)
- GET `/api/v1/stories` - List stories
- GET `/api/v1/stories/:day` - Stories by day
- GET `/api/v1/stories/:id/quiz` - Story quiz
- POST `/api/v1/stories/:id/read` - Mark as read (auth)

### ✅ Quizzes (3 endpoints)
- POST `/api/v1/quizzes/:storyId/submit` - Submit answers (auth)
- GET `/api/v1/quizzes/stats` - Player stats (auth)
- GET `/api/v1/quizzes/leaderboard` - Leaderboard

### ✅ Resources (4 endpoints)
- GET `/api/v1/resources` - Resource definitions
- GET `/api/v1/resources/my-resources` - Player resources (auth)
- POST `/api/v1/resources/harvest` - Harvest (auth)
- GET `/api/v1/resources/leaderboard` - Leaderboard

### ✅ Heroes (5 endpoints)
- GET `/api/v1/heroes` - List heroes
- GET `/api/v1/heroes/my-heroes` - Player heroes (auth)
- POST `/api/v1/heroes/recruit` - Recruit hero (auth)
- POST `/api/v1/heroes/deploy` - Deploy hero (auth)
- GET `/api/v1/heroes/leaderboard` - Leaderboard

### ✅ Provinces (7 endpoints)
- GET `/api/v1/provinces` - List provinces
- GET `/api/v1/provinces/:id` - Province details
- GET `/api/v1/provinces/my-provinces` - Player provinces (auth)
- POST `/api/v1/provinces/:id/upgrade/farmer` - Farmer upgrade (auth)
- POST `/api/v1/provinces/:id/upgrade/resource` - Resource upgrade (auth)
- POST `/api/v1/provinces/:id/upgrade/development` - Dev upgrade (auth)

### ✅ Game Data (2 endpoints)
- GET `/api/v1/game-data` - Full config
- GET `/api/v1/config` - Simplified config

---

**Total endpoints implemented: 24/24 ✅**
All endpoints are now ready to serve real MVP1 game data to the frontend.
