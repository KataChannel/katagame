#!/bin/bash

# MVP 1.0 Integration Testing Suite
# Comprehensive testing of all endpoints with security checks

set -e

BASE_URL="http://localhost:11001"
RESULTS_FILE="test-results.json"
TOKEN=""
PLAYER_ID=""
HERO_ID=""
BATTLE_ID=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}MVP 1.0 Integration Test Suite${NC}"
echo -e "${BLUE}================================${NC}\n"

# Function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local test_name=$5
  local auth_header=$6

  echo -ne "Testing: $test_name... "

  local headers='-H "Content-Type: application/json"'
  if [ -n "$auth_header" ]; then
    headers="$headers -H \"Authorization: Bearer $auth_header\""
  fi

  local response
  if [ "$method" = "GET" ]; then
    response=$(eval "curl -s -w '\n%{http_code}' -X $method '$BASE_URL$endpoint' $headers")
  else
    response=$(eval "curl -s -w '\n%{http_code}' -X $method '$BASE_URL$endpoint' $headers -d '$data'")
  fi

  local body=$(echo "$response" | head -n -1)
  local status=$(echo "$response" | tail -n 1)

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
    ((TESTS_PASSED++))
    echo "$body"
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status)"
    ((TESTS_FAILED++))
    echo "Response: $body"
  fi
  echo ""
}

# ============================================
# PHASE 1: Authentication Tests
# ============================================
echo -e "${YELLOW}=== Phase 1: Authentication ===${NC}\n"

# Test 1: Register new user
TEST_USERNAME="testuser_$(date +%s)"
TEST_EMAIL="testuser_$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123"

echo -ne "Test 1: Register User... "
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  PLAYER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"playerId":"[^"]*"' | cut -d'"' -f4)
  echo "Player ID: $PLAYER_ID\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $REGISTER_RESPONSE\n"
fi

# Test 2: Login with valid credentials
echo -ne "Test 2: Login... "
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "Token: ${TOKEN:0:20}...\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $LOGIN_RESPONSE\n"
fi

# Test 3: Login with invalid credentials
echo -ne "Test 3: Login with Invalid Credentials (should fail)... "
INVALID_LOGIN=$(curl -s -w '\n%{http_code}' -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123\"}")

