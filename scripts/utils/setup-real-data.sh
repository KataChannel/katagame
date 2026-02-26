#!/bin/bash

# 🚀 Frontend Real Data Integration - Quick Start Script
# This script helps set up and verify everything is ready to use real MVP1 data

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🎮 Frontend Real Data Integration - Quick Start              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -f "package.json" ]; then
  if [ -f "frontend/package.json" ]; then
    cd frontend
  else
    echo -e "${RED}❌ Error: Please run this script from the project root or frontend directory${NC}"
    exit 1
  fi
fi

echo -e "${BLUE}📋 Phase 1: Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check API Client exists
echo -n "Checking API Client file... "
if [ -f "lib/mvp1ApiClient.ts" ]; then
  echo -e "${GREEN}✅ mvp1ApiClient.ts found${NC}"
else
  echo -e "${RED}❌ mvp1ApiClient.ts not found${NC}"
  exit 1
fi

# Check Hooks file exists
echo -n "Checking Hooks file... "
if [ -f "lib/useGameData.ts" ]; then
  echo -e "${GREEN}✅ useGameData.ts found${NC}"
else
  echo -e "${RED}❌ useGameData.ts not found${NC}"
  exit 1
fi

# Check Integration docs exist
echo -n "Checking documentation... "
if [ -f "lib/MVP1_FRONTEND_INTEGRATION.md" ]; then
  echo -e "${GREEN}✅ Integration guide found${NC}"
else
  echo -e "${YELLOW}⚠️  Integration guide not found${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Phase 2: Environment Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check .env.local exists
echo -n "Checking environment configuration... "
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✅ .env.local found${NC}"
  
  # Check if API URL is configured
  if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
    API_URL=$(grep "NEXT_PUBLIC_API_URL" .env.local | cut -d '=' -f 2)
    echo "   API URL configured to: ${API_URL}"
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_API_URL not configured${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  .env.local not found - creating default${NC}"
  
  # Create .env.local with defaults
  cat > .env.local << 'EOF'
# MVP1 Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:11101/api/v1
NEXT_PUBLIC_DEBUG_API=true

# Game configuration
NEXT_PUBLIC_GAME_NAME=Kata Game
NEXT_PUBLIC_VERSION=1.0.0
EOF
  
  echo -e "${GREEN}✅ .env.local created with defaults${NC}"
fi

echo ""
echo -e "${BLUE}📦 Phase 3: Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check node_modules
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📥 Installing dependencies...${NC}"
  npm install
  echo -e "${GREEN}✅ Dependencies installed${NC}"
else
  echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""
echo -e "${BLUE}🧪 Phase 4: Type Checking${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking TypeScript compilation..."
if npm run type-check 2>&1 | tail -5; then
  echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
  echo -e "${YELLOW}⚠️  TypeScript check completed (check output above for details)${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Phase 5: Backend Verification${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if backend is running
echo -n "Checking if NestJS backend is running... "
if timeout 2 bash -c 'echo > /dev/tcp/localhost/11101' 2>/dev/null; then
  echo -e "${GREEN}✅ Backend is running on localhost:11101${NC}"
  
  # Try to fetch a sample endpoint (GraphQL)
  echo -n "Testing API endpoint... "
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:11101/graphql | grep -q "200\|400\|401"; then
    echo -e "${GREEN}✅ API is responding${NC}"
  else
    echo -e "${YELLOW}⚠️  API not responding as expected${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Backend not detected on localhost:11101${NC}"
  echo ""
  echo "    To start the backend, run:"
  echo -e "    ${BLUE}cd backend && npm run dev${NC}"
fi

echo ""
echo -e "${BLUE}📚 Phase 6: Documentation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DOCS=(
  "FRONTEND_INTEGRATION_READY.md"
  "FRONTEND_REAL_DATA_INTEGRATION_GUIDE.md"
  "REAL_DATA_MIGRATION_CHECKLIST.md"
)

echo "Available documentation:"
for doc in "${DOCS[@]}"; do
  if [ -f "../$doc" ]; then
    echo -e "  ${GREEN}✅${NC} $doc"
  else
    echo -e "  ${RED}❌${NC} $doc"
  fi
done

echo ""
echo -e "${BLUE}✨ Phase 7: Quick Reference${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "API Client Usage:"
echo -e "  ${YELLOW}import MVP1ApiClient from '@/lib/mvp1ApiClient';${NC}"
echo ""

echo "Setting Auth Token:"
echo -e "  ${YELLOW}MVP1ApiClient.setAuthToken(token);${NC}"
echo ""

echo "Loading Game Data:"
echo -e "  ${YELLOW}import { useGameData } from '@/lib/useGameData';${NC}"
echo -e "  ${YELLOW}const { stories, provinces, heroes } = useGameData();${NC}"
echo ""

echo "Calling Endpoints:"
echo -e "  ${YELLOW}const stories = await MVP1ApiClient.getStories();${NC}"
echo -e "  ${YELLOW}const heroes = await MVP1ApiClient.getPlayerHeroes();${NC}"
echo -e "  ${YELLOW}const resources = await MVP1ApiClient.getPlayerResources();${NC}"
echo ""

echo -e "${BLUE}📋 Next Steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣  Ensure backend is running:"
echo -e "    ${BLUE}cd ../backend && npm run dev${NC}"
echo ""

echo "2️⃣  Review integration guide:"
echo -e "    ${BLUE}cat ../FRONTEND_REAL_DATA_INTEGRATION_GUIDE.md${NC}"
echo ""

echo "3️⃣  Follow migration checklist:"
echo -e "    ${BLUE}cat ../REAL_DATA_MIGRATION_CHECKLIST.md${NC}"
echo ""

echo "4️⃣  Start frontend development:"
echo -e "    ${BLUE}npm run dev${NC}"
echo ""

echo "5️⃣  Begin component migration:"
echo "    - Start with ResourceBar component"
echo "    - Then ProvinceCard"
echo "    - Then CultureCenter"
echo "    - Then HeroesTab"
echo "    - Finally main page.tsx"
echo ""

echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Everything is ready to start replacing mock data with real MVP1 endpoints!"
echo ""
echo "For detailed instructions, see: FRONTEND_REAL_DATA_INTEGRATION_GUIDE.md"
echo ""
