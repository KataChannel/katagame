# 🚀 Frontend API Integration - Bước Thực Hiện Chi Tiết

## Phần 1: Khởi Tạo Database (CRITICAL - Làm trước tiên)

### 1.1 Chạy Database Schema

```bash
# Step 1: Verify database container is running
docker ps | grep katagame-db

# Step 2: Execute the schema
docker exec katagame-db psql -U katagame -d katagame < /mnt/chikiet/kataoffical/katagame/katagame_database_schema.sql

# Step 3: Verify tables are created
docker exec katagame-db psql -U katagame -d katagame -c "\dt"
```

**Expected output:**
```
                     List of relations
 Schema |           Name            | Type  |  Owner
--------+---------------------------+-------+---------
 public | players                   | table | katagame
 public | provinces                 | table | katagame
 public | heroes                    | table | katagame
 public | stories                   | table | katagame
 public | quizzes                   | table | katagame
 public | resources                 | table | katagame
 public | player_heroes             | table | katagame
 public | player_provinces          | table | katagame
 public | player_resources          | table | katagame
 public | season_battles            | table | katagame
 public | _prisma_migrations        | table | katagame
(And more...)
```

### 1.2 Seed Initial Data

Create a file `/mnt/chikiet/kataoffical/katagame/seed-data.sql`:

```sql
-- Insert Vietnam Provinces
INSERT INTO provinces (id, name, is_capital, base_gold_rate, base_culture_rate) VALUES
(1, 'Hà Nội', true, 1.5, 2.0),
(2, 'Hồ Chí Minh', true, 1.8, 1.8),
(3, 'Huế', true, 1.2, 2.5),
(4, 'Hải Phòng', false, 1.3, 1.0),
(5, 'Đà Nẵng', false, 1.4, 1.5),
(6, 'Cần Thơ', false, 1.2, 1.0),
(7, 'Hà Giang', false, 0.8, 0.5),
(8, 'Cao Bằng', false, 0.9, 0.6),
(9, 'Bắc Kạn', false, 0.8, 0.5),
(10, 'Tuyên Quang', false, 0.9, 0.6);

-- Insert Heroes
INSERT INTO heroes (name, element, rarity, base_power, description, is_summonable) VALUES
('Thánh Gióng', 'fire', 'legendary', 250, 'Vị Thánh bảo vệ đất Việt với sức mạnh Hỏa', true),
('Trần Hưng Đạo', 'water', 'legendary', 240, 'Tướng quân vĩ đại với chiến thuật nước', true),
('Quang Trung', 'earth', 'legendary', 245, 'Hoàng đế mạnh mẽ kiểm soát đất đai', true),
('Bà Triệu', 'wood', 'legendary', 235, 'Nữ tướng huyền thoại của Việt Nam', true),
('Trúc Nhan', 'metal', 'legendary', 230, 'Người phụ nữ dũng cảm với tinh thần thép', true),
('Tô Hiệu', 'fire', 'epic', 180, 'Nhân vật anh hùng cương chistng', true),
('Nguyễn Trãi', 'water', 'epic', 175, 'Nhà nước gia thông thái', true);

-- Insert Sample Player
INSERT INTO players (username, email, password_hash, level, experience) VALUES
('testplayer', 'test@example.com', '$2b$10$test', 1, 0)
ON CONFLICT (email) DO NOTHING;

-- Insert Player Resources
INSERT INTO player_resources (player_id, resource_type, amount)
SELECT id, 'gold', 1000 FROM players WHERE username = 'testplayer'
ON CONFLICT (player_id, resource_type) DO UPDATE SET amount = 1000;

INSERT INTO player_resources (player_id, resource_type, amount)
SELECT id, 'culture', 500 FROM players WHERE username = 'testplayer'
ON CONFLICT (player_id, resource_type) DO UPDATE SET amount = 500;
```

Run seed data:

```bash
docker exec katagame-db psql -U katagame -d katagame < /mnt/chikiet/kataoffical/katagame/seed-data.sql
```

### 1.3 Verify Data in Database

