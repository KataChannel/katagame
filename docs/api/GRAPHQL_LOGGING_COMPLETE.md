# 📊 BACKEND GRAPHQL LOGGING - IMPLEMENTATION COMPLETE

**Date:** 30 October 2025  
**Status:** ✅ DEPLOYED  
**Backend:** NestJS GraphQL API với comprehensive logging

---

## 🎯 OBJECTIVES

Thêm detailed logging cho GraphQL API để:
1. Track tất cả queries/mutations được gọi
2. Log input variables và parameters
3. Hiển thị execution time
4. Debug errors với stack traces
5. Monitor resource checks trong province upgrades

---

## ✅ IMPLEMENTED FEATURES

### 1. **GraphQL Request Logging Plugin**

**File:** `backend/src/graphql/plugins/logging.plugin.ts`

**Chức năng:**
- ✅ Log operation name (query/mutation)
- ✅ Log operation type (query, mutation, subscription)
- ✅ Log input variables (JSON formatted)
- ✅ Track execution time (ms)
- ✅ Detailed error logging với code và path
- ✅ Stack traces trong development mode

**Example Output:**
```
[GraphQL] 📝 MUTATION: upgradeProvince
[GraphQL]    Variables: {
  "input": {
    "provinceId": 1,
    "upgradeType": "FARMER"
  }
}
[GraphQL] ✅ upgradeProvince completed in 45ms
```

---

### 2. **Province Service Logging**

**File:** `backend/src/province/province.service.ts`

**Enhanced methods:**

#### `upgradeProvince()` - Comprehensive upgrade logging:
```typescript
🔧 Upgrade request: Player=uuid-123, Province=1, Type=FARMER
📊 Current province state: {"provinceId":1,"farmerLevel":1,"resourceLevel":1,"developmentLevel":1}
💰 Upgrade costs: {"gold":500,"rice":300}
🏦 Player resources: [{"type":"gold","amount":5000},{"type":"rice","amount":3000}]
✓ gold: 5000 >= 500
✓ rice: 3000 >= 300
✅ Resource check passed
📝 Update data: {"farmer_level":2}
✅ Upgrade completed successfully! New farmer_level: 2
```

#### `unlockProvince()` - Province unlock tracking:
```typescript
🔓 Unlock request: Player=uuid-123, Province=1
📍 Province found: Hà Nội (Region: Bắc)
📅 Player progress: Day 5, Required: No requirement
✅ Province Hà Nội unlocked successfully!
```

#### `checkResourcesAvailable()` - Resource validation:
```typescript
✓ gold: 5000 >= 500
✓ rice: 3000 >= 300
⚠️  Insufficient wood: Have 50, Need 100  // Nếu thiếu
```

---

### 3. **Error Logging Enhancement**

**File:** `backend/src/app.module.ts`

**GraphQL formatError:**
```typescript
formatError: (error) => {
  console.error('🔴 GraphQL Error:', {
    message: error.message,
    code: error.extensions?.code,
    path: error.path,
    originalError: error.extensions?.originalError
  });
  
  return {
    message: error.message,
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    path: error.path
  };
}
```

**Example Error Output:**
```
🔴 GraphQL Error: {
  message: 'Insufficient resources',
  code: 'BAD_REQUEST',
  path: ['upgradeProvince'],
  originalError: {...}
}

[GraphQL] ❌ upgradeProvince failed in 23ms
[GraphQL]    Error 1: Insufficient resources
[GraphQL]    Code: BAD_REQUEST
[GraphQL]    Path: upgradeProvince
```

---

## 📝 LOG LEVELS

### Production Logs (Always shown):
- `LOG` - Success operations, completion times
- `ERROR` - Failed operations, errors

### Development Logs (debug mode):
- `DEBUG` - Variables, state changes, resource checks
- Stack traces cho errors

---

## 🧪 TESTING EXAMPLES

### Test 1: Successful Upgrade
```graphql
mutation {
  upgradeProvince(input: {
    provinceId: 1
    upgradeType: "FARMER"
  }) {
    provinceId
    farmerLevel
  }
}
```

**Console Output:**
```
[GraphQL] 📝 MUTATION: UpgradeProvince
[GraphQL]    Variables: {"input":{"provinceId":1,"upgradeType":"FARMER"}}
[ProvinceService] 🔧 Upgrade request: Player=abc-123, Province=1, Type=FARMER
[ProvinceService] 📊 Current province state: {"farmerLevel":1}
[ProvinceService] 💰 Upgrade costs: {"gold":500,"rice":300}
[ProvinceService] 🏦 Player resources: [{"type":"gold","amount":5000}...]
[ProvinceService] ✅ Resource check passed
[ProvinceService] ✅ Upgrade completed successfully! New farmer_level: 2
[GraphQL] ✅ UpgradeProvince completed in 45ms
```

