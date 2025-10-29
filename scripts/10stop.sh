#!/bin/bash

# Kata Game - Stop Development Environment

echo "🛑 Stopping Kata Game development environment..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop frontend
echo -e "${YELLOW}Stopping Next.js frontend...${NC}"
pkill -f "next dev" 2>/dev/null || true
if [ -f /tmp/katagame-frontend.pid ]; then
    kill $(cat /tmp/katagame-frontend.pid) 2>/dev/null || true
    rm /tmp/katagame-frontend.pid
fi
echo -e "${GREEN}✓ Frontend stopped${NC}"

# Stop backend
echo -e "${YELLOW}Stopping Motia backend...${NC}"
pkill -f "motia dev" 2>/dev/null || true
if [ -f /tmp/katagame-backend.pid ]; then
    kill $(cat /tmp/katagame-backend.pid) 2>/dev/null || true
    rm /tmp/katagame-backend.pid
fi
echo -e "${GREEN}✓ Backend stopped${NC}"

# Optionally stop PostgreSQL (commented out by default)
# echo -e "${YELLOW}Stopping PostgreSQL...${NC}"
# docker stop katagame-postgres
# echo -e "${GREEN}✓ PostgreSQL stopped${NC}"

echo ""
echo -e "${GREEN}All services stopped${NC}"
echo ""
echo "Note: PostgreSQL container is still running."
echo "To stop it: docker stop katagame-postgres"
echo ""
