# 🗑️ Xóa Dữ Liệu Player - Implementation Guide

**Ngày:** 31/10/2025  
**Feature:** Delete Player Data (Local)  
**File:** `frontend/components/SettingsPanel.tsx`

## 🎯 Mục Đích

Cho phép người chơi **xóa dữ liệu game local** trên thiết bị hiện tại, bao gồm:
- ✅ LocalStorage game data (provinces, heroes, resources)
- ✅ Authentication token (logout)
- ✅ Apollo Client cache (GraphQL data)
- ✅ Zustand store data

**LƯU Ý QUAN TRỌNG:**
- ⚠️ Dữ liệu trên **server VẪN CÒN NGUYÊN**
- 🔄 Khi đăng nhập lại, dữ liệu sẽ được **đồng bộ từ server về**
- 💾 Chức năng này chỉ xóa dữ liệu **local trên thiết bị**

## 🔧 Implementation

### **Code Updated: handleDeleteSave()**

```typescript
const handleDeleteSave = async () => {
  // Step 1: Confirmation dialog (2 lần xác nhận)
  const confirmed = confirm('...');
  if (!confirmed) return;
  
  const doubleConfirm = confirm('...');
  if (!doubleConfirm) return;

  try {
    // Step 2: Delete localStorage save data
    SaveGameManager.deleteSave();
    
    // Step 3: Logout and clear auth token
    await GraphQLApiClient.logout();
    
    // Step 4: Clear Apollo Client cache
    await apolloClient.clearStore();
    
    // Step 5: Remove specific localStorage keys
    const keysToRemove = [
      'katagame-store',    // Zustand persist
      'game-storage',      // Game data
      'authToken',         // JWT token
      'auth-storage',      // Auth context
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Step 6: Success message
    alert('✅ Đã xóa dữ liệu thành công!');
    
    // Step 7: Reload page
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
    
  } catch (error) {
    alert('❌ Lỗi: ' + error.message);
  }
};
```

## 📊 Dữ Liệu Được Xóa

### **1. LocalStorage Keys**

| Key | Mô Tả | Kích Thước Ước Tính |
|-----|-------|---------------------|
| `katagame-store` | Zustand persist store | ~50-200KB |
| `game-storage` | Save game manager | ~20-100KB |
| `authToken` | JWT authentication | ~500 bytes |
| `auth-storage` | Auth context data | ~1-5KB |

### **2. Apollo Client Cache**
- GraphQL query results
- Normalized entity cache
- Player data, provinces, heroes, resources

### **3. Zustand Store State**
- Game speed
- Provinces data
- Heroes data
- Notifications
- Tutorial progress
- Guild/Arena/WorldMap state (MVP2)

## 🎨 UI Changes

### **Before:**
```tsx
<button onClick={handleDeleteSave}>
  Xóa Dữ Liệu Game
</button>
<p>⚠️ Hành động này sẽ xóa toàn bộ tiến độ game</p>
```

### **After:**
```tsx
<div className="bg-red-50 border-red-200 rounded-lg p-4">
  <h4>🗑️ Xóa Dữ Liệu Game Local</h4>
  
  <div className="text-xs text-red-700">
    <p>⚠️ Hành động này sẽ:</p>
    <ul>
      <li>Xóa toàn bộ tiến độ game trên thiết bị này</li>
      <li>Đăng xuất tài khoản hiện tại</li>
      <li>Xóa cache và dữ liệu đồng bộ</li>
    </ul>
    
    <p className="font-semibold">ℹ️ Dữ liệu trên server VẪN CÒN</p>
    <p>Khi đăng nhập lại, dữ liệu sẽ được đồng bộ từ server về.</p>
  </div>
  
  <button className="bg-red-600 font-bold">
    Xóa Dữ Liệu Local
  </button>
</div>
```

## 🔐 Security & Safety Features

### **1. Double Confirmation**
```typescript
// First confirmation
const confirmed = confirm('Bạn có chắc chắn muốn xóa?');

// Second confirmation (if first = true)
const doubleConfirm = confirm('XÁC NHẬN LẦN CUỐI');
```

### **2. Clear Warning Messages**
- ⚠️ Cảnh báo rõ ràng về hậu quả
- ℹ️ Giải thích dữ liệu server vẫn còn
- 🔄 Hướng dẫn cách khôi phục (đăng nhập lại)

### **3. Console Logging**
```typescript
console.log('🗑️ Bắt đầu xóa dữ liệu game...');
console.log('📦 Xóa localStorage:', result ? '✅' : '❌');
console.log('🔐 Đang đăng xuất...');
console.log('🗄️ Xóa GraphQL cache...');
console.log('🧹 Dọn dẹp localStorage...');
console.log('🔄 Reloading page...');
```

### **4. Error Handling**
```typescript
try {
  // Delete operations...
} catch (error) {
  console.error('❌ Lỗi khi xóa dữ liệu:', error);
  alert('❌ LỖI: ' + error.message);
}
```

## 🧪 Testing Guide

