#!/bin/bash
# ClawApp MVP Quick Deploy Script
# Run this to get ClawApp running locally in < 10 minutes

set -e

echo "🦞 ClawApp MVP Setup"
echo "===================="

# 1. Check OpenClaw
echo ""
echo "Step 1/5: Checking OpenClaw..."
if command -v openclaw &> /dev/null; then
  echo "✅ OpenClaw found: $(openclaw --version 2>/dev/null || echo 'installed')"
else
  echo "⚠️  OpenClaw not found. Installing..."
  npm install -g openclaw
fi

# 2. Start Gateway
echo ""
echo "Step 2/5: Starting OpenClaw Gateway..."
openclaw gateway start || echo "Gateway may already be running"
sleep 2

# 3. Copy MVP config
echo ""
echo "Step 3/5: Installing ClawApp config..."
WORKSPACE="$HOME/.openclaw/workspace"
mkdir -p "$WORKSPACE"
cp mvp-config/SOUL.md "$WORKSPACE/SOUL.md"
cp mvp-config/AGENTS.md "$WORKSPACE/AGENTS.md"
echo "✅ Config installed to $WORKSPACE"

# 4. Connect WhatsApp
echo ""
echo "Step 4/5: Connect WhatsApp"
echo "─────────────────────────────────────"
echo "Run this command to connect WhatsApp:"
echo ""
echo "  openclaw channels login whatsapp"
echo ""
echo "Then scan the QR code with your phone:"
echo "  WhatsApp → Settings → Linked Devices → Link a Device"
echo "─────────────────────────────────────"
echo ""
read -p "Press ENTER when WhatsApp is connected..." 

# 5. Start demo server
echo ""
echo "Step 5/5: Starting ClawApp demo server..."
cd shopify-app
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created .env from template."
  echo "   Add your Stripe keys to .env before taking payments."
fi

npm install --silent
echo ""
echo "✅ ClawApp is ready!"
echo ""
echo "Open in browser: http://localhost:4000"
echo "Landing page:    http://localhost:4000/index.html"
echo ""
echo "To take real payments:"
echo "  1. Add STRIPE_SECRET_KEY to shopify-app/.env"
echo "  2. Run: node scripts/setup-stripe-products.js"
echo "  3. Add the generated Price IDs to .env"
echo ""
echo "🦞 Good luck! Send your first demo link to customers."
node server.js
