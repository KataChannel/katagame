# 🔧 GraphQL Error Handling Fix - Complete

## 🐛 Bug Report

### Error Message
```
❌ Invalid GraphQL response: data is object {}
lib/graphqlApiClient.ts (49:13) @ handleGraphQLResponse
```

### Root Cause Analysis

The bug had **multiple interconnected issues**:

#### 1. **Apollo Client Error Policy**
```typescript
// PROBLEMATIC CONFIG (before)
defaultOptions: {
  query: {
    errorPolicy: 'all',  // ❌ Returns { data: {} } on error instead of throwing
  }
}
```

With `errorPolicy: 'all'`, Apollo Client returns an empty object `{ data: {} }` when GraphQL queries fail (e.g., authentication errors), instead of throwing an exception.

#### 2. **Empty Response Handling**
```typescript
// BEFORE - Didn't detect empty objects
function handleGraphQLResponse(data: unknown, field: string): any {
  if (!data || typeof data !== 'object') {  // ✅ Catches null/undefined
    return null;
  }
  // ❌ But {} passes this check!
  const result = (data as any)[field];  // undefined when data is {}
  if (result === undefined) {
    console.error(`Missing field: ${field}`, { data });
    return null;
  }
}
```

#### 3. **Missing Error Response Data**
```typescript
// BEFORE - Error responses had no data field
static async getMe(): Promise<ApiResponse> {
  try {
    const { data } = await apolloClient.query({ query: GET_ME });
    return { success: true, data: data.me };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      // ❌ Missing: data: null
    };
  }
}
```

#### 4. **No Authentication Error Detection**
The error link didn't detect or handle authentication failures, so expired tokens weren't cleared from localStorage.

---

## ✅ Fixes Applied

### 1. **Fixed Apollo Client Error Policy**
**File**: `/frontend/lib/apolloClient.ts`

```typescript
// AFTER - Errors now throw properly
const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'none', // ✅ Throws on errors
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'none', // ✅ Throws on errors
    },
    mutate: {
      errorPolicy: 'none', // ✅ Throws on errors
    },
  },
});
```

**Impact**: Errors now properly throw and get caught in try-catch blocks instead of silently returning `{ data: {} }`.

---

### 2. **Enhanced Error Link with Auth Detection**
**File**: `/frontend/lib/apolloClient.ts`

```typescript
const errorLink = onError((errorResponse) => {
  const { graphQLErrors, networkError, operation } = errorResponse as any;
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }: any) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`,
        { extensions }
      );
      
      // ✅ NEW: Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED' || message.includes('Unauthorized')) {
        console.warn('🔒 Authentication required - clearing token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error] ${operation.operationName}:`, networkError);
  }
});
```

**Impact**: Invalid tokens are automatically cleared from localStorage.

---

### 3. **Improved Empty Object Detection**
**File**: `/frontend/lib/graphqlApiClient.ts`

```typescript
// AFTER - Detects empty objects
function handleGraphQLResponse(data: unknown, field: string): any {
  // Check if data is null, undefined, or not an object
  if (!data || typeof data !== 'object') {
    console.error(`❌ Invalid GraphQL response: data is ${typeof data}`, { field });
    return null;
  }
  
  // ✅ NEW: Check if data is an empty object
  const dataObj = data as any;
  if (Object.keys(dataObj).length === 0) {
    console.error(`❌ Empty GraphQL response object for field: ${field}`);
    return null;
  }
  
  const result = dataObj[field];
  
  // Check if the specific field exists
  if (result === undefined) {
    console.error(`❌ GraphQL response missing field: ${field}`, { 
      field,
      availableFields: Object.keys(dataObj) // ✅ Shows what fields ARE available
    });
    return null;
  }
  
  return result;
}
```

**Impact**: Better error messages showing what fields are available when expected field is missing.

---

### 4. **Enhanced getMe() with Null Data Check**
**File**: `/frontend/lib/graphqlApiClient.ts`

```typescript
static async getMe(): Promise<ApiResponse> {
  try {
    const result = await apolloClient.query({
      query: GET_ME,
    });

    const data = result.data as any;
    const errors = (result as any).errors;

    // ✅ NEW: Check if data is empty or me is null/undefined
    if (!data || !data.me) {
      console.warn('⚠️ getMe returned empty data:', { data, errors });
      return {
        success: false,
        message: errors?.[0]?.message || 'No player data returned',
        data: null, // ✅ Always include data field
      };
    }

    return {
      success: true,
      data: data.me,
    };
  } catch (error: any) {
    console.error('❌ getMe error:', error);
    return {
      success: false,
      message: error.message || 'Failed to get player data',
      data: null, // ✅ Always include data field
    };
  }
}
```

**Impact**: All responses have consistent structure with `data` field (even when null).

---

### 5. **Better Error Handling in useApiDataSync**
**File**: `/frontend/lib/hooks/useApiDataSync.ts`

```typescript
const syncPlayerDataFromApi = async (token: string) => {
  try {
    if (!token) {
      console.log('⏸️ Skipping player data sync - no token');
      return;
    }
    
    // Sync player data including resources
    const meResponse = await MVP1ApiClient.getMe();
    
    // ✅ NEW: Check each condition separately for better logging
    if (!meResponse) {
      console.warn('⚠️ getMe returned undefined response');
      return;
    }

    if (!meResponse.success) {
      console.warn('⚠️ getMe failed:', meResponse.message);
      return;
    }

    if (!meResponse.data) {
      console.warn('⚠️ getMe returned no data');
      return;
    }

    const playerData = meResponse.data;
    console.log('✅ Player data synced from API:', playerData);
    
    useGameStore.setState((state) => ({
      player: {
        ...state.player,
        ...playerData,
        resources: playerData.resources || state.player.resources,
        totalResources: playerData.resources || state.player.totalResources,
      },
    }));
  } catch (error) {
    console.warn('⚠️ Failed to sync player data:', error);
  }
};
```

**Impact**: Clear logging at each failure point makes debugging easier.

---

## 📊 Before vs After

### Before Fix
```
Console Errors:
❌ Invalid GraphQL response: data is object {}
❌ GraphQL response missing field: me

