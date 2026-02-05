# 🐳 Docker Setup - Complete Guide

Your complete guide to running KataGame with Docker Compose.

---

## 📖 Table of Contents

1. [Quick Start (3 Commands!)](#quick-start-3-commands)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Verify Setup](#verify-setup)
5. [Common Commands](#common-commands)
6. [Services Overview](#services-overview)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## 🚀 Quick Start (3 Commands!)

```bash
# 1. Start all services with one command
docker-compose up -d

# 2. Wait for initialization
sleep 10

# 3. Verify everything is working
docker-compose ps
```

✅ **Done!** All services are running. Jump to [Verify Setup](#verify-setup).

---

## 📋 Prerequisites

### Required
- **Docker** - [Install](https://docs.docker.com/get-docker/)
- **Docker Compose** - [Install](https://docs.docker.com/compose/install/)
- **Git** - For cloning and version control

### Optional (for development)
- **Node.js 18+** - For backend development
- **PostgreSQL CLI** - For direct database access
- **Redis CLI** - For Redis development

### Verify Installation

```bash
# Check Docker
docker --version

# Check Docker Compose
docker-compose --version

# Check Git
git --version
```

---

## 🔧 Installation & Setup

### Automated Setup (Recommended)

We provide a setup script that automates everything:

```bash
# Make script executable
chmod +x docker-setup.sh

# Run setup script
./docker-setup.sh

# Script will:
# - Check prerequisites
# - Start Docker services
# - Initialize database
# - Setup backend
# - Print service URLs
```

### Manual Setup

If you prefer to set up manually:

#### Step 1: Start Docker Services
```bash
# Start core services (PostgreSQL + Backend)
docker-compose up -d

# Or with optional services (Redis, PgAdmin)
docker-compose --profile optional up -d

# Verify services started
docker-compose ps
```

#### Step 2: Initialize Database
```bash
# Create database
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE katagame;"

# Load schema
docker-compose exec -i postgres psql -U postgres -d katagame < katagame_database_schema.sql

# Verify tables created
docker-compose exec postgres psql -U postgres -d katagame -c "\dt"
```

#### Step 3: Setup Backend
```bash
# Navigate to backend
cd motia

# Copy environment file
cp .env.example .env.local

# Update DATABASE_URL (if using docker-compose)
# Edit .env.local and set:
# DATABASE_URL=postgresql://postgres:postgres@postgres:5432/katagame

# Install dependencies
npm install

# Return to root
cd ..
```

---

## ✅ Verify Setup

### Check Services Running
```bash
# List all services
docker-compose ps

# Expected output:
# NAME              STATUS
# postgres          Up 2 minutes (healthy)
# redis             Up 2 minutes (healthy)
# pgadmin           Up 2 minutes
```

### Check Database Connection
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d katagame -c "SELECT 1;"

# Expected output:
#  ?column?
# ----------
#         1
```

### Check Backend Configuration
```bash
# Verify .env.local exists
ls -la motia/.env.local

# View database URL
grep "DATABASE_URL" motia/.env.local
```

### Start Backend
```bash
# In one terminal, start backend
cd motia
npm run dev

# Should see: "🚀 Server running at http://localhost:3001"
```

### Test API
```bash
# In another terminal, test API
curl http://localhost:3001/api/v1/players/leaderboard

# Should return JSON array of players
```

✅ **All set!** Your development environment is ready.

---

## 🔧 Common Commands

### Service Management

```bash
# Start services
docker-compose up -d

# Stop services (data preserved)
docker-compose stop

# Stop and remove (data preserved in volumes)
docker-compose down

# Stop and DELETE all data
docker-compose down -v

# Restart specific service
docker-compose restart postgres

# View running services
docker-compose ps

# View logs
docker-compose logs

# Follow logs (like tail -f)
docker-compose logs -f postgres
```

### Database Operations

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d katagame

# Common queries once connected:
\dt                              # List tables
\d players                        # Describe players table
SELECT COUNT(*) FROM players;    # Count players
SELECT * FROM players LIMIT 5;   # View first 5 players
\q                               # Quit

# Backup database
docker-compose exec postgres pg_dump -U postgres katagame > backup.sql

# Restore from backup
docker-compose exec -i postgres psql -U postgres -d katagame < backup.sql

# Reset database (WARNING: deletes all data!)
docker-compose exec postgres psql -U postgres -c "DROP DATABASE katagame;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE katagame;"
docker-compose exec -i postgres psql -U postgres -d katagame < katagame_database_schema.sql
```

### Backend Development

```bash
cd motia

npm run dev              # Start development server
npm run build            # Build for production
npm install              # Install dependencies
npm test                 # Run tests (if available)

# Check backend logs
cd .. && docker-compose logs backend
```

### Docker Compose Profiles

```bash
# Start with optional services (Redis, PgAdmin)
docker-compose --profile optional up -d

# PgAdmin web interface
# URL: http://localhost:5050
# Email: admin@katagame.local
# Password: admin

# To add database to PgAdmin:
# Host: postgres (service name)
# Port: 5432
# Username: postgres
# Password: postgres
```

---

## 📊 Services Overview

### PostgreSQL Database
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: katagame
- **Purpose**: Main game database
- **Status**: Required

### Redis (Optional)
- **Port**: 6379
- **Purpose**: Caching layer
- **Status**: Optional
- **Start**: `docker-compose --profile optional up -d`

### PgAdmin (Optional)
- **Port**: 5050
- **URL**: http://localhost:5050
- **Email**: admin@katagame.local
- **Password**: admin
- **Purpose**: Database management UI
- **Status**: Optional
- **Start**: `docker-compose --profile optional up -d`

### Backend API
- **Port**: 3001
- **URL**: http://localhost:3001
- **Purpose**: Game backend API
- **Status**: User-started
- **Start**: `cd motia && npm run dev`

### Frontend
- **Port**: 3000
- **URL**: http://localhost:3000
- **Purpose**: Next.js game UI
- **Status**: User-started
- **Start**: `cd katagame && npm run dev`

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5432
lsof -i :5432

# Kill process (be careful!)
kill -9 <PID>

# Or change port in docker-compose.yml:
# ports:
#   - "5433:5432"
```

### Docker Service Won't Start

```bash
# Check logs
docker-compose logs postgres

# Restart Docker daemon
# Linux:
sudo systemctl restart docker

# Mac/Windows: Restart Docker Desktop
```

### Database Connection Refused

```bash
# Check PostgreSQL is running
docker-compose ps

# If not running, start it
docker-compose up -d postgres

# Check database exists
docker-compose exec postgres psql -U postgres -l

# If not, create it
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE katagame;"
```

### Can't Connect to Docker Daemon

```bash
# Check if Docker is running
docker ps

# Start Docker (Linux)
sudo systemctl start docker

# Mac/Windows: Open Docker Desktop
```

### Backend Can't Connect to Database

```bash
# Check DATABASE_URL in motia/.env.local
grep DATABASE_URL motia/.env.local

# For docker-compose, should be:
# DATABASE_URL=postgresql://postgres:postgres@postgres:5432/katagame

# Test connection
docker-compose exec postgres pg_isready -U postgres

# Check backend logs
cd motia && npm run dev  # Shows connection errors
```

### "psql: command not found"

```bash
# If you need psql locally, install PostgreSQL client
# Ubuntu/Debian:
sudo apt install postgresql-client

# macOS:
brew install postgresql

# Or use docker-compose exec to access database:
docker-compose exec postgres psql -U postgres
```

### PgAdmin Can't Connect to PostgreSQL

```bash
# In PgAdmin, use service name, not localhost
Host: postgres  # NOT localhost
Port: 5432
Username: postgres
Password: postgres
Database: katagame

# Services communicate by name on docker-compose network
```

### Disk Space Issues

```bash
# Check Docker disk usage
docker system df

# Clean up unused images/volumes
docker system prune

# Remove specific volume (data deleted!)
docker volume rm katagame_postgres_data

# See free space
df -h
```

---

## 📚 Configuration Files

### docker-compose.yml
Main configuration file defining all services. Contains:
- PostgreSQL service
- Redis service (optional)
- PgAdmin service (optional)
- Volume definitions
- Network configuration

### docker-compose.prod.yml
Production overrides. Use with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### motia/.env.example
Backend environment template. Copy to `.env.local`:
```bash
cp motia/.env.example motia/.env.local
```

Key variables for Docker Compose:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/katagame
REDIS_URL=redis://redis:6379/0
PORT=3001
```

---

## 🚀 Next Steps

### 1. Start Developing
```bash
# Terminal 1: Backend
cd motia
npm run dev

# Terminal 2: Frontend  
cd katagame
npm run dev

# Terminal 3: Database operations
docker-compose exec postgres psql -U postgres -d katagame
```

### 2. Access Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- PgAdmin: http://localhost:5050 (if started)
- Redis: localhost:6379 (if started)

### 3. Read Related Documentation
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Comprehensive Docker guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup options
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick command reference
- [motia/README_BACKEND.md](./motia/README_BACKEND.md) - Backend guide

### 4. Explore Backend API
```bash
# List available endpoints
curl http://localhost:3001/api/v1/

# Get leaderboard
curl http://localhost:3001/api/v1/players/leaderboard

# See API_ROUTES.md for all endpoints
cat motia/API_ROUTES.md
```

### 5. Next Development Tasks
- [ ] Connect frontend to backend API
- [ ] Test all game features
- [ ] Set up WebSocket connections
- [ ] Configure Redis caching
- [ ] Load testing
- [ ] Production deployment

---

## 📞 Need Help?

1. **Quick commands?** → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. **Docker advanced?** → [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
3. **Database setup?** → [DATABASE_SETUP.md](./DATABASE_SETUP.md)
4. **Backend development?** → [motia/README_BACKEND.md](./motia/README_BACKEND.md)
5. **API documentation?** → [motia/API_ROUTES.md](./motia/API_ROUTES.md)

---

## ✅ Setup Checklist

- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] docker-compose.yml exists in project root
- [ ] Run docker-setup.sh or manual setup
- [ ] All services started: `docker-compose ps`
- [ ] Database initialized and schema loaded
- [ ] Backend .env.local configured
- [ ] Backend npm dependencies installed
- [ ] Backend starts without errors
- [ ] API responds to requests
- [ ] PgAdmin accessible (optional)

---

## 🎉 You're All Set!

Your development environment is ready. Start building! 

Happy coding! 🚀

---

**Last Updated**: 2024
**Version**: 1.0
