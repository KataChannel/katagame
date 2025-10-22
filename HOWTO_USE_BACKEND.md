# 🎮 How to Use the Backend - Step by Step

**For**: Developers who want to run and use the KataGame backend

---

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ Node.js 18+ (`node --version`)
- ✅ npm 8+ (`npm --version`)
- ✅ PostgreSQL 13+ (`psql --version`)
- ✅ (Optional) Redis (`redis-cli --version`)

---

## 🚀 Step 1: Setup Backend

Navigate to the backend directory:

```bash
cd /mnt/chikiet/kataoffical/katagame/motia
```

Run the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- ✅ Check prerequisites
- ✅ Install npm packages
- ✅ Create .env.local
- ✅ Setup database
- ✅ Generate types

---

## 🔧 Step 2: Configure Environment

Edit `.env.local` with your database credentials:

```bash
nano .env.local
```

Key variables to update:

```env
# PostgreSQL connection
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/katagame

# JWT secret (change for production!)
JWT_SECRET=your-super-secret-key-here

# Server port
PORT=3001
```

---

## 🗄️ Step 3: Setup Database

Create the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE katagame;
\q

# Run schema
psql katagame < ../katagame_database_schema.sql
```

Verify the database:

```bash
psql -d katagame -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
```

You should see tables like: `players`, `battles`, `guilds`, etc.

---

## ▶️ Step 4: Start Backend

```bash
npm run dev
```

You should see:

```
=========================================
  KataGame Configuration
=========================================
Environment: development
Node Env: development
Server: 0.0.0.0:3001
Features: { guildWars: true, marketplace: true, ... }
=========================================

✓ Backend started at http://localhost:3001
```

---

## ✅ Step 5: Test Backend

In a new terminal, test the API:

```bash
# Test 1: Get leaderboard (no auth needed)
curl http://localhost:3001/api/v1/players/leaderboard

# Test 2: Register a user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testplayer",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Save the returned token for next test
TOKEN="<token_from_response>"

# Test 3: Get your profile (requires token)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/players/me
```

If all tests pass ✅, your backend is working!

---

## 🔗 Step 6: Connect Frontend

Update the frontend environment:

File: `katagame/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

Then start the frontend in a new terminal:

```bash
cd katagame
npm run dev
```

Frontend should now connect to backend at `http://localhost:3000`

---

## 📚 Step 7: Use the API

### Get Available Endpoints

See [motia/API_ROUTES.md](./motia/API_ROUTES.md) for complete list.

### Common API Calls

#### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testplayer","password":"TestPass123"}'
```

#### Get Player Profile
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/players/me
```

#### Get Leaderboard
```bash
curl http://localhost:3001/api/v1/players/leaderboard?limit=10
```

#### Start Battle
```bash
curl -X POST http://localhost:3001/api/v1/battles/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"defenderId":"<opponent_id>","battleType":"pvp"}'
```

#### Get Quests
```bash
curl http://localhost:3001/api/v1/quests?dynasty=Tang&difficulty=medium
```

---

## 🧪 Testing Tools

### Option 1: Postman
1. Download Postman
2. Import: [motia/API_ROUTES.md](./motia/API_ROUTES.md)
3. Setup environment variables (token, playerId)
4. Test endpoints

### Option 2: curl (Command Line)
```bash
# Create a test script
cat > test_api.sh << 'ENDSCRIPT'
#!/bin/bash

API="http://localhost:3001/api/v1"

# Login
echo "Logging in..."
LOGIN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testplayer","password":"TestPass123"}')

TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Get profile
echo -e "\nGetting profile..."
curl -s -H "Authorization: Bearer $TOKEN" $API/players/me | jq .

# Get leaderboard
echo -e "\nGetting leaderboard..."
curl -s $API/players/leaderboard?limit=5 | jq .
ENDSCRIPT

chmod +x test_api.sh
./test_api.sh
```

### Option 3: VS Code REST Client
1. Install: REST Client extension
2. Create `test.http` file:

