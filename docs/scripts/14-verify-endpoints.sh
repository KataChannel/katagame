#!/bin/bash

# API Response Format Verification Script
# Validates that all 15 API endpoints have proper Motia response format

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         API Response Format Verification Report              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

ENDPOINTS=(
  "auth-login.step.ts"
  "auth-logout.step.ts"
  "auth-refresh-token.step.ts"
  "auth-register.step.ts"
  "battle-start.step.ts"
  "battle-resolve.step.ts"
  "hero-list.step.ts"
  "hero-recruit.step.ts"
  "player-profile.step.ts"
  "player-profile-public.step.ts"
  "player-update.step.ts"
  "resource-harvest.step.ts"
  "resource-trade.step.ts"
  "achievement-list.step.ts"
  "save-game-sync.step.ts"
)

ENDPOINT_PATH="/chikiet/kataoffical/katagame/motia/steps/game"
VALID=0
INVALID=0
TOTAL=${#ENDPOINTS[@]}

for endpoint in "${ENDPOINTS[@]}"; do
  FILE="$ENDPOINT_PATH/$endpoint"
  NAME="${endpoint%.step.ts}"
  
  if [ ! -f "$FILE" ]; then
    echo "⚠️  $NAME - FILE NOT FOUND"
    INVALID=$((INVALID + 1))
    continue
  fi
  
  # Check for incorrect format (success: first at line start)
  if grep -E '^\s*success\s*:' "$FILE" | grep -q 'return'; then
    echo "❌ $NAME - Incorrect format detected (success: ...)"
    INVALID=$((INVALID + 1))
    continue
  fi
  
  # Check for correct format (has return with status and body)
  if grep -q 'status.*body' "$FILE" || grep -q 'body.*success' "$FILE"; then
    echo "✅ $(printf '%-30s' "$NAME") - OK"
    VALID=$((VALID + 1))
  else
    # Fallback check - just ensure it has status and body somewhere
    STATUS_COUNT=$(grep -c 'status:' "$FILE")
    BODY_COUNT=$(grep -c 'body:' "$FILE")
    
    if [ "$STATUS_COUNT" -gt 0 ] && [ "$BODY_COUNT" -gt 0 ]; then
      echo "✅ $(printf '%-30s' "$NAME") - OK"
      VALID=$((VALID + 1))
    else
      echo "⚠️  $(printf '%-30s' "$NAME") - Format unclear"
      INVALID=$((INVALID + 1))
    fi
  fi
done

echo ""
echo "───────────────────────────────────────────────────────────────"
echo "Summary:"
echo "  ✅ Valid endpoints:  $VALID/$TOTAL"
echo "  ❌ Issues found:    $INVALID"
if [ $INVALID -eq 0 ]; then
  echo "  Overall Status:     🟢 ALL ENDPOINTS READY"
  EXIT_CODE=0
else
  echo "  Overall Status:     🔴 NEEDS FIXES"
  EXIT_CODE=1
fi
echo ""

exit $EXIT_CODE
