# 🎮 Development Workflow Guide

Complete guide for daily development workflow with KataGame.

---

## 📋 Table of Contents

1. [Daily Startup](#daily-startup)
2. [Development Process](#development-process)
3. [Testing Workflow](#testing-workflow)
4. [Common Tasks](#common-tasks)
5. [Git Workflow](#git-workflow)
6. [Debugging](#debugging)
7. [Performance Optimization](#performance-optimization)
8. [Deployment](#deployment)

---

## 🚀 Daily Startup

### Quick Start (Copy & Paste)

#### Terminal 1: Start Services
```bash
cd /path/to/katagame

# Start Docker services
docker-compose up -d

# Check they're running
docker-compose ps

# Expected: postgres (healthy), redis, pgadmin running
```

#### Terminal 2: Start Backend
```bash
cd /path/to/katagame/motia

# Start backend server
npm run dev

# Expected: "🚀 Server running at http://localhost:3001"
```

#### Terminal 3: Start Frontend
```bash
cd /path/to/katagame/katagame

# Start frontend
npm run dev

# Expected: "▲ Next.js running at http://localhost:3000"
```

#### Terminal 4: Database Access (Optional)
```bash
cd /path/to/katagame

# Connect to database if needed
docker-compose exec postgres psql -U postgres -d katagame

# View tables: \dt
# Quit: \q
```

### Verification Checklist

- [ ] Docker services running: `docker-compose ps`
- [ ] Backend accessible: `curl http://localhost:3001`
- [ ] Frontend accessible: http://localhost:3000
- [ ] Database connected: Can query tables
- [ ] No errors in any terminal

### Automated Startup (Optional)

Create `start.sh`:
```bash
#!/bin/bash

# Start from project root
cd "$(dirname "$0")"

# Terminal 1: Services
gnome-terminal -- bash -c "docker-compose up -d && docker-compose logs -f"

# Wait for services
sleep 3

# Terminal 2: Backend
gnome-terminal -- bash -c "cd motia && npm run dev"

# Wait for backend
sleep 2

# Terminal 3: Frontend
gnome-terminal -- bash -c "cd katagame && npm run dev"

# Terminal 4: Info
gnome-terminal -- bash -c "echo 'Services:'; docker-compose ps; echo ''; echo 'Frontend: http://localhost:3000'; echo 'Backend: http://localhost:3001'; bash"

echo "✅ All services started!"
```

```bash
chmod +x start.sh
./start.sh
```

---

## 🛠️ Development Process

### Creating a New Feature

#### 1. Plan (5 minutes)
```markdown
Feature: Add new quest type
Files to modify:
- motia/src/services/quest.service.ts
- motia/steps/game/quest-submission.step.ts
- katagame/components/QuestTab.tsx
Database changes:
- Add quest_type column to quests table
API changes:
- New endpoint POST /quests
Testing:
- Test new endpoint
- Test UI integration
- Test database
```

#### 2. Backend Implementation (30 minutes)

**Step 1: Database Schema**
```bash
# Check existing schema
docker-compose exec postgres psql -U postgres -d katagame -c "\d quests"

# Add new column if needed
docker-compose exec postgres psql -U postgres -d katagame << EOF
ALTER TABLE quests ADD COLUMN quest_type VARCHAR(50) DEFAULT 'standard';
EOF

# Verify
docker-compose exec postgres psql -U postgres -d katagame -c "\d quests"
```

**Step 2: Update Service**
```typescript
// motia/src/services/quest.service.ts

async getQuestsByType(type: string): Promise<Quest[]> {
  return this.database.query(`
    SELECT * FROM quests 
    WHERE quest_type = $1
    ORDER BY created_at DESC
  `, [type]);
}
```

**Step 3: Update Event Handler**
```typescript
// motia/steps/game/quest-submission.step.ts

// Add logic for new quest type
if (quest.quest_type === 'challenge') {
  // Different reward calculation
  reward = questScore * 2;
}
```

**Step 4: Add API Endpoint**
```typescript
// motia/src/api/quests.ts

router.get('/quests/type/:type', async (req, res) => {
  const { type } = req.params;
  const quests = await questService.getQuestsByType(type);
  res.json(quests);
});
```

**Step 5: Test API**
```bash
# Test new endpoint
curl http://localhost:3001/api/v1/quests/type/challenge

# Should return JSON array of quests
```

#### 3. Frontend Implementation (20 minutes)

**Step 1: Create Component**
```typescript
// katagame/components/ChallengeQuestTab.tsx

export default function ChallengeQuestTab() {
  const [quests, setQuests] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:3001/api/v1/quests/type/challenge')
      .then(r => r.json())
      .then(setQuests)
      .catch(console.error);
  }, []);
  
  return (
    <div>
      {quests.map(quest => (
        <div key={quest.id}>{quest.title}</div>
      ))}
    </div>
  );
}
```

**Step 2: Integrate to Main UI**
```typescript
// katagame/components/GameLoop.tsx

// Add to tabs
<ChallengeQuestTab />
```

**Step 3: Test Frontend**
```bash
# Check http://localhost:3000 in browser
# Should see new quest type
```

#### 4. Testing (15 minutes)

```bash
# Backend test
curl -X GET http://localhost:3001/api/v1/quests/type/challenge

# Database test
docker-compose exec postgres psql -U postgres -d katagame << EOF
SELECT * FROM quests WHERE quest_type = 'challenge';
EOF

# Frontend test
# Open http://localhost:3000
# Check if quests are displayed
```

#### 5. Commit
```bash
git add -A
git commit -m "feat: add challenge quest type

- Add quest_type column to database
- Implement getQuestsByType service method
- Add challenge logic to quest handler
- Create ChallengeQuestTab component
- Add API endpoint for filtering by type

Fixes #123"
```

---

## 🧪 Testing Workflow

### Unit Testing

```bash
# Backend tests
cd motia
npm test

# Frontend tests
cd katagame
npm test
```

### Integration Testing

```bash
# Test API with sample data
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123"}'

# Extract token from response
TOKEN="your-token-here"

# Test with authentication
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/players/profile
```

### Database Testing

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d katagame

# Check data
SELECT COUNT(*) FROM players;
SELECT * FROM battles LIMIT 5;
SELECT * FROM marketplace_listings WHERE status = 'active';

# Test transactions
BEGIN;
INSERT INTO players (username, password_hash) VALUES ('test', 'hash');
-- Check if successful
ROLLBACK;  -- Undo for testing
```

### Manual Testing

```
1. Open http://localhost:3000
2. Click through each feature
3. Check browser console for errors
4. Check backend logs for issues
5. Verify database updates
```

### Performance Testing

```bash
# Load test backend
ab -n 1000 -c 10 http://localhost:3001/api/v1/players/leaderboard

# Check memory usage
docker stats katagame-postgres

# Check database performance
docker-compose exec postgres psql -U postgres -d katagame << EOF
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
EOF
```

---

## 🎯 Common Tasks

### Add New API Endpoint

```bash
# 1. Create handler in motia/src/api/
# 2. Add service method in motia/src/services/
# 3. Test with curl
# 4. Document in motia/API_ROUTES.md
# 5. Commit with description
```

### Modify Database Schema

```bash
# 1. Create backup
docker-compose exec postgres pg_dump -U postgres katagame > backup.sql

# 2. Make changes
docker-compose exec postgres psql -U postgres -d katagame << EOF
ALTER TABLE players ADD COLUMN new_field VARCHAR(100);
EOF

# 3. Test changes
docker-compose exec postgres psql -U postgres -d katagame -c "\d players"

# 4. Revert if needed
# docker-compose exec -i postgres psql -U postgres -d katagame < backup.sql
```

### Add New Feature Flag

```bash
# 1. Add to .env.local
echo "FEATURE_NEW_SYSTEM=true" >> motia/.env.local

# 2. Use in code
if (process.env.FEATURE_NEW_SYSTEM === 'true') {
  // New feature code
}

# 3. Restart backend
# Ctrl+C to stop
npm run dev
```

### Debug Backend

```bash
# Add to code
console.log('Debug info:', variable);

# Check logs
docker-compose logs -f backend

# Or check terminal where npm run dev is running
```

### Debug Frontend

```bash
# Browser DevTools: F12
# Check Console tab for errors
# Check Network tab for API calls
# Check Sources for breakpoints
```

### Fix Database Issues

```bash
# Backup first
docker-compose exec postgres pg_dump -U postgres katagame > backup.sql

# Check database health
docker-compose exec postgres pg_isready -U postgres

# Check specific table
docker-compose exec postgres psql -U postgres -d katagame << EOF
SELECT COUNT(*) FROM players;
VACUUM players;
ANALYZE players;
EOF

# View table structure
docker-compose exec postgres psql -U postgres -d katagame -c "\d+ players"
```

---

## 📊 Git Workflow

### Before Starting Work

```bash
# Update local repository
git pull origin main

# Create feature branch
git checkout -b feature/quest-types

# Or create fix branch
git checkout -b fix/quest-bug-123
```

### During Development

```bash
# Check status
git status

# Add changes
git add .

# Commit frequently
git commit -m "feat: implement quest type filtering"

# Push to backup
git push -u origin feature/quest-types
```

### Before Committing

```bash
# Review changes
git diff

# Run tests
npm test

# Check for console.logs
grep -r "console.log" motia/src --exclude-dir=node_modules

# Format code (if using prettier)
npm run format
```

### Commit Message Format

```
type(scope): subject

body

footer

Types: feat, fix, docs, style, refactor, test, chore
Example:
feat(quests): add challenge quest type

- Add quest_type column
- Implement filtering by type
- Create UI component

Fixes #123
```

### Push & Create PR

```bash
# Push code
git push

# Create pull request
# GitHub will show option to create PR
```

---

## 🐛 Debugging

### Backend Debugging

```bash
# 1. Add console.log
console.log('User:', user);

# 2. Watch logs
docker-compose logs -f backend

# Or in terminal with npm run dev:
# Logs appear directly

# 3. Check API response
curl -v http://localhost:3001/api/v1/players

# 4. Use database query
docker-compose exec postgres psql -U postgres -d katagame -c "SELECT * FROM players LIMIT 1;"

# 5. Check environment variables
grep VAR_NAME motia/.env.local

# 6. Use debugger (if installed)
# node --inspect motia/src/index.ts
# Then open chrome://inspect
```

### Frontend Debugging

```bash
# 1. Browser DevTools (F12)
# - Console: View errors and logs
# - Network: Check API calls
# - Elements: Inspect HTML
# - Sources: Set breakpoints

# 2. Add console.log in React
console.log('Component mounted');

# 3. React DevTools
# - Install extension
# - Check component state
# - Trace re-renders

# 4. Network tab
# - Check API requests
# - View response data
# - Check headers
```

### Database Debugging

```bash
# Connect
docker-compose exec postgres psql -U postgres -d katagame

# Check query performance
EXPLAIN ANALYZE SELECT * FROM players WHERE level > 10;

# View locks
SELECT * FROM pg_locks;

# Check active connections
SELECT * FROM pg_stat_activity;

# View recently modified tables
SELECT * FROM pg_stat_user_tables ORDER BY last_vacuum DESC;

# Exit
\q
```

---

## ⚡ Performance Optimization

### Backend Optimization

```bash
# Check slow queries
docker-compose exec postgres psql -U postgres -d katagame << EOF
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
EOF

# Add indexes for common queries
ALTER TABLE players ADD INDEX idx_level (level);
ALTER TABLE battles ADD INDEX idx_player_id (player_id);

# Monitor memory
docker stats

# Check response times
time curl http://localhost:3001/api/v1/players/leaderboard
```

### Frontend Optimization

```bash
# Check bundle size
npm run build

# Analyze bundles
npm install --save-dev webpack-bundle-analyzer

# Check performance
# DevTools → Lighthouse
# Aim for >90 score
```

### Database Optimization

```bash
# Run vacuum to clean up
docker-compose exec postgres psql -U postgres -d katagame -c "VACUUM ANALYZE;"

# Check table sizes
docker-compose exec postgres psql -U postgres -d katagame << EOF
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename)) 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(tablename) DESC;
EOF

# Archive old data
DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console.logs in code
- [ ] No TODOs or FIXMEs
- [ ] Database schema migrated
- [ ] Environment variables set
- [ ] Security audit passed
- [ ] Performance tested
- [ ] Backup created

### Deployment Steps

```bash
# 1. Create backup
docker-compose exec postgres pg_dump -U postgres katagame > production_backup.sql

# 2. Update code
git pull origin main

# 3. Install dependencies
npm install
cd motia && npm install && cd ..
cd katagame && npm install && cd ..

# 4. Run migrations
# (if using Prisma)
npx prisma migrate deploy

# 5. Build for production
cd motia && npm run build
cd katagame && npm run build

# 6. Deploy using docker-compose.prod.yml
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 7. Verify
curl https://yourdomain.com/api/v1/health

# 8. Monitor
docker-compose logs -f
```

---

## 📋 Daily Checklist

### Morning
- [ ] Pull latest code: `git pull`
- [ ] Start services: `docker-compose up -d`
- [ ] Check for errors: `docker-compose logs`
- [ ] Review TODOs in code

### During Work
- [ ] Commit regularly: `git commit -m "..."`
- [ ] Test changes: curl / browser
- [ ] Check logs for errors
- [ ] Document changes

### Before Leaving
- [ ] Push code: `git push`
- [ ] Stop services if needed: `docker-compose stop`
- [ ] Check for uncommitted changes: `git status`
- [ ] Leave notes about current work

---

## 🆘 Quick Help

| Issue | Solution |
|-------|----------|
| Backend won't start | Check logs: `npm run dev` or `docker-compose logs backend` |
| Database connection error | Verify DATABASE_URL in .env.local |
| Port already in use | Change port in docker-compose.yml or kill process |
| Frontend won't load | Check http://localhost:3000 and browser console |
| API returns 401 | Need to login first and use token |
| Database full | Clean up old data or increase disk space |

---

## 📚 Resources

- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick commands
- [motia/README_BACKEND.md](./motia/README_BACKEND.md) - Backend guide
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker reference
- [motia/API_ROUTES.md](./motia/API_ROUTES.md) - API docs

---

**Happy Developing! 🚀**
