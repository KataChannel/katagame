#!/bin/bash

# Local git operations
git add .
git commit -m "update"
git push

# Remote server operations
ssh root@116.118.49.243 << 'EOF'
cd rausachfinal
git pull
docker compose -f 'docker-compose.yml' up -d --build
docker builder prune -af
#docker image prune -a -f
EOF