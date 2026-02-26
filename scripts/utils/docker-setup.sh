#!/bin/bash

# KataGame Development Setup Script with Docker Compose
# This script sets up the entire development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Install from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker installed: $(docker --version)"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        echo "Install from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose installed: $(docker-compose --version)"
    
    # Check Node/npm (for backend)
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        echo "Install from: https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js installed: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm installed: $(npm --version)"
}

# Start Docker services
start_services() {
    print_header "Starting Docker Services"
    
    if [ "$1" == "full" ]; then
        print_info "Starting all services including optional (Redis, PgAdmin)"
        docker-compose --profile optional up -d
    else
        print_info "Starting core services (PostgreSQL)"
        docker-compose up -d postgres
    fi
    
    # Wait for database
    print_info "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if docker-compose exec postgres pg_isready -U postgres &> /dev/null; then
            print_success "PostgreSQL is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "PostgreSQL failed to start after 30 attempts"
            exit 1
        fi
        echo -n "."
        sleep 1
    done
}

# Initialize database
init_database() {
    print_header "Initializing Database"
    
    # Check if database exists
    DB_EXISTS=$(docker-compose exec postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='katagame'")
    
    if [ -z "$DB_EXISTS" ]; then
        print_info "Creating database..."
        docker-compose exec postgres psql -U postgres -c "CREATE DATABASE katagame;"
        print_success "Database created"
    else
        print_info "Database already exists"
    fi
    
    # Run schema
    if [ -f "katagame_database_schema.sql" ]; then
        print_info "Running schema..."
        docker-compose exec -i postgres psql -U postgres -d katagame < katagame_database_schema.sql
        print_success "Schema initialized"
    else
        print_error "Schema file not found: katagame_database_schema.sql"
        exit 1
    fi
}

# Setup backend
setup_backend() {
    print_header "Setting Up Backend"
    
    if [ ! -d "backend" ]; then
        print_error "backend directory not found"
        exit 1
    fi
    
    cd backend
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        print_info "Creating .env from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
        else
            echo "DATABASE_URL=postgresql://postgres:postgres@localhost:11103/katagame" > .env
            echo "PORT=11101" >> .env
            echo "REDIS_URL=redis://localhost:11104" >> .env
        fi
        print_success ".env created"
    else
        print_info ".env already exists"
    fi
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_info "Dependencies already installed"
    fi
    
    cd ..
}

# Print service URLs
print_services() {
    print_header "Services Ready!"
    
    echo ""
    echo -e "${GREEN}Services running:${NC}"
    docker-compose ps
    
    echo ""
    echo -e "${GREEN}Available URLs:${NC}"
    echo -e "  Backend API:  ${BLUE}http://localhost:11101/graphql${NC}"
    echo -e "  GraphQL:      ${BLUE}http://localhost:11101/graphql${NC}"
    echo -e "  Database:     ${BLUE}postgres://localhost:11103/katagame${NC}"
    
    # Check for optional services
    if docker-compose ps redis &> /dev/null | grep -q "redis"; then
        echo -e "  Redis:        ${BLUE}redis://localhost:11104${NC}"
    fi
    
    if docker-compose ps pgadmin &> /dev/null | grep -q "pgadmin"; then
        echo -e "  PgAdmin:      ${BLUE}http://localhost:11102${NC} (admin@katagame.local / admin)"
    fi
    
    echo ""
}

# Print next steps
print_next_steps() {
    print_header "Next Steps"
    
    echo ""
    echo "1. Start the backend:"
    echo -e "   ${BLUE}cd backend${NC}"
    echo -e "   ${BLUE}npm run dev${NC}"
    echo ""
    echo "2. In another terminal, start the frontend:"
    echo -e "   ${BLUE}cd frontend${NC}"
    echo -e "   ${BLUE}npm run dev${NC}"
    echo ""
    echo "3. Test the API:"
    echo -e "   ${BLUE}curl http://localhost:11101/graphql${NC}"
    echo ""
    echo "4. View database:"
    echo -e "   ${BLUE}docker-compose exec postgres psql -U postgres -d katagame${NC}"
    echo ""
    echo "5. Stop services:"
    echo -e "   ${BLUE}docker-compose stop${NC}"
    echo ""
    echo "6. Stop and remove all:"
    echo -e "   ${BLUE}docker-compose down -v${NC}"
    echo ""
}

# Main execution
main() {
    clear
    
    print_header "🎮 KataGame Development Setup"
    
    echo ""
    print_info "This script will set up your complete development environment with Docker"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Ask about full setup
    read -p "Include optional services (Redis, PgAdmin)? (y/n): " -n 1 -r INCLUDE_OPTIONAL
    echo ""
    
    if [[ $INCLUDE_OPTIONAL =~ ^[Yy]$ ]]; then
        start_services "full"
    else
        start_services "core"
    fi
    
    # Initialize database
    init_database
    
    # Setup backend
    setup_backend
    
    # Print services
    print_services
    
    # Print next steps
    print_next_steps
    
    print_success "Setup complete! Happy coding! 🚀"
}

# Run main
main "$@"
