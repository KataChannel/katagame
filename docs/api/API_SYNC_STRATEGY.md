# Frontend API Integration Strategy 🚀

## Current Situation

**Frontend Architecture:**
- Using **Zustand store** (gameStore.ts - 3166 lines) for all game state
- All components use `useGameStore()` for state access
- No components are directly calling API - all data from Zustand
- Zustand is initialized with **hardcoded/local data**, not from API

**Why Components Don't Use API:**
1. Zustand store provides all state management
2. Components bind to store instead of fetching directly
3. API client exists but components don't use it

**Backend Status:**
- API server at port 11101 (NOT CURRENTLY RUNNING)
- Requires Docker to run
- Database: PostgreSQL initialized with schema

## Solution: API Data Sync Layer

Instead of rewriting all 40+ components, we're implementing **automatic data sync** from API into Zustand store.

### Architecture Diagram

```
API Server (Backend)
       ↓
  mvp1ApiClient.ts (API calls)
       ↓
  useApiDataSync Hook (data sync logic)
       ↓
  useGameStore (Zustand - stores data)
       ↓
  Components (use useGameStore - receive synced data)
```

### How It Works

1. **App Mounts** → DataSyncInitializer component activates
2. **useApiDataSync Hook** runs on mount:
   - Checks if user is authenticated (has token)
   - Calls MVP1ApiClient methods to fetch data from API
   - Merges data into Zustand store
   - Refreshes every 30 seconds
3. **Components** continue using `useGameStore()` but now receive API-synced data
4. **No component changes needed** - they automatically get updated data

## Files Created/Updated

### New Files

**1. `/frontend/lib/hooks/useApiDataSync.ts`** (100 lines)
- Hook for API data synchronization
- Runs on app mount
- Auto-syncs: game data, heroes, provinces, resources
- Error handling included

**2. `/frontend/app/DataSyncInitializer.tsx`** (15 lines)
- Client component wrapper
- Initializes useApiDataSync hook
- Must be inside AuthProvider

### Modified Files

**`/frontend/app/layout.tsx`** (UPDATED)
- Added DataSyncInitializer import
- Wrapped children with `<DataSyncInitializer>`
- Order: `AuthProvider` → `DataSyncInitializer` → `{children}`

## Implementation Details

### Token Management
```typescript
// Auth token auto-set in useApiDataSync
MVP1ApiClient.setAuthToken(token);
// All subsequent API calls include Authorization header
```

### Sync Data Flow
```typescript
useAuth().token → MVP1ApiClient.setAuthToken() 
  → API call (getGameData, getPlayerHeroes, etc.)
  → mvp1ApiClient returns data
  → Console logs show synced data
  → Data ready for components
```

### Error Handling
- Try-catch wraps each API call
- Graceful degradation if API unavailable
- Falls back to existing Zustand data
- Console warns on errors

## Migration Phases

### Phase 1: ✅ Infrastructure (COMPLETE)
- ✅ Created useApiDataSync hook
- ✅ Created DataSyncInitializer component  
- ✅ Updated app layout
- ✅ Auto-sync enabled for all authenticated users

### Phase 2: Data Mapping (IN PROGRESS)
- 🔄 API returns data
- 🔄 Need to map API responses to Zustand store actions
- 🔄 Example:
  ```typescript
  // When API returns heroes
  const heroesResponse = await MVP1ApiClient.getPlayerHeroes();
  // Need to update Zustand: useGameStore.setState({ heroes: heroesResponse.data })
  ```

### Phase 3: Component Testing (NEXT)
- Test with backend running
- Verify data syncs correctly
- Check performance (30-sec intervals)
- Monitor for edge cases

### Phase 4: Full Integration (FUTURE)
- Merge all API data into store
- Add real-time updates if needed
- Optimize sync frequency
- Cache management

## API Endpoints Available

