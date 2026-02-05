# Kata Game - Setup Guide

Complete setup and development guide for the Kata Game project.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running Development Servers](#running-development-servers)
- [API Testing](#api-testing)
- [Technology Stack](#technology-stack)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

- **Node.js**: v18.x or v20.x (LTS recommended)
- **npm**: v8+ (comes with Node.js)
- **Docker**: v20+ (for PostgreSQL database)
- **PostgreSQL**: 15+ (via Docker container)
- **Git**: For version control

### Optional Tools

- **VS Code**: Recommended editor
- **Postman/Insomnia**: For API testing
- **pgAdmin/DBeaver**: For database management

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd katagame
```

### 2. Setup PostgreSQL Database

```bash
# Create and start PostgreSQL container
docker run -d \
  --name katagame-postgres \
  -p 11003:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=katagame \
  postgres:15

# Verify database is running
docker ps | grep katagame-postgres
```

### 3. Install Dependencies

```bash
# Backend dependencies
cd motia
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 4. Database Migration

```bash
cd motia

# Reset database and run all migrations
npm run seed

# Or run migrations separately:
npm run reset-db   # Drops and recreates all tables
npm run migrate    # Runs migration scripts
npm run seed:provinces  # Seed provinces data
npm run seed:heroes     # Seed heroes data
npm run seed:resources  # Seed resources/buildings data
```

### 5. Start Development Environment

```bash
# From katagame root directory
./run.sh
```

This starts:
- PostgreSQL (port 11003) - if not already running
- Backend API (port 11001) - Motia framework
- Frontend (port 11000) - Next.js 16

### 6. Access Application

- **Frontend**: http://localhost:11000
- **Backend API**: http://localhost:11001
- **Motia Workbench**: http://localhost:11001 (development UI)

---

## 📁 Project Structure

```
katagame/
├── frontend/              # Next.js 16 application
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities, hooks, services
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   ├── package.json
│   └── next.config.ts
│
├── motia/                # Backend API (Motia framework)
│   ├── src/
│   │   ├── services/     # Business logic services
│   │   ├── migrations/   # Database migrations
│   │   ├── seeds/        # Database seed scripts
│   │   └── config/       # Configuration files
│   ├── steps/            # API endpoints (Motia steps)
│   │   ├── game/         # Game-related endpoints
│   │   └── petstore/     # Example endpoints
│   └── package.json
│
├── run.sh                # Start all services
├── stop.sh               # Stop all services
└── SETUP.md              # This file
```

---

## ⚙️ Environment Configuration

### Backend Environment (.env in motia/)

Create `.env` file in `motia/` directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:11003/katagame

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h

# Server
PORT=11001
NODE_ENV=development

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend Environment (.env.local in frontend/)

Create `.env.local` file in `frontend/` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:11001
NEXT_PUBLIC_WS_URL=ws://localhost:11001

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=true
```

---

## 🗄️ Database Setup

### Connection Details

- **Host**: localhost
- **Port**: 11003
- **Database**: katagame
- **Username**: postgres
- **Password**: postgres
- **Connection String**: `postgresql://postgres:postgres@localhost:11003/katagame`

### Database Schema

The database uses PostgreSQL 15 with the following main tables:

- `players` - Player accounts and profiles
- `player_stats` - Player statistics and progression
- `provinces` - Game world provinces/territories
- `heroes` - Character heroes
- `pets` - Pet companions
- `resources` - Resource types and balances
- `buildings` - Building types and upgrades
- `achievements` - Achievement definitions and unlocks
- `guilds` - Player guilds/clans
- `battles` - Battle history and results

### Running Migrations

```bash
cd motia

# Reset entire database (CAUTION: Deletes all data!)
npm run reset-db

# Run migrations only
npm run migrate

# Seed specific data
npm run seed:provinces   # Load all Vietnam provinces
npm run seed:heroes      # Load hero characters
npm run seed:stories     # Load story content
npm run seed:resources   # Load resource types and buildings

# Full reset + migrate + seed
npm run seed
```

### Database Management

Access PostgreSQL via CLI:

```bash
# Enter PostgreSQL container
docker exec -it katagame-postgres psql -U postgres -d katagame

# Example queries
SELECT * FROM players LIMIT 10;
SELECT * FROM provinces WHERE region = 'Miền Bắc';
SELECT username, level, resources FROM players;
```

Or use GUI tools like pgAdmin/DBeaver with connection details above.

---

## 🏃 Running Development Servers

### Using Scripts (Recommended)

```bash
# Start all services
./run.sh

# Stop all services
./stop.sh
```

### Manual Start

#### 1. Start PostgreSQL

```bash
docker start katagame-postgres
```

#### 2. Start Backend (Motia)

```bash
cd motia
npx motia dev -p 11001

# Or with npm script
npm run dev
```

#### 3. Start Frontend (Next.js)

```bash
cd frontend
npm run dev
```

### Development Workflow

1. **Backend changes**: Auto-reloads via Motia watch mode
2. **Frontend changes**: Hot Module Replacement (HMR) via Next.js
3. **Database changes**: Run migrations manually with `npm run migrate`

### Logs

View real-time logs:

```bash
# Backend logs (when using run.sh)
tail -f /tmp/katagame-backend.log

# Frontend logs (when using run.sh)
tail -f /tmp/katagame-frontend.log

# PostgreSQL logs
docker logs -f katagame-postgres
```

---

## 🧪 API Testing

### Register New User

```bash
curl -X POST http://localhost:11001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "playerId": "uuid-here",
    "username": "testuser",
    "level": 1
  }
}
```

### Login

```bash
curl -X POST http://localhost:11001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### Get Navigation (Protected Route)

```bash
# Use token from register/login response
TOKEN="your-jwt-token-here"

curl http://localhost:11001/api/v1/navigation/player \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "playerId": "uuid",
    "navigation": [
      {
        "key": "game",
        "label": "Home",
        "labelVietnamese": "Trang Chủ",
        "icon": "Home",
        "unlockLevel": 1,
        "isUnlocked": true
      }
    ],
    "totalUnlocked": 4,
    "totalLocked": 11
  }
}
```

### Other Endpoints

```bash
# Get player resources
curl http://localhost:11001/api/v1/resources/my-resources \
  -H "Authorization: Bearer $TOKEN"

# Get player heroes
curl http://localhost:11001/api/v1/heroes/player \
  -H "Authorization: Bearer $TOKEN"

# Get provinces
curl http://localhost:11001/api/v1/provinces/player \
  -H "Authorization: Bearer $TOKEN"

# Get stories
curl http://localhost:11001/api/v1/stories/list \
  -H "Authorization: Bearer $TOKEN"
```

### API Documentation

Full API documentation available at:
- **Motia Workbench**: http://localhost:11001 (when backend is running)
- Navigate to "Steps" tab to see all available endpoints

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: [Next.js 16.0.0-canary.0](https://nextjs.org/) (App Router)
- **Runtime**: Node.js (NOT Bun - see notes below)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **Build Tool**: Turbopack (--turbopack flag)
- **UI Components**: Lucide React (icons)

**Note**: We attempted to migrate to Bun.js for performance but encountered compatibility issues with Next.js 16:
- `async_hooks.createHook` not implemented in Bun
- Stream errors: `ERR_STREAM_ALREADY_FINISHED`
- **Decision**: Keep Next.js on Node.js for stability

### Backend

- **Framework**: [Motia 0.8.2-beta.139](https://motia.dev/)
- **Runtime**: Node.js (via npx)
- **Language**: TypeScript
- **Database ORM**: Raw SQL queries via `pg` library
- **Authentication**: Custom JWT implementation
- **API Architecture**: Step-based (Motia pattern)

### Database

- **RDBMS**: PostgreSQL 15
- **Deployment**: Docker container
- **Schema**: Custom migrations in `motia/src/migrations/`

### DevOps

- **Containerization**: Docker (database only)
- **Process Management**: bash scripts (run.sh/stop.sh)
- **Logging**: File-based (/tmp/*.log)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Database not initialized" Error

**Problem**: Backend returns 500 error with "Database not initialized. Call initDatabase first."

**Solution**:
```bash
# This was fixed in PlayerService. Update your code:
cd motia
git pull  # Get latest fixes

# Or manually fix:
# Change all `getDatabase()` calls to `initDatabase(connectionString)`
```

#### 2. Backend Returns HTML Instead of JSON

**Problem**: API endpoints return Motia workbench HTML.

**Cause**: Motia steps not loaded after cache clear.

**Solution**:
```bash
cd motia
npm run postinstall   # Re-run Motia install
pkill -f "motia dev"
npm run dev           # Restart backend
```

#### 3. Frontend Build Errors (Next.js 16)

**Problem**: TypeScript errors about response data types.

**Solution**: We've fixed all known issues. Common patterns:
```typescript
// Before
setData(response.data.items)

// After
setData((response.data as any).items)
```

#### 4. Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use ::11001`

**Solution**:
```bash
# Kill processes on port 11001 (backend)
pkill -f "motia dev"

# Kill processes on port 11000 (frontend)
pkill -f "next dev"

# Or use lsof to find and kill specific process
lsof -ti:11001 | xargs kill -9
lsof -ti:11000 | xargs kill -9
```

#### 5. PostgreSQL Container Not Starting

**Problem**: `docker: Error response from daemon: Conflict.`

**Solution**:
```bash
# Remove existing container and recreate
docker rm -f katagame-postgres

# Recreate with data persistence
docker run -d \
  --name katagame-postgres \
  -p 11003:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=katagame \
  -v katagame-db-data:/var/lib/postgresql/data \
  postgres:15
```

#### 6. Navigation Endpoint Returns Empty Array

**Problem**: `/api/v1/navigation/player` returns no navigation items.

**Cause**: Player doesn't have required database records.

**Solution**:
```bash
# Add missing columns to player_stats
docker exec katagame-postgres psql -U postgres -d katagame -c "
  ALTER TABLE player_stats 
  ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tutorial_step INTEGER DEFAULT 1;
"

# Or re-run migrations
cd motia
npm run migrate
```

#### 7. JWT Token Invalid/Expired

**Problem**: `401 Unauthorized - Invalid token`

**Solution**: Register a new user or login again to get fresh token:
```bash
curl -X POST http://localhost:11001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@test.com","password":"Demo1234"}'
```

Password requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

---

## 📚 Additional Resources

### Documentation

- **Motia Framework**: https://motia.dev/docs
- **Next.js 16**: https://nextjs.org/docs (canary)
- **PostgreSQL**: https://www.postgresql.org/docs/15/

### Development Notes

- **Migration from Next.js 15 to 16**: We removed deprecated `swcMinify` config and added type casting for response data.
- **Bun.js Investigation**: Attempted migration failed due to async_hooks incompatibility. Staying with Node.js.
- **Database Service Pattern**: Always use `initDatabase(url)` instead of `getDatabase()` to avoid initialization errors.
- **Motia Step Discovery**: After cleaning `.motia` cache, always run `npm run postinstall` to reinitialize Motia.

### Project Timeline

- **Oct 2024**: Initial setup with Next.js 15, Motia backend
- **Oct 29, 2024**: 
  - Upgraded to Next.js 16
  - Fixed 7 TypeScript compilation errors
  - Added tutorial columns to player_stats
  - Fixed PlayerService database initialization
  - Created navigation service and API
  - Created run.sh/stop.sh scripts
  - Created this documentation

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run type checks: `cd frontend && npm run build`
4. Test API endpoints manually or with automated tests
5. Commit with descriptive message
6. Push and create Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (auto-format on save recommended)
- **Linting**: ESLint rules in `eslint.config.mjs`

---

## 📞 Support

For issues or questions:
1. Check this SETUP.md troubleshooting section
2. Check Motia logs: `tail -f /tmp/katagame-backend.log`
3. Check Next.js logs: `tail -f /tmp/katagame-frontend.log`
4. Review database state: `docker exec -it katagame-postgres psql -U postgres -d katagame`

---

**Happy Coding! 🎮**
