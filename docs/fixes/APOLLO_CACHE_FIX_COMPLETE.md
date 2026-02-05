# ✅ FIX: Frontend không update sau upgrade Province

## 🔍 Root Cause
Component nhận `province` từ props (Zustand store), nhưng Apollo refetch chỉ update Apollo cache, KHÔNG update Zustand store → UI không re-render.

## ✅ Solution

### 1. **GraphQL Mutations - Refetch Queries**
```typescript
// graphqlApiClient.ts
upgradeProvince(provinceId, upgradeType) {
  apolloClient.mutate({
    mutation: UPGRADE_PROVINCE,
    refetchQueries: [
      { query: GET_MY_PROVINCES },
      { query: GET_MY_PROVINCE, variables: { provinceId } },
      { query: GET_MY_RESOURCES },
    ],
    awaitRefetchQueries: true, // Wait for refetch
  });
}
```

### 2. **Components - Local State Update**
```typescript
// ProvinceCard.tsx & MobileProvinceCard.tsx
const [province, setProvince] = useState(initialProvince);

// Update local state khi nhận data mới từ mutation
const response = await MVP1ApiClient.upgradeFarmer(provinceId);
if (response?.success && response.data) {
  setProvince(response.data); // ← Instant UI update
}
```

## 📊 Flow

```
User clicks "Nâng cấp" 
  ↓
GraphQL Mutation (upgradeProvince)
  ↓
Backend processes & returns new data
  ↓
Apollo refetches queries (background)
  ↓
Component updates local state (instant)
  ↓
UI re-renders với data mới ✅
```

## 🎯 Benefits

- ✅ **Instant UI feedback** - Local state update ngay lập tức
- ✅ **Apollo cache sync** - RefetchQueries đảm bảo consistency
- ✅ **No manual Zustand updates** - Cleaner code
- ✅ **Works với GraphQL** - Proper Apollo Client pattern

## 📝 Files Updated

1. **graphqlApiClient.ts** - Added refetchQueries to all mutations
2. **ProvinceCard.tsx** - Local state + useEffect
3. **MobileProvinceCard.tsx** - Local state + useEffect

## 🚀 Test

```bash
1. Click "Nâng cấp Nông dân" → farmerLevel tăng (instant)
2. Click "Nâng cấp Tài nguyên" → resourceLevel tăng (instant)
3. Resources giảm theo cost
4. UI update KHÔNG cần refresh page
```

**Status:** ✅ DEPLOYED
