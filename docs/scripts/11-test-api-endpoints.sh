#!/bin/bash

# MVP 1.0 Week 1 - API Testing Script
# Quick verification that all endpoints are working

BASE_URL="http://localhost:11001"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MVP 1.0 API Endpoint Testing ===${NC}\n"

# Test 1: Register User
echo -e "${BLUE}1. POST /auth/register${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"Password123"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  echo "Response: $REGISTER_RESPONSE"
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "Response: $REGISTER_RESPONSE"
fi

# Test 2: Login
echo -e "\n${BLUE}2. POST /auth/login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testuser@example.com",
    "password":"Password123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Login successful${NC}"
  # Extract token (adjust based on actual response structure)
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Token: ${TOKEN:0:20}..."
  echo "Full Response: $LOGIN_RESPONSE"
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
fi

# Test 3: Get Current Player Profile
echo -e "\n${BLUE}3. GET /players/me${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/players/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Get profile successful${NC}"
  echo "Response: $PROFILE_RESPONSE"
else
  echo -e "${RED}✗ Get profile failed${NC}"
  echo "Response: $PROFILE_RESPONSE"
fi

# Test 4: Update Player
echo -e "\n${BLUE}4. PUT /players/update${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/v1/players/update" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"TestPlayer123"
  }')

if echo "$UPDATE_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Player update successful${NC}"
  echo "Response: $UPDATE_RESPONSE"
else
  echo -e "${RED}✗ Player update failed${NC}"
  echo "Response: $UPDATE_RESPONSE"
fi

# Test 5: Get Heroes List
echo -e "\n${BLUE}5. GET /heroes/list${NC}"
HEROES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/heroes/list" \
  -H "Authorization: Bearer $TOKEN")

if echo "$HEROES_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Get heroes list successful${NC}"
  HERO_COUNT=$(echo "$HEROES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
  echo "Found $HERO_COUNT heroes"
  echo "Response: $HEROES_RESPONSE" | head -200
else
  echo -e "${RED}✗ Get heroes list failed${NC}"
  echo "Response: $HEROES_RESPONSE"
fi

# Test 6: Recruit Hero (needs hero ID from previous response)
echo -e "\n${BLUE}6. POST /heroes/recruit${NC}"
# Extract first hero ID
HERO_ID=$(echo "$HEROES_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Recruiting hero: $HERO_ID"

RECRUIT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/heroes/recruit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"heroId\":\"$HERO_ID\"
  }")

if echo "$RECRUIT_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Hero recruit successful${NC}"
  echo "Response: $RECRUIT_RESPONSE"
else
  echo -e "${RED}✗ Hero recruit failed${NC}"
  echo "Response: $RECRUIT_RESPONSE"
fi

# Test 7: Start Battle
echo -e "\n${BLUE}7. POST /battles/start${NC}"
START_BATTLE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/battles/start" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$START_BATTLE_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Start battle successful${NC}"
  BATTLE_ID=$(echo "$START_BATTLE_RESPONSE" | grep -o '"battleId":"[^"]*"' | cut -d'"' -f4)
  echo "Battle ID: $BATTLE_ID"
  echo "Response: $START_BATTLE_RESPONSE"
else
  echo -e "${RED}✗ Start battle failed${NC}"
  echo "Response: $START_BATTLE_RESPONSE"
fi

# Test 8: Resolve Battle
echo -e "\n${BLUE}8. POST /battles/resolve${NC}"
RESOLVE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/battles/resolve" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"battleId\":\"$BATTLE_ID\",
    \"result\":\"attacker_win\"
  }")

if echo "$RESOLVE_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Resolve battle successful${NC}"
  echo "Response: $RESOLVE_RESPONSE"
else
  echo -e "${RED}✗ Resolve battle failed${NC}"
  echo "Response: $RESOLVE_RESPONSE"
fi

# Test 9: Harvest Resources
echo -e "\n${BLUE}9. GET /resources/harvest${NC}"
HARVEST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/resources/harvest" \
  -H "Authorization: Bearer $TOKEN")

if echo "$HARVEST_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Harvest resources successful${NC}"
  echo "Response: $HARVEST_RESPONSE"
else
  echo -e "${RED}✗ Harvest resources failed${NC}"
  echo "Response: $HARVEST_RESPONSE"
fi

# Test 10: Trade Resources
echo -e "\n${BLUE}10. POST /resources/trade${NC}"
TRADE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/resources/trade" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromResource":"gold",
    "toResource":"rice",
    "amount":50
  }')

if echo "$TRADE_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Trade resources successful${NC}"
  echo "Response: $TRADE_RESPONSE"
else
  echo -e "${RED}✗ Trade resources failed${NC}"
  echo "Response: $TRADE_RESPONSE"
fi

# Test 11: Get Achievements
echo -e "\n${BLUE}11. GET /achievements/list${NC}"
ACHIEVEMENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/achievements/list" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ACHIEVEMENTS_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Get achievements successful${NC}"
  echo "Response: $ACHIEVEMENTS_RESPONSE" | head -300
else
  echo -e "${RED}✗ Get achievements failed${NC}"
  echo "Response: $ACHIEVEMENTS_RESPONSE"
fi

# Test 12: Save Game
echo -e "\n${BLUE}12. POST /save-game/sync${NC}"
SAVE_GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/save-game/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gameData":{
      "checkpoint":5,
      "level":1,
      "progress":"started"
    }
  }')

if echo "$SAVE_GAME_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Save game successful${NC}"
  echo "Response: $SAVE_GAME_RESPONSE"
else
  echo -e "${RED}✗ Save game failed${NC}"
  echo "Response: $SAVE_GAME_RESPONSE"
fi

# Test 13: Refresh Token
echo -e "\n${BLUE}13. POST /auth/refresh-token${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/refresh-token" \
  -H "Authorization: Bearer $TOKEN")

if echo "$REFRESH_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Refresh token successful${NC}"
  echo "Response: $REFRESH_RESPONSE"
else
  echo -e "${RED}✗ Refresh token failed${NC}"
  echo "Response: $REFRESH_RESPONSE"
fi

# Test 14: Logout
echo -e "\n${BLUE}14. POST /auth/logout${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Logout successful${NC}"
  echo "Response: $LOGOUT_RESPONSE"
else
  echo -e "${RED}✗ Logout failed${NC}"
  echo "Response: $LOGOUT_RESPONSE"
fi

echo -e "\n${BLUE}=== Testing Complete ===${NC}"
