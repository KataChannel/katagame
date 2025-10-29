#!/bin/bash

# Kata Game - Development Environment Launcher
# Starts PostgreSQL, Motia backend, and Next.js frontend

set -e

echo "🚀 Starting Kata Game development environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL container is running
echo -e "${YELLOW}1. Checking PostgreSQL...${NC}"
if docker ps | grep -q katagame-postgres; then
    echo -e "${GREEN}✓ PostgreSQL already running${NC}"
else
    echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
    if docker ps -a | grep -q katagame-postgres; then
        docker start katagame-postgres
    else
        echo -e "${RED}✗ PostgreSQL container 'katagame-postgres' not found!${NC}"
        echo "Create it with: docker run -d --name katagame-postgres -p 11003:5432 -e POSTGRES_PASSWORD=postgres postgres:15"
        exit 1
    fi
    sleep 3
    echo -e "${GREEN}✓ PostgreSQL started${NC}"
fi
echo ""

# Start Motia backend
echo -e "${YELLOW}2. Starting Motia backend (port 11001)...${NC}"
cd motia
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

# Kill any existing Motia processes
pkill -f "motia dev" 2>/dev/null || true
sleep 1

# Start backend in background
nohup npx motia dev -p 11001 > /tmp/katagame-backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > /tmp/katagame-backend.pid
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo -e "  Logs: /tmp/katagame-backend.log"
echo ""

# Start Next.js frontend
echo -e "${YELLOW}3. Starting Next.js frontend (port 11000)...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Start frontend in background
nohup npm run dev > /tmp/katagame-frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/katagame-frontend.pid
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo -e "  Logs: /tmp/katagame-frontend.log"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to initialize...${NC}"
sleep 8

# Check if services are running
echo ""
echo "=== Service Status ==="
echo ""

# Check backend
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend:  http://localhost:11001${NC}"
else
    echo -e "${RED}✗ Backend failed to start. Check /tmp/katagame-backend.log${NC}"
fi

# Check frontend
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend: http://localhost:11000${NC}"
else
    echo -e "${RED}✗ Frontend failed to start. Check /tmp/katagame-frontend.log${NC}"
fi

# Check PostgreSQL
if docker ps | grep -q katagame-postgres; then
    echo -e "${GREEN}✓ Database: postgresql://localhost:11003/katagame${NC}"
else
    echo -e "${RED}✗ PostgreSQL not running${NC}"
fi

echo ""
echo "=== Development Environment Ready ==="
echo ""
echo "Frontend: http://localhost:11000"
echo "Backend:  http://localhost:11001"
echo "Workbench: http://localhost:11001 (Motia UI)"
echo ""
echo "To stop all services: ./stop.sh"
echo "To view logs:"
echo "  Backend:  tail -f /tmp/katagame-backend.log"
echo "  Frontend: tail -f /tmp/katagame-frontend.log"
echo ""
