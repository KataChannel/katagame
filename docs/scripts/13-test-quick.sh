#!/bin/bash

# Quick MVP 1.0 API Test
BASE_URL="http://localhost:11001"
TIMESTAMP=$(date +%s)

echo "🧪 MVP 1.0 Quick API Test"
echo "================================"

# Test 1: Register
echo -e "\n1️⃣ Testing Register..."
REGISTER=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"user$TIMESTAMP\",\"email\":\"test$TIMESTAMP@test.com\",\"password\":\"Pass123456\"}")
  
if echo "$REGISTER" | grep -q "success.*true"; then
  echo "✅ Register: PASS"
  TOKEN=$(echo "$REGISTER" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
  PLAYER_ID=$(echo "$REGISTER" | grep -o '"playerId":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo "❌ Register: FAIL"
  echo "$REGISTER"
  exit 1
fi

# Test 2: Login
echo -e "\n2️⃣ Testing Login..."
LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$TIMESTAMP@test.com\",\"password\":\"Pass123456\"}")

if echo "$LOGIN" | grep -q "success.*true"; then
  echo "✅ Login: PASS"
else
  echo "❌ Login: FAIL"
  echo "$LOGIN"
fi

# Test 3: Get Profile
echo -e "\n3️⃣ Testing Get Profile..."
PROFILE=$(curl -s -X GET "$BASE_URL/api/v1/players/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE" | grep -q "success.*true"; then
  echo "✅ Get Profile: PASS"
else
  echo "❌ Get Profile: FAIL"
  echo "$PROFILE"
fi

# Test 4: Get Heroes List
echo -e "\n4️⃣ Testing Heroes List..."
HEROES=$(curl -s -X GET "$BASE_URL/api/v1/heroes/list" \
  -H "Authorization: Bearer $TOKEN")

if echo "$HEROES" | grep -q "success.*true"; then
  echo "✅ Heroes List: PASS"
  HERO_ID=$(echo "$HEROES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo "❌ Heroes List: FAIL"
  echo "$HEROES"
fi

# Test 5: Recruit Hero
echo -e "\n5️⃣ Testing Hero Recruit..."
RECRUIT=$(curl -s -X POST "$BASE_URL/api/v1/heroes/recruit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"heroId\":\"$HERO_ID\"}")

if echo "$RECRUIT" | grep -q "success.*true"; then
  echo "✅ Recruit Hero: PASS"
else
  echo "❌ Recruit Hero: FAIL"
  echo "$RECRUIT"
fi

# Test 6: Start Battle
echo -e "\n6️⃣ Testing Battle Start..."
BATTLE=$(curl -s -X POST "$BASE_URL/api/v1/battles/start" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"enemyId\":\"1\",\"heroIds\":[\"$HERO_ID\"]}")

if echo "$BATTLE" | grep -q "success.*true"; then
  echo "✅ Battle Start: PASS"
  BATTLE_ID=$(echo "$BATTLE" | grep -o '"battleId":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo "❌ Battle Start: FAIL"
  echo "$BATTLE"
fi

# Test 7: Harvest Resources
echo -e "\n7️⃣ Testing Harvest Resources..."
HARVEST=$(curl -s -X GET "$BASE_URL/api/v1/resources/harvest" \
  -H "Authorization: Bearer $TOKEN")

if echo "$HARVEST" | grep -q "success.*true"; then
  echo "✅ Harvest: PASS"
else
  echo "❌ Harvest: FAIL"
  echo "$HARVEST"
fi

# Test 8: Get Achievements
echo -e "\n8️⃣ Testing Get Achievements..."
ACHIEVEMENTS=$(curl -s -X GET "$BASE_URL/api/v1/achievements/list" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ACHIEVEMENTS" | grep -q "success.*true"; then
  echo "✅ Achievements: PASS"
else
  echo "❌ Achievements: FAIL"
  echo "$ACHIEVEMENTS"
fi

# Test 9: Logout
echo -e "\n9️⃣ Testing Logout..."
LOGOUT=$(curl -s -X POST "$BASE_URL/api/v1/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LOGOUT" | grep -q "success.*true"; then
  echo "✅ Logout: PASS"
else
  echo "❌ Logout: FAIL"
  echo "$LOGOUT"
fi

echo -e "\n================================"
echo "✅ All tests completed!"
