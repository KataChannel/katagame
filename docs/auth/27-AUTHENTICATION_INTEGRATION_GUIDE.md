# Authentication Integration Guide

**Version:** 1.0  
**Date:** 2024-10-22  
**Status:** ✅ Implementation Complete (Basic Structure)

---

## 📋 Overview

This guide documents the complete authentication system integration between the **Next.js Frontend** and **Motia Backend** for the KataGame project. The system supports three authentication methods:

1. ✅ **Email/Password Registration** 
2. ✅ **Email/Password Login**
3. ⏳ **Google OAuth** (Setup required)

---

## 🏗️ Architecture

### Frontend Components

```
katagame/components/
├── AuthPage.tsx              (Main authentication UI - 355 lines)
├── GoogleSignInButton.tsx    (Google OAuth button - 90+ lines)
└── [integrated into page.tsx]
```

**State Management:**
- `isAuthenticated`: Boolean tracking auth state
- `authToken`: JWT token from backend
- `currentUser`: User data object
- `localStorage`: Persistent token storage

### Backend Services

```
motia/src/
├── services/
│   ├── auth.service.ts       (JWT & password handling - 216 lines)
│   └── player.service.ts     (Player CRUD operations - updated)
├── routes/
│   └── auth.routes.ts        (API handlers - 320+ lines, NEW)
├── api.utils.ts              (Validation & responses - updated)
└── config.ts                 (Configuration)
```

### Database

```sql
PostgreSQL Table: players
├── id (UUID, PK)
├── username (VARCHAR, UNIQUE)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── level (INTEGER, DEFAULT 1)
├── experience (INTEGER, DEFAULT 0)
├── resources (JSONB)
├── status (VARCHAR: active|banned|suspended)
└── [timestamps, metadata...]
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:11001/api/v1
```

### Authentication Endpoints

#### 1. Register (POST /auth/register)
```bash
curl -X POST http://localhost:11001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player_name",
    "email": "player@example.com",
    "password": "SecurePass123"
  }'
```

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player_name",
    "email": "player@example.com",
    "level": 1
  },
  "message": "Registration successful",
  "timestamp": 1629789600000
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Username must be 3-20 characters...",
  "timestamp": 1629789600000,
  "code": 400
}
```

---

#### 2. Login (POST /auth/login)
```bash
curl -X POST http://localhost:11001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player_name",
    "password": "SecurePass123"
  }'
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player_name",
    "level": 5,
    "experience": 25000
  },
  "message": "Login successful",
  "timestamp": 1629789600000
}
```

---

#### 3. Google OAuth (POST /auth/google)
```bash
curl -X POST http://localhost:11001/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "google_id_token_here"
  }'
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user_name",
    "email": "user@gmail.com",
    "level": 1
  },
  "message": "Google authentication successful",
  "timestamp": 1629789600000
}
```

---

#### 4. Get Current User (GET /auth/me)
```bash
curl -X GET http://localhost:11001/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player_name",
    "email": "player@example.com",
    "level": 5,
    "experience": 25000,
    "resources": {
      "gold": 5000,
      "gems": 1500,
      "culture": 250
    },
    "status": "active",
    "created_at": "2024-10-22T10:30:00Z",
    "last_login": "2024-10-22T14:30:00Z"
  },
  "message": "User info retrieved",
  "timestamp": 1629789600000
}
```

---

#### 5. Refresh Token (POST /auth/refresh)
```bash
curl -X POST http://localhost:11001/api/v1/auth/refresh \
  -H "Authorization: Bearer old_token_here"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here"
  },
  "message": "Token refreshed",
  "timestamp": 1629789600000
}
```

---

## 🔐 Security Features

### Password Hashing
- **Algorithm:** PBKDF2 with SHA-512
- **Salt:** 10-byte random salt
- **Iterations:** 100,000
- **Output:** Hex-encoded salt$hash

```typescript
// Example hash: "a3f2b1c4...$ ef8d9c2a..."
const hash = authService.hashPassword("password");
```

### JWT Token
- **Algorithm:** HS256
- **Secret:** `process.env.JWT_SECRET` (required in production)
- **Expiry:** 24 hours
- **Payload:** `{ playerId, username, iat, exp }`

### Validation Rules

**Username:**
- Length: 3-20 characters
- Pattern: Only letters, numbers, underscores
- Unique in database

**Email:**
- Format: Valid email pattern (xxx@xxx.xxx)
- Unique in database

**Password:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

---

## 🚀 Frontend Implementation

### 1. AuthPage Component

Located at: `katagame/components/AuthPage.tsx`

**Features:**
- Tab-based UI (Login/Register)
- Form validation with error messages
- Vietnamese language support
- Google OAuth integration
- Loading states
- Auto-redirect on success

**Usage:**
```tsx
<AuthPage 
  onAuthSuccess={(token, user) => {
    // Handle successful authentication
    setAuthToken(token);
    setCurrentUser(user);
  }} 
