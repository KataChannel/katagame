# 🎮 KataGame - Complete Development Setup Guide

Welcome to KataGame! This guide will get you up and running with the complete game development environment.

---

## 🚀 Quick Start (Choose Your Path)

### Path 1: Docker Compose (Recommended - Fastest! 🐳)
```bash
# One command to start everything
docker-compose up -d

# Backend starts automatically, frontend is user-started
cd motia && npm run dev    # Terminal 1: Backend
cd katagame && npm run dev # Terminal 2: Frontend
```
👉 **[Full Docker Setup Guide →](./DOCKER_SETUP_README.md)**

### Path 2: Automated Setup Script 
```bash
# Run automated setup
chmod +x docker-setup.sh
./docker-setup.sh

# Then start backend and frontend
cd motia && npm run dev
cd katagame && npm run dev
```

### Path 3: Manual Local Setup
```bash
# See DATABASE_SETUP.md for database options
# Install PostgreSQL locally and run schema
# Then configure .env.local and npm install/run
```
👉 **[Database Setup Guide →](./DATABASE_SETUP.md)**

---

## 📚 Documentation Index

### Setup & Configuration
| Document | Purpose | When to Use |
|----------|---------|------------|
| [DOCKER_SETUP_README.md](./DOCKER_SETUP_README.md) | Quick docker setup | First time setup with Docker |
| [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) | Complete Docker reference | Docker advanced usage |
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | Database initialization | All database setup options |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick commands | Daily development |

### Backend Development
| Document | Purpose | When to Use |
|----------|---------|------------|
| [motia/README_BACKEND.md](./motia/README_BACKEND.md) | Backend overview | Understanding backend architecture |
| [motia/API_ROUTES.md](./motia/API_ROUTES.md) | API documentation | Using backend API endpoints |
| [HOWTO_USE_BACKEND.md](./HOWTO_USE_BACKEND.md) | Backend setup steps | Setting up backend manually |

### Frontend Development
| Document | Purpose | When to Use |
|----------|---------|------------|
| [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) | Frontend-backend connection | Integrating frontend with API |

### Deployment & Production
| Document | Purpose | When to Use |
|----------|---------|------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deployment | Deploying to production |

---

## 🎯 First Time Setup

### Recommended: 5-Minute Docker Setup

```bash
# 1. Start services (1 command)
docker-compose up -d

# 2. Verify everything is running
docker-compose ps

# 3. In Terminal 1: Start backend
cd motia
npm install  # Only first time
npm run dev

# 4. In Terminal 2: Start frontend
cd katagame
npm install  # Only first time
npm run dev

# 5. Access in browser
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

✅ **You're done!** 

Next: Read [DOCKER_SETUP_README.md](./DOCKER_SETUP_README.md) for more details.

---

## 🔧 What's Included

### Backend (Motia Framework)
- ✅ 8 Event Handlers (game systems)
- ✅ 7 Service Classes (type-safe database layer)
- ✅ JWT Authentication
- ✅ 40+ REST API endpoints
- ✅ PostgreSQL database
- ✅ Rate limiting & security
- ✅ Real-time analytics

### Frontend (Next.js)
- ✅ Game UI components
- ✅ Player dashboard
- ✅ Battle system
- ✅ Marketplace
- ✅ Guilds & PvP
- ✅ Leaderboards
- ✅ Mobile responsive

### Infrastructure
- ✅ PostgreSQL database with schema
- ✅ Redis caching (optional)
- ✅ Docker Compose setup
- ✅ PgAdmin database UI (optional)
- ✅ Environment configuration
- ✅ Development & production configs

---

## 📋 System Requirements

### Minimum
- Docker & Docker Compose
- 2GB RAM available
- 5GB disk space

### Recommended
- Docker & Docker Compose
- 4GB+ RAM available
- 10GB+ disk space
- Node.js 18+ (for development)
- Git (for version control)

---

## 🏃 Project Structure

```
katagame/                          # Project root
├── docker-compose.yml             # Docker services
├── docker-compose.prod.yml        # Production override
├── docker-setup.sh                # Automated setup script
├── katagame_database_schema.sql   # Database schema
│
├── katagame/                      # Frontend (Next.js)
│   ├── app/                       # Next.js app directory
│   ├── components/                # React components
│   ├── lib/                       # Utilities
│   ├── public/                    # Static files
│   └── package.json
│
├── motia/                         # Backend (Node.js)
│   ├── src/
│   │   ├── services/              # Business logic layer
│   │   ├── config.ts              # Configuration
│   │   └── api.utils.ts           # API helpers
│   ├── steps/
│   │   └── game/                  # Event handlers
│   ├── .env.example               # Environment template
│   ├── .env.local                 # Local configuration
│   └── package.json
│
├── scripts/                       # Utility scripts
└── [Documentation files]          # Setup guides
```

---

## 🚀 Getting Started

### 1️⃣ Initial Setup (5 minutes)
```bash
# Just one command!
docker-compose up -d
sleep 10  # Wait for database

