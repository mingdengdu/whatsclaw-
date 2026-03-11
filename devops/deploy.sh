#!/bin/bash
# WhatsClaw 一键部署脚本
# 用法: bash /opt/whatsclaw/repo/devops/deploy.sh
set -e

echo "🚀 WhatsClaw Deploy Starting..."

# 1. 拉取最新代码
cd /opt/whatsclaw/repo
git pull

# 2. 同步静态文件
cp -r landing/* /opt/whatsclaw/landing/
cp -r academy/ /opt/whatsclaw/landing/
echo "✅ 静态文件已同步"

# 3. 更新 nginx 配置
cat > /etc/nginx/conf.d/whatsclaw.conf << 'NGINXEOF'
server {
    listen 80;
    server_name whatsclaw.xyz www.whatsclaw.xyz;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name whatsclaw.xyz www.whatsclaw.xyz;
    ssl_certificate /etc/letsencrypt/live/whatsclaw.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/whatsclaw.xyz/privkey.pem;
    root /opt/whatsclaw/landing;
    index index.html;
    location / { try_files $uri $uri/ =404; }
    location /api/chat {
        proxy_pass http://127.0.0.1:3000/api/chat;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Access-Control-Allow-Origin *;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
    }
    location /health {
        proxy_pass http://127.0.0.1:4000/health;
    }
}
NGINXEOF

# 4. 重启 nginx
nginx -t && systemctl restart nginx
echo "✅ Nginx 已重启"

# 5. 启动/重启 chat-api (MiniMax, port 3000)
if pm2 list | grep -q "chat-api"; then
    pm2 restart chat-api
else
    cd /opt/whatsclaw/chat && pm2 start server.js --name chat-api
fi
echo "✅ Chat API (MiniMax) 已启动"

# 6. 重启 whatsclaw-api (port 4000)
if pm2 list | grep -q "whatsclaw-api"; then
    pm2 restart whatsclaw-api
else
    cd /opt/whatsclaw/repo/shopify-app && npm install && pm2 start server.js --name whatsclaw-api
fi
echo "✅ WhatsClaw API 已启动"

# 7. 保存 pm2 进程
pm2 save

echo ""
echo "🎉 部署完成！访问 https://whatsclaw.xyz 验证"
