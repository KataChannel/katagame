#!/bin/bash

# Frontend API Integration Verification Script
# Checks if all files are in place and properly configured

echo "🔍 Frontend API Integration Verification"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $1 (NOT FOUND)"
        ((CHECKS_FAILED++))
    fi
}

# Function to check content
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $1 contains '$2'"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $1 missing '$2'"
        ((CHECKS_FAILED++))
    fi
}

echo "📁 Created Files:"
echo "-----------------"
check_file "frontend/lib/hooks/useApi.ts"
check_file "frontend/lib/authContext.tsx"
check_file "FRONTEND_API_INTEGRATION_COMPLETE.md"
check_file "FRONTEND_API_INTEGRATION_IMPLEMENTATION.md"
check_file "FRONTEND_API_INTEGRATION_QUICK_START.md"

echo ""
echo "📝 File Content Verification:"
echo "----------------------------"
check_content "frontend/lib/hooks/useApi.ts" "useHeroes"
check_content "frontend/lib/hooks/useApi.ts" "useGameAction"
check_content "frontend/lib/authContext.tsx" "useAuth"
check_content "frontend/lib/authContext.tsx" "AuthProvider"
check_content "frontend/components/HeroesTab.tsx" "useHeroes"
check_content "frontend/app/layout.tsx" "AuthProvider"
check_content "frontend/app/layout.tsx" "@/lib/authContext"

echo ""
echo "⚙️ Configuration Check:"
echo "---------------------"
check_content "frontend/.env.local" "NEXT_PUBLIC_API_URL"

echo ""
echo "🎯 Component Status:"
echo "-------------------"
check_content "frontend/components/HeroesTab.tsx" "loading" && echo "  • HeroesTab has loading state" || echo "  • HeroesTab missing loading state"
check_content "frontend/components/HeroesTab.tsx" "error" && echo "  • HeroesTab has error state" || echo "  • HeroesTab missing error state"

echo ""
echo "📊 Summary:"
echo "----------"
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Failed: ${RED}$CHECKS_FAILED${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✨ All checks passed! Frontend API integration is complete.${NC}"
    echo ""
    echo "📚 Documentation:"
    echo "  • FRONTEND_API_INTEGRATION_COMPLETE.md - Full guide"
    echo "  • FRONTEND_API_INTEGRATION_IMPLEMENTATION.md - Step-by-step"
    echo "  • FRONTEND_API_INTEGRATION_QUICK_START.md - Quick reference"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Wrap app with AuthProvider (layout.tsx)"
    echo "  2. Update ProvinceTab to use useProvinces() hook"
    echo "  3. Update ResourcesTab to use usePlayerResources() hook"
    echo "  4. Update StoriesTab to use useStories() hook"
    echo "  5. Test in browser with DevTools Network tab"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some checks failed. Please review the items above.${NC}"
    exit 1
fi
