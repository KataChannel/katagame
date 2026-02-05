# 🚀 Quick Start Card - KataGame

**Print this or bookmark for quick reference!**

---

## ⚡ 3-Minute Setup

```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Terminal 2: Start backend
cd motia && npm run dev

# Terminal 3: Start frontend
cd katagame && npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Database: localhost:5432
- PgAdmin: http://localhost:5050 (optional)

---

## 🎯 Essential Commands

### Docker
```bash
docker-compose up -d        # Start
docker-compose ps           # Status
docker-compose logs -f      # Logs
docker-compose stop         # Stop
docker-compose down -v      # Reset
```

### Backend
```bash
cd motia
npm run dev                 # Start
npm install                 # Dependencies
npm run build               # Production
```

### Database
```bash
# Connect
docker-compose exec postgres psql -U postgres -d katagame

# Backup
docker-compose exec postgres pg_dump -U postgres katagame > backup.sql

# Restore
docker-compose exec -i postgres psql -U postgres -d katagame < backup.sql
```

---

## 📖 Documentation Quick Links

| Need | Link |
|------|------|
| Getting started | [GETTING_STARTED.md](./GETTING_STARTED.md) |
| Quick setup | [DOCKER_SETUP_README.md](./DOCKER_SETUP_README.md) |
| Daily commands | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Development | [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) |
| Backend API | [motia/API_ROUTES.md](./motia/API_ROUTES.md) |
| Troubleshooting | [QUICK_REFERENCE.md - Troubleshooting](./QUICK_REFERENCE.md#-troubleshooting) |
| Find docs | [COMPLETE_DOC_INDEX.md](./COMPLETE_DOC_INDEX.md) |

---

## 🐛 Quick Fixes

### "Port already in use"
```bash
# Change port in docker-compose.yml
# Or stop existing service
docker-compose down
```

### "Can't connect to database"
```bash
# Restart database
docker-compose restart postgres

# Check if running
docker-compose ps
```

### "Backend won't start"
```bash
# Check env file
grep DATABASE_URL motia/.env.local

# Should be: postgresql://postgres:postgres@postgres:5432/katagame

# Reinstall
cd motia && npm install
```

### "psql not found"
```bash
# Use docker-compose
docker-compose exec postgres psql -U postgres -d katagame

# Or install locally
# Ubuntu: sudo apt install postgresql-client
# macOS: brew install postgresql
```

---

## 🎮 Test the System

```bash
# Check database
curl http://localhost:3001/api/v1/players/leaderboard

# Should return JSON array

# Check frontend
# Open http://localhost:3000 in browser
```

---

## 📊 What's Running

| Service | Port | Status | Command |
|---------|------|--------|---------|
| Frontend | 3000 | User-started | `cd katagame && npm run dev` |
| Backend | 3001 | User-started | `cd motia && npm run dev` |
| PostgreSQL | 5432 | Docker | `docker-compose` |
| Redis | 6379 | Docker (optional) | `docker-compose --profile optional` |
| PgAdmin | 5050 | Docker (optional) | `docker-compose --profile optional` |

---

## 🔑 Key Facts

- **Database**: PostgreSQL at `postgres:5432`
- **User**: postgres
- **Password**: postgres
- **Database name**: katagame
- **JWT expiry**: 24 hours
- **API prefix**: `/api/v1`
- **Dev mode**: HMR enabled on both
- **Docker network**: katagame-network (services communicate by name)

---

## 📋 Daily Workflow

```bash
# Morning: Start services
docker-compose up -d

# Start backend
cd motia && npm run dev

# (New terminal) Start frontend
cd katagame && npm run dev

# (New terminal) Work on code

# Evening: Push code
git push

# Stop services
docker-compose stop

# (Or keep running for next session)
```

---

## 🆘 Need Help?

1. **Setup issues**: [DOCKER_SETUP_README.md](./DOCKER_SETUP_README.md)
2. **Command help**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. **Development help**: [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
4. **API help**: [motia/API_ROUTES.md](./motia/API_ROUTES.md)
5. **Docker help**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
6. **Find anything**: [COMPLETE_DOC_INDEX.md](./COMPLETE_DOC_INDEX.md)

---

## ✅ Checklist

- [ ] Docker installed
- [ ] `docker-compose up -d` works
- [ ] Services running: `docker-compose ps`
- [ ] Can access http://localhost:3001
- [ ] Backend starts: `cd motia && npm run dev`
- [ ] Frontend starts: `cd katagame && npm run dev`
- [ ] Can access http://localhost:3000

---

## 🎉 You're Ready!

Everything is set up and documented.

**Next**: Open [GETTING_STARTED.md](./GETTING_STARTED.md)

---

**Keep this handy!** 📌

Print or bookmark: **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for full command reference

Last Updated: 2024