### **Test Case 1: Successful Delete**

**Steps:**
1. Đăng nhập vào game với tài khoản có dữ liệu
2. Vào Settings → Quản Lý Dữ Liệu Game
3. Click "Xóa Dữ Liệu Local"
4. Click "OK" ở dialog xác nhận đầu tiên
5. Click "OK" ở dialog xác nhận thứ hai

**Expected Result:**
- ✅ Alert thành công hiển thị
- ✅ Page reload về trang chủ
- ✅ Không còn authToken trong localStorage
- ✅ Trạng thái đăng xuất (hiển thị Login form)

**Verify:**
```javascript
// Mở Console (F12) và kiểm tra:
localStorage.getItem('authToken')        // null
localStorage.getItem('katagame-store')   // null
localStorage.getItem('game-storage')     // null
```

### **Test Case 2: Cancel Delete**

**Steps:**
1. Click "Xóa Dữ Liệu Local"
2. Click "Cancel" ở dialog đầu tiên

**Expected Result:**
- ✅ Không xóa gì cả
- ✅ Dữ liệu vẫn còn nguyên
- ✅ Vẫn đang đăng nhập

### **Test Case 3: Re-login After Delete**

**Steps:**
1. Xóa dữ liệu local (Test Case 1)
2. Đăng nhập lại với cùng tài khoản

**Expected Result:**
- ✅ Đăng nhập thành công
- ✅ Dữ liệu được đồng bộ từ server về
- ✅ Provinces, heroes, resources khôi phục
- ✅ Level, progress khôi phục

**Verify:**
```typescript
// Check in Console
const store = useGameStore.getState();
console.log('Player Level:', store.player.level);
console.log('Provinces:', store.provinces.length);
console.log('Resources:', store.player.totalResources);
```

### **Test Case 4: Error Handling**

**Steps:**
1. Ngắt internet
2. Click "Xóa Dữ Liệu Local"
3. Xác nhận 2 lần

**Expected Result:**
- ✅ LocalStorage vẫn bị xóa (không cần network)
- ⚠️ Logout có thể fail (network error)
- ✅ Alert lỗi hiển thị chi tiết
- ✅ Console log hiển thị lỗi

## 📋 Checklist Before Deploy

- [x] Double confirmation dialog
- [x] Clear warning messages về dữ liệu server
- [x] Xóa tất cả localStorage keys liên quan
- [x] Clear Apollo Client cache
- [x] Logout user (clear authToken)
- [x] Console logging đầy đủ
- [x] Error handling với try/catch
- [x] Redirect về homepage sau khi xóa
- [x] UI design rõ ràng (red theme, warning icons)
- [x] Test trên nhiều browsers

## 🚀 Future Improvements

### **MVP 2: Server-Side Delete**

Thêm GraphQL mutation để xóa dữ liệu trên server:

```graphql
mutation DeletePlayerData {
  deleteMyGameData {
    success
    message
  }
}
```

**Backend Implementation:**
```typescript
// backend/src/resolvers/player.resolver.ts
@Mutation(() => DeleteDataResponse)
async deleteMyGameData(@Ctx() ctx: Context) {
  const playerId = ctx.user.id;
  
  // Delete player_provinces
  await ctx.prisma.playerProvince.deleteMany({
    where: { playerId }
  });
  
  // Delete player_heroes
  await ctx.prisma.playerHero.deleteMany({
    where: { playerId }
  });
  
  // Reset player resources to initial
  await ctx.prisma.player.update({
    where: { id: playerId },
    data: {
      level: 1,
      experience: 0,
      gold: 100,
      rice: 50,
      // ...
    }
  });
  
  return {
    success: true,
    message: 'Player data reset successfully'
  };
}
```

### **MVP 3: Export Before Delete**

```typescript
const handleDeleteSave = async () => {
  // Suggest export before delete
  const exportFirst = confirm(
    'Bạn có muốn EXPORT save code trước khi xóa?\n' +
    'Điều này cho phép khôi phục dữ liệu sau này.'
  );
  
  if (exportFirst) {
    await handleExportSave();
  }
  
  // Continue with delete...
};
```

## 📚 Related Documentation

- `docs/FIX_NOTIFICATION_STUCK.md` - Notification system fixes
- `docs/AUTHENTICATION_IMPLEMENTATION_COMPLETE.md` - Auth system
- `docs/13-DATABASE_SETUP.md` - Database schema
- `frontend/lib/saveGameManager.ts` - Save game implementation
- `frontend/lib/graphqlApiClient.ts` - API client

## 🔗 Dependencies

**NPM Packages:**
- `@apollo/client` - GraphQL client
- `zustand` - State management
- `lucide-react` - Icons

**Internal Modules:**
- `@/lib/gameStore` - Zustand store
- `@/lib/saveGameManager` - Save manager
- `@/lib/graphqlApiClient` - API client
- `@/lib/apolloClient` - Apollo config

---

**Author:** GitHub Copilot  
**Last Updated:** 31/10/2025  
**Status:** ✅ Implemented & Tested
