#!/bin/bash

# =====================================================
# Docs Clean - Dọn dẹp và quản lý tài liệu
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║           🧹 DOCS CLEAN MANAGER           ║"
    echo "║              KataGame Dev                 ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${YELLOW}Chọn một tùy chọn:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Xóa node_modules (tất cả)"
    echo -e "  ${GREEN}2)${NC} Xóa build artifacts (.next, dist)"
    echo -e "  ${GREEN}3)${NC} Xóa cache (npm, bun, turbo)"
    echo -e "  ${GREEN}4)${NC} Xóa log files"
    echo -e "  ${GREEN}5)${NC} Xóa tất cả (node_modules + build + cache + logs)"
    echo -e "  ${GREEN}6)${NC} Reinstall dependencies"
    echo -e "  ${GREEN}7)${NC} Tính kích thước thư mục"
    echo -e "  ${GREEN}8)${NC} Tìm file lớn (>10MB)"
    echo -e "  ${GREEN}9)${NC} Xóa .DS_Store và Thumbs.db"
    echo -e "  ${GREEN}10)${NC} Tạo/Cập nhật .gitignore"
    echo -e "  ${GREEN}0)${NC} Thoát"
    echo ""
}

delete_node_modules() {
    echo -e "${CYAN}🗑️  Đang tìm và xóa node_modules...${NC}"
    
    # Count first
    count=$(find "$SCRIPT_DIR" -type d -name "node_modules" 2>/dev/null | wc -l)
    echo -e "${YELLOW}Tìm thấy $count thư mục node_modules${NC}"
    
    if [ "$count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Xác nhận xóa? (y/n):${NC}"
        read -r confirm
        
        if [ "$confirm" = "y" ]; then
            find "$SCRIPT_DIR" -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
            echo -e "${GREEN}✅ Đã xóa tất cả node_modules!${NC}"
        else
            echo -e "${YELLOW}Đã hủy.${NC}"
        fi
    else
        echo -e "${GREEN}Không tìm thấy node_modules nào.${NC}"
    fi
}

delete_build() {
    echo -e "${CYAN}🗑️  Đang xóa build artifacts...${NC}"
    
    # List of build directories
    build_dirs=(".next" "dist" ".turbo" ".motia" "build" "out")
    
    for dir in "${build_dirs[@]}"; do
        count=$(find "$SCRIPT_DIR" -type d -name "$dir" 2>/dev/null | wc -l)
        if [ "$count" -gt 0 ]; then
            echo -e "${YELLOW}Đang xóa $dir ($count thư mục)...${NC}"
            find "$SCRIPT_DIR" -type d -name "$dir" -exec rm -rf {} + 2>/dev/null || true
        fi
    done
    
    echo -e "${GREEN}✅ Đã xóa build artifacts!${NC}"
}

delete_cache() {
    echo -e "${CYAN}🗑️  Đang xóa cache...${NC}"
    
    # NPM cache
    if [ -d "$HOME/.npm" ]; then
        echo -e "${YELLOW}Xóa npm cache...${NC}"
        npm cache clean --force 2>/dev/null || true
    fi
    
    # Bun cache
    if [ -d "$HOME/.bun" ]; then
        echo -e "${YELLOW}Xóa bun cache...${NC}"
        rm -rf "$HOME/.bun/install/cache" 2>/dev/null || true
    fi
    
    # Turbo cache
    if [ -d "$SCRIPT_DIR/.turbo" ]; then
        echo -e "${YELLOW}Xóa turbo cache...${NC}"
        rm -rf "$SCRIPT_DIR/.turbo" 2>/dev/null || true
    fi
    
    # Next.js cache
    find "$SCRIPT_DIR" -type d -name ".next" -exec rm -rf {}/cache \; 2>/dev/null || true
    
    # ESLint cache
    find "$SCRIPT_DIR" -name ".eslintcache" -delete 2>/dev/null || true
    
    # TypeScript cache
    find "$SCRIPT_DIR" -name "*.tsbuildinfo" -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Đã xóa cache!${NC}"
}

delete_logs() {
    echo -e "${CYAN}🗑️  Đang xóa log files...${NC}"
    
    # Log files
    find "$SCRIPT_DIR" -name "*.log" -delete 2>/dev/null || true
    find "$SCRIPT_DIR" -type d -name "logs" -exec rm -rf {} + 2>/dev/null || true
    
    # NPM debug logs
    find "$SCRIPT_DIR" -name "npm-debug.log*" -delete 2>/dev/null || true
    find "$SCRIPT_DIR" -name "yarn-debug.log*" -delete 2>/dev/null || true
    find "$SCRIPT_DIR" -name "yarn-error.log*" -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Đã xóa log files!${NC}"
}

delete_all() {
    echo -e "${YELLOW}⚠️  Xóa TẤT CẢ (node_modules + build + cache + logs)? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ]; then
        delete_node_modules
        delete_build
        delete_cache
        delete_logs
        echo -e "${GREEN}✅ Đã xóa tất cả!${NC}"
    else
        echo -e "${YELLOW}Đã hủy.${NC}"
    fi
}

reinstall_deps() {
    echo -e "${CYAN}📦 Reinstalling dependencies...${NC}"
    
    # Detect package manager
    if [ -f "$SCRIPT_DIR/bun.lockb" ]; then
        pkg_manager="bun"
    elif [ -f "$SCRIPT_DIR/yarn.lock" ]; then
        pkg_manager="yarn"
    elif [ -f "$SCRIPT_DIR/pnpm-lock.yaml" ]; then
        pkg_manager="pnpm"
    else
        pkg_manager="npm"
    fi
    
    echo -e "${BLUE}Package manager: $pkg_manager${NC}"
    
    # Install in each directory with package.json
    for dir in "$SCRIPT_DIR" "$SCRIPT_DIR/frontend" "$SCRIPT_DIR/backend"; do
        if [ -f "$dir/package.json" ]; then
            echo -e "${CYAN}📁 Installing in $dir...${NC}"
            cd "$dir"
            
            case $pkg_manager in
                bun) bun install ;;
                yarn) yarn install ;;
                pnpm) pnpm install ;;
                *) npm install ;;
            esac
        fi
    done
    
    echo -e "${GREEN}✅ Reinstall hoàn tất!${NC}"
}

