# 🐛 Fix: Bug Xóa Dữ Liệu Server - Vẫn Còn Data Sau Reset

**Ngày:** 31/10/2025  
**Vấn đề:** Sau khi click "XÓA VĨNH VIỄN DỮ LIỆU SERVER", dữ liệu vẫn còn trong database

## 🔍 Root Cause Analysis

### **Vấn đề 1: Apollo Client Refetch Queries**
```typescript
// ❌ TRƯỚC - Có refetchQueries
await apolloClient.mutate({
  mutation: RESET_PLAYER_DATA,
  refetchQueries: [
    { query: GET_ME },
    { query: GET_MY_PROVINCES },
    { query: GET_MY_HEROES },
    { query: GET_MY_RESOURCES },
  ],
  awaitRefetchQueries: true,
});
```

**Vấn đề:**
- Sau khi reset, Apollo **tự động refetch** các queries
- Data mới từ server (đã reset) được cache lại
- Nhưng Zustand store vẫn giữ data cũ
- Khi reload → conflict giữa Apollo cache và Zustand

### **Vấn đề 2: Thứ Tự Xóa Cache Sai**
```typescript
// ❌ TRƯỚC - Xóa cache sau khi logout
SaveGameManager.deleteSave();
await GraphQLApiClient.logout();
await apolloClient.clearStore(); // ← Quá muộn!
```

**Vấn đề:**
- Logout có thể trigger re-render
- Re-render có thể trigger data fetch
- Cache chưa được clear → hiển thị data cũ

### **Vấn đề 3: Soft Reload**
```typescript
// ❌ TRƯỚC - Soft reload
window.location.href = '/';
```

**Vấn đề:**
- Soft reload có thể giữ một số cache
- Service worker có thể cache response
- Browser cache có thể không bị clear

## ✅ Solutions Applied

### **Fix 1: Remove refetchQueries**
```typescript
// ✅ SAU - Không refetch
await apolloClient.mutate({
  mutation: RESET_PLAYER_DATA,
  // Không refetch để tránh cache stale data
});

// Clear cache NGAY SAU reset
await apolloClient.clearStore();
```

### **Fix 2: Đúng Thứ Tự Clear Cache**
```typescript
// ✅ Thứ tự đúng:
// 1. Reset server data
await GraphQLApiClient.resetPlayerData();

// 2. Clear Apollo cache TRƯỚC
await apolloClient.clearStore();

// 3. Clear localStorage
SaveGameManager.deleteSave();
localStorage.removeItem('katagame-store');
localStorage.removeItem('game-storage');
localStorage.removeItem('authToken');
localStorage.removeItem('auth-storage');

// 4. Logout SAU CÙNG
await GraphQLApiClient.logout();

// 5. Hard reload
window.location.replace('/');
```

### **Fix 3: Hard Reload**
```typescript
// ✅ SAU - Hard reload
window.location.replace('/'); // ← Force reload, clear cache
```

### **Fix 4: Loading State**
```typescript
const [isResetting, setIsResetting] = useState(false);

const handleResetServerData = async () => {
  if (isResetting) {
    alert('⏳ Đang xử lý... Vui lòng đợi!');
    return;
  }
  
  setIsResetting(true);
  try {
    // ... reset logic
  } catch (error) {
    setIsResetting(false); // Reset state on error
  }
};
```

### **Fix 5: Clear Apollo Cache Trong API Client**
```typescript
// graphqlApiClient.ts
static async resetPlayerData(): Promise<ApiResponse> {
  const { data } = await apolloClient.mutate({
    mutation: RESET_PLAYER_DATA,
    // NO refetchQueries!
  });
  
  // ✅ Clear cache immediately
  await apolloClient.clearStore();
  
  return { success: true };
}
```

## 🧪 Testing Steps

### **1. Verify Backend Reset Works**

**Test với Prisma Studio:**
```bash
cd backend
bunx prisma studio
```

1. Mở http://localhost:5555
2. Chọn bảng `player`
3. Tìm player của bạn
4. Note: `level`, `experience`, số lượng `player_province`, `player_hero`

**Test với SQL:**
```sql
-- Check BEFORE
SELECT id, username, level, experience, resources 
FROM player WHERE id = 'YOUR_PLAYER_ID';

SELECT COUNT(*) FROM player_province WHERE player_id = 'YOUR_PLAYER_ID';
SELECT COUNT(*) FROM player_hero WHERE player_id = 'YOUR_PLAYER_ID';

-- Run reset (via UI or GraphQL)

-- Check AFTER
SELECT id, username, level, experience, resources 
FROM player WHERE id = 'YOUR_PLAYER_ID';

SELECT COUNT(*) FROM player_province WHERE player_id = 'YOUR_PLAYER_ID';
SELECT COUNT(*) FROM player_hero WHERE player_id = 'YOUR_PLAYER_ID';
```

