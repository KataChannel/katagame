#!/bin/bash

# Script to test resetPlayerData mutation
# Usage: ./test-reset-player.sh <player_id>

PLAYER_ID=${1:-""}

if [ -z "$PLAYER_ID" ]; then
  echo "❌ Error: Player ID required"
  echo "Usage: ./test-reset-player.sh <player_id>"
  exit 1
fi

echo "🔍 Testing resetPlayerData mutation for player: $PLAYER_ID"
echo ""

# Get JWT token (you need to login first)
echo "⚠️ Make sure you have a valid JWT token in your environment"
echo "Set TOKEN variable: export TOKEN='your-jwt-token'"
echo ""

if [ -z "$TOKEN" ]; then
  echo "❌ Error: TOKEN environment variable not set"
  echo "Please login and set your JWT token:"
  echo "export TOKEN='your-jwt-token-here'"
  exit 1
fi

echo "1️⃣ Checking BEFORE reset..."
curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { me { id username level experience resources } myProvinces { id provinceId } myHeroes { id heroId } }"
  }' | jq '.'

echo ""
echo "2️⃣ Executing resetPlayerData mutation..."
RESET_RESULT=$(curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation { resetPlayerData { success message } }"
  }')

echo "$RESET_RESULT" | jq '.'

# Check if successful
SUCCESS=$(echo "$RESET_RESULT" | jq -r '.data.resetPlayerData.success')

if [ "$SUCCESS" = "true" ]; then
  echo ""
  echo "✅ Reset successful!"
  echo ""
  echo "3️⃣ Checking AFTER reset..."
  curl -s -X POST http://localhost:3000/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "query": "query { me { id username level experience resources } myProvinces { id provinceId } myHeroes { id heroId } }"
    }' | jq '.'
  
  echo ""
  echo "✅ Expected results:"
  echo "  - level: 1"
  echo "  - experience: 0"
  echo "  - resources: {gold: 1000, rice: 1000, lumber: 500, stone: 500, bazan: 100, gems: 1500, culture: 100}"
  echo "  - myProvinces: []"
  echo "  - myHeroes: []"
else
  echo ""
  echo "❌ Reset failed!"
  MESSAGE=$(echo "$RESET_RESULT" | jq -r '.data.resetPlayerData.message')
  echo "Error: $MESSAGE"
fi
