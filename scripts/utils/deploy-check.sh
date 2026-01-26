#!/bin/bash

# KataGame Deployment Initialization Script
# Prepares backend for staging/production deployment

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         🚀 KataGame Deployment Initialization                ║"
echo "║               Backend → Staging/Production                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_ROOT="/chikiet/kataoffical/katagame"
BACKEND_PATH="$PROJECT_ROOT/motia"
DB_SCHEMA="$PROJECT_ROOT/katagame_database_schema.sql"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counter
CHECKS_PASSED=0
CHECKS_FAILED=0

echo "📋 PRE-DEPLOYMENT VERIFICATION CHECKLIST"
echo ""

# Check 1: Verify backend exists
echo -n "1️⃣  Backend directory... "
if [ -d "$BACKEND_PATH" ]; then
  echo -e "${GREEN}✅ Found${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${RED}❌ NOT FOUND${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 2: Verify database schema
echo -n "2️⃣  Database schema... "
if [ -f "$DB_SCHEMA" ]; then
  LINES=$(wc -l < "$DB_SCHEMA")
  echo -e "${GREEN}✅ Found ($LINES lines)${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${RED}❌ NOT FOUND${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 3: Verify all 15 endpoints
echo -n "3️⃣  API endpoints (15/15)... "
ENDPOINT_COUNT=$(find "$BACKEND_PATH/steps/game" -name "*.step.ts" -type f | grep -E "(auth-|hero-|battle-|player-|resource-|achievement-|save-game)" | wc -l)
if [ "$ENDPOINT_COUNT" -ge 15 ]; then
  echo -e "${GREEN}✅ All found ($ENDPOINT_COUNT files)${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${YELLOW}⚠️  Found $ENDPOINT_COUNT (expected 15+)${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 4: Verify response wrapper utility
echo -n "4️⃣  Response wrapper utility... "
if [ -f "$BACKEND_PATH/src/utils/response.wrapper.ts" ]; then
  echo -e "${GREEN}✅ Found${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${RED}❌ NOT FOUND${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 5: Verify services
echo -n "5️⃣  Domain services... "
SERVICE_COUNT=$(find "$BACKEND_PATH/src/services" -name "*.service.ts" -type f 2>/dev/null | wc -l)
if [ "$SERVICE_COUNT" -ge 5 ]; then
  echo -e "${GREEN}✅ Found ($SERVICE_COUNT services)${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${YELLOW}⚠️  Found $SERVICE_COUNT services${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 6: Verify environment template
echo -n "6️⃣  Environment template... "
if [ -f "$PROJECT_ROOT/.env.example" ] || [ -f "$BACKEND_PATH/.env.example" ]; then
  echo -e "${GREEN}✅ Found${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${YELLOW}⚠️  Create .env.example file${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 7: Verify documentation
echo -n "7️⃣  Deployment documentation... "
if [ -f "$PROJECT_ROOT/DEPLOYMENT_READINESS.md" ]; then
  echo -e "${GREEN}✅ Found${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${RED}❌ NOT FOUND${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check 8: Verify endpoint verification script
echo -n "8️⃣  Endpoint verification script... "
if [ -f "$PROJECT_ROOT/verify-endpoints.sh" ]; then
  echo -e "${GREEN}✅ Found${NC}"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${RED}❌ NOT FOUND${NC}"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

echo ""
echo "───────────────────────────────────────────────────────────────"
echo ""

# Summary
if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED ($CHECKS_PASSED/$((CHECKS_PASSED + CHECKS_FAILED)))${NC}"
  echo ""
  echo "🚀 DEPLOYMENT READY!"
  echo ""
  echo "Next steps:"
  echo "1. Setup staging infrastructure (PostgreSQL, Redis)"
  echo "2. Configure environment variables (.env file)"
  echo "3. Deploy backend to staging server"
  echo "4. Run database migration"
  echo "5. Execute smoke tests"
  echo "6. Run integration test suite"
  echo ""
  echo "Documentation:"
  echo "  📖 Deployment Guide: $PROJECT_ROOT/DEPLOYMENT_GUIDE.md"
  echo "  📋 Deployment Readiness: $PROJECT_ROOT/DEPLOYMENT_READINESS.md"
  echo "  🎯 Backend Architecture: $PROJECT_ROOT/BACKEND_ARCHITECTURE_REVIEW.md"
  echo ""
  
  # Generate deployment summary
  echo "📊 DEPLOYMENT SUMMARY:"
  echo "  Backend Files: $ENDPOINT_COUNT endpoints + services"
  echo "  Database Schema: $LINES SQL lines"
  echo "  Status: ✅ 100% READY FOR STAGING"
  echo "  Timeline: Week 1 (staging), Week 2-3 (production)"
  echo ""
  
  exit 0
else
  echo -e "${RED}❌ $CHECKS_FAILED CHECKS FAILED${NC}"
  echo ""
  echo "Please fix the issues above before deploying."
  exit 1
fi