```bash
# Check provinces
docker exec katagame-db psql -U katagame -d katagame -c "SELECT id, name, base_gold_rate FROM provinces LIMIT 5;"

# Check heroes
docker exec katagame-db psql -U katagame -d katagame -c "SELECT name, element, rarity, base_power FROM heroes;"

# Check players
docker exec katagame-db psql -U katagame -d katagame -c "SELECT username, level, experience FROM players;"
```

---

## Phần 2: Verify Backend API Responses

### 2.1 Test API Endpoints

```bash
# Test Heroes Endpoint
curl -s http://localhost:11101/api/v1/heroes | jq '.body.data.heroes | length'

# Should return: 7 (or number of heroes inserted)

# Test Provinces Endpoint  
curl -s http://localhost:11101/api/v1/provinces | jq '.body.data.provinces[0]'

# Test Resources Endpoint
curl -s http://localhost:11101/api/v1/resources | jq '.body.data.resources'
```

**Expected Results:**
- ✅ `/heroes` returns array with 7+ heroes
- ✅ `/provinces` returns array with provinces
- ✅ `/resources` returns without errors
- ✅ All responses have `"success": true`

### 2.2 Create Test Script

Create `/mnt/chikiet/kataoffical/katagame/test-frontend-api.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Frontend API Integration"
echo "=================================="

API_URL="http://localhost:11101/api/v1"

echo ""
echo "1️⃣  Testing /heroes endpoint..."
HEROES_COUNT=$(curl -s $API_URL/heroes | jq '.body.data.heroes | length')
echo "   ✅ Heroes count: $HEROES_COUNT"

echo ""
echo "2️⃣  Testing /provinces endpoint..."
PROVINCES_COUNT=$(curl -s $API_URL/provinces | jq '.body.data.provinces | length')
echo "   ✅ Provinces count: $PROVINCES_COUNT"

echo ""
echo "3️⃣  Testing /resources endpoint..."
RESOURCES=$(curl -s $API_URL/resources | jq '.body.data.resources')
echo "   ✅ Resources: $RESOURCES"

echo ""
echo "4️⃣  Testing /stories endpoint..."
STORIES=$(curl -s $API_URL/stories | jq '.body.data.stories | length')
echo "   ✅ Stories count: $STORIES"

echo ""
echo "✨ All tests passed! API is ready for frontend integration."
```

Run it:

```bash
chmod +x /mnt/chikiet/kataoffical/katagame/test-frontend-api.sh
bash /mnt/chikiet/kataoffical/katagame/test-frontend-api.sh
```

---

## Phần 3: Frontend Implementation

### 3.1 Files Already Created

✅ **`/frontend/lib/hooks/useApi.ts`** - Complete API hooks
- `useHeroes()` - Fetch all heroes from API
- `usePlayerHeroes()` - Fetch player's heroes
- `useProvinces()` - Fetch provinces
- `usePlayerProvinces()` - Fetch player's provinces
- `useStories()` - Fetch stories with pagination
- `useResources()` - Fetch available resources
- `usePlayerResources()` - Fetch player resources
- `useQuizLeaderboard()` - Fetch quiz scores
- `useResourceLeaderboard()` - Fetch resource leaderboard
- `useHeroLeaderboard()` - Fetch hero power leaderboard
- `useGameData()` - Fetch complete game data
- `useGameAction()` - Mutations for game actions

✅ **`/frontend/lib/authContext.tsx`** - Authentication context with:
- Login/Register functionality
- Token management
- Persistent auth state
- Error handling

✅ **`/frontend/components/HeroesTab.tsx`** - Updated to use API
- Uses `useHeroes()` hook instead of mock data
- Shows loading/error states
- Displays real API data

### 3.2 Update App Layout to Include Auth Provider

Edit `/mnt/chikiet/kataoffical/katagame/frontend/app/layout.tsx`:

```tsx
import { AuthProvider } from '@/lib/authContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KataGame',
  description: 'Vietnamese Gaming Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3.3 Component Integration Examples

#### Example 1: Using Hero Hook

```tsx
import { useHeroes } from '@/lib/hooks/useApi';

