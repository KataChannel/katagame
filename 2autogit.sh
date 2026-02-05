#!/bin/bash

# =====================================================
# Auto Git - Tự động hóa Git workflow
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

REPO_PATH=$(pwd)

print_banner() {
    echo -e "${MAGENTA}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║           🚀 AUTO GIT MANAGER             ║"
    echo "║              KataGame Dev                 ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${YELLOW}Chọn một tùy chọn:${NC}"
    echo ""
    echo -e "  ${GREEN}1)${NC} Quick commit (add + commit + push)"
    echo -e "  ${GREEN}2)${NC} Xem status"
    echo -e "  ${GREEN}3)${NC} Xem log (10 commits gần nhất)"
    echo -e "  ${GREEN}4)${NC} Tạo branch mới"
    echo -e "  ${GREEN}5)${NC} Chuyển branch"
    echo -e "  ${GREEN}6)${NC} Merge branch"
    echo -e "  ${GREEN}7)${NC} Pull latest"
    echo -e "  ${GREEN}8)${NC} Xem diff"
    echo -e "  ${GREEN}9)${NC} Stash changes"
    echo -e "  ${GREEN}10)${NC} Pop stash"
    echo -e "  ${GREEN}11)${NC} Reset soft (undo last commit)"
    echo -e "  ${GREEN}12)${NC} Xem remote info"
    echo -e "  ${GREEN}13)${NC} Fetch all branches"
    echo -e "  ${GREEN}14)${NC} Delete branch"
    echo -e "  ${GREEN}0)${NC} Thoát"
    echo ""
}

show_current_branch() {
    current_branch=$(git branch --show-current 2>/dev/null || echo "N/A")
    echo -e "${CYAN}📍 Branch hiện tại: ${GREEN}$current_branch${NC}"
    echo ""
}

quick_commit() {
    echo -e "${BLUE}📝 Nhập commit message:${NC}"
    read -r message
    
    if [ -z "$message" ]; then
        message="Update $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    echo -e "${CYAN}🔄 Đang add all changes...${NC}"
    git add -A
    
    echo -e "${CYAN}📦 Đang commit...${NC}"
    git commit -m "$message"
    
    echo -e "${CYAN}🚀 Đang push...${NC}"
    git push
    
    echo -e "${GREEN}✅ Đã commit và push thành công!${NC}"
}

show_status() {
    echo -e "${CYAN}📊 Git Status:${NC}"
    echo ""
    git status
}

show_log() {
    echo -e "${CYAN}📜 Git Log (10 commits gần nhất):${NC}"
    echo ""
    git log --oneline --graph --decorate -10
}

create_branch() {
    echo -e "${BLUE}🌿 Nhập tên branch mới:${NC}"
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}❌ Tên branch không được để trống!${NC}"
        return
    fi
    
    git checkout -b "$branch_name"
    echo -e "${GREEN}✅ Đã tạo và chuyển sang branch: $branch_name${NC}"
}

switch_branch() {
    echo -e "${CYAN}📋 Danh sách branches:${NC}"
    git branch -a
    echo ""
    echo -e "${BLUE}🔀 Nhập tên branch muốn chuyển:${NC}"
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}❌ Tên branch không được để trống!${NC}"
        return
    fi
    
    git checkout "$branch_name"
    echo -e "${GREEN}✅ Đã chuyển sang branch: $branch_name${NC}"
}

merge_branch() {
    echo -e "${CYAN}📋 Danh sách branches:${NC}"
    git branch -a
    echo ""
    echo -e "${BLUE}🔗 Nhập tên branch muốn merge vào branch hiện tại:${NC}"
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}❌ Tên branch không được để trống!${NC}"
        return
    fi
    
    git merge "$branch_name"
    echo -e "${GREEN}✅ Đã merge branch: $branch_name${NC}"
}

pull_latest() {
    echo -e "${CYAN}🔄 Đang pull latest...${NC}"
    git pull
    echo -e "${GREEN}✅ Đã pull thành công!${NC}"
}

show_diff() {
    echo -e "${CYAN}📝 Git Diff:${NC}"
    echo ""
    git diff
}

stash_changes() {
    echo -e "${BLUE}💾 Nhập message cho stash (optional):${NC}"
    read -r stash_message
    
    if [ -z "$stash_message" ]; then
        git stash
    else
        git stash push -m "$stash_message"
    fi
    
    echo -e "${GREEN}✅ Đã stash changes!${NC}"
}

pop_stash() {
    echo -e "${CYAN}📋 Danh sách stash:${NC}"
    git stash list
    echo ""
    echo -e "${CYAN}🔄 Đang pop stash...${NC}"
    git stash pop
    echo -e "${GREEN}✅ Đã pop stash!${NC}"
}

reset_soft() {
    echo -e "${YELLOW}⚠️  Bạn có chắc muốn undo last commit? (y/n):${NC}"
    read -r confirm
    
    if [ "$confirm" = "y" ]; then
        git reset --soft HEAD~1
        echo -e "${GREEN}✅ Đã undo last commit (changes vẫn giữ lại)${NC}"
    else
        echo -e "${YELLOW}Đã hủy.${NC}"
    fi
}

show_remote() {
    echo -e "${CYAN}🌐 Remote Info:${NC}"
    echo ""
    git remote -v
    echo ""
    echo -e "${CYAN}📍 Current branch tracking:${NC}"
    git branch -vv
}

fetch_all() {
    echo -e "${CYAN}🔄 Đang fetch all branches...${NC}"
    git fetch --all
    echo -e "${GREEN}✅ Đã fetch all branches!${NC}"
}

delete_branch() {
    echo -e "${CYAN}📋 Danh sách branches:${NC}"
    git branch -a
    echo ""
    echo -e "${BLUE}🗑️  Nhập tên branch muốn xóa:${NC}"
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}❌ Tên branch không được để trống!${NC}"
        return
    fi
    
    echo -e "${YELLOW}⚠️  Xóa local hay remote? (local/remote/both):${NC}"
    read -r delete_type
    
    case $delete_type in
        local)
            git branch -d "$branch_name"
            echo -e "${GREEN}✅ Đã xóa local branch: $branch_name${NC}"
            ;;
        remote)
            git push origin --delete "$branch_name"
            echo -e "${GREEN}✅ Đã xóa remote branch: $branch_name${NC}"
            ;;
        both)
            git branch -d "$branch_name"
            git push origin --delete "$branch_name"
            echo -e "${GREEN}✅ Đã xóa cả local và remote branch: $branch_name${NC}"
            ;;
        *)
            echo -e "${RED}❌ Lựa chọn không hợp lệ!${NC}"
            ;;
    esac
}

# Main
print_banner
show_current_branch

while true; do
    print_menu
    echo -e "${CYAN}Nhập lựa chọn: ${NC}"
    read -r choice
    echo ""
    
    case $choice in
        1) quick_commit ;;
        2) show_status ;;
        3) show_log ;;
        4) create_branch ;;
        5) switch_branch ;;
        6) merge_branch ;;
        7) pull_latest ;;
        8) show_diff ;;
        9) stash_changes ;;
        10) pop_stash ;;
        11) reset_soft ;;
        12) show_remote ;;
        13) fetch_all ;;
        14) delete_branch ;;
        0) 
            echo -e "${GREEN}👋 Tạm biệt!${NC}"
            exit 0 
            ;;
        *)
            echo -e "${RED}❌ Lựa chọn không hợp lệ!${NC}"
            ;;
    esac
    echo ""
    show_current_branch
done