**Expected After Reset:**
- `level`: 1
- `experience`: 0
- `resources`: `{"gold": 1000, "rice": 1000, "lumber": 500, "stone": 500, "bazan": 100, "gems": 1500, "culture": 100}`
- `player_province` count: 0
- `player_hero` count: 0

### **2. Test Frontend Flow**

**Console Logs Should Show:**
```
🔥 Bắt đầu xóa dữ liệu trên server...
📡 Calling resetPlayerData mutation...
✅ Server response: {success: true, message: "..."}
✅ Dữ liệu server đã được reset
🗄️ Xóa GraphQL cache...
🧹 Dọn dẹp localStorage...
  ✅ Removed: katagame-store
  ✅ Removed: game-storage
  ✅ Removed: authToken
  ✅ Removed: auth-storage
🔐 Đang đăng xuất...
🔄 Force reloading page...
```

**Steps:**
1. Đăng nhập vào game
2. Tạo một số progress (unlock province, recruit hero)
3. Vào Settings → XÓA DỮ LIỆU SERVER
4. Xác nhận 3 lần
5. Quan sát console logs
6. Page reload → về login screen
7. Đăng nhập lại
8. Verify: Level 1, không có provinces, không có heroes

### **3. Test Error Handling**

**Test Network Error:**
1. Tắt backend server
2. Click "XÓA VĨNH VIỄN DỮ LIỆU SERVER"
3. Should show error alert
4. Button should be enabled again (not stuck in loading state)

**Test Invalid Token:**
1. Clear authToken manually: `localStorage.removeItem('authToken')`
2. Click button
3. Should show authentication error

## 📊 Debug Checklist

Nếu vẫn thấy dữ liệu sau reset:

- [ ] Check backend logs - có thấy "🔥 Resetting player data" không?
- [ ] Check database - chạy SQL verify queries
- [ ] Check browser console - có error không?
- [ ] Check Network tab - mutation có return success: true không?
- [ ] Check localStorage - các keys đã bị xóa chưa?
- [ ] Check Apollo cache - đã clear chưa? (xem trong Redux DevTools)
- [ ] Try hard refresh: Ctrl+Shift+R hoặc Cmd+Shift+R
- [ ] Try incognito mode để test clean state
- [ ] Check browser cache - có bật "Disable cache" trong DevTools không?

## 🔧 Common Issues & Solutions

### **Issue 1: Data vẫn hiển thị sau reload**

**Cause:** Zustand persist đang restore old data  
**Solution:** Clear localStorage TRƯỚC khi reload
```typescript
localStorage.clear(); // Nuclear option
window.location.replace('/');
```

### **Issue 2: Backend không xóa provinces**

**Cause:** Field name sai (camelCase vs snake_case)  
**Solution:** Dùng `player_id` chứ không phải `playerId`
```typescript
await tx.playerProvince.deleteMany({
  where: { player_id: playerId } // ✅ Correct
});
```

### **Issue 3: Mutation timeout**

**Cause:** Transaction quá lớn  
**Solution:** Tăng timeout hoặc xóa từng batch
```typescript
await this.prisma.$transaction(async (tx) => {
  // Delete operations...
}, {
  timeout: 30000, // 30 seconds
});
```

## 📁 Files Modified

1. **frontend/lib/graphqlApiClient.ts**
   - Removed `refetchQueries`
   - Added `await apolloClient.clearStore()`
   - Added comments explaining why

2. **frontend/components/SettingsPanel.tsx**
   - Added `isResetting` state
   - Improved order: reset → clear cache → clear storage → logout → reload
   - Changed to `window.location.replace('/')` for hard reload
   - Added loading state to button

3. **backend/scripts/verify-player-reset.sql** (NEW)
   - SQL queries to verify reset worked

4. **backend/scripts/test-reset-player.sh** (NEW)
   - Bash script to test mutation via curl

## 🎯 Prevention

**Code Review Checklist:**
- [ ] Mutation không refetch queries nếu sẽ reload page
- [ ] Clear cache TRƯỚC khi redirect
- [ ] Hard reload (`window.location.replace`) cho operation lớn
- [ ] Test với database thật, không chỉ mock
- [ ] Verify backend logs để đảm bảo transaction succeeded
- [ ] Test error cases (network error, auth error)

---

**Status:** ✅ Fixed  
**Last Updated:** 31/10/2025  
**Tested:** Backend + Frontend + Database