/>
```

### 2. GoogleSignInButton Component

Located at: `katagame/components/GoogleSignInButton.tsx`

**Features:**
- Google Sign-In script loading
- OAuth credential handling
- Backend integration
- Error handling

**Usage:**
```tsx
<GoogleSignInButton 
  onSuccess={(token, user) => {
    // Handle Google auth success
  }} 
/>
```

### 3. Main Page Integration

Located at: `katagame/app/page.tsx`

**Changes Made:**
- Added `isAuthenticated` state
- Added `authToken` state  
- Added `currentUser` state
- Added localStorage persistence
- Added authentication check on mount
- Added user info display
- Added logout button
- Conditional rendering (show AuthPage if not authenticated)

**Authentication Flow:**
```
App Mount
  ↓
Check localStorage for token & user
  ↓
If found → setIsAuthenticated(true)
  ↓
Render Game if authenticated, AuthPage otherwise
  ↓
On AuthPage success → setIsAuthenticated(true) + localStorage update
  ↓
On Logout → Clear localStorage + setIsAuthenticated(false)
```

---

## 🔧 Backend Implementation

### AuthenticationService

Location: `motia/src/services/auth.service.ts`

**Key Methods:**

```typescript
// Hash password
hashPassword(password: string): string

// Verify password
verifyPassword(password: string, hash: string): boolean

// Generate JWT token
generateToken(playerId: string, username: string): string

// Verify JWT token
verifyToken(token: string): { playerId, username } | null

// Register new player
register(username, email, password): { token, playerId }

// Login player
login(username, password): { token, playerId }

// Refresh token
refreshToken(token: string): string | null

// Validate token
validateToken(token: string): boolean
```

### PlayerService Enhancements

Location: `motia/src/services/player.service.ts`

**New Methods Added:**
```typescript
// Get player by email
async getPlayerByEmail(email: string): Promise<Player | null>

// Existing methods enhanced
createPlayer(username, email, passwordHash): Promise<Player>
getPlayerByUsername(username): Promise<Player | null>
updateLastLogin(playerId): Promise<Player>
```

### Auth Routes

Location: `motia/src/routes/auth.routes.ts` (NEW - 320+ lines)

**Handler Functions:**
- `registerHandler()` - Register new user
- `loginHandler()` - Login user
- `googleAuthHandler()` - Google OAuth
- `refreshTokenHandler()` - Refresh token
- `getMeHandler()` - Get current user

**Validation:**
- Input validation with `Validators` utility
- Error responses with proper HTTP codes
- Comprehensive logging

---

## 🗄️ Database Setup

### Table: players

Already exists in `katagame_database_schema.sql`

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  resources JSONB DEFAULT '{...}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW(),
  ...
);
```

**Indexes Created:**
- `idx_players_username` - For login lookups
- `idx_players_email` - For email verification
- `idx_players_status` - For filtering active players
- `idx_players_level` - For leaderboard sorting
- `idx_players_total_power` - For power calculations

---

## 📦 Environment Configuration

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Backend (.env or .env.local)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/katagame

# JWT
JWT_SECRET=your-secret-key-change-in-prod
JWT_EXPIRY=24h

# Server
PORT=11001
HOST=0.0.0.0

# Logging
LOG_LEVEL=info
MOTIA_LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:11000
```

---

## ✅ Implementation Checklist

### ✅ Completed

- [x] AuthenticationService created (JWT + password hashing)
- [x] PlayerService with auth methods
- [x] AuthPage component (login/register UI)
- [x] GoogleSignInButton component
- [x] Frontend page.tsx integration
- [x] Auth routes/handlers created
- [x] API response wrapper utilities
- [x] Validation utilities
- [x] Error handling system
- [x] localStorage persistence
- [x] Vietnamese language support

### ⏳ Pending

- [ ] Google OAuth Client ID setup (requires Google Cloud Console)
- [ ] Backend deployment and testing
- [ ] Integration testing (frontend + backend)
- [ ] Email verification (optional)
- [ ] Password reset flow (optional)
- [ ] Two-factor authentication (optional)
- [ ] Session management (optional)
- [ ] Rate limiting on auth endpoints (optional)

---

## 🧪 Testing Guide

### Test Scenario 1: Registration Flow

1. **Navigate to Auth Page**
   ```
   http://localhost:3000
   ```

2. **Switch to Register Tab**
   - Click "Đăng Ký" button

3. **Fill Form**
   - Username: `testplayer123`
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Confirm: `TestPass123`

4. **Submit**
   - Button: "Đăng Ký Ngay"
   - Expected: Success message + redirect to game

5. **Verify**
   - Check localStorage for `authToken` and `user`
   - Game should display user info in header

### Test Scenario 2: Login Flow

1. **Navigate to Auth Page**
   ```
   http://localhost:3000
   ```

2. **Fill Login Form**
   - Email: `test@example.com`
   - Password: `TestPass123`

3. **Submit**
   - Button: "Đăng Nhập"
   - Expected: Success message + redirect to game

4. **Verify**
   - User info displayed in header
   - Logout button functional

### Test Scenario 3: Google OAuth (After Setup)

1. **Setup Google Client ID**
   - Add to `.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...`

2. **Click Google Sign-In Button**

3. **Complete Google OAuth Flow**

4. **Verify**
   - Account created with Google email
   - Logged in automatically

---

## 🔄 Data Flow Diagrams

### Registration Flow

```
User Input
    ↓
