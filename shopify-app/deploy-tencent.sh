#!/bin/bash
# ClawApp 腾讯云一键部署脚本
# 用法：bash deploy-tencent.sh <服务器IP> <SSH用户名(默认ubuntu/root)>
#
# 执行后：
# 1. 上传所有文件到服务器
# 2. 安装 Node.js 依赖
# 3. 用 PM2 守护进程启动服务
# 4. 输出公网访问地址

set -e

SERVER_IP=${1:-""}
SSH_USER=${2:-"ubuntu"}
DEPLOY_DIR="/opt/clawapp"
APP_PORT=4000

if [ -z "$SERVER_IP" ]; then
  echo "用法: bash deploy-tencent.sh <服务器IP> [用户名]"
  echo "例：  bash deploy-tencent.sh 43.xxx.xxx.xxx ubuntu"
  echo ""
  echo "腾讯云轻量服务器默认用户名通常是 ubuntu 或 root"
  exit 1
fi

echo "🦞 ClawApp 部署到腾讯云 $SERVER_IP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 1. 打包文件
echo "📦 打包文件..."
cd "$PROJECT_ROOT"
tar -czf /tmp/clawapp-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='*.log' \
  landing/ \
  shopify-app/

echo "✅ 打包完成"

# 2. 上传到服务器
echo ""
echo "📤 上传到服务器..."
ssh "$SSH_USER@$SERVER_IP" "mkdir -p $DEPLOY_DIR"
scp /tmp/clawapp-deploy.tar.gz "$SSH_USER@$SERVER_IP:/tmp/"
rm /tmp/clawapp-deploy.tar.gz

# 3. 远程执行部署
echo ""
echo "🚀 远程部署中..."
ssh "$SSH_USER@$SERVER_IP" << REMOTE_SCRIPT
set -e

# 解压
cd $DEPLOY_DIR
tar -xzf /tmp/clawapp-deploy.tar.gz --overwrite
rm /tmp/clawapp-deploy.tar.gz

# 安装 Node.js（如果没有）
if ! command -v node &> /dev/null; then
  echo "安装 Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 安装 PM2（如果没有）
if ! command -v pm2 &> /dev/null; then
  echo "安装 PM2..."
  sudo npm install -g pm2
fi

# 安装依赖
cd $DEPLOY_DIR/shopify-app
npm install --production

# 创建 .env（如果不存在）
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  .env 文件已创建，记得填入 Stripe key"
fi

# 启动/重启服务
pm2 delete clawapp 2>/dev/null || true
pm2 start server.js --name clawapp --cwd $DEPLOY_DIR/shopify-app
pm2 save
pm2 startup 2>/dev/null | tail -1 | bash 2>/dev/null || true

echo "服务状态:"
pm2 status clawapp

REMOTE_SCRIPT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 部署完成！"
echo ""
echo "落地页地址: http://$SERVER_IP:$APP_PORT"
echo "健康检查:   http://$SERVER_IP:$APP_PORT/health"
echo ""
echo "⚠️  记得在腾讯云控制台放行端口 $APP_PORT（安全组入站规则）"
echo ""
echo "填入 Stripe Key 后重启："
echo "  ssh $SSH_USER@$SERVER_IP 'cd $DEPLOY_DIR/shopify-app && nano .env && pm2 restart clawapp'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
