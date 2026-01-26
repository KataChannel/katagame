#!/bin/bash

echo "======================================"
echo "🧪 Frontend Province Display Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Check Systems${NC}"
echo "--------------------------------------"

# Check backend
if curl -s http://localhost:3000/graphql > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running${NC}"
else
    echo -e "${YELLOW}❌ Backend not running!${NC}"
    exit 1
fi

# Check frontend
if curl -s http://localhost:11000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend running${NC}"
else
    echo -e "${YELLOW}❌ Frontend not running!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Test Backend API${NC}"
echo "--------------------------------------"

# Register new test user
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@test.com"
PASSWORD="test123"
USERNAME="TestUser${TIMESTAMP}"

echo "Creating test account: $EMAIL"

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{register(email:\\\"$EMAIL\\\",password:\\\"$PASSWORD\\\",username:\\\"$USERNAME\\\"){success playerId token message}}\"}")

echo "$REGISTER_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    
    # Extract token
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    PLAYER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"playerId":"[^"]*"' | cut -d'"' -f4)
    
    echo "Token: ${TOKEN:0:50}..."
    echo "Player ID: $PLAYER_ID"
else
    echo -e "${YELLOW}❌ Registration failed${NC}"
    echo "$REGISTER_RESPONSE"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Test myProvinces GraphQL Query${NC}"
echo "--------------------------------------"

PROVINCES_RESPONSE=$(curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"query{myProvinces{id provinceId province{name region}farmerLevel resourceLevel developmentLevel}}"}')

echo "Response:"
echo "$PROVINCES_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PROVINCES_RESPONSE"

echo "$PROVINCES_RESPONSE" | grep -q 'Hà Nội'
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend returns provinces correctly${NC}"
else
    echo -e "${YELLOW}⚠️ No provinces in response${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Frontend Test Instructions${NC}"
echo "--------------------------------------"
echo ""
echo "Open browser at: ${GREEN}http://localhost:11000${NC}"
echo ""
echo "1. Login with:"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo ""
echo "2. After login, page will reload"
echo ""
echo "3. Open browser console (F12)"
echo ""
echo "4. Look for these logs:"
echo "   ${GREEN}🔐 Auth token found, syncing data...${NC}"
echo "   ${GREEN}🔄 Starting game data sync from API...${NC}"
echo "   ${GREEN}📦 Provinces API Response: {...}${NC}"
echo "   ${GREEN}✅ Received 2 provinces from API${NC}"
echo "   ${GREEN}🗺️ Transformed provinces for frontend: [...]${NC}"
echo ""
echo "5. Provinces should display:"
echo "   - Hà Nội (North)"
echo "   - Hồ Chí Minh (South)"
echo ""
echo "======================================"
echo -e "${GREEN}✅ Backend Test Complete!${NC}"
echo "======================================"
echo ""