AuthPage.handleSignup()
    ↓
Form Validation
    ↓
POST /auth/register
    ↓
Backend: registerHandler()
    ├─ Validate input
    ├─ Check username uniqueness
    ├─ Hash password
    ├─ Create player in DB
    └─ Generate JWT token
    ↓
Response with token + user data
    ↓
localStorage.setItem('authToken', token)
    ↓
onAuthSuccess() callback
    ↓
Redirect to Game
```

### Login Flow

```
User Input
    ↓
AuthPage.handleLogin()
    ↓
Form Validation
    ↓
POST /auth/login
    ↓
Backend: loginHandler()
    ├─ Find player by username/email
    ├─ Verify password
    ├─ Check if banned
    ├─ Update last_login
    └─ Generate JWT token
    ↓
Response with token + user data
    ↓
localStorage.setItem('authToken', token)
    ↓
onAuthSuccess() callback
    ↓
Redirect to Game
```

### Google OAuth Flow

```
User Clicks Google Button
    ↓
Google Sign-In Modal
    ↓
User Authenticates with Google
    ↓
Google returns ID Token
    ↓
GoogleSignInButton.handleGoogleLogin()
    ↓
POST /auth/google with token
    ↓
Backend: googleAuthHandler()
    ├─ Decode and verify token
    ├─ Extract email + google_id
    ├─ Check if user exists
    ├─ Create user if new
    └─ Generate JWT token
    ↓
Response with token + user data
    ↓
localStorage.setItem('authToken', token)
    ↓
onSuccess() callback
    ↓
Redirect to Game
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused" on localhost:3001

**Solution:**
```bash
# Start backend server
cd motia
npm run dev
```

### Issue: "CORS error" in browser console

**Solution:**
```
Update .env in motia:
CORS_ORIGIN=http://localhost:3000
```

### Issue: "Invalid token" after login

**Solution:**
```
Check JWT_SECRET matches between frontend and backend
Clear localStorage and try login again
```

### Issue: "Username already taken"

**Solution:**
```
- Username must be unique
- Try username with different suffix
- Check database: SELECT * FROM players WHERE username='xxx';
```

### Issue: "Password requirements not met"

**Solution:**
```
Password must have:
- Minimum 8 characters
- 1 uppercase letter (A-Z)
- 1 lowercase letter (a-z)
- 1 number (0-9)

Example: "MyPassword123"
```

### Issue: Google OAuth not working

**Solution:**
```
1. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local
2. Verify Client ID from Google Cloud Console
3. Add http://localhost:3000 to Authorized origins
4. Restart frontend server
```

---

## 📚 Additional Resources

### Files Changed/Created

**Frontend:**
- ✅ `katagame/components/AuthPage.tsx` (NEW)
- ✅ `katagame/components/GoogleSignInButton.tsx` (NEW)
- ✅ `katagame/app/page.tsx` (UPDATED)

**Backend:**
- ✅ `motia/src/routes/auth.routes.ts` (NEW)
- ✅ `motia/src/services/player.service.ts` (UPDATED - added getPlayerByEmail)
- ✅ `motia/src/api.utils.ts` (Already exists)

**Database:**
- ✅ `katagame_database_schema.sql` (Already has players table)

### Configuration Files

- `katagame/.env.local` - Frontend environment
- `motia/.env.local` - Backend environment

---

## 🎯 Next Steps

1. **Setup Google OAuth**
   - Create Google Cloud project
   - Get Client ID
   - Add to .env.local

2. **Test Locally**
   - Start backend: `cd motia && npm run dev`
   - Start frontend: `cd katagame && npm run dev`
   - Test registration/login flow

3. **Deploy**
   - Use docker-compose.yml for production
   - Update environment variables
   - Run database migrations

4. **Monitor**
   - Check backend logs
   - Monitor authentication events
   - Track user registrations

---

## 📞 Support

For issues or questions about the authentication system:

1. Check this guide's troubleshooting section
2. Review logs: `motia/.motia/logs/`
3. Check browser console: `F12` → Console tab
4. Review API responses in Network tab

---

**Last Updated:** 2024-10-22  
**Status:** ✅ Ready for Integration Testing