# Verify
docker-compose ps
```

### 2️⃣ Start Backend (Terminal 1)
```bash
cd motia
npm run dev
# Should see: 🚀 Server running at http://localhost:3001
```

### 3️⃣ Start Frontend (Terminal 2)
```bash
cd katagame
npm run dev
# Should see: ▲ Next.js running at http://localhost:3000
```

### 4️⃣ Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Database**: postgres @ localhost:5432
- **PgAdmin** (optional): http://localhost:5050

### 5️⃣ Test Backend
```bash
# In Terminal 3, test API
curl http://localhost:3001/api/v1/players/leaderboard
```

---

## 📖 Common Commands

### Service Management
```bash
docker-compose up -d      # Start all services
docker-compose ps         # View running services
docker-compose logs -f    # View logs
docker-compose stop       # Stop services
docker-compose down       # Remove services (data saved)
docker-compose down -v    # Remove everything (delete data!)
```

### Backend Development
```bash
cd motia
npm run dev              # Development mode
npm run build            # Production build
npm run generate-types   # Generate types
npm test                 # Run tests
```

### Database Access
```bash
# Via docker-compose
docker-compose exec postgres psql -U postgres -d katagame

# Backup
docker-compose exec postgres pg_dump -U postgres katagame > backup.sql

# Restore
docker-compose exec -i postgres psql -U postgres -d katagame < backup.sql
```

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for more commands.

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml
# Or kill existing process
lsof -i :5432
kill -9 <PID>
```

### Database Connection Error
```bash
# Check if services are running
docker-compose ps

# If not, restart
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Backend Won't Start
```bash
# Check .env.local
cat motia/.env.local

# For docker-compose, DATABASE_URL should be:
# DATABASE_URL=postgresql://postgres:postgres@postgres:5432/katagame

# Install dependencies
cd motia && npm install
```

### Can't Access Frontend/Backend
```bash
# Check services are running
docker-compose ps

# Check ports
# Frontend should be 3000
# Backend should be 3001
# Database should be 5432

# Check firewall if on remote server
```

See [DOCKER_SETUP_README.md - Troubleshooting](./DOCKER_SETUP_README.md#-troubleshooting) for more solutions.

---

## 🎓 Learning the System

### Frontend First?
1. Start with [katagame/README.md](./katagame/README.md)
2. Explore React components in `katagame/components/`
3. Connect to backend (see [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md))

### Backend First?
1. Read [motia/README_BACKEND.md](./motia/README_BACKEND.md)
2. Check API endpoints in [motia/API_ROUTES.md](./motia/API_ROUTES.md)
3. Understand event handlers in `motia/steps/game/`
4. Explore services in `motia/src/services/`

### Full Stack?
1. Follow [DOCKER_SETUP_README.md](./DOCKER_SETUP_README.md)
2. Start both frontend and backend
3. Read both README files
4. Explore integration guide
5. Build a feature end-to-end

---

## 🚢 Deployment

When ready for production:

1. **Database**: Use managed database (AWS RDS, Google Cloud SQL, Heroku)
2. **Backend**: Deploy to cloud platform (Heroku, Railway, AWS)
3. **Frontend**: Deploy to CDN (Vercel, Netlify, AWS CloudFront)
4. **Environment**: Use production .env with secure secrets

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for details.

---

## 📊 Architecture Overview

### Frontend → Backend Communication
```
Browser (localhost:3000)
    ↓
Next.js Frontend (katagame/)
    ↓
HTTP/REST API (localhost:3001)
    ↓
Express Backend (motia/)
    ↓
PostgreSQL Database (localhost:5432)
```

### Backend Event System
```
Game Events (Motia)
    ↓
8 Event Handlers
    ↓
7 Domain Services
    ↓
PostgreSQL Database
```

### Running Services
```
Terminal 1: Backend
├── Node.js
├── Express
├── Motia Framework
└── PostgreSQL Connection

Terminal 2: Frontend
├── Next.js Dev Server
├── React Components
└── WebSocket Connections

Docker:
├── PostgreSQL (5432)
├── Redis (6379)
└── PgAdmin (5050)
```

---

## 🆘 Need Help?

### Quick Issues
→ Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

### Setup Issues
→ Check [DOCKER_SETUP_README.md - Troubleshooting](./DOCKER_SETUP_README.md#-troubleshooting)

### Backend Issues
→ Check [motia/README_BACKEND.md](./motia/README_BACKEND.md)

### Database Issues
→ Check [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### Docker Issues
→ Check [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)

### Integration Issues
→ Check [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)

---

## ✅ Setup Checklist

- [ ] Docker & Docker Compose installed
- [ ] docker-compose.yml exists
- [ ] Services started: `docker-compose up -d`
- [ ] Database initialized
- [ ] Backend configured (.env.local)
- [ ] Backend npm dependencies installed
- [ ] Backend running: `npm run dev`
- [ ] Frontend npm dependencies installed
- [ ] Frontend running: `npm run dev`
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:3001

---

## 🎉 Ready to Go!

You now have:
- ✅ Complete game backend with 8 systems
- ✅ Full-featured frontend
- ✅ Database with schema
- ✅ Docker setup for easy deployment
- ✅ Comprehensive documentation

**Next Steps:**
1. Follow [DOCKER_SETUP_README.md](./DOCKER_SETUP_README.md) for setup
2. Explore the code in `motia/` and `katagame/`
3. Read [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md)
4. Build new features!

---

## 📞 Resources

- **Backend Docs**: [motia/README_BACKEND.md](./motia/README_BACKEND.md)
- **API Docs**: [motia/API_ROUTES.md](./motia/API_ROUTES.md)
- **Docker Help**: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- **Database Setup**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Quick Commands**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

**Happy Coding! 🚀**

Last Updated: 2024
