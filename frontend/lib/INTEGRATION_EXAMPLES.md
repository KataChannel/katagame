# MVP1 Frontend Integration Examples

This document contains code examples for integrating MVP1 real data into the frontend components.

**Note**: These are example patterns and should be adapted to your actual component structure.

## Example 1: Basic Integration in page.tsx

```typescript
import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import MVP1ApiClient from '@/lib/mvp1ApiClient';
import { loadGameData } from '@/lib/useGameData';

export default function Game() {
  useEffect(() => {
    const initializeGame = async () => {
      // 1. Set authentication token
      const token = localStorage.getItem('authToken');
      if (token) {
        MVP1ApiClient.setAuthToken(token);
      }

      // 2. Load real game data
      const realData = await loadGameData(!!token);

      // 3. You can now use realData instead of mock data
      console.log('Real stories:', realData.stories);
      console.log('Real provinces:', realData.provinces);
      console.log('Real player resources:', realData.playerResources);
    };

    initializeGame();
  }, []);

  // Rest of component...
}
```

## Example 2: Component using real stories

```typescript
import { useGameData } from '@/lib/useGameData';

function StoriesTab() {
  const { stories, isLoading, error } = useGameData();

  if (isLoading) return <div>Loading stories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Available Stories</h2>
      <div className="stories-list">
        {stories.map(story => (
          <StoryCard
            key={story.id}
            storyId={story.id}
            title={story.name}
            description={story.description}
            day={story.day}
          />
        ))}
      </div>
    </div>
  );
}
```

## Example 3: Component for quiz submission

```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';
import { useState } from 'react';

function QuizComponent({ storyId }: { storyId: string }) {
  const [answers, setAnswers] = useState([]);

  const handleSubmitQuiz = async () => {
    try {
      const result = await MVP1ApiClient.submitQuiz(storyId, answers);
      
      if (result.success) {
        console.log('Quiz submitted successfully!');
        console.log('Rewards:', result.data);
      } else {
        console.error('Quiz submission failed:', result.message);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  return (
    <div>
      {/* Quiz UI here */}
      <button onClick={handleSubmitQuiz}>Submit Quiz</button>
    </div>
  );
}
```

## Example 4: Component using real provinces

```typescript
import { useGameData } from '@/lib/useGameData';

function ProvinceList() {
  const { provinces, playerProvinces, isLoading } = useGameData();

  if (isLoading) return <div>Loading provinces...</div>;

  return (
    <div>
      <h2>My Provinces ({playerProvinces?.length || 0})</h2>
      <div className="provinces-grid">
        {playerProvinces?.map(playerProvince => {
          const provinceInfo = provinces.find(
            p => p.provinceId === playerProvince.provinceId
          );
          
          return (
            <ProvinceCard
              key={playerProvince.id}
              name={provinceInfo?.name}
              farmerLevel={playerProvince.farmerLevel}
              resourceLevel={playerProvince.resourceLevel}
              developmentLevel={playerProvince.developmentLevel}
            />
          );
        })}
      </div>
    </div>
  );
}
```

## Example 5: Resource harvesting

```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';
import { useState } from 'react';

function HarvestButton({ resourceType }: { resourceType: string }) {
  const [isHarvesting, setIsHarvesting] = useState(false);

  const handleHarvest = async () => {
    setIsHarvesting(true);
    try {
      const result = await MVP1ApiClient.harvestResources(resourceType);
      
      if (result.success) {
        console.log('Harvested resources');
        // Refresh player resources
        const updated = await MVP1ApiClient.getPlayerResources();
        // Update component state or store
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('Harvest failed:', error);
    } finally {
      setIsHarvesting(false);
    }
  };

  return (
    <button onClick={handleHarvest} disabled={isHarvesting}>
      {isHarvesting ? 'Harvesting...' : 'Harvest'}
    </button>
  );
}
```

## Example 6: Leaderboard component

```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';
import { useState, useEffect } from 'react';

function QuizLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const result = await MVP1ApiClient.getQuizLeaderboard(10, 0);
        if (result.success && result.data) {
          setLeaderboard(result.data.leaderboard || []);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Quizzes</th>
          <th>Correct</th>
          <th>Gold Earned</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((entry: any) => (
          <tr key={entry.rank}>
            <td>{entry.rank}</td>
            <td>{entry.username}</td>
            <td>{entry.quizzesCompleted}</td>
            <td>{entry.correctAnswers}</td>
            <td>{entry.totalGold}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Example 7: Hero recruitment

```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';