```http
### Get leaderboard
GET http://localhost:3001/api/v1/players/leaderboard

### Register
POST http://localhost:3001/api/v1/auth/register
Content-Type: application/json

{
  "username": "testplayer",
  "email": "test@example.com",
  "password": "TestPass123"
}

### Login
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "username": "testplayer",
  "password": "TestPass123"
}

### Get profile
GET http://localhost:3001/api/v1/players/me
Authorization: Bearer <your_token_here>
```

---

## 🐛 Troubleshooting

### "Connection refused" on database
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Or for macOS
brew services start postgresql

# Test connection
psql -U postgres -c "SELECT 1"
```

### "Port 3001 already in use"
```bash
# Change port in .env.local
PORT=3002

# Or kill the process
lsof -i :3001
kill -9 <PID>
```

### "JWT verification failed"
```bash
# Make sure JWT_SECRET is same in .env.local
# And never change it without re-registering users
```

### "Cannot find module 'pg'"
```bash
# Install dependencies
npm install

# Make sure you're in motia/ directory
cd motia
npm install
```

### Database doesn't have tables
```bash
# Run the schema
psql katagame < ../katagame_database_schema.sql

# Check tables
psql katagame -c "\dt"
```

---

## 📊 Monitoring

### Check Backend Logs
The terminal running `npm run dev` shows logs.

### Check Database
```bash
# Connect to database
psql katagame

# Check tables
\dt

# Check player count
SELECT COUNT(*) FROM players;

# Check recent battles
SELECT * FROM battles ORDER BY created_at DESC LIMIT 5;
```

### Check API Health
```bash
# Health check endpoint
curl http://localhost:3001/api/v1/health

# Or just try any endpoint
curl http://localhost:3001/api/v1/players/leaderboard
```

---

## 🚀 Commands Reference

```bash
# In motia/ directory

# Install dependencies
npm install

# Development server
npm run dev

# Build
npm run build

# Generate Motia types
npm run generate-types

# Run tests (if configured)
npm test

# Clean build
npm run clean
```

---

## 📖 Next Steps

1. ✅ Backend running
2. ✅ API working
3. → Follow [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)
4. → Connect frontend to backend
5. → Test all systems
6. → Deploy to production

---

## 🎯 Common Workflows

### Workflow 1: Development
```bash
# Terminal 1: Backend
cd motia && npm run dev

# Terminal 2: Frontend
cd katagame && npm run dev

# Terminal 3: Testing
# Use curl/Postman to test APIs
```

### Workflow 2: Adding New Feature
1. Add event handler in `steps/game/`
2. Add service method in `src/services/`
3. Add API endpoint documentation
4. Test with curl
5. Update frontend to call new endpoint

### Workflow 3: Database Debugging
```bash
# Connect to database
psql katagame

# Check specific table
SELECT * FROM players LIMIT 5;

# Check player resources
SELECT id, username, resources FROM players WHERE username='testplayer';

# Update test data
UPDATE players SET resources='{"gold":10000,"gems":5000,"culture":1000}' WHERE username='testplayer';
```

---

## �� Tips

- **Auto-reload**: Backend auto-reloads on file changes
- **Environment**: Use `.env.local` for development, `.env.production` for production
- **Logs**: Check terminal output for detailed logs when `LOG_LEVEL=debug`
- **Rate limiting**: Adjust in .env if testing heavily
- **WebSocket**: Real-time updates need WebSocket connection (see integration guide)

---

## 📞 Support

- 📄 [API Documentation](./motia/API_ROUTES.md)
- 📄 [Backend README](./motia/README_BACKEND.md)
- 📄 [Architecture Review](./BACKEND_ARCHITECTURE_REVIEW.md)
- 📄 [Integration Guide](./FRONTEND_BACKEND_INTEGRATION.md)

---

**Happy coding! 🎉**

For more details, see the comprehensive documentation in the project root.