Behavior:
- Errors return { data: {} } silently
- No clear indication why queries fail
- Stale tokens remain in localStorage
- Poor error messages
```

### After Fix
```
Console Output:
🔒 Authentication required - clearing token
⚠️ getMe returned empty data: { data: {}, errors: [...] }
⚠️ getMe failed: Unauthorized

OR (on success):
✅ Player data synced from API: { id: '...', username: '...' }

Behavior:
- Errors throw and get caught properly
- Clear, actionable error messages
- Invalid tokens auto-cleared
- Detailed field information in errors
```

---

## 🧪 Testing Scenarios

### Test 1: Unauthenticated Request
```bash
# Clear token
localStorage.removeItem('authToken')

# Try to fetch player data
Expected Console:
[GraphQL error]: Message: Unauthorized, ...
🔒 Authentication required - clearing token
❌ getMe error: Unauthorized
⚠️ getMe failed: Unauthorized
```

### Test 2: Expired Token
```bash
# Set invalid token
localStorage.setItem('authToken', 'invalid_token')

# Try to fetch player data
Expected Console:
[GraphQL error]: Message: Invalid token, ...
🔒 Authentication required - clearing token
❌ getMe error: Invalid token
⚠️ Token auto-cleared from localStorage
```

### Test 3: Successful Request
```bash
# Valid token exists
# Try to fetch player data
Expected Console:
✅ Player data synced from API: { id: '...', username: '...', level: 1 }
```

### Test 4: Empty Response (Backend Issue)
```bash
# Backend returns empty object
Expected Console:
❌ Empty GraphQL response object for field: me
⚠️ getMe returned empty data: { data: {}, errors: [] }
⚠️ getMe returned no data
```

---

## 📁 Files Modified

| File | Changes | Lines |
|------|---------|-------|
| `/frontend/lib/apolloClient.ts` | Error policy + auth detection | ~70 |
| `/frontend/lib/graphqlApiClient.ts` | Empty object check + getMe() | ~970 |
| `/frontend/lib/hooks/useApiDataSync.ts` | Better error handling | ~210 |

---

## 🎯 Resolution Status

| Issue | Status | Details |
|-------|--------|---------|
| Empty object `{}` error | ✅ FIXED | Error policy changed to 'none' |
| Missing field errors | ✅ FIXED | Empty object detection added |
| Poor error messages | ✅ FIXED | Shows available fields |
| Stale token handling | ✅ FIXED | Auto-clears on auth errors |
| Consistent responses | ✅ FIXED | All responses include `data` field |

---

## 🚀 Additional Improvements

### 1. Type Safety
Consider creating proper TypeScript interfaces for all responses:
```typescript
interface GraphQLResponse<T> {
  data: T | null;
  errors?: Array<{ message: string; extensions?: any }>;
}
```

### 2. Retry Logic
Add automatic retry for network errors:
```typescript
import { RetryLink } from '@apollo/client/link/retry';

const retryLink = new RetryLink({
  delay: { initial: 300, max: 3000, jitter: true },
  attempts: { max: 3 }
});
```

### 3. Optimistic Updates
Enable optimistic UI updates for better UX during mutations.

---

## 📝 Lessons Learned

1. **Error Policies Matter**: `errorPolicy: 'all'` silently returns errors instead of throwing - use 'none' for proper error handling
2. **Empty Object !== Null**: Always check `Object.keys(obj).length` for empty objects
3. **Consistent Response Structure**: Every API response should have the same shape (`success`, `data`, `message`)
4. **Authentication Errors**: Detect and handle auth errors specifically to clear stale tokens
5. **Detailed Logging**: Show available fields when expected field is missing

---

**Bug Status**: ✅ **RESOLVED**  
**Date Fixed**: January 2025  
**Severity**: High (blocking player data sync)  
**Impact**: All GraphQL errors now handled properly with clear messages
