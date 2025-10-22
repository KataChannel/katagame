# 🐳 Docker Setup Guide - KataGame

Complete guide to running KataGame with Docker and Docker Compose.

---

## 📋 Prerequisites

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

**Verify Installation:**
```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (3 commands!)

```bash
# 1. Start all services
docker-compose up -d

# 2. Wait for database initialization
sleep 10

# 3. Verify it's working
curl http://localhost:3001/api/v1/players/leaderboard
```

✅ Done! All services running.

---

## 📦 What's Included

### Default Services (Always Running)
| Service | Port | Purpose | Access |
|---------|------|---------|--------|
| PostgreSQL | 5432 | Main database | `psql` or DBeaver |
| Backend API | 3001 | Game backend | `http://localhost:3001` |

### Optional Services (Use `--profile optional`)
| Service | Port | Purpose | Access |
|---------|------|---------|--------|
| Redis | 6379 | Caching layer | `redis-cli` |
| PgAdmin | 5050 | Database UI | `http://localhost:5050` |

---

## 🎯 Common Scenarios

### Scenario 1: Start Everything (Development)
```bash
# Start all services with optional ones
docker-compose --profile optional up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Open services:
# - Backend: http://localhost:3001
# - PgAdmin: http://localhost:5050 (admin@katagame.local / admin)
```

### Scenario 2: Start Just Database & Backend (Quick Dev)
```bash
# Start only core services
docker-compose up -d postgres

# Backend connects automatically
# Check backend logs
docker-compose logs -f backend
```

### Scenario 3: Fresh Start (Reset Everything)
```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d

# Recreate tables
docker-compose exec -i postgres psql -U postgres -d katagame < katagame_database_schema.sql
```

### Scenario 4: Production Deployment
```bash
# Use production override
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres
```

---

## 🔧 Service Management

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres

# Start with logs in foreground
docker-compose up postgres
```

### Stop Services
```bash
# Stop all (data preserved)
docker-compose stop

# Stop specific service
docker-compose stop postgres

# Stop and remove containers (data preserved in volumes)
docker-compose down

# Stop, remove containers, and DELETE all data
docker-compose down -v
```

### View Status
```bash
# List running services
docker-compose ps

# Check resource usage
docker stats

# View service health
docker-compose exec postgres pg_isready -U postgres
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs postgres

# Follow logs (tail -f style)
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail 100 postgres
```

---

## 🗄️ Database Operations

### Connect to Database
```bash
# Via docker-compose
docker-compose exec postgres psql -U postgres -d katagame

# Via docker
docker exec -it katagame-postgres psql -U postgres -d katagame

# Via local psql (if installed)
psql -h localhost -U postgres -d katagame
```

### Common Database Tasks
```bash
# List tables
docker-compose exec postgres psql -U postgres -d katagame -c "\dt"

# View table structure
docker-compose exec postgres psql -U postgres -d katagame -c "\d players"

# Count records
docker-compose exec postgres psql -U postgres -d katagame -c "SELECT COUNT(*) FROM players;"

# View first 5 players
docker-compose exec postgres psql -U postgres -d katagame -c "SELECT * FROM players LIMIT 5;"

# Delete all data (WARNING!)
docker-compose exec postgres psql -U postgres -d katagame -c "DELETE FROM players; DELETE FROM battles;"
```

### Backup & Restore
```bash
# Backup entire database
docker-compose exec postgres pg_dump -U postgres katagame > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific table
docker-compose exec postgres pg_dump -U postgres -t players katagame > backup_players.sql

# Restore from backup
docker-compose exec -i postgres psql -U postgres -d katagame < backup_20240115_143022.sql

# Restore with options (verbose, error on warning)
cat backup.sql | docker-compose exec -i postgres psql -U postgres -d katagame -v ON_ERROR_STOP=1

# Automated daily backup
# Add to crontab: 0 3 * * * docker-compose -f /path/to/docker-compose.yml exec postgres pg_dump -U postgres katagame > /backup/$(date +\%Y\%m\%d).sql
```

---

## 🔐 PgAdmin Web Interface (Optional)

Access database visually without command line.

### First Time Setup
```bash
# 1. Start with optional services
docker-compose --profile optional up -d

# 2. Open browser: http://localhost:5050

# 3. Login
# Email: admin@katagame.local
# Password: admin

# 4. Add Server
# Server > Register > Server
# General Tab:
#   Name: KataGame
# Connection Tab:
#   Host: postgres (use service name)
#   Username: postgres
#   Password: postgres
#   Port: 5432

# 5. Navigate to Databases > katagame > Schemas > public > Tables
```

### Common PgAdmin Tasks
```bash
# Query data
# Tools > Query Tool
# SELECT * FROM players;

# Backup
# Database > katagame > Backup

# Restore
# Database > katagame > Restore
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused"
```bash
# Check if services are running
docker-compose ps

# If not, start them
docker-compose up -d

# Check service health
docker-compose exec postgres pg_isready -U postgres
```

### Issue: "Port already in use"
```bash
# See what's using port 5432
lsof -i :5432

# Or find and stop existing container
docker ps | grep postgres
docker stop <container-id>

# Or change ports in docker-compose.yml
# ports:
#   - "5433:5432"  # Use 5433 instead
```

### Issue: "Cannot connect to Docker daemon"
```bash
# Docker daemon not running
sudo systemctl start docker

# Or on Mac/Windows, restart Docker Desktop
```

