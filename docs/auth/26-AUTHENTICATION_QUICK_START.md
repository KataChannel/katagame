# Authentication Quick Start - Testing Guide

**Version:** 1.0  
**Last Updated:** 2024-10-22  
**Purpose:** Quick reference for testing authentication integration

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running
- Two terminals open

---

## Step 1: Start Backend (Terminal 1)

```bash
# Navigate to backend
cd /mnt/chikiet/kataoffical/katagame/motia

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
[INFO] 2024-10-22 10:00:00 - KataGame Configuration
Environment: development
Node Env: development
Server: 0.0.0.0:3001
Database: [configured]
Features: {
  guildWars: true,
  marketplace: true,
  quests: true,
  analytics: true,
  achievements: true
}
```

✅ **Backend Ready on:** `http://localhost:11001/api/v1`

---

## Step 2: Start Frontend (Terminal 2)

```bash
# Navigate to frontend
cd /mnt/chikiet/kataoffical/katagame/katagame

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
> katagame@1.0.0 dev
> next dev

  ▲ Next.js 15.0.0
  - ready on: http://localhost:11000
```

✅ **Frontend Ready on:** `http://localhost:11000`

---

### Step 3: Test Registration

### Via Browser UI

1. **Open:** `http://localhost:11000`
2. **Switch to "Đăng Ký" (Register) tab**
3. **Fill Form:**
   - **Username:** `testplayer001`
   - **Email:** `test@example.com`
   - **Password:** `TestPass123`
   - **Confirm:** `TestPass123`
4. **Click:** "Đăng Ký Ngay"
5. **Expected:** Success message + logged in

### Via cURL (Alternative)

```bash
curl -X POST http://localhost:11001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testplayer001",
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testplayer001",
    "email": "test@example.com",
    "level": 1
  },
  "message": "Registration successful",
  "timestamp": 1629789600000
}
```

---

## Step 4: Test Login

### Via Browser UI

1. **Logout** (if still logged in)
2. **Switch to "Đăng Nhập" (Login) tab**
3. **Fill Form:**
   - **Email:** `test@example.com`
   - **Password:** `TestPass123`
4. **Click:** "Đăng Nhập"
5. **Expected:** Logged in + game loads

### Via cURL (Alternative)

```bash
curl -X POST http://localhost:11001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testplayer001",
    "password": "TestPass123"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "playerId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testplayer001",
    "level": 1,
    "experience": 0
  },
  "message": "Login successful",
  "timestamp": 1629789600000
}
```

---

## Step 5: Test Get Current User

```bash
# Use token from login response
TOKEN="eyJhbGc..."

curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "testplayer001",
    "email": "test@example.com",
    "level": 1,
    "experience": 0,
    "resources": {
      "gold": 200,
      "rice": 100,
      "lumber": 50,
      "stone": 30,
      "culture": 20,
      "gems": 1500
    },
    "status": "active",
    "created_at": "2024-10-22T10:30:00Z",
    "last_login": "2024-10-22T10:30:00Z"
  },
  "message": "User info retrieved",
  "timestamp": 1629789600000
}
```

---

## 🧪 Testing Checklist

### Registration Tests

- [ ] Valid credentials register successfully
- [ ] Error: Username too short (< 3 chars)
- [ ] Error: Invalid email format
- [ ] Error: Password too short (< 8 chars)
- [ ] Error: Password without uppercase
- [ ] Error: Password without lowercase
- [ ] Error: Password without number
- [ ] Error: Passwords don't match
- [ ] Error: Username already taken
- [ ] Error: Email already registered
- [ ] Token saved to localStorage
- [ ] User object saved to localStorage

### Login Tests

- [ ] Valid credentials login successfully
- [ ] Error: Invalid email/password combination
- [ ] Error: Email not found
- [ ] Error: Wrong password
- [ ] Token saved to localStorage
- [ ] User redirected to game
- [ ] Header shows username

### Session Tests

- [ ] Page refresh maintains login session
- [ ] Logout clears token from localStorage
- [ ] Logout redirects to auth page
- [ ] Token includes correct user ID
- [ ] GET /auth/me returns correct user data

### Edge Cases

- [ ] Rapid registration attempts
- [ ] Very long username/email
- [ ] Special characters in password
- [ ] Concurrent login attempts
- [ ] Token expiration handling

---

## 🔍 Browser DevTools

### Check localStorage

```javascript
// Open DevTools: F12
// Go to: Application → Local Storage → http://localhost:3000

// View stored token
localStorage.getItem('authToken')

// View stored user
JSON.parse(localStorage.getItem('user'))

// Clear all
localStorage.clear()
```

### Check Network Requests

```
1. Open DevTools: F12
2. Go to Network tab
3. Perform login
4. Click on POST auth/login request
5. Check:
   - Request body (form data)
   - Response status (should be 200)
   - Response data (token included?)
```

### Check Console Errors

```
1. Open DevTools: F12
2. Go to Console tab
3. Look for errors/warnings during auth flow
4. Check CORS issues
5. Verify API URLs
```

---

## 📊 Expected Data Flow

### Registration Success