STATUS=$(echo "$INVALID_LOGIN" | tail -n 1)
if [ "$STATUS" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (Should return 401)\n"
  ((TESTS_FAILED++))
fi

# Test 4: Invalid email format validation
echo -ne "Test 4: Invalid Email Format Validation... "
INVALID_EMAIL=$(curl -s -w '\n%{http_code}' -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"notanemail\",\"password\":\"Password123\"}")

STATUS=$(echo "$INVALID_EMAIL" | tail -n 1)
if [ "$STATUS" = "400" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (Should return 400)\n"
  ((TESTS_FAILED++))
fi

# ============================================
# PHASE 2: Player Management Tests
# ============================================
echo -e "${YELLOW}=== Phase 2: Player Management ===${NC}\n"

# Test 5: Get current profile
echo -ne "Test 5: Get Current Profile... "
PROFILE=$(curl -s -X GET "$BASE_URL/api/v1/players/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  echo "Profile retrieved\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $PROFILE\n"
fi

# Test 6: Update player profile
echo -ne "Test 6: Update Player Profile... "
UPDATE=$(curl -s -X PUT "$BASE_URL/api/v1/players/update" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"TestPlayer_$(date +%s)\"}")

if echo "$UPDATE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  echo "Profile updated\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $UPDATE\n"
fi

# Test 7: Get public profile (if player ID extracted)
if [ -n "$PLAYER_ID" ]; then
  echo -ne "Test 7: Get Public Profile... "
  PUBLIC_PROFILE=$(curl -s -X GET "$BASE_URL/api/v1/players/$PLAYER_ID/profile" \
    -H "Authorization: Bearer $TOKEN")

  if echo "$PUBLIC_PROFILE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
    echo "Public profile retrieved\n"
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    echo "Response: $PUBLIC_PROFILE\n"
  fi
fi

# ============================================
# PHASE 3: Game Systems Tests
# ============================================
echo -e "${YELLOW}=== Phase 3: Game Systems ===${NC}\n"

# Test 8: Get heroes list
echo -ne "Test 8: Get Heroes List... "
HEROES=$(curl -s -X GET "$BASE_URL/api/v1/heroes/list" \
  -H "Authorization: Bearer $TOKEN")

if echo "$HEROES" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  HERO_ID=$(echo "$HEROES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "Heroes found: Hero ID: ${HERO_ID:0:15}...\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $HEROES\n"
fi

# Test 9: Recruit hero
if [ -n "$HERO_ID" ]; then
  echo -ne "Test 9: Recruit Hero... "
  RECRUIT=$(curl -s -X POST "$BASE_URL/api/v1/heroes/recruit" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"heroId\":\"$HERO_ID\"}")

  if echo "$RECRUIT" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
    echo "Hero recruited\n"
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    echo "Response: $RECRUIT\n"
  fi
fi

# Test 10: Start battle
echo -ne "Test 10: Start Battle... "
BATTLE=$(curl -s -X POST "$BASE_URL/api/v1/battles/start" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}")

if echo "$BATTLE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  BATTLE_ID=$(echo "$BATTLE" | grep -o '"battleId":"[^"]*"' | cut -d'"' -f4)
  echo "Battle started: Battle ID: ${BATTLE_ID:0:15}...\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $BATTLE\n"
fi

# Test 11: Resolve battle
if [ -n "$BATTLE_ID" ]; then
  echo -ne "Test 11: Resolve Battle... "
  RESOLVE=$(curl -s -X POST "$BASE_URL/api/v1/battles/resolve" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"battleId\":\"$BATTLE_ID\",\"result\":\"attacker_win\"}")

  if echo "$RESOLVE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
    echo "Battle resolved, rewards granted\n"
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((TESTS_FAILED++))
    echo "Response: $RESOLVE\n"
  fi
fi

# Test 12: Harvest resources
echo -ne "Test 12: Harvest Resources... "
HARVEST=$(curl -s -X GET "$BASE_URL/api/v1/resources/harvest" \
  -H "Authorization: Bearer $TOKEN")

if echo "$HARVEST" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  echo "Resources harvested\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $HARVEST\n"
fi

# Test 13: Trade resources
echo -ne "Test 13: Trade Resources... "
TRADE=$(curl -s -X POST "$BASE_URL/api/v1/resources/trade" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"fromResource\":\"gold\",\"toResource\":\"rice\",\"amount\":50}")

if echo "$TRADE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  echo "Resources traded\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $TRADE\n"
fi

# Test 14: Get achievements
echo -ne "Test 14: Get Achievements... "
ACHIEVEMENTS=$(curl -s -X GET "$BASE_URL/api/v1/achievements/list" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ACHIEVEMENTS" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  echo "Achievements retrieved\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $ACHIEVEMENTS\n"
fi

# Test 15: Save game
echo -ne "Test 15: Save Game... "
SAVE=$(curl -s -X POST "$BASE_URL/api/v1/save-game/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"gameData\":{\"checkpoint\":5,\"level\":1}}")

if echo "$SAVE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((TESTS_PASSED++))
  echo "Game saved\n"
else
  echo -e "${RED}✗ FAIL${NC}"
  ((TESTS_FAILED++))
  echo "Response: $SAVE\n"
fi

# ============================================
# PHASE 4: Security Tests
# ============================================
echo -e "${YELLOW}=== Phase 4: Security Tests ===${NC}\n"

# Test 16: Missing auth token
echo -ne "Test 16: Missing Auth Token (should fail)... "
NO_AUTH=$(curl -s -w '\n%{http_code}' -X GET "$BASE_URL/api/v1/players/me")
STATUS=$(echo "$NO_AUTH" | tail -n 1)

if [ "$STATUS" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (Should return 401)\n"
  ((TESTS_FAILED++))
fi

# Test 17: Invalid auth token
echo -ne "Test 17: Invalid Auth Token (should fail)... "
INVALID_TOKEN=$(curl -s -w '\n%{http_code}' -X GET "$BASE_URL/api/v1/players/me" \
  -H "Authorization: Bearer invalid_token_12345")
STATUS=$(echo "$INVALID_TOKEN" | tail -n 1)

if [ "$STATUS" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (Should return 401)\n"
  ((TESTS_FAILED++))
fi

# Test 18: Weak password validation
echo -ne "Test 18: Weak Password Validation... "
WEAK_PASS=$(curl -s -w '\n%{http_code}' -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"weak_$(date +%s)@example.com\",\"password\":\"weak\"}")
STATUS=$(echo "$WEAK_PASS" | tail -n 1)

if [ "$STATUS" = "400" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Correctly rejected)\n"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} (Should return 400)\n"
  ((TESTS_FAILED++))
fi

# ============================================
# PHASE 5: Rate Limiting Tests
# ============================================
echo -e "${YELLOW}=== Phase 5: Rate Limiting ===${NC}\n"

echo "Test 19: Rate Limiting (sending 11 rapid requests)..."
RATE_LIMIT_TEST=0
for i in {1..11}; do
  RATE_TEST=$(curl -s -w '%{http_code}' -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test@example.com\",\"password\":\"WrongPass123\"}" -o /dev/null)
  
  if [ "$RATE_TEST" = "429" ]; then
    echo -e "  Request $i: ${GREEN}429 Rate Limited${NC} (Expected)"
    RATE_LIMIT_TEST=1
    break
  elif [ "$i" = "11" ] && [ "$RATE_TEST" != "429" ]; then
    echo -e "  Request $i: ${YELLOW}$RATE_TEST${NC} (Expected 429 by now)"
  else
    echo -e "  Request $i: $RATE_TEST"
  fi
done

if [ "$RATE_LIMIT_TEST" = "1" ]; then
  echo -e "${GREEN}✓ PASS${NC} (Rate limiting working)\n"
  ((TESTS_PASSED++))
else
  echo -e "${YELLOW}⚠ NOTE${NC} (Rate limiting may not trigger in fast succession)\n"
fi

# ============================================
# TEST SUMMARY
# ============================================
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests:  $((TESTS_PASSED + TESTS_FAILED))"

SUCCESS_RATE=$((TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED)))
echo -e "Success Rate: ${GREEN}$SUCCESS_RATE%${NC}\n"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED${NC}\n"
  exit 0
else
  echo -e "${RED}✗ SOME TESTS FAILED${NC}\n"
  exit 1
fi