### Issue: "Database does not exist"
```bash
# Check existing databases
docker-compose exec postgres psql -U postgres -l

# Create database manually
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE katagame;"

# Run schema
docker-compose exec -i postgres psql -U postgres -d katagame < katagame_database_schema.sql
```

### Issue: "Volumes full / disk space"
```bash
# Check disk usage
df -h

# See Docker volumes
docker volume ls

# Clean up unused volumes
docker volume prune

# Check specific volume size
docker volume inspect katagame_postgres_data

# Remove specific volume (WARNING: deletes data!)
docker volume rm katagame_postgres_data
```

### Issue: "Service won't start"
```bash
# Check logs for errors
docker-compose logs postgres

# Check exit codes
docker-compose ps

# Restart service
docker-compose restart postgres

# Recreate service
docker-compose up -d --force-recreate postgres
```

---

## 📊 Monitoring & Performance

### View Resource Usage
```bash
# Real-time stats
docker stats

# Just PostgreSQL
docker stats katagame-postgres

# Limited to 5 seconds then exit
docker stats --no-stream
```

### Check Database Size
```bash
# Total database size
docker-compose exec postgres psql -U postgres -d katagame -c "SELECT pg_size_pretty(pg_database_size('katagame'));"

# Size per table
docker-compose exec postgres psql -U postgres -d katagame -c "SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename)) FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(tablename) DESC;"

# Size of volumes
docker volume ls
du -sh /var/lib/docker/volumes/katagame_postgres_data/_data
```

### Slow Query Log
```bash
# Enable query logging in PostgreSQL
docker-compose exec postgres psql -U postgres -d katagame -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# Reload configuration
docker-compose exec postgres psql -U postgres -d katagame -c "SELECT pg_reload_conf();"

# View logs
docker-compose logs postgres | grep "duration:"
```

---

## 🔄 Updating Services

### Update Docker Images
```bash
# Pull latest images
docker-compose pull

# Restart services with new images
docker-compose up -d

# Clean up old images
docker image prune
```

### Update Configuration
```bash
# Edit docker-compose.yml or docker-compose.prod.yml
nano docker-compose.yml

# Restart services to apply changes
docker-compose restart

# Or recreate services
docker-compose up -d --force-recreate
```

---

## 📝 Environment Variables

### Using .env File
```bash
# Create .env file in project root
cat > .env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin-password
EOF

# Start services with .env
docker-compose up -d

# Docker Compose automatically loads .env
```

### Production Example
```bash
# .env for production
POSTGRES_USER=produser
POSTGRES_PASSWORD=$(openssl rand -base64 32)
PGADMIN_DEFAULT_EMAIL=devops@company.com
PGADMIN_DEFAULT_PASSWORD=$(openssl rand -base64 32)
DB_POOL_SIZE=50
DB_SSL_MODE=require
```

---

## 🚀 Advanced Topics

### Multi-Container Debugging
```bash
# Access container shell
docker-compose exec postgres bash

# Run commands inside container
docker-compose exec postgres apt-get update
docker-compose exec postgres apt-get install -y package-name

# Check network connectivity
docker-compose exec postgres ping redis
docker-compose exec redis redis-cli ping
```

### Network Management
```bash
# View network
docker network ls

# Inspect network
docker network inspect katagame_katagame-network

# Services can communicate by name:
# postgres:5432
# redis:6379
# These are automatically resolved by Docker's DNS
```

### Scaling Services
```bash
# Run multiple Redis instances
docker-compose up -d --scale redis=3

# Check running instances
docker-compose ps redis
```

### Custom Network Config
```yaml
# In docker-compose.yml
networks:
  katagame-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## 🔒 Security Best Practices

### For Development
```bash
# Use default passwords from docker-compose.yml
# Fine for development only!
```

### For Production
```bash
# 1. Change all default passwords in .env
POSTGRES_PASSWORD=$(openssl rand -base64 32)
PGADMIN_DEFAULT_PASSWORD=$(openssl rand -base64 32)

# 2. Use environment file
docker-compose --env-file /etc/katagame/.env up -d

# 3. Use docker-compose.prod.yml override
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Enable SSL/TLS
# Add to PostgreSQL container environment:
# POSTGRES_INITDB_ARGS: "-c ssl=on"

# 5. Restrict network access
# Use firewall rules, security groups, or network policies
```

---

## 📚 Related Documentation

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database initialization guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick command reference
- [HOWTO_USE_BACKEND.md](./HOWTO_USE_BACKEND.md) - Backend setup guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment

---

## 💡 Tips & Tricks

### One-liner Commands
```bash
# Stop and remove everything, then start fresh
docker-compose down -v && docker-compose up -d

# Tail all logs from all services
docker-compose logs -f

# Check if database is healthy
docker-compose exec postgres pg_isready -U postgres

# Get database URL for copying
echo "postgresql://postgres:postgres@localhost:5432/katagame"
```

### Useful Aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias dc='docker-compose'
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'

# Usage:
# dcup
# dcps
# dclogs postgres
```

### Monitoring Script
```bash
#!/bin/bash
# Save as monitor.sh

watch -n 1 '
echo "=== Docker Compose Status ==="
docker-compose ps
echo ""
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"
'
```

---

## ✅ Checklist

- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] docker-compose.yml in project root
- [ ] Run `docker-compose up -d`
- [ ] Database schema initialized
- [ ] Backend configured with `DATABASE_URL`
- [ ] Backend running and accessible
- [ ] PgAdmin accessible (optional)
- [ ] Backups scheduled
- [ ] Monitoring alerts configured

---

**Happy containerizing! 🐳**