async function recruitHero(heroType: string) {
  try {
    const result = await MVP1ApiClient.recruitHero(heroType);
    
    if (result.success) {
      console.log('Hero recruited!', result.data);
      // Refresh player heroes
      const heroes = await MVP1ApiClient.getPlayerHeroes();
      return heroes;
    } else {
      console.error('Failed to recruit hero:', result.message);
    }
  } catch (error) {
    console.error('Error recruiting hero:', error);
  }
}
```

## Example 8: Province upgrade

```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';

async function upgradeFarmerLevel(provinceId: string) {
  try {
    const result = await MVP1ApiClient.upgradeFarmer(provinceId);
    
    if (result.success) {
      console.log('Farmer upgraded!', result.data);
      // Refresh provinces
      const provinces = await MVP1ApiClient.getPlayerProvinces();
      return provinces;
    } else {
      console.error('Failed to upgrade farmer:', result.message);
    }
  } catch (error) {
    console.error('Error upgrading farmer:', error);
  }
}
```

## Example 9: Get player statistics

```typescript
import MVP1ApiClient from '@/lib/mvp1ApiClient';
import { useState, useEffect } from 'react';

function PlayerStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await MVP1ApiClient.getQuizStats();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="stats-panel">
      <div>Total Quizzes: {stats.totalQuizzes}</div>
      <div>Correct Answers: {stats.correctAnswers}</div>
      <div>Accuracy: {stats.accuracyRate}%</div>
      <div>Total Gold: {stats.totalGoldEarned}</div>
    </div>
  );
}
```

## Example 10: Game Configuration

```typescript
import { useGameData } from '@/lib/useGameData';

function GameConfig() {
  const { gameConfig } = useGameData();

  if (!gameConfig) return <div>Loading config...</div>;

  return (
    <div>
      <h3>Game Version: {gameConfig.version}</h3>
      <p>Quizzes per day: {gameConfig.quizPerDay}</p>
      <p>Max heroes: {gameConfig.maxHeroes}</p>
      <p>Max provinces: {gameConfig.maxProvinces}</p>
      <p>Resources: {gameConfig.resourceTypes?.join(', ')}</p>
    </div>
  );
}
```

## Key Patterns

### 1. Authentication
```typescript
// Set token
MVP1ApiClient.setAuthToken(token);

// Token is persisted in localStorage
// Token is automatically added to all requests as Bearer header
```

### 2. Data Loading (Two Options)

**Option A - React Hook (automatic)**:
```typescript
const gameData = useGameData();
```

**Option B - Function (programmatic)**:
```typescript
const data = await loadGameData(true); // true = requires auth
```

### 3. API Calls
```typescript
// All methods follow this pattern
const result = await MVP1ApiClient.methodName(args);

if (result.success) {
  // result.data contains the response
} else {
  // result.message contains the error
}
```

### 4. Error Handling
```typescript
try {
  const result = await MVP1ApiClient.methodName();
  if (result.success) {
    // Success handling
  } else {
    // API error (result.message)
  }
} catch (error) {
  // Network error
  console.error(error);
}
```

### 5. Async Operations
- All API calls are async/await
- Use loading state during fetch
- Refresh data after mutations
- Cache response in component state

## Migration Checklist

- [ ] Import MVP1ApiClient and useGameData in main components
- [ ] Add MVP1ApiClient.setAuthToken() in login handler
- [ ] Replace hardcoded provinces with real provinces from API
- [ ] Replace hardcoded resources with real resources from API
- [ ] Replace hardcoded heroes with real heroes from API
- [ ] Update story list component to fetch stories from API
- [ ] Update quiz component to use submitQuiz function
- [ ] Update leaderboard to fetch real leaderboard data
- [ ] Update resource harvest to use real harvest function
- [ ] Update hero recruitment to use real recruit function
- [ ] Update province upgrades to use real upgrade functions
- [ ] Test all features with real backend data
- [ ] Monitor API responses in browser DevTools
- [ ] Add error notifications for failed API calls
- [ ] Implement token refresh if tokens expire
- [ ] Add loading states for all API calls
- [ ] Add caching for static data (provinces, resources, heroes)
- [ ] Implement pagination for leaderboards
- [ ] Add real-time updates (WebSocket or polling)
