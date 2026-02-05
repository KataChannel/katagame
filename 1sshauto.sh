#!/bin/bash

# =====================================================
# SSH Auto - Quản lý SSH keys và kết nối
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║           🔐 SSH AUTO MANAGER             ║"
    echo "║              KataGame Dev                 ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${YELLOW}Chọn một tùy chọn:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Tạo SSH key mới"
    echo -e "  ${GREEN}2)${NC} Xem SSH public key"
    echo -e "  ${GREEN}3)${NC} Copy SSH key vào clipboard"
    echo -e "  ${GREEN}4)${NC} Test kết nối GitHub"
    echo -e "  ${GREEN}5)${NC} Test kết nối GitLab"
    echo -e "  ${GREEN}6)${NC} Thêm SSH key vào ssh-agent"
    echo -e "  ${GREEN}7)${NC} Liệt kê tất cả SSH keys"
    echo -e "  ${GREEN}8)${NC} Cấu hình Git user"
    echo -e "  ${GREEN}0)${NC} Thoát"
    echo ""
}

generate_ssh_key() {
    echo -e "${BLUE}📧 Nhập email của bạn:${NC}"
    read -r email
    
    if [ -z "$email" ]; then
        echo -e "${RED}❌ Email không được để trống!${NC}"
        return
    fi
    
    echo -e "${BLUE}📁 Nhập tên file (mặc định: id_ed25519):${NC}"
    read -r filename
    filename=${filename:-id_ed25519}
    
    ssh_path="$HOME/.ssh/$filename"
    
    if [ -f "$ssh_path" ]; then
        echo -e "${YELLOW}⚠️  File $ssh_path đã tồn tại. Ghi đè? (y/n):${NC}"
        read -r overwrite
        if [ "$overwrite" != "y" ]; then
            echo -e "${YELLOW}Đã hủy.${NC}"
            return
        fi
    fi
    
    echo -e "${CYAN}🔑 Đang tạo SSH key...${NC}"
    ssh-keygen -t ed25519 -C "$email" -f "$ssh_path"
    
    echo -e "${GREEN}✅ SSH key đã được tạo tại: $ssh_path${NC}"
    echo ""
    echo -e "${YELLOW}Public key của bạn:${NC}"
    cat "${ssh_path}.pub"
}

show_public_key() {
    echo -e "${BLUE}📁 Nhập tên file key (mặc định: id_ed25519):${NC}"
    read -r filename
    filename=${filename:-id_ed25519}
    
    ssh_path="$HOME/.ssh/${filename}.pub"
    
    if [ -f "$ssh_path" ]; then
        echo -e "${GREEN}🔑 Public key:${NC}"
        echo ""
        cat "$ssh_path"
        echo ""
    else
        echo -e "${RED}❌ Không tìm thấy file: $ssh_path${NC}"
    fi
}

copy_to_clipboard() {
    echo -e "${BLUE}📁 Nhập tên file key (mặc định: id_ed25519):${NC}"
    read -r filename
    filename=${filename:-id_ed25519}
    
    ssh_path="$HOME/.ssh/${filename}.pub"
    
    if [ -f "$ssh_path" ]; then
        if command -v xclip &> /dev/null; then
            cat "$ssh_path" | xclip -selection clipboard
            echo -e "${GREEN}✅ SSH key đã được copy vào clipboard (xclip)${NC}"
        elif command -v pbcopy &> /dev/null; then
            cat "$ssh_path" | pbcopy
            echo -e "${GREEN}✅ SSH key đã được copy vào clipboard (pbcopy)${NC}"
        elif command -v clip.exe &> /dev/null; then
            cat "$ssh_path" | clip.exe
            echo -e "${GREEN}✅ SSH key đã được copy vào clipboard (WSL)${NC}"
        else
            echo -e "${YELLOW}⚠️  Không tìm thấy công cụ clipboard. Đây là key của bạn:${NC}"
            cat "$ssh_path"
        fi
    else
        echo -e "${RED}❌ Không tìm thấy file: $ssh_path${NC}"
    fi
}

test_github() {
    echo -e "${CYAN}🔄 Đang test kết nối GitHub...${NC}"
    ssh -T git@github.com 2>&1 || true
}

test_gitlab() {
    echo -e "${CYAN}🔄 Đang test kết nối GitLab...${NC}"
    ssh -T git@gitlab.com 2>&1 || true
}

add_to_agent() {
    echo -e "${BLUE}📁 Nhập tên file key (mặc định: id_ed25519):${NC}"
    read -r filename
    filename=${filename:-id_ed25519}
    
    ssh_path="$HOME/.ssh/$filename"
    
    if [ -f "$ssh_path" ]; then
        eval "$(ssh-agent -s)"
        ssh-add "$ssh_path"
        echo -e "${GREEN}✅ SSH key đã được thêm vào ssh-agent${NC}"
    else
        echo -e "${RED}❌ Không tìm thấy file: $ssh_path${NC}"
    fi
}

list_keys() {
    echo -e "${CYAN}📋 Danh sách SSH keys trong ~/.ssh/:${NC}"
    echo ""
    ls -la ~/.ssh/ 2>/dev/null || echo -e "${YELLOW}Thư mục ~/.ssh không tồn tại${NC}"
}

config_git_user() {
    echo -e "${BLUE}👤 Nhập tên của bạn:${NC}"
    read -r name
    echo -e "${BLUE}📧 Nhập email của bạn:${NC}"
    read -r email
    
    if [ -n "$name" ] && [ -n "$email" ]; then
        git config --global user.name "$name"
        git config --global user.email "$email"
        echo -e "${GREEN}✅ Git user đã được cấu hình:${NC}"
        echo -e "   Name: $(git config --global user.name)"
        echo -e "   Email: $(git config --global user.email)"
    else
        echo -e "${RED}❌ Tên và email không được để trống!${NC}"
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
        1) generate_ssh_key ;;
        2) show_public_key ;;
        3) copy_to_clipboard ;;
        4) test_github ;;
        5) test_gitlab ;;
        6) add_to_agent ;;
        7) list_keys ;;
        8) config_git_user ;;
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