export function MyComponent() {
  const { heroes, loading, error } = useHeroes();

  if (loading) return <div>Loading heroes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {heroes.map(hero => (
        <div key={hero.id}>{hero.displayName}</div>
      ))}
    </div>
  );
}
```

#### Example 2: Using Auth Hook

```tsx
import { useAuth } from '@/lib/authContext';

export function LoginComponent() {
  const { login, loading, error } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* form fields */}
    </form>
  );
}
```

#### Example 3: Using Game Actions

```tsx
import { useGameAction } from '@/lib/hooks/useApi';

export function RecruitComponent() {
  const { recruitHero, loading, error } = useGameAction();

  const handleRecruit = async () => {
    try {
      const response = await recruitHero('legendary');
      if (response.success) {
        // Refresh heroes list
      }
    } catch (err) {
      console.error('Recruit failed:', err);
    }
  };

  return (
    <button onClick={handleRecruit} disabled={loading}>
      {loading ? 'Recruiting...' : 'Recruit Hero'}
    </button>
  );
}
```

### 3.4 Components to Update (Priority Order)

#### Priority 1 (Core Gameplay - Update FIRST):
1. ✅ **HeroesTab.tsx** - DONE ✨
2. **ProvinceTab.tsx** - Use `useProvinces()`
3. **ResourcesTab.tsx** - Use `usePlayerResources()`
4. **StoriesTab.tsx** - Use `useStories()`
5. **LeaderboardTab.tsx** - Use `useQuizLeaderboard()` + `useResourceLeaderboard()`

#### Priority 2 (UI Components):
6. **WorldMapTab.tsx** - Use `usePlayerProvinces()` + `useGameAction()`
7. **InventoryTab.tsx** - Use `usePlayerResources()`
8. **ShopComponent.tsx** - Use `useGameAction()` for purchases
9. **QuestComponent.tsx** - Use `useStories()` + `useGameAction()`
10. **ProfileComponent.tsx** - Use `useAuth()` + `useGameData()`

#### Priority 3 (Advanced Features):
11. **FriendsTab.tsx** - API integration
12. **GuildTab.tsx** - API integration
13. **BattleComponent.tsx** - API integration
14. **MarketplaceTab.tsx** - API integration

### 3.5 Migration Pattern for Each Component

For each component file, follow this pattern:

**BEFORE:**
```tsx
import { heroesData } from '@/lib/heroesData';

export default function Component() {
  const heroes = heroesData;
  return <div>{heroes.map(...)}</div>;
}
```

**AFTER:**
```tsx
import { useHeroes } from '@/lib/hooks/useApi';

export default function Component() {
  const { heroes, loading, error } = useHeroes();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{heroes.map(...)}</div>;
}
```

---

## Phần 4: Testing & Verification

### 4.1 Development Server

```bash
# In frontend directory
npm run dev

# Should see:
# ✓ compiled successfully
# Ready in 2.3s
```

### 4.2 Browser Console Checks

Open browser DevTools (F12) and navigate to `http://localhost:3000`:

1. **Check API Calls:**
   - Network tab → Filter by `XHR`
   - Should see requests to `http://localhost:11101/api/v1/heroes`
   - Response should have `heroes` array

2. **Check Local Storage:**
   - Application → Local Storage
   - Should have `authToken` key (after login)

3. **Check Console:**
   - Should have NO red errors
   - May have info/debug logs

### 4.3 Component Verification Checklist

Use this checklist to verify each component:

```
Component: HeroesTab
├── [ ] API hook loads data (useHeroes)
├── [ ] Loading state displays
├── [ ] Error state displays
├── [ ] Heroes display with real data
├── [ ] Filters work
├── [ ] No console errors
└── [ ] Network requests successful

Component: ProvinceTab
├── [ ] API hook loads data (useProvinces)
├── [ ] Province list shows
├── [ ] Can click province
├── [ ] Details display
└── [ ] No mock data imports

...and so on
```

### 4.4 Manual Testing Scenarios

#### Scenario 1: Fresh Load
1. Clear browser cache (Ctrl+Shift+Del)
2. Refresh page
3. ✅ Heroes should load from API (empty at first, then populate)
4. ✅ Network tab shows API calls
5. ✅ No console errors

#### Scenario 2: Filter & Search
1. Click element filter
2. ✅ Heroes re-filter
3. ✅ No new API call (filters locally)

