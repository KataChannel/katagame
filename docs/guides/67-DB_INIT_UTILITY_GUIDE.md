# 🛠️ Database Initialization Utility Guide

## Overview

Created a reusable utility module at `/motia/src/utils/db-init.util.ts` to help all endpoints properly initialize the database and services.

## Three Main Functions

### 1. ensureDatabaseInitialized()

Initializes only the database with error handling.

**Usage:**
```typescript
import { ensureDatabaseInitialized } from '../../src/utils/db-init.util'

export const handler = async (request: any) => {
  try {
    // Initialize database
    const dbError = await ensureDatabaseInitialized()
    if (dbError) {
      return dbError  // Returns error response if initialization fails
    }

    // Database is now ready, proceed with business logic
    // ...
  } catch (error) {
    return errorResponse(500, 'Unexpected error')
  }
}
```

**Returns:**
- `null` if successful
- Error response object if failed

---

### 2. initializeServices()

Initializes auth and player services after database is ready.

**Usage:**
```typescript
import { initializeServices } from '../../src/utils/db-init.util'

const result = await initializeServices()

if (result.error) {
  return result.error  // Service initialization failed
}

const { authService, playerService } = result
// Use services here
```

**Returns:**
```typescript
{
  authService?: AuthenticationService,
  playerService?: PlayerService,
  error?: ErrorResponse  // Only if something went wrong
}
```

---

### 3. initializeDatabaseAndServices() ⭐ RECOMMENDED

Complete initialization in one call - database first, then services.

**Usage:**
```typescript
import { initializeDatabaseAndServices } from '../../src/utils/db-init.util'

export const handler = async (request: any) => {
  try {
    // Initialize everything in one call
    const { authService, playerService, error } = await initializeDatabaseAndServices()
    
    // Check for errors
    if (error) {
      return error  // Returns error response immediately
    }

    // Now use services
    const decoded = authService.verifyToken(token)
    const player = await playerService.getPlayer(playerId)
    
    return successResponse(player, 'Player data retrieved')
  } catch (error) {
    return errorResponse(500, 'Unexpected error')
  }
}
```

**Returns:**
```typescript
{
  authService?: AuthenticationService,
  playerService?: PlayerService,
  error?: ErrorResponse  // Only set if something failed
}
```

---

## Recommended Usage Pattern for Game Endpoints

```typescript
import { initializeDatabaseAndServices } from '../../src/utils/db-init.util'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'
import { ApiLogger } from '../../src/api.utils'

export const handler = async (request: any) => {
  try {
    // Get authorization token
    const authHeader = request.headers?.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(401, 'No token provided')
    }

    // Initialize database and services
    const { authService, playerService, error } = await initializeDatabaseAndServices()
    if (error) return error

    // Verify token
    const token = authHeader.substring(7)
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return errorResponse(401, 'Invalid token')
    }

    // Do business logic
    const player = await playerService.getPlayer(decoded.playerId)
    if (!player) {
      return errorResponse(404, 'Player not found')
    }

    // Return success
    return successResponse(player, 'Operation successful')
  } catch (error) {
    ApiLogger.error('Handler error', error)
    return errorResponse(500, 'Internal server error')
  }
}
```

---

## Endpoints to Update

These endpoints need to use the new utility:

**Priority High** (Have getPlayerService import):
- ✅ `auth-login.step.ts` - Already fixed manually
- ✅ `auth-register.step.ts` - Already fixed manually
- `player-update.step.ts`
- `player-profile.step.ts`
- `player-profile-public.step.ts`

**Priority Medium** (Battle endpoints):
- `battle-start.step.ts`
- `battle-resolve.step.ts`

**Priority Medium** (Resource endpoints):
- `resource-harvest.step.ts`
- `resource-trade.step.ts`

**Priority Low** (Other endpoints):
- `save-game-sync.step.ts`
- `hero-recruit.step.ts`
- `hero-list.step.ts`
- `achievement-list.step.ts`

---

## Step-by-Step Implementation

For each game endpoint:

### Step 1: Add imports
```typescript
import { initializeDatabaseAndServices } from '../../src/utils/db-init.util'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'
```

### Step 2: Initialize at handler start
```typescript
export const handler = async (request: any) => {
  try {
    const { authService, playerService, error } = await initializeDatabaseAndServices()
    if (error) return error
    
    // Rest of handler...
  } catch (error) {
    return errorResponse(500, 'Error message')
  }
}
```

### Step 3: Use services
```typescript
const player = await playerService.getPlayer(playerId)
const token = authService.generateToken(playerId, username)
```

### Step 4: Return standardized responses
```typescript
return successResponse(data, 'Success message')
// or
return errorResponse(status, 'Error message')
```

---

## Error Handling Hierarchy

```
Error Occurs
    ↓
Database Initialization? → Error → return errorResponse(500, 'Database init failed')
    ↓ No
Service Initialization? → Error → return errorResponse(500, 'Service init failed')
    ↓ No
Authorization Check? → Error → return errorResponse(401, 'Invalid token')
    ↓ No
Validation? → Error → return errorResponse(400, 'Validation failed')
    ↓ No
Database Operation? → Error → return errorResponse(500, 'Operation failed')
    ↓ No
Success → return successResponse(data, 'Success message')
```

---

## Logging

The utility module automatically logs errors using `ApiLogger`:

```typescript
// Logged automatically:
ApiLogger.error('Database initialization error', dbError)
ApiLogger.error('Service initialization error', serviceError)
```

## Configuration

The utility uses environment variables:

```typescript
const databaseUrl = process.env.DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:11003/katagame'
```

Ensure `.env.local` has:
```
DATABASE_URL=postgresql://username:password@host:5432/katagame
```

---

## Benefits

✅ **Consistency** - All endpoints use same pattern
✅ **DRY** - No repeated initialization code
✅ **Error Handling** - Centralized error management
✅ **Logging** - Automatic error logging
✅ **Maintainability** - Easy to update in one place
✅ **Testing** - Single point to test initialization logic

---

## Testing the Utility

```typescript
// Test 1: Successful initialization
const { authService, playerService, error } = await initializeDatabaseAndServices()
expect(error).toBeNull()
expect(authService).toBeDefined()
expect(playerService).toBeDefined()

// Test 2: Failed database initialization (with invalid URL)
process.env.DATABASE_URL = 'invalid://url'
const result = await initializeDatabaseAndServices()
expect(result.error).toBeDefined()
expect(result.error.body.success).toBe(false)
```

---

**This utility is production-ready and available for all endpoints! 🚀**
