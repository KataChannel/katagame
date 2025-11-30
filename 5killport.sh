#!/bin/bash

# =====================================================
# Kill Port - Quản lý và kill processes trên port
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

# KataGame default ports
FRONTEND_PORT=11000
BACKEND_PORT=3000
DATABASE_PORT=11003
GRAPHQL_PORT=3000

print_banner() {
    echo -e "${RED}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║           💀 KILL PORT MANAGER            ║"
    echo "║              KataGame Dev                 ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${YELLOW}Chọn một tùy chọn:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Kill port cụ thể"
    echo -e "  ${GREEN}2)${NC} Kill Frontend port ($FRONTEND_PORT)"
    echo -e "  ${GREEN}3)${NC} Kill Backend port ($BACKEND_PORT)"
    echo -e "  ${GREEN}4)${NC} Kill Database port ($DATABASE_PORT)"
    echo -e "  ${GREEN}5)${NC} Kill ALL KataGame ports"
    echo -e "  ${GREEN}6)${NC} Xem processes đang chạy trên port"
    echo -e "  ${GREEN}7)${NC} Xem tất cả listening ports"
    echo -e "  ${GREEN}8)${NC} Kill process by name"
    echo -e "  ${GREEN}9)${NC} Kill all Node.js processes"
    echo -e "  ${GREEN}10)${NC} Kill all Bun processes"
    echo -e "  ${GREEN}0)${NC} Thoát"
    echo ""
}

kill_port() {
    local port=$1
    
    if [ -z "$port" ]; then
        echo -e "${BLUE}🔢 Nhập port number:${NC}"
        read -r port
    fi
    
    if [ -z "$port" ]; then
        echo -e "${RED}❌ Port không được để trống!${NC}"
        return
    fi
    
    echo -e "${CYAN}🔍 Tìm process trên port $port...${NC}"
    
    # Find PID using port
    if command -v lsof &> /dev/null; then
        pids=$(lsof -ti:$port 2>/dev/null || true)
    elif command -v ss &> /dev/null; then
        pids=$(ss -tlnp | grep ":$port " | grep -oP '(?<=pid=)\d+' 2>/dev/null || true)
    elif command -v netstat &> /dev/null; then
        pids=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1 || true)
    else
        echo -e "${RED}❌ Không tìm thấy lsof, ss hoặc netstat!${NC}"
        return
    fi
    
    if [ -z "$pids" ]; then
        echo -e "${YELLOW}⚠️  Không có process nào đang chạy trên port $port${NC}"
        return
    fi
    
    echo -e "${YELLOW}Found PIDs: $pids${NC}"
    
    for pid in $pids; do
        echo -e "${CYAN}Killing PID $pid...${NC}"
        kill -9 "$pid" 2>/dev/null || true
    done
    
    echo -e "${GREEN}✅ Đã kill tất cả processes trên port $port${NC}"
}

kill_all_katagame_ports() {
    echo -e "${YELLOW}⚠️  Kill tất cả KataGame ports ($FRONTEND_PORT, $BACKEND_PORT, $DATABASE_PORT)? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ]; then
        echo -e "${CYAN}Killing Frontend port $FRONTEND_PORT...${NC}"
        kill_port $FRONTEND_PORT
        
        echo -e "${CYAN}Killing Backend port $BACKEND_PORT...${NC}"
        kill_port $BACKEND_PORT
        
        echo -e "${CYAN}Killing Database port $DATABASE_PORT...${NC}"
        kill_port $DATABASE_PORT
        
        echo -e "${GREEN}✅ Đã kill tất cả KataGame ports!${NC}"
    else
        echo -e "${YELLOW}Đã hủy.${NC}"
    fi
}

show_port_process() {
    echo -e "${BLUE}🔢 Nhập port number:${NC}"
    read -r port
    
    if [ -z "$port" ]; then
        echo -e "${RED}❌ Port không được để trống!${NC}"
        return
    fi
    
    echo -e "${CYAN}🔍 Process trên port $port:${NC}"
    echo ""
    
    if command -v lsof &> /dev/null; then
        lsof -i:$port 2>/dev/null || echo "Không có process nào"
    elif command -v ss &> /dev/null; then
        ss -tlnp | grep ":$port " || echo "Không có process nào"
    elif command -v netstat &> /dev/null; then
        netstat -tlnp 2>/dev/null | grep ":$port " || echo "Không có process nào"
    fi
}

show_all_ports() {
    echo -e "${CYAN}📋 Tất cả listening ports:${NC}"
    echo ""
    
    if command -v ss &> /dev/null; then
        ss -tlnp | head -30
    elif command -v netstat &> /dev/null; then
        netstat -tlnp 2>/dev/null | head -30
    elif command -v lsof &> /dev/null; then
        lsof -iTCP -sTCP:LISTEN 2>/dev/null | head -30
    fi
    
    echo ""
    echo -e "${YELLOW}(Hiển thị tối đa 30 dòng)${NC}"
}

kill_by_name() {
    echo -e "${BLUE}🔤 Nhập tên process (ví dụ: node, bun, next):${NC}"
    read -r process_name
    
    if [ -z "$process_name" ]; then
        echo -e "${RED}❌ Tên process không được để trống!${NC}"
        return
    fi
    
    echo -e "${CYAN}🔍 Tìm processes có tên '$process_name'...${NC}"
    
    # Show matching processes
    ps aux | grep -i "$process_name" | grep -v grep
    
    echo ""
    echo -e "${YELLOW}⚠️  Kill tất cả processes trên? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ]; then
        pkill -f "$process_name" 2>/dev/null || true
        echo -e "${GREEN}✅ Đã kill processes có tên '$process_name'${NC}"
    else
        echo -e "${YELLOW}Đã hủy.${NC}"
    fi
}

kill_all_node() {
    echo -e "${YELLOW}⚠️  Kill tất cả Node.js processes? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ]; then
        pkill -f node 2>/dev/null || true
        echo -e "${GREEN}✅ Đã kill tất cả Node.js processes${NC}"
    else
        echo -e "${YELLOW}Đã hủy.${NC}"
    fi
}

kill_all_bun() {
    echo -e "${YELLOW}⚠️  Kill tất cả Bun processes? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ]; then
        pkill -f bun 2>/dev/null || true
        echo -e "${GREEN}✅ Đã kill tất cả Bun processes${NC}"
    else
        echo -e "${YELLOW}Đã hủy.${NC}"
    fi
}

# Check for direct port argument
if [ -n "$1" ]; then
    kill_port "$1"
    exit 0
fi

# Main
print_banner

# Show current KataGame ports status
echo -e "${CYAN}📊 KataGame Ports Status:${NC}"
for port in $FRONTEND_PORT $BACKEND_PORT $DATABASE_PORT; do
    if command -v lsof &> /dev/null; then
        if lsof -i:$port &> /dev/null; then
            echo -e "  Port $port: ${GREEN}●${NC} Running"
        else
            echo -e "  Port $port: ${RED}○${NC} Free"
        fi
    fi
done
echo ""

while true; do
    print_menu
    echo -e "${CYAN}Nhập lựa chọn: ${NC}"
    read -r choice
    echo ""
    
    case $choice in
        1) kill_port ;;
        2) kill_port $FRONTEND_PORT ;;
        3) kill_port $BACKEND_PORT ;;
        4) kill_port $DATABASE_PORT ;;
        5) kill_all_katagame_ports ;;
        6) show_port_process ;;
        7) show_all_ports ;;
        8) kill_by_name ;;
        9) kill_all_node ;;
        10) kill_all_bun ;;
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
