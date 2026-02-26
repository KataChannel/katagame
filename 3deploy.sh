#!/bin/bash

# =====================================================
# Deploy Script - Triển khai KataGame
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
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║           🚀 KATAGAME DEPLOY              ║"
    echo "║         Production Deployment             ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${YELLOW}Chọn môi trường deploy:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Build Frontend (Production)"
    echo -e "  ${GREEN}2)${NC} Build Backend (Production)"
    echo -e "  ${GREEN}3)${NC} Build All"
    echo -e "  ${GREEN}4)${NC} Deploy Frontend to Vercel"
    echo -e "  ${GREEN}5)${NC} Deploy Backend với Docker"
    echo -e "  ${GREEN}6)${NC} Deploy Database (Docker PostgreSQL)"
    echo -e "  ${GREEN}7)${NC} Deploy Full Stack (Docker Compose)"
    echo -e "  ${GREEN}8)${NC} Check Health All Services"
    echo -e "  ${GREEN}9)${NC} View Docker Containers"
    echo -e "  ${GREEN}10)${NC} View Docker Logs"
    echo -e "  ${GREEN}11)${NC} Stop All Containers"
    echo -e "  ${GREEN}12)${NC} Clean Docker (prune)"
    echo -e "  ${GREEN}0)${NC} Thoát"
    echo ""
}

build_frontend() {
    echo -e "${CYAN}🔨 Building Frontend...${NC}"
    cd "$SCRIPT_DIR/frontend"
    
    if command -v bun &> /dev/null; then
        bun install
        bun run build
    else
        npm install
        npm run build
    fi
    
    echo -e "${GREEN}✅ Frontend build thành công!${NC}"
    echo -e "${CYAN}📁 Output: frontend/.next${NC}"
}

build_backend() {
    echo -e "${CYAN}🔨 Building Backend...${NC}"
    cd "$SCRIPT_DIR/backend"
    
    if command -v bun &> /dev/null; then
        bun install
        bun run build
    else
        npm install
        npm run build
    fi
    
    echo -e "${GREEN}✅ Backend build thành công!${NC}"
    echo -e "${CYAN}📁 Output: backend/dist${NC}"
}

build_all() {
    build_frontend
    echo ""
    build_backend
    echo ""
    echo -e "${GREEN}✅ Build All thành công!${NC}"
}

deploy_vercel() {
    echo -e "${CYAN}🚀 Deploying Frontend to Vercel...${NC}"
    cd "$SCRIPT_DIR/frontend"
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  Vercel CLI chưa được cài đặt. Đang cài đặt...${NC}"
        npm i -g vercel
    fi
    
    echo -e "${BLUE}Deploy production? (y/n):${NC}"
    read -r is_prod
    
    if [ "$is_prod" = "y" ]; then
        vercel --prod
    else
        vercel
    fi
    
    echo -e "${GREEN}✅ Deploy Vercel thành công!${NC}"
}

deploy_backend_docker() {
    echo -e "${CYAN}🐳 Deploying Backend với Docker...${NC}"
    cd "$SCRIPT_DIR/backend"
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        echo -e "${YELLOW}⚠️  Dockerfile không tồn tại. Tạo Dockerfile...${NC}"
        cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
EOF
    fi
    
    docker build -t katagame-backend:latest .
    docker run -d -p 3000:3000 --name katagame-backend katagame-backend:latest
    
    echo -e "${GREEN}✅ Backend đã được deploy tại http://localhost:3000${NC}"
}

deploy_database() {
    echo -e "${CYAN}🐘 Deploying PostgreSQL Database...${NC}"
    cd "$SCRIPT_DIR"
    
    docker-compose -f docker-compose.yml up -d postgres
    
    echo -e "${GREEN}✅ Database đã được deploy tại localhost:11103${NC}"
}

deploy_fullstack() {
    echo -e "${CYAN}🚀 Deploying Full Stack với Docker Compose...${NC}"
    cd "$SCRIPT_DIR"
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        echo -e "${RED}❌ docker-compose.yml không tồn tại!${NC}"
        return
    fi
    
    docker-compose up -d --build
    
    echo -e "${GREEN}✅ Full Stack đã được deploy!${NC}"
    echo -e "${CYAN}📍 Services:${NC}"
    echo -e "   - Frontend: http://localhost:11100"
    echo -e "   - Backend: http://localhost:3000"
    echo -e "   - Database: localhost:11103"
}

check_health() {
    echo -e "${CYAN}🏥 Checking Health All Services...${NC}"
    echo ""
    
    # Check Frontend
    echo -e "${BLUE}Frontend (http://localhost:11100):${NC}"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:11100 | grep -q "200\|304"; then
        echo -e "  ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  ${RED}❌ Unhealthy or Not Running${NC}"
    fi
    
    # Check Backend
    echo -e "${BLUE}Backend (http://localhost:3000/graphql):${NC}"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/graphql | grep -q "200\|400"; then
        echo -e "  ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  ${RED}❌ Unhealthy or Not Running${NC}"
    fi
    
    # Check Database
    echo -e "${BLUE}Database (localhost:11103):${NC}"
    if docker exec katagame-postgres pg_isready -U postgres &> /dev/null; then
        echo -e "  ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  ${RED}❌ Unhealthy or Not Running${NC}"
    fi
}

view_containers() {
    echo -e "${CYAN}🐳 Docker Containers:${NC}"
    echo ""
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

view_logs() {
    echo -e "${BLUE}Nhập tên container (hoặc 'all' cho tất cả):${NC}"
    read -r container_name
    
    if [ "$container_name" = "all" ]; then
        docker-compose logs -f --tail=100
    else
        docker logs -f --tail=100 "$container_name"
    fi
}

stop_all() {
    echo -e "${YELLOW}⚠️  Dừng tất cả containers? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ]; then
        docker-compose down
        echo -e "${GREEN}✅ Đã dừng tất cả containers${NC}"
    else
        echo -e "${YELLOW}Đã hủy.${NC}"
    fi
}

clean_docker() {
    echo -e "${YELLOW}⚠️  Xóa tất cả unused Docker resources? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ]; then
        docker system prune -af
        docker volume prune -f
        echo -e "${GREEN}✅ Đã clean Docker!${NC}"
    else
        echo -e "${YELLOW}Đã hủy.${NC}"
    fi
}

# Main
print_banner

while true; do
    print_menu
    echo -e "${CYAN}Nhập lựa chọn: ${NC}"
    read -r choice
    echo ""
    
    case $choice in
        1) build_frontend ;;
        2) build_backend ;;
        3) build_all ;;
        4) deploy_vercel ;;
        5) deploy_backend_docker ;;
        6) deploy_database ;;
        7) deploy_fullstack ;;
        8) check_health ;;
        9) view_containers ;;
        10) view_logs ;;
        11) stop_all ;;
        12) clean_docker ;;
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
