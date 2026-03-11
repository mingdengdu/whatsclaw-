#!/bin/bash
# WhatsClaw 网站恢复脚本
# 执行此脚本可恢复网站访问（HTTP可用，HTTPS可选）
# 用法：bash restore-website.sh

set -e
echo "🔧 WhatsClaw 网站恢复脚本 v1.0"
echo "=================================="

# 1. 检查 root 权限
if [[ $EUID -ne 0 ]]; then
   echo "❌ 请以 root 用户或 sudo 执行"
   exit 1
fi

echo "✅ 当前用户：$(whoami)"
echo ""

# 2. 检查 nginx 服务状态
echo "📦 检查 nginx 状态..."
nginx_status=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
echo "   nginx 状态：$nginx_status"

if [[ "$nginx_status" != "active" ]]; then
    echo "   ⚠️  nginx 未运行，尝试启动..."
    systemctl start nginx
    sleep 2
fi

echo ""

# 3. 同步最新 GitHub 代码
echo "🔄 同步 GitHub 代码..."
cd /opt/whatsclaw/repo
echo "   当前目录：$(pwd)"
echo "   当前分支：$(git rev-parse --abbrev-ref HEAD)"

# 检查是否有未提交的更改
if [[ $(git status --porcelain) ]]; then
    echo "   ⚠️ 工作区有未提交的更改，暂存..."
    git stash
fi

echo "   拉取最新代码..."
git fetch origin
git reset --hard origin/master
echo "   最新 commit: $(git log --oneline -1)"
echo ""

# 4. 复制文件到网站目录
echo "📁 复制网站文件..."
LANDING_DIR="/opt/whatsclaw/landing"
mkdir -p "$LANDING_DIR"
echo "   目标目录：$LANDING_DIR"

# 删除旧文件
echo "   清理旧文件..."
rm -f "$LANDING_DIR"/*.html 2>/dev/null || true
rm -rf "$LANDING_DIR"/academy 2>/dev/null || true

# 复制新文件
echo "   复制 landing 文件..."
cp -r landing/* "$LANDING_DIR/"

echo "   复制 academy 文件夹..."
cp -r academy/ "$LANDING_DIR/" 2>/dev/null || echo "⚠️ academy 文件夹不存在"

echo "   复制 appstore 素材..."
mkdir -p "$LANDING_DIR/appstore"
cp -r appstore/* "$LANDING_DIR/appstore/" 2>/dev/null || echo "⚠️ appstore 文件夹不存在"

echo "   复制静态资源..."
mkdir -p "$LANDING_DIR/static"
cp -r static/* "$LANDING_DIR/static/" 2>/dev/null || echo "⚠️ static 文件夹不存在"

echo "   文件列表："
ls -la "$LANDING_DIR/"
echo ""

# 5. 恢复 nginx 配置文件
echo "⚙️ 设置 nginx 配置..."
NGINX_CONF="/etc/nginx/conf.d/whatsclaw.conf"

# 检查是否已有 HTTPS 证书
CERT_PATH="/etc/letsencrypt/live/whatsclaw.xyz/fullchain.pem"
if [[ -f "$CERT_PATH" ]]; then
    echo "   ✅ 检测到 SSL 证书，使用 HTTPS 配置"
    cp /opt/whatsclaw/repo/nginx/whatsclaw-https.conf "$NGINX_CONF"
else
    echo "   ⚠️ 未检测到 SSL 证书，使用 HTTP 配置"
    cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name whatsclaw.xyz www.whatsclaw.xyz;
    root /opt/whatsclaw/landing;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # health check
    location /health {
        return 200 '{"status":"ok","service":"whatsclaw-website"}';
        add_header Content-Type application/json;
    }
}
EOF
fi

echo "   nginx 配置内容："
cat "$NGINX_CONF" | head -20
echo ""

# 6. 测试 nginx 配置
echo "🧪 测试 nginx 配置..."
nginx -t
echo "   ✅ nginx 配置测试通过"

# 7. 重启 nginx
echo "🚀 重启 nginx 服务..."
systemctl restart nginx
echo "   nginx 重启完成"

# 8. 放开防火墙端口（如果需要）
echo "🔓 配置防火墙..."
CHECK_UUID=$(sudo nft --json list ruleset 2>/dev/null | grep -q '"family"' && echo "yes" || echo "no")
if [[ "$CHECK_UUID" == "yes" ]]; then
    echo "   检测到 nft 防火墙规则，确保端口 80/443 开放..."
    nft add rule inet filter input tcp dport {80, 443} accept 2>/dev/null || true
else
    echo "   检查 iptables..."
    iptables -A INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
    iptables -A INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
fi

# 9. 验证网站访问
echo "🌐 验证网站访问..."
IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "127.0.0.1")
echo "   服务器公网 IP：$IP"

echo "   测试端口..."
nc -z localhost 80 && echo "   ✅ 端口 80 开放" || echo "   ❌ 端口 80 关闭"
nc -z localhost 443 && echo "   ✅ 端口 443 开放" || echo "   ❌ 端口 443 关闭"

echo "   测试 HTTP 响应..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")
echo "   HTTP 状态码：$HTTP_RESPONSE"

if [[ "$HTTP_RESPONSE" =~ ^[23][0-9][0-9]$ ]]; then
    echo "   ✅ HTTP 网站正常"
else
    echo "   ❌ HTTP 网站异常"
fi

# 10. 检查证书并尝试 HTTPS
if [[ -f "$CERT_PATH" ]]; then
    echo ""
    echo "🔐 检测到 SSL 证书，尝试 HTTPS 访问..."
    # 尝试重启 certbot（如果可用）
    if command -v certbot &>/dev/null; then
        echo "   更新证书期限..."
        certbot renew --quiet
    fi
    
    echo "   测试 HTTPS 响应..."
    HTTPS_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost/ 2>/dev/null || echo "000")
    echo "   HTTPS 状态码：$HTTPS_RESPONSE"
    
    if [[ "$HTTPS_RESPONSE" =~ ^[23][0-9][0-9]$ ]]; then
        echo "   ✅ HTTPS 网站正常"
    else
        echo "   ⚠️ HTTPS 可能配置有误，但 HTTP 可用"
    fi
fi

echo ""
echo "=================================="
echo "✅ 恢复完成！"
echo ""
echo "🌍 网站访问地址："
echo "   http://whatsclaw.xyz"
echo "   http://43.156.245.94"
echo ""
echo "📚 Academy 页面："
echo "   http://whatsclaw.xyz/academy/"
echo "   http://whatsclaw.xyz/academy/cases.html"
echo "   http://whatsclaw.xyz/academy/journey.html"
echo ""
echo "🔍 检查网站："
echo "   curl -I http://whatsclaw.xyz"
echo "   curl -I https://whatsclaw.xyz"
echo ""
echo "📢 后续建议："
echo "   1. 如需 HTTPS，执行：certbot --nginx -d whatsclaw.xyz"
echo "   2. 检查域名 DNS 解析：nslookup whatsclaw.xyz"
echo "   3. 服务器重启后可能需要重新执行恢复脚本"
exit 0