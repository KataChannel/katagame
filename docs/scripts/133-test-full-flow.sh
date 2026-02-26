#!/bin/bash
# MVP1 Full Flow Test
# Tests complete game flow: login → get resources → harvest → upgrade province

echo "=========================================="
echo "MVP1 FULL FLOW TEST"
echo "=========================================="
echo ""

# 1. Login
echo "Step 1: Login as testplayer..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:11101/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@katagame.com","password":"test123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
PLAYER_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.playerId')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed!"
  echo $LOGIN_RESPONSE | jq .
  exit 1
fi

echo "✅ Login successful"
echo "   Player ID: $PLAYER_ID"
echo "   Level: $(echo $LOGIN_RESPONSE | jq -r '.data.level')"
echo "   Gold: $(echo $LOGIN_RESPONSE | jq -r '.data.gold')"
echo ""

# 2. Get Resources
echo "Step 2: Get current resources..."
RESOURCES=$(curl -s http://localhost:11101/api/v1/resources/my-resources \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Resources retrieved:"
echo $RESOURCES | jq '.body.data.resources'
echo ""

# 3. Get Provinces
echo "Step 3: Get player provinces..."
PROVINCES=$(curl -s http://localhost:11101/api/v1/provinces/my-provinces \
  -H "Authorization: Bearer $TOKEN")

PROVINCE_COUNT=$(echo $PROVINCES | jq '.body.data.totalProvinces')
echo "✅ Provinces owned: $PROVINCE_COUNT"
echo $PROVINCES | jq '.body.data.provinces[] | {name: .name, farmerLevel: .farmerLevel, resourceLevel: .resourceLevel, developmentLevel: .developmentLevel}'
echo ""

# 4. Harvest Resources
echo "Step 4: Harvest resources from provinces..."
HARVEST=$(curl -s -X POST http://localhost:11101/api/v1/resources/harvest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Harvest result:"
echo $HARVEST | jq .
echo ""

# 5. Upgrade Province (Farmer Level)
FIRST_PROVINCE_ID=$(echo $PROVINCES | jq -r '.body.data.provinces[0].provinceId')
echo "Step 5: Upgrade province $FIRST_PROVINCE_ID (Farmer Level)..."

UPGRADE=$(curl -s -X POST "http://localhost:11101/api/v1/provinces/$FIRST_PROVINCE_ID/upgrade/farmer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Upgrade result:"
echo $UPGRADE | jq .
echo ""

# 6. Get Updated Resources
echo "Step 6: Get updated resources after harvest & upgrade..."
RESOURCES_AFTER=$(curl -s http://localhost:11101/api/v1/resources/my-resources \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Updated resources:"
echo $RESOURCES_AFTER | jq '.body.data.resources'
echo ""

# 7. Get Updated Provinces
echo "Step 7: Get updated provinces..."
PROVINCES_AFTER=$(curl -s http://localhost:11101/api/v1/provinces/my-provinces \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Updated provinces:"
echo $PROVINCES_AFTER | jq '.body.data.provinces[] | {name: .name, farmerLevel: .farmerLevel, resourceLevel: .resourceLevel, developmentLevel: .developmentLevel}'
echo ""

echo "=========================================="
echo "✅ FULL FLOW TEST COMPLETED SUCCESSFULLY!"
echo "=========================================="