calculate_size() {
    echo -e "${CYAN}📊 Tính kích thước thư mục...${NC}"
    echo ""
    
    echo -e "${BLUE}Tổng dung lượng dự án:${NC}"
    du -sh "$SCRIPT_DIR" 2>/dev/null
    echo ""
    
    echo -e "${BLUE}Chi tiết các thư mục lớn:${NC}"
    du -sh "$SCRIPT_DIR"/*/ 2>/dev/null | sort -hr | head -20
    echo ""
    
    echo -e "${BLUE}node_modules:${NC}"
    find "$SCRIPT_DIR" -type d -name "node_modules" -exec du -sh {} \; 2>/dev/null | sort -hr
}

find_large_files() {
    echo -e "${CYAN}🔍 Tìm file lớn (>10MB)...${NC}"
    echo ""
    
    find "$SCRIPT_DIR" -type f -size +10M -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}' | sort -hr
}

delete_system_files() {
    echo -e "${CYAN}🗑️  Đang xóa .DS_Store và Thumbs.db...${NC}"
    
    find "$SCRIPT_DIR" -name ".DS_Store" -delete 2>/dev/null || true
    find "$SCRIPT_DIR" -name "Thumbs.db" -delete 2>/dev/null || true
    find "$SCRIPT_DIR" -name "desktop.ini" -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Đã xóa system files!${NC}"
}

update_gitignore() {
    echo -e "${CYAN}📝 Tạo/Cập nhật .gitignore...${NC}"
    
    gitignore_path="$SCRIPT_DIR/.gitignore"
    
    cat > "$gitignore_path" << 'EOF'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.next/
out/
.turbo/
.motia/

# Cache
.npm/
.eslintcache
*.tsbuildinfo
.cache/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
desktop.ini

# Testing
coverage/
.nyc_output/

# Misc
*.pem
*.p12
.vercel/
EOF

    echo -e "${GREEN}✅ Đã cập nhật .gitignore!${NC}"
}

# Main
print_banner

while true; do
    print_menu
    echo -e "${CYAN}Nhập lựa chọn: ${NC}"
    read -r choice
    echo ""
    
    case $choice in
        1) delete_node_modules ;;
        2) delete_build ;;
        3) delete_cache ;;
        4) delete_logs ;;
        5) delete_all ;;
        6) reinstall_deps ;;
        7) calculate_size ;;
        8) find_large_files ;;
        9) delete_system_files ;;
        10) update_gitignore ;;
        0) 
            echo -e "${GREEN}👋 Tạm biệt!${NC}"
            exit 0 
            ;;
        *)
            echo -e "${RED}❌ Lựa chọn không hợp lệ!${NC}"
            ;;
    esac
    echo ""
done
