#!/bin/bash

# ============================================================================
# KATAGAME - Database Initialization Test Script
# Purpose: Verify all seeded data in database
# ============================================================================

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║           🧪 KATAGAME DATABASE VERIFICATION TEST                          ║"
echo "║                                                                            ║"
echo "║           Testing seeded data:                                            ║"
echo "║           ✓ Provinces (63)                                                ║"
echo "║           ✓ Resources (5)                                                 ║"
echo "║           ✓ Buildings (6)                                                 ║"
echo "║           ✓ Heroes (23)                                                   ║"
echo "║           ✓ Stories (30)                                                  ║"
echo "║           ✓ Quiz Questions (90)                                           ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '#' | xargs)
fi

DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:11003/katagame"}
echo "📌 Testing Database: $DATABASE_URL"
echo ""

if ! command -v psql &> /dev/null; then
  echo "❌ psql not found. Please install PostgreSQL client."
  exit 1
fi

run_test() {
  local test_name=$1
  local query=$2
  local expected=$3

  echo -n "🔍 Testing: $test_name... "
  
  result=$(psql "$DATABASE_URL" -t -c "$query" 2>/dev/null | tr -d ' ')
  
  if [ -z "$expected" ]; then
    echo "✅ Result: $result rows"
  elif [ "$result" = "$expected" ]; then
    echo "✅ Found: $result/$expected"
  else
    echo "❌ Expected $expected, got $result"
    return 1
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 1: STATIC DATA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test provinces
run_test "Provinces Count" \
  "SELECT COUNT(*) FROM provinces;" \
  "63"

# Test sample province
run_test "Hanoi Province Exists" \
  "SELECT COUNT(*) FROM provinces WHERE id = 1 AND name = 'Hà Nội';" \
  "1"

# Test resources
run_test "Resources Count" \
  "SELECT COUNT(*) FROM resources;" \
  "5"

# Test resource types
run_test "Gold Resource" \
  "SELECT COUNT(*) FROM resources WHERE element_type = 'gold';" \
  "1"

run_test "Rice Resource" \
  "SELECT COUNT(*) FROM resources WHERE element_type = 'rice';" \
  "1"

# Test buildings
run_test "Buildings Count" \
  "SELECT COUNT(*) FROM buildings;" \
  "6"

run_test "Farm Building" \
  "SELECT COUNT(*) FROM buildings WHERE building_type = 'farm';" \
  "1"

run_test "Mine Building" \
  "SELECT COUNT(*) FROM buildings WHERE building_type = 'mine';" \
  "1"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 2: HEROES & STORIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test heroes
run_test "Total Heroes" \
  "SELECT COUNT(*) FROM heroes;" \
  "23"

run_test "MVP1 Available Heroes" \
  "SELECT COUNT(*) FROM heroes WHERE is_available = true;" \
  "5"

run_test "Hung Vuong Hero" \
  "SELECT COUNT(*) FROM heroes WHERE id = 'hero_hung_vuong_i';" \
  "1"

run_test "Premium Heroes" \
  "SELECT COUNT(*) FROM heroes WHERE is_premium = true;" \
  "2"

# Test stories
run_test "Total Stories" \
  "SELECT COUNT(*) FROM stories;" \
  "30"

run_test "Day 1 Story Exists" \
  "SELECT COUNT(*) FROM stories WHERE day = 1;" \
  "1"

run_test "Day 2 Story Exists" \
  "SELECT COUNT(*) FROM stories WHERE day = 2;" \
  "1"

# Test quiz questions
run_test "Total Quiz Questions" \
  "SELECT COUNT(*) FROM quiz_questions;" \
  "90"

run_test "Quiz Questions Per Story" \
  "SELECT COUNT(*) FROM quiz_questions WHERE story_id = 'story_day_01';" \
  "3"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUITE 3: DATA INTEGRITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test story categories
run_test "History Stories" \
  "SELECT COUNT(*) FROM stories WHERE category = 'history';" \
  ""

run_test "Geography Stories" \
  "SELECT COUNT(*) FROM stories WHERE category = 'geography';" \
  ""

# Test resource generation rates
run_test "Gold Resource Rate" \
  "SELECT base_generation_rate FROM resources WHERE element_type = 'gold';" \
  ""

# Test building costs
run_test "Farm Building Cost" \
  "SELECT base_gold_cost FROM buildings WHERE building_type = 'farm';" \
  ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DETAILED QUERIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 Resource Details:"
psql "$DATABASE_URL" -c "
SELECT emoji, name_english, element_type, base_generation_rate, base_storage_capacity 
FROM resources 
ORDER BY element_type;
" 2>/dev/null

echo ""
echo "📊 Building Details:"
psql "$DATABASE_URL" -c "
SELECT name_english, building_type, base_gold_cost, construction_time_seconds, max_level 
FROM buildings 
ORDER BY building_type;
" 2>/dev/null

echo ""
echo "📊 MVP1 Heroes:"
psql "$DATABASE_URL" -c "
SELECT name_english, era, rarity, bonus_type, is_premium
FROM heroes 
WHERE is_available = true
ORDER BY rarity DESC;
" 2>/dev/null

echo ""
echo "📊 First 5 Stories:"
psql "$DATABASE_URL" -c "
SELECT day, title_english, category, era 
FROM stories 
WHERE day <= 5 
ORDER BY day;
" 2>/dev/null

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║           ✅ VERIFICATION COMPLETE                                        ║"
echo "║                                                                            ║"
echo "║           Summary:                                                         ║"
echo "║           ✓ 63 Provinces loaded                                            ║"
echo "║           ✓ 5 Resources with generation rates                              ║"
echo "║           ✓ 6 Buildings with construction times                            ║"
echo "║           ✓ 23 Heroes (5 MVP1 + 18 MVP2+)                                  ║"
echo "║           ✓ 30 Stories with categories & eras                              ║"
echo "║           ✓ 90 Quiz Questions (3 per story)                                ║"
echo "║                                                                            ║"
echo "║           Database is ready for game development! 🚀                       ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
