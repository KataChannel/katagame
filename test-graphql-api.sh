#!/bin/bash

echo "===== GraphQL API Test Suite ====="
echo ""

BASE_URL="http://localhost:3000/graphql"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_query() {
  local name=$1
  local query=$2
  local expected=$3
  
  echo -e "${BLUE}Testing: $name${NC}"
  
  response=$(curl -s "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\"}")
  
  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Response: $response"
    ((FAILED++))
  fi
  echo ""
}

test_mutation() {
  local name=$1
  local mutation=$2
  local expected=$3
  
  echo -e "${BLUE}Testing: $name${NC}"
  
  response=$(curl -s "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$mutation\"}")
  
  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    
    # Extract token if it's a register/login test
    if [[ $mutation == *"register"* ]] || [[ $mutation == *"login"* ]]; then
      TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
      export AUTH_TOKEN="$TOKEN"
    fi
  else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Response: $response"
    ((FAILED++))
  fi
  echo ""
}

test_authenticated_query() {
  local name=$1
  local query=$2
  local expected=$3
  
  echo -e "${BLUE}Testing (Authenticated): $name${NC}"
  
  if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}✗ FAILED - No auth token${NC}"
    ((FAILED++))
    echo ""
    return
  fi
  
  response=$(curl -s "$BASE_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{\"query\":\"$query\"}")
  
  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAILED${NC}"
    echo "Response: $response"
    ((FAILED++))
  fi
  echo ""
}

echo "========================================="
echo "1. Testing GraphQL Server Health"
echo "========================================="

test_query "Server Health Check" \
  "{ __typename }" \
  "Query"

echo "========================================="
echo "2. Testing Authentication"
echo "========================================="

# Generate random email to avoid duplicates
RANDOM_EMAIL="test$(date +%s)@test.com"

test_mutation "User Registration" \
  "mutation { register(email: \\\"$RANDOM_EMAIL\\\", password: \\\"password123\\\", username: \\\"testuser$(date +%s)\\\") { success token username level } }" \
  "\"success\":true"

test_mutation "User Login" \
  "mutation { login(email: \\\"$RANDOM_EMAIL\\\", password: \\\"password123\\\") { success token username level } }" \
  "\"success\":true"

echo "========================================="
echo "3. Testing Player Queries"
echo "========================================="

test_authenticated_query "Get Current User" \
  "query { me { id username email level experience } }" \
  "\"username\""

echo "========================================="
echo "4. Testing Resource Queries"
echo "========================================="

test_authenticated_query "Get All Resources" \
  "query { resources { id nameEnglish elementType } }" \
  "\"resources\""

test_authenticated_query "Get My Resources" \
  "query { myResources { resourceType amount } }" \
  "\"myResources\""

echo "========================================="
echo "5. Testing Province Queries"
echo "========================================="

test_authenticated_query "Get All Provinces" \
  "query { provinces { id name description region } }" \
  "\"provinces\""

test_authenticated_query "Get My Provinces" \
  "query { myProvinces { provinceId farmerLevel } }" \
  "\"myProvinces\""

echo "========================================="
echo "6. Testing Hero Queries"
echo "========================================="

test_authenticated_query "Get All Heroes" \
  "query { heroes { id nameVietnamese rarity } }" \
  "\"heroes\""

test_authenticated_query "Get My Heroes" \
  "query { myHeroes { heroId level experience } }" \
  "\"myHeroes\""

echo "========================================="
echo "7. Testing Story Queries"
echo "========================================="

test_authenticated_query "Get All Stories" \
  "query { stories { id titleVietnamese content day } }" \
  "\"stories\""

echo "========================================="
echo "Test Results Summary"
echo "========================================="

TOTAL=$((PASSED + FAILED))
echo -e "${GREEN}Passed: $PASSED/$TOTAL${NC}"
echo -e "${RED}Failed: $FAILED/$TOTAL${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed ✗${NC}"
  exit 1
fi
