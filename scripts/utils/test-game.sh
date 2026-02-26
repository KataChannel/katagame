#!/bin/bash

echo "======================================"
echo "🎮 KATAGAME - Quick Test Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 System Status Check${NC}"
echo "--------------------------------------"

# Check Backend
echo -n "Backend (port 3000): "
if curl -s http://localhost:3000/graphql > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${YELLOW}❌ Not running${NC}"
    echo "Start with: cd backend && npm run dev"
fi

# Check Frontend
echo -n "Frontend (port 11100): "
if curl -s http://localhost:11100 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${YELLOW}❌ Not running${NC}"
    echo "Start with: cd frontend && npm run dev"
fi

# Check Database
echo -n "Database (port 11103): "
if docker exec katagame-postgres psql -U postgres -d katagame -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${YELLOW}❌ Not running${NC}"
    echo "Start with: docker-compose up -d"
fi

echo ""
echo -e "${BLUE}📈 Game Data Status${NC}"
echo "--------------------------------------"

# Check game data
docker exec katagame-postgres psql -U postgres -d katagame -c "
SELECT 'Heroes' as table_name, COUNT(*) as count FROM heroes 
UNION ALL SELECT 'Provinces', COUNT(*) FROM provinces 
UNION ALL SELECT 'Resources', COUNT(*) FROM resources 
UNION ALL SELECT 'Stories', COUNT(*) FROM stories 
UNION ALL SELECT 'Players', COUNT(*) FROM players 
ORDER BY table_name;" 2>/dev/null

echo ""
echo -e "${BLUE}🧪 Test Registration${NC}"
echo "--------------------------------------"

# Register test player
TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@test.com"
echo "Creating test player: $EMAIL"

RESPONSE=$(curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{register(email:\\\"$EMAIL\\\",password:\\\"test123\\\",username:\\\"TestPlayer$TIMESTAMP\\\"){success playerId message}}\"}")

echo "$RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Registration successful!${NC}"
    PLAYER_ID=$(echo "$RESPONSE" | grep -o '"playerId":"[^"]*"' | cut -d'"' -f4)
    echo "Player ID: $PLAYER_ID"
    
    # Check provinces
    echo ""
    echo "Checking auto-unlocked provinces..."
    docker exec katagame-postgres psql -U postgres -d katagame -c "
    SELECT prov.name, pp.farmer_level, pp.resource_level, pp.development_level 
    FROM player_provinces pp 
    JOIN provinces prov ON pp.province_id = prov.id 
    WHERE pp.player_id = '$PLAYER_ID';" 2>/dev/null
    
    # Check resources
    echo ""
    echo "Checking starting resources..."
    docker exec katagame-postgres psql -U postgres -d katagame -c "
    SELECT resources FROM players WHERE id = '$PLAYER_ID';" 2>/dev/null
    
else
    echo -e "${YELLOW}❌ Registration failed${NC}"
    echo "$RESPONSE"
fi

echo ""
echo -e "${BLUE}🧪 Test Login & GraphQL Query${NC}"
echo "--------------------------------------"

# Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{login(email:\\\"$EMAIL\\\",password:\\\"test123\\\"){token playerId}}\"}")

echo "$LOGIN_RESPONSE" | grep -q '"token":'
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Login successful!${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    # Query my provinces
    echo ""
    echo "Querying player's provinces via GraphQL..."
    PROVINCES_RESPONSE=$(curl -s -X POST http://localhost:3000/graphql \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"query":"query{myProvinces{province{name region}farmerLevel}}"}')
    
    echo "$PROVINCES_RESPONSE" | grep -q 'Hà Nội'
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ GraphQL query successful!${NC}"
        echo "$PROVINCES_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PROVINCES_RESPONSE"
    else
        echo -e "${YELLOW}❌ GraphQL query failed${NC}"
        echo "$PROVINCES_RESPONSE"
    fi
else
    echo -e "${YELLOW}❌ Login failed${NC}"
    echo "$LOGIN_RESPONSE"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✅ Test Complete!${NC}"
echo "======================================"
echo ""
echo "Open your browser at:"
echo "  Frontend: http://localhost:11100"
echo "  GraphQL Playground: http://localhost:3000/graphql"
echo ""
echo "Test credentials:"
echo "  Email: $EMAIL"
echo "  Password: test123"
echo ""