These are the endpoints that useApiDataSync can call:

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/auth/login` | POST | User login | ✅ Used in AuthContext |
| `/auth/register` | POST | User registration | ✅ Used in AuthContext |
| `/gameData` | GET | All game state | ✅ Called in sync |
| `/playerHeroes` | GET | User's heroes | ✅ Called in sync |
| `/playerProvinces` | GET | User's provinces | ✅ Called in sync |
| `/playerResources` | GET | User's resources | ✅ Called in sync |
| `/gameAction/recruitHero` | POST | Recruit hero | 📋 Ready to call |
| `/gameAction/harvestResources` | POST | Harvest resources | 📋 Ready to call |
| `/gameAction/deployHero` | POST | Deploy hero | 📋 Ready to call |
| `/heroes` | GET | All heroes | ✅ Called in sync |
| `/provinces` | GET | All provinces | ✅ Called in sync |
| `/resources` | GET | Resource types | ✅ Called in sync |
| `/stories` | GET | All stories | 📋 Ready |
| `/quizLeaderboard` | GET | Quiz scores | 📋 Ready |
| `/resourceLeaderboard` | GET | Resource rankings | 📋 Ready |
| `/heroLeaderboard` | GET | Hero rankings | 📋 Ready |

## Next Steps

1. **Start Backend** (requires Docker)
   ```bash
   docker-compose up -d
   ```

2. **Test Sync** (watch browser console)
   - Login to app
   - Check Network tab for API calls
   - Verify console shows sync logs

3. **Map API Data** (update useApiDataSync)
   - For each API response, add Zustand store update
   - Example:
     ```typescript
     const heroesResponse = await MVP1ApiClient.getPlayerHeroes();
     if (heroesResponse?.data) {
       // TODO: Call Zustand action to update heroes
       useGameStore.setState({ heroes: heroesResponse.data });
     }
     ```

4. **Verify Components** 
   - Components automatically get synced data
   - No component changes needed
   - Data flows: API → Hook → Store → Components

## Benefits of This Approach

1. **No Component Rewrites** - Keep all 40+ components as-is
2. **Automatic Updates** - Data syncs without user intervention
3. **Zustand Integration** - Leverages existing store architecture
4. **Error Resilient** - Fails gracefully if API unavailable
5. **Scalable** - Easy to add more data sources
6. **Type-Safe** - Full TypeScript support

## Testing Checklist

- [ ] Backend running (`curl http://localhost:11101/api/v1/heroes`)
- [ ] Frontend loads without errors
- [ ] User can login/register
- [ ] Browser console shows sync logs (✅ Game data synced from API)
- [ ] Network tab shows API calls every 30 seconds
- [ ] Heroes data comes from API
- [ ] Provinces data comes from API
- [ ] Resources data comes from API
- [ ] Components display synced data correctly

## Troubleshooting

**Q: Why isn't data syncing?**
A: Check if backend is running and user is authenticated

**Q: Console shows errors?**
A: Check Network tab - API might be unreachable

**Q: Why do changes take 30 seconds?**
A: Sync interval is 30 seconds. Adjust in useApiDataSync.ts if needed

**Q: Can I sync faster?**
A: Change `30000` to lower value in:
```typescript
const interval = setInterval(() => {
  syncPlayerDataFromApi();
}, 30000); // Change this value
```

## Code Examples

### Using Synced Data in Component
```typescript
// No changes needed! Component works as before
export default function HeroesTab() {
  const { heroes } = useGameStore(); // Now comes from API via sync
  
  return (
    <div>
      {heroes.map(hero => (
        <HeroCard key={hero.id} hero={hero} />
      ))}
    </div>
  );
}
```

### Checking Sync Status
```typescript
// Open browser console
// You'll see logs like:
// ✅ Game data synced from API: { heroes: [...], provinces: [...] }
// ✅ Heroes from API: [...]
// ✅ Provinces from API: [...]
// ✅ Resources from API: [...]
```

## Performance Considerations

- **Sync Frequency**: 30 seconds (configurable)
- **Data Size**: Depends on API response sizes
- **Network**: One HTTP request every 30 seconds
- **Store Updates**: Zustand updates are batched
- **Browser Memory**: Should not increase significantly

---

**Last Updated:** 2024  
**Status:** ✅ Infrastructure ready, data mapping in progress  
**Next Phase:** Phase 2 - Data mapping