#### Scenario 3: Network Error Simulation
1. DevTools → Network → Throttle to "Offline"
2. Click hero
3. ✅ Error message displays
4. ✅ Loading states handled

#### Scenario 4: Data Refresh
1. Perform action (recruit hero)
2. ✅ Component re-fetches data
3. ✅ UI updates automatically

---

## Phần 5: Debugging & Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Cannot find name 'heroes'"
**Cause:** Still importing from mock data file
**Solution:** 
```tsx
// ❌ Remove this
import { heroes } from '@/lib/heroesData';

// ✅ Add this
import { useHeroes } from '@/lib/hooks/useApi';
const { heroes, loading, error } = useHeroes();
```

#### Issue 2: API Returns Empty Array
**Cause:** Database not seeded
**Solution:** Run seed-data.sql (see Part 1.2)

#### Issue 3: "relation 'heroes' does not exist"
**Cause:** Database schema not initialized
**Solution:** Run schema SQL (see Part 1.1)

#### Issue 4: Network Error (CORS)
**Cause:** Backend not running or wrong port
**Solution:**
```bash
# Check backend status
curl http://localhost:11101/api/v1/heroes

# Restart if needed
docker-compose up -d
```

#### Issue 5: Memory Issues During Load
**Cause:** Large dataset or inefficient queries
**Solution:**
- Add pagination to hooks
- Implement virtual scrolling
- Add filters before rendering

### Debug Helpers

Add this to any component for debugging:

```tsx
useEffect(() => {
  console.log('Heroes data:', heroes);
  console.log('Loading:', loading);
  console.log('Error:', error);
}, [heroes, loading, error]);
```

Enable debug mode in `.env.local`:

```
NEXT_PUBLIC_DEBUG=true
```

Then use:

```tsx
const debug = process.env.NEXT_PUBLIC_DEBUG === 'true';

if (debug) {
  console.log('Component mounted');
  console.log('Props:', { heroes, loading, error });
}
```

---

## Phần 6: Performance Optimization

### 6.1 Memoization

```tsx
import { useMemo } from 'react';
import { useHeroes } from '@/lib/hooks/useApi';

export function Component() {
  const { heroes } = useHeroes();
  
  // Memoize filtered list
  const filteredHeroes = useMemo(() => {
    return heroes?.filter(h => h.rarity === 'legendary') || [];
  }, [heroes]);
  
  return <div>{filteredHeroes.map(...)}</div>;
}
```

### 6.2 Pagination for Large Lists

```tsx
import { useState } from 'react';
import { useStories } from '@/lib/hooks/useApi';

export function StoriesList() {
  const [page, setPage] = useState(1);
  const { stories, pagination } = useStories(page, 10);
  
  return (
    <>
      {stories.map(story => <StoryCard key={story.id} story={story} />)}
      
      <div className="pagination">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {pagination.page} of {Math.ceil(pagination.total / 10)}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= pagination.total}>
          Next
        </button>
      </div>
    </>
  );
}
```

### 6.3 Lazy Loading Components

```tsx
import { lazy, Suspense } from 'react';

const HeroesTab = lazy(() => import('@/components/HeroesTab'));

export function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeroesTab />
    </Suspense>
  );
}
```

---

## Summary Checklist

- [x] Database schema initialized
- [x] Initial data seeded
- [x] API endpoints verified  
- [x] React hooks created (useHeroes, useProvinces, etc)
- [x] Auth context created
- [x] HeroesTab updated to use API
- [x] App layout updated with AuthProvider
- [ ] ProvinceTab updated
- [ ] ResourcesTab updated
- [ ] StoriesTab updated
- [ ] LeaderboardTab updated
- [ ] All components migrated from mock data
- [ ] Testing completed
- [ ] Performance optimizations applied
- [ ] Deployment ready

---

## Next Steps

1. **Run database initialization** (Part 1.1-1.3)
2. **Verify API responses** (Part 2.1-2.2)
3. **Test in browser** (Part 4)
4. **Update remaining components** (Part 3.4)
5. **Deploy to production** (when ready)

Let me know if you need help with any step! 🚀