```
Browser Request
↓
POST /auth/register
{
  "username": "testplayer001",
  "email": "test@example.com",
  "password": "TestPass123"
}
↓
Backend Processing
├─ Validate inputs
├─ Hash password
├─ Create DB entry
└─ Generate JWT token
↓
Browser Response (200)
{
  "success": true,
  "data": {
    "token": "...",
    "playerId": "...",
    ...
  }
}
↓
localStorage["authToken"] = token
localStorage["user"] = {...}
↓
Redirect to Game
```

### Login Success

```
Browser Request
↓
POST /auth/login
{
  "username": "testplayer001",
  "password": "TestPass123"
}
↓
Backend Processing
├─ Find player by username
├─ Verify password
└─ Generate JWT token
↓
Browser Response (200)
{
  "success": true,
  "data": {
    "token": "...",
    "playerId": "...",
    ...
  }
}
↓
localStorage["authToken"] = token
localStorage["user"] = {...}
↓
Redirect to Game
```

---

## 🐛 Common Issues & Solutions

### ❌ "Failed to fetch"

**Cause:** Backend not running or wrong URL

**Solution:**
```bash
# Terminal 1: Check backend is running
cd motia && npm run dev

# Terminal 2: Check URL is correct
# http://localhost:11001/api/v1 ← should be running

# Check CORS in .env
CORS_ORIGIN=http://localhost:11000
```

### ❌ "CORS policy: No 'Access-Control-Allow-Origin'"

**Cause:** Backend CORS not configured

**Solution:**
```
motia/.env:
CORS_ORIGIN=http://localhost:11000
```

### ❌ "Unauthorized" (401)

**Cause:** Invalid or missing token

**Solution:**
```javascript
// Check token exists
const token = localStorage.getItem('authToken');
console.log(token); // Should be a long string starting with "ey"

// If missing, login again
```

### ❌ "Invalid credentials"

**Cause:** Wrong username/password combination

**Solution:**
```
1. Double-check spelling
2. Make sure it's the username you registered with
3. Try registering a new account
4. Check database: 
   - Open psql
   - SELECT * FROM players WHERE username='testplayer001';
```

### ❌ "Username already taken"

**Cause:** Username exists in database

**Solution:**
```bash
# Use unique username
testplayer001 → testplayer002 → testplayer003

# Or clear database (dev only)
# DELETE FROM players WHERE username='testplayer001';
```

---

## 🔗 API Reference Quick Links

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| /auth/register | POST | Create new account | ❌ |
| /auth/login | POST | Login with credentials | ❌ |
| /auth/google | POST | Login with Google | ❌ |
| /auth/me | GET | Get current user | ✅ |
| /auth/refresh | POST | Get new token | ✅ |

---

## 💾 Test Data

### Test Account 1 (Email/Password)
```
Username: testplayer001
Email: test@example.com
Password: TestPass123
```

### Test Account 2 (Email/Password)
```
Username: player2
Email: player2@example.com
Password: MyPassword456
```

### Test Account 3 (Email/Password)
```
Username: admin
Email: admin@game.com
Password: AdminPass789
```

---

## 📝 Testing Log Template

Copy and paste for testing sessions:

```
=== Authentication Testing Log ===
Date: [DATE]
Tester: [NAME]
Build: [VERSION]

REGISTRATION TESTS:
[ ] Test 1: Valid registration
    Result: ✓/✗
    Note: 
    
[ ] Test 2: Duplicate username
    Result: ✓/✗
    Note:

[ ] Test 3: Invalid email
    Result: ✓/✗
    Note:

LOGIN TESTS:
[ ] Test 4: Valid login
    Result: ✓/✗
    Note:

[ ] Test 5: Wrong password
    Result: ✓/✗
    Note:

SESSION TESTS:
[ ] Test 6: Page refresh maintains session
    Result: ✓/✗
    Note:

[ ] Test 7: Logout works
    Result: ✓/✗
    Note:

SUMMARY:
Passed: [X]/7
Failed: [Y]/7
Issues Found:
- [ISSUE 1]
- [ISSUE 2]

Next Steps:
[ ] Fix issues
[ ] Re-test
[ ] Document fixes
```

---

## 🎯 Success Criteria

### Registration Must Work
- ✅ User can create account with valid data
- ✅ Token is returned
- ✅ User is logged in immediately
- ✅ Token saved to localStorage
- ✅ Can access game features

### Login Must Work
- ✅ User can login with credentials
- ✅ Token is returned
- ✅ User data is correct
- ✅ Can access game features
- ✅ Session persists on refresh

### Logout Must Work
- ✅ Button works
- ✅ localStorage cleared
- ✅ Redirected to auth page
- ✅ Cannot access game features

---

## 📞 Next Steps

1. **Start servers:** Follow steps 1-2 above
2. **Run tests:** Execute tests from Testing Checklist
3. **Document results:** Use Testing Log Template
4. **Report issues:** Note any failures
5. **Fix bugs:** Address issues found
6. **Re-test:** Verify fixes work
7. **Deploy:** Move to production

---

**Ready to Test?** Start with Step 1 above! 🚀

Last Updated: 2024-10-22  
Status: ✅ Ready for Testing
