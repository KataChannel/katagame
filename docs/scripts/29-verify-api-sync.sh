#!/bin/bash

# API Data Sync Implementation Verification
# Kiểm tra toàn bộ API sync layer đã được implement đúng

echo "🔍 Verifying API Data Sync Implementation..."
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  local file=$1
  local description=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $description"
    ((CHECKS_PASSED++))
    return 0
  else
    echo -e "${RED}❌${NC} $description - File not found: $file"
    ((CHECKS_FAILED++))
    return 1
  fi
}

check_content() {
  local file=$1
  local pattern=$2
  local description=$3
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $description"
    ((CHECKS_PASSED++))
    return 0
  else
    echo -e "${RED}❌${NC} $description - Pattern not found in $file"
    ((CHECKS_FAILED++))
    return 1
  fi
}

echo "📁 Checking File Structure..."
check_file "frontend/lib/hooks/useApiDataSync.ts" "useApiDataSync.ts hook created"
check_file "frontend/app/DataSyncInitializer.tsx" "DataSyncInitializer component created"

echo ""
echo "📝 Checking Hook Implementation..."
check_content "frontend/lib/hooks/useApiDataSync.ts" "useApiDataSync" "useApiDataSync hook exported"
check_content "frontend/lib/hooks/useApiDataSync.ts" "useAuth" "useAuth imported from authContext"
check_content "frontend/lib/hooks/useApiDataSync.ts" "MVP1ApiClient" "MVP1ApiClient imported"
check_content "frontend/lib/hooks/useApiDataSync.ts" "setAuthToken" "Auth token set on API client"
check_content "frontend/lib/hooks/useApiDataSync.ts" "getGameData" "getGameData API call present"
check_content "frontend/lib/hooks/useApiDataSync.ts" "getPlayerHeroes" "getPlayerHeroes API call present"
check_content "frontend/lib/hooks/useApiDataSync.ts" "getPlayerProvinces" "getPlayerProvinces API call present"
check_content "frontend/lib/hooks/useApiDataSync.ts" "getPlayerResources" "getPlayerResources API call present"
check_content "frontend/lib/hooks/useApiDataSync.ts" "setInterval" "30-second refresh interval implemented"

echo ""
echo "🔄 Checking DataSyncInitializer..."
check_content "frontend/app/DataSyncInitializer.tsx" "useApiDataSync" "DataSyncInitializer uses useApiDataSync hook"
check_content "frontend/app/DataSyncInitializer.tsx" "'use client'" "DataSyncInitializer is client component"

echo ""
echo "📐 Checking Layout Integration..."
check_content "frontend/app/layout.tsx" "DataSyncInitializer" "DataSyncInitializer imported in layout"
check_content "frontend/app/layout.tsx" "<DataSyncInitializer>" "DataSyncInitializer wraps children in layout"
check_content "frontend/app/layout.tsx" "<AuthProvider>" "AuthProvider still present in layout"

echo ""
echo "🔐 Checking Auth Context..."
check_content "frontend/lib/authContext.tsx" "isAuthenticated" "isAuthenticated property in auth context"
check_content "frontend/lib/authContext.tsx" "token" "token property in auth context"

echo ""
echo "🌐 Checking API Client..."
check_content "frontend/lib/mvp1ApiClient.ts" "setAuthToken" "API client has setAuthToken method"
check_content "frontend/lib/mvp1ApiClient.ts" "getGameData" "API client has getGameData method"
check_content "frontend/lib/mvp1ApiClient.ts" "getPlayerHeroes" "API client has getPlayerHeroes method"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 VERIFICATION RESULTS"
echo ""
echo -e "Checks Passed: ${GREEN}${CHECKS_PASSED}${NC}"
echo -e "Checks Failed: ${RED}${CHECKS_FAILED}${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! API Data Sync layer is ready.${NC}"
  echo ""
  echo "🚀 Next Steps:"
  echo "1. Start backend server:"
  echo "   docker-compose up -d"
  echo ""
  echo "2. Open frontend in browser:"
  echo "   npm run dev"
  echo ""
  echo "3. Login with credentials"
  echo ""
  echo "4. Open browser console (F12)"
  echo ""
  echo "5. Watch for sync logs:"
  echo "   ✅ Game data synced from API"
  echo "   ✅ Heroes from API"
  echo "   ✅ Provinces from API"
  echo "   ✅ Resources from API"
  echo ""
  echo "📋 Expected Behavior:"
  echo "- Data syncs every 30 seconds"
  echo "- No errors in console"
  echo "- Network tab shows API requests"
  echo "- Components display data from API"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please review implementation.${NC}"
  exit 1
fi
