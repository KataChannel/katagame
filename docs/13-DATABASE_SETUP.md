# 🗄️ Database Setup Guide

**For**: Setting up PostgreSQL for KataGame backend

---

## 📋 Quick Setup Options

Choose one of these options based on your setup:

### ✅ Option 1A: Docker Compose (Recommended - Easiest!)
```bash
# Copy docker-compose.yml is already in project root

# Start all services
docker-compose up -d

# Wait for database to initialize
sleep 10

# Verify database
docker-compose exec postgres psql -U postgres -d katagame -c "\dt"

# View logs
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop services and remove data
docker-compose down -v
```

**What's included:**
- ✅ PostgreSQL 15 (primary database)
- ✅ Redis 7 (optional cache)
- ✅ PgAdmin (optional database UI)

**Profiles:**
```bash
# Start with optional services (Redis, PgAdmin)
docker-compose --profile optional up -d

# PgAdmin available at: http://localhost:5050
# Email: admin@katagame.local
# Password: admin
```

### ✅ Option 1B: Docker (Manual - Single Container)
```bash
# Start PostgreSQL in Docker
docker run -d \
  --name katagame-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Wait 10 seconds for container to start
sleep 10

# Create database
docker exec katagame-postgres psql -U postgres -c "CREATE DATABASE katagame;"

# Run schema
docker exec -i katagame-postgres psql -U postgres -d katagame < katagame_database_schema.sql

# Verify
docker exec katagame-postgres psql -U postgres -d katagame -c "\dt"
```

### ✅ Option 2: Local PostgreSQL Installation

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Connect and create database
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE katagame;
\q

# Run schema
psql -U postgres -d katagame < katagame_database_schema.sql
```

#### macOS (Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database
psql -U postgres -c "CREATE DATABASE katagame;"

# Run schema
psql -U postgres -d katagame < katagame_database_schema.sql
```

#### Windows
1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Run installer
3. Remember the password for `postgres` user
4. Use pgAdmin to create database `katagame`
5. Run schema using pgAdmin or command line

### ✅ Option 3: Managed Database

#### AWS RDS
```bash
# 1. Create RDS instance via AWS Console
# 2. Note the endpoint, username, password
# 3. Add security group to allow connections
# 4. Update .env.local:
DATABASE_URL=postgresql://username:password@your-endpoint.rds.amazonaws.com:5432/katagame

# 5. Create database and run schema:
psql -h your-endpoint.rds.amazonaws.com -U username -d postgres -c "CREATE DATABASE katagame;"
psql -h your-endpoint.rds.amazonaws.com -U username -d katagame -f katagame_database_schema.sql
```

#### Heroku
```bash
# 1. Create app
heroku create your-app-name

# 2. Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# 3. Get connection string
heroku config:get DATABASE_URL

# 4. Use in .env.local
DATABASE_URL=<paste-heroku-url>

# 5. Run schema
heroku pg:psql < katagame_database_schema.sql
```

---

## ⚙️ Configuration

### Update .env.local

```bash
cd motia
nano .env.local
```

Set these variables:

```env
# Local Docker
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/katagame

# Or your custom connection
DATABASE_URL=postgresql://username:password@host:port/katagame

# Other important settings
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=30000
DATABASE_TIMEOUT=2000
```

---

## ✅ Verify Database Setup

### Test Connection
```bash
# Test basic connection
psql -d katagame -c "SELECT 1"

# Should return: ?column?
#           1
```

### Check Tables
```bash
# List all tables
psql -d katagame -c "\dt"

# Should show: players, battles, guilds, marketplace_listings, etc.
```

### Check Data
```bash
# Count tables
psql -d katagame -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"

# Should show at least 10 tables
```

---

## 🐛 Troubleshooting

### "Connection refused"
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Or if using Docker
docker ps | grep postgres

# Start PostgreSQL
sudo systemctl start postgresql
# Or
docker start katagame-postgres
```

### "psql: command not found"
```bash
# Install PostgreSQL client
sudo apt install postgresql-client

# Or if using Homebrew
brew install postgresql
```

### "Database already exists"
```bash
# Drop existing database
psql -U postgres -c "DROP DATABASE katagame;"

# Create new one
psql -U postgres -c "CREATE DATABASE katagame;"
```

### "Permission denied"
```bash
# Check PostgreSQL user permissions
sudo -u postgres psql

# In PostgreSQL:
ALTER USER postgres WITH SUPERUSER;
```

### "Connection timeout"
```bash
# Check if database host is correct in .env.local
# Check firewall rules
# Check if host is accessible

# Test connection with telnet
telnet your-host 5432
```

---

## 🔄 Docker Database Management

### View Logs
```bash
docker logs katagame-postgres
```

### Connect to Database
```bash
docker exec -it katagame-postgres psql -U postgres
```

### Backup Database
```bash
docker exec katagame-postgres pg_dump -U postgres katagame > backup.sql
```

### Restore Database
```bash
docker exec -i katagame-postgres psql -U postgres katagame < backup.sql
```

### Stop/Start/Remove
```bash
docker stop katagame-postgres      # Stop
docker start katagame-postgres     # Start
docker restart katagame-postgres   # Restart
docker rm katagame-postgres        # Remove (delete all data!)
```

---

## 📊 Database Schema

The `katagame_database_schema.sql` file creates:

### Tables
- `players` - Player profiles and stats
- `battles` - Battle records
- `marketplace_listings` - Item listings
- `educational_quests` - Quiz questions
- `quest_progress` - Player quest completion
- `guilds` - Guild information
- `guild_members` - Guild membership
- `provinces` - Territory map
- `analytics_events` - Event tracking
- `leaderboard_entries` - Ranking data

### Indexes
- Player lookups
- Battle queries
- Leaderboard rankings
- Analytics searches

---

## 🚀 Development Workflow

### First Time Setup
```bash
# 1. Start database
docker run -d --name katagame-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# 2. Create database
docker exec katagame-postgres psql -U postgres -c "CREATE DATABASE katagame;"

# 3. Run schema
docker exec -i katagame-postgres psql -U postgres -d katagame < katagame_database_schema.sql

# 4. Update .env.local
cd motia
nano .env.local

# 5. Start backend
npm run dev
```

### Daily Development
```bash
# Check if database is running
docker ps | grep postgres

# If not running
docker start katagame-postgres

# Start backend
cd motia
npm run dev
```

### Reset Database
```bash
# WARNING: This deletes all data!
docker exec katagame-postgres psql -U postgres -c "DROP DATABASE katagame;"
docker exec katagame-postgres psql -U postgres -c "CREATE DATABASE katagame;"
docker exec -i katagame-postgres psql -U postgres -d katagame < katagame_database_schema.sql
```

---

## 🔒 Production Setup

For production, use:
- ✅ Managed database (AWS RDS, Google Cloud SQL, etc.)
- ✅ High availability cluster (3+ replicas)
- ✅ Automated backups
- ✅ SSL/TLS connections
- ✅ Strong passwords
- ✅ Network isolation
- ✅ Monitoring and alerts

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for production setup.

---

## 📞 Need Help?

1. Check [HOWTO_USE_BACKEND.md](../HOWTO_USE_BACKEND.md)
2. Check [motia/README_BACKEND.md](../motia/README_BACKEND.md)
3. Check [troubleshooting section above](#-troubleshooting)

---

**Database Setup Complete! 🎉**
