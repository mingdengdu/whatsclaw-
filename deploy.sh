#!/bin/bash
# WhatsClaw 自动部署脚本
# 服务器执行：bash /opt/whatsclaw/deploy.sh

REPO="https://github.com/mingdengdu/whatsclaw.git"
WEB_ROOT="/opt/whatsclaw/landing"
REPO_DIR="/opt/whatsclaw/repo"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "⏬ 首次克隆仓库..."
  git clone "$REPO" "$REPO_DIR"
else
  echo "🔄 拉取最新代码..."
  cd "$REPO_DIR" && git pull
fi

echo "📂 同步文件到 web 目录..."
rsync -av --exclude='.git' --exclude='images' "$REPO_DIR/" "$WEB_ROOT/"

echo "✅ 部署完成！"
curl -s http://localhost/health && echo " - nginx OK"