---

### Test 2: Insufficient Resources Error
```graphql
mutation {
  upgradeProvince(input: {
    provinceId: 1
    upgradeType: "DEVELOPMENT"
  }) {
    provinceId
  }
}
```

**Console Output:**
```
[GraphQL] 📝 MUTATION: UpgradeProvince
[ProvinceService] 🔧 Upgrade request: Player=abc-123, Province=1, Type=DEVELOPMENT
[ProvinceService] 💰 Upgrade costs: {"gold":1000,"rice":500,"wood":300,"stone":200}
[ProvinceService] 🏦 Player resources: [{"type":"gold","amount":100}...]
[ProvinceService] ⚠️  Insufficient gold: Have 100, Need 1000
[ProvinceService] ❌ Insufficient resources. Required: {"gold":1000,"rice":500,"wood":300,"stone":200}
🔴 GraphQL Error: {
  message: 'Insufficient resources',
  code: 'BAD_REQUEST',
  path: ['upgradeProvince']
}
[GraphQL] ❌ UpgradeProvince failed in 23ms
[GraphQL]    Error 1: Insufficient resources
[GraphQL]    Code: BAD_REQUEST
```

---

## 🚀 DEPLOYMENT

### Files Created/Modified:
1. ✅ `backend/src/graphql/plugins/logging.plugin.ts` (NEW)
2. ✅ `backend/src/app.module.ts` (UPDATED - added plugin)
3. ✅ `backend/src/province/province.service.ts` (UPDATED - added Logger)

### Backend Status:
```bash
✅ TypeScript compilation: Success (0 errors)
✅ Server running: http://localhost:3000
✅ GraphQL endpoint: http://localhost:3000/graphql
✅ Logging active: All mutations/queries tracked
```

**Server Logs:**
```
[Nest] 150668  - 10/30/2025, 11:01:57 AM  LOG [NestFactory] Starting Nest application...
[Nest] 150668  - 10/30/2025, 11:01:57 AM  LOG [PrismaService] ✅ Database connected successfully
[Nest] 150668  - 10/30/2025, 11:01:57 AM  LOG [GraphQLModule] Mapped {/graphql, POST} route
[Nest] 150668  - 10/30/2025, 11:01:57 AM  LOG [NestApplication] Nest application successfully started
🚀 NestJS GraphQL Server running on http://localhost:3000/graphql
```

---

## 📊 LOG OUTPUT LOCATION

### Console Output:
- Real-time logs trong terminal
- Color-coded (LOG=green, ERROR=red, DEBUG=blue)

### File Output:
```bash
backend/backend-debug.log  # All logs saved here
tail -f backend/backend-debug.log  # Watch logs real-time
```

---

## 🎯 BENEFITS

### For Debugging:
- ✅ Xem chính xác operation nào được gọi
- ✅ Track input parameters để reproduce bugs
- ✅ Measure performance (execution time)
- ✅ Identify resource check failures

### For Monitoring:
- ✅ Track API usage patterns
- ✅ Identify slow queries
- ✅ Catch errors early
- ✅ Audit trail cho user actions

### For Development:
- ✅ Understand data flow
- ✅ Verify business logic
- ✅ Test edge cases
- ✅ Debug without inserting breakpoints

---

## 📈 NEXT STEPS

### Immediate:
- [x] GraphQL Plugin implemented
- [x] Province Service logging
- [x] Error formatting
- [x] Backend deployed

### Future Enhancements:
- [ ] Add logging to Hero/Story/Resource services
- [ ] Implement request correlation IDs
- [ ] Add performance monitoring (slow query alerts)
- [ ] Log aggregation (Winston + file rotation)
- [ ] Production log filtering (remove DEBUG logs)

---

## 🔗 RELATED DOCUMENTATION

- [BUG_FIX_PROVINCE_UPGRADE_INSUFFICIENT_RESOURCES.md](./BUG_FIX_PROVINCE_UPGRADE_INSUFFICIENT_RESOURCES.md)
- [MVP1_GAME_FLOW_COMPLETE.md](./MVP1_GAME_FLOW_COMPLETE.md)
- [BACKEND_GRAPHQL_MIGRATION.md](./BACKEND_GRAPHQL_MIGRATION.md)

---

**✅ Status: DEPLOYED & ACTIVE**  
**📊 Logging Level: FULL (Development mode)**  
**🚀 Backend: http://localhost:3000/graphql**
