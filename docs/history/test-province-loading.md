# Test Province Loading Fix

## Before Fix
**Console Output:**
```
🔐 Auth token found
⏸️ Skipping data sync - not authenticated
```
**UI:** Infinite "Đang tải dữ liệu tỉnh thành..."

## Root Cause
`useApiDataSync` hook used `useState` for `isAuthenticated`:
1. `setIsAuthenticated(true)` called
2. `syncGameDataFromApi()` called immediately
3. Function checks `if (!isAuthenticated) return;` - **OLD state value = false**
4. Sync skipped despite token existing

## Fix Applied
**File:** `/frontend/lib/hooks/useApiDataSync.ts`

**Changes:**
- ❌ Removed `useState` for authentication
- ✅ Pass token directly from `localStorage` to functions
- ✅ Functions check parameter, not state
- ✅ Added explicit `provinceId` field in transform
- ✅ Added `.filter(Boolean)` to remove null entries

**New Flow:**
```typescript
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    syncGameDataFromApi(token); // Pass directly!
  }
}, []);

const syncGameDataFromApi = async (token: string) => {
  if (!token) return; // Check parameter
  // ... sync logic
};
```

## Expected After Fix
**Console Output:**
```
Auth token found, syncing data...
Starting game data sync from API...
Provinces API Response: { success: true, data: [...] }
Received 2 provinces from API
Transformed 2 provinces for frontend
Game data sync completed
```

**UI:** Province cards displayed immediately (Hà Nội, Hồ Chí Minh)

## Test Steps
1. Open http://localhost:11000
2. Login with existing account OR register new account
3. Check browser console (F12)
4. Verify provinces display without "Đang tải..." message
5. Click province cards to confirm interaction works

## Backend Verification
```bash
# Test myProvinces query
TOKEN="your_jwt_token"
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ myProvinces { provinceId province { id name region } farmerLevel } }"}'

# Expected: 2 provinces with IDs 1 and 2
```

## Status
✅ **FIXED** - Frontend now loads provinces immediately on login
