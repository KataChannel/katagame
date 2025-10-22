#!/bin/bash

# KataGame Backend Setup Script
# Thiết lập môi trường phát triển cho Motia backend

set -e

echo "=========================================="
echo "  KataGame Backend Setup"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_status "Node.js detected: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_status "npm detected: $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    print_status "PostgreSQL detected: $PSQL_VERSION"
    PSQL_AVAILABLE=true
else
    print_warning "PostgreSQL CLI (psql) not found. Database setup will be skipped."
    print_warning "Install PostgreSQL client tools or use Docker for database"
    PSQL_AVAILABLE=false
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    REDIS_VERSION=$(redis-cli --version)
    print_status "Redis detected: $REDIS_VERSION"
else
    print_warning "Redis not found. Install it for caching support"
fi

echo ""
echo "=========================================="
echo "  Installing Dependencies"
echo "=========================================="
echo ""

# Navigate to motia directory
cd "$(dirname "$0")"

# Install dependencies
print_status "Installing npm packages..."
npm install --legacy-peer-deps

echo ""
print_status "Dependencies installed"

echo ""
echo "=========================================="
echo "  Environment Configuration"
echo "=========================================="
echo ""

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    print_status "Creating .env.local..."
    cp .env.example .env.local
    print_warning "Please update .env.local with your database credentials"
else
    print_status ".env.local already exists"
fi

echo ""
echo "=========================================="
echo "  Database Setup"
echo "=========================================="
echo ""

# Check if psql is available
if [ "$PSQL_AVAILABLE" != "true" ]; then
    print_warning "PostgreSQL CLI not available. Skipping database setup."
    print_warning "You can:"
    print_warning "  1. Install PostgreSQL client: sudo apt install postgresql-client"
    print_warning "  2. Use Docker: docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres"
    print_warning "  3. Use managed database (AWS RDS, Heroku, etc.)"
    print_warning ""
    print_status "Update DATABASE_URL in .env.local after setting up database"
else
    # Ask user if they want to setup database
    read -p "Do you want to setup the database now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        
        # Source environment
        set -a
        [ -f .env.local ] && source .env.local
        set +a

        # Extract database info from DATABASE_URL
        # postgresql://user:password@host:port/dbname
        DBUSER="${DB_USER:-postgres}"
        DBHOST="${DB_HOST:-localhost}"
        DBPORT="${DB_PORT:-5432}"
        DBNAME="${DB_NAME:-katagame}"

        echo ""
        print_status "Database Configuration:"
        echo "  Host: $DBHOST:$DBPORT"
        echo "  Database: $DBNAME"
        echo "  User: $DBUSER"
        echo ""

        # Create database
        print_status "Creating database..."
        PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$DBHOST" -U "$DBUSER" -c "CREATE DATABASE $DBNAME;" 2>/dev/null || print_warning "Database may already exist"

        # Run schema
        if [ -f ../katagame_database_schema.sql ]; then
            print_status "Running database schema..."
            PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$DBHOST" -U "$DBUSER" -d "$DBNAME" -f ../katagame_database_schema.sql
            print_status "Database schema created"
        else
            print_warning "Schema file not found: ../katagame_database_schema.sql"
        fi
    fi
fi

echo ""
echo "=========================================="
echo "  Generate Types"
echo "=========================================="
echo ""

print_status "Generating Motia types..."
npm run generate-types 2>/dev/null || print_warning "Could not generate types (Motia CLI may not be available)"

echo ""
echo "=========================================="
echo "  Build"
echo "=========================================="
echo ""

print_status "Building project..."
npm run build 2>/dev/null || print_warning "Build may have issues"

echo ""
echo "=========================================="
echo "  Setup Complete! 🎉"
echo "=========================================="
echo ""

print_status "Next steps:"
echo "  1. Setup PostgreSQL:"
echo "     - Option A: Install PostgreSQL locally (sudo apt install postgresql)"
echo "     - Option B: Use Docker (docker run -d -e POSTGRES_PASSWORD=postgres postgres)"
echo "     - Option C: Use managed database (AWS RDS, Heroku, etc.)"
echo ""
echo "  2. Update .env.local with your database credentials"
echo "  3. Run: npm run dev"
echo "  4. Backend will start at http://localhost:3001"
echo ""

print_status "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build production"
echo "  npm run generate-types - Generate Motia types"
echo "  npm test             - Run tests"
echo ""

print_warning "Database Setup Instructions:"
echo ""
echo "Option 1: PostgreSQL Local Install"
echo "  # Ubuntu/Debian"
echo "  sudo apt update && sudo apt install postgresql postgresql-contrib"
echo "  sudo systemctl start postgresql"
echo ""
echo "Option 2: Docker"
echo "  docker run -d --name katagame-postgres \\"
echo "    -e POSTGRES_PASSWORD=postgres \\"
echo "    -p 5432:5432 \\"
echo "    postgres:15"
echo ""
echo "Option 3: Update .env.local"
echo "  DATABASE_URL=postgresql://user:pass@host:5432/katagame"
echo ""

print_warning "Important:"
echo "  - Change JWT_SECRET in .env.local before production"
echo "  - Ensure PostgreSQL is running before starting backend"
echo "  - Frontend expects API at http://localhost:3001"
echo ""

echo "=========================================="
