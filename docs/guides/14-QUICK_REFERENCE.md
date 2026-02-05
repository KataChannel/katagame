# 🚀 Quick Reference - KataGame Backend

**For**: Quick commands and solutions for common tasks

---

## ⚡ Quick Start (5 minutes)

### Step 1: Docker Compose Setup (Easiest!)
```bash
# Start all services
docker-compose up -d

# Wait for database
sleep 10

# Verify database
docker-compose exec postgres psql -U postgres -d katagame -c "\dt"
```

### Step 1B: Docker Setup (Alternative)
```bash
# Start PostgreSQL
docker run -d --name katagame-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15

# Create database
docker exec katagame-postgres psql -U postgres -c "CREATE DATABASE katagame;"
docker exec -i katagame-postgres psql -U postgres -d katagame < katagame_database_schema.sql
```

### Step 2: Install & Run Backend
```bash
cd motia
npm install
npm run dev
```

### Step 3: Test
```bash
# New terminal
curl http://localhost:3001/api/v1/players/leaderboard
```

✅ Done! Backend running at `http://localhost:3001`

---

## 🔧 Common Commands

### Docker Compose (All Services)
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove data
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Restart specific service
docker-compose restart postgres

# Scale service
docker-compose up -d --scale redis=2

# Start with optional services (Redis, PgAdmin)
docker-compose --profile optional up -d

# Access database via docker-compose
docker-compose exec postgres psql -U postgres -d katagame

# Backup via docker-compose
docker-compose exec postgres pg_dump -U postgres katagame > backup.sql

# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Backend
```bash
cd motia

npm run dev              # Start development
npm run build            # Build for production
npm run generate-types   # Generate Motia types
npm test                 # Run tests
npm install              # Install dependencies
```

### Database (Docker)
```bash
# Start/Stop
docker start katagame-postgres
docker stop katagame-postgres

# Connect
docker exec -it katagame-postgres psql -U postgres

# Backup
docker exec katagame-postgres pg_dump -U postgres katagame > backup.sql

# Restore
docker exec -i katagame-postgres psql -U postgres katagame < backup.sql

# Logs
docker logs katagame-postgres
```

### Database (psql)
```bash
# Connect
psql -d katagame

# Common queries
\dt                 # List tables
\d players          # Describe table
SELECT * FROM players LIMIT 5;  # View data
```

### Frontend
```bash
cd katagame

npm run dev         # Start dev server
npm run build       # Build production
npm test            # Run tests
```

---

## 🧪 Testing API

### Get Token
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testplayer","password":"TestPass123"}'

# Copy the token from response
TOKEN="your_token_here"
```

### Get Profile
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/players/me
```

### Get Leaderboard
```bash
curl http://localhost:3001/api/v1/players/leaderboard
```

### Start Battle
```bash
curl -X POST http://localhost:3001/api/v1/battles/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"defenderId":"player-id-here","battleType":"pvp"}'
```

### Get Quests
```bash
curl http://localhost:3001/api/v1/quests?dynasty=Tang
```

---

## 🐛 Quick Fixes

### "psql: command not found"
```bash
# Install PostgreSQL client
sudo apt install postgresql-client    # Ubuntu/Debian
brew install postgresql               # macOS
# Or use Docker instead
```

### "Cannot connect to database"
```bash
# Check if Docker container is running
docker ps | grep postgres

# If not, start it
docker start katagame-postgres

# Check if local PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### "Port 3001 already in use"
```bash
# Find and kill process
lsof -i :3001
kill -9 <PID>

# Or change port in .env.local
PORT=3002
```

### "Database doesn't exist"
```bash
# Create database
docker exec katagame-postgres psql -U postgres -c "CREATE DATABASE katagame;"

# Run schema
docker exec -i katagame-postgres psql -U postgres -d katagame < katagame_database_schema.sql
```

### "JWT verification failed"
```bash
# Check JWT_SECRET in .env.local is correct
cat motia/.env.local | grep JWT_SECRET

# If needed, regenerate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "npm install fails"
```bash
# Clear cache
npm cache clean --force

# Try again
npm install --legacy-peer-deps

# Or use yarn
yarn install
```

---

## 📊 Development Setup

### All 3 Services Running
```bash
# Terminal 1: Database
docker run -d --name katagame-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Terminal 2: Backend
cd motia && npm run dev

# Terminal 3: Frontend
cd katagame && npm run dev

# Terminal 4: Testing
# Use curl/Postman
```

### Check All Running
```bash
# Backend: http://localhost:3001/api/v1/players/leaderboard
# Frontend: http://localhost:3000
# Database: psql -d katagame -c "SELECT 1"
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `motia/.env.local` | Backend config |
| `katagame/.env.local` | Frontend config |
| `katagame_database_schema.sql` | Database schema |
| `motia/API_ROUTES.md` | API documentation |
| `motia/README_BACKEND.md` | Backend guide |

---

## 🔗 Key URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| API Base | http://localhost:3001/api/v1 |
| Database | localhost:5432 |

---

## 📚 Documentation Links

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup guide
- [HOWTO_USE_BACKEND.md](./HOWTO_USE_BACKEND.md) - Detailed backend guide
- [motia/API_ROUTES.md](./motia/API_ROUTES.md) - API endpoints
- [motia/README_BACKEND.md](./motia/README_BACKEND.md) - Backend reference
- [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) - Integration guide

---

## 🆘 Need Help?

1. Check relevant documentation file above
2. Search GitHub issues
3. Check error message in terminal
4. Use troubleshooting section above

---

## 💡 Pro Tips

- Keep 3 terminals open: DB, Backend, Frontend
- Use `docker-compose` for easier multi-service management
- Use VS Code REST Client extension for testing
- Monitor logs in real-time with `tail -f`
- Use `watch npm run dev` to auto-restart on changes

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0

---

**Let's build amazing things! 🚀**
