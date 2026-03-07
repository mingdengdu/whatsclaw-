# WhatsClaw 🦞

> WhatsApp AI for Shopify — the Wati alternative with real AI, no per-message fees, and optional self-hosting.

**Live:** https://whatsclaw.xyz

---

## What's in this repo

```
landing/
  index.html          # Main landing page (Stripe + WeChat Pay CNY/HKD)
  story.html          # Customer story page (Sarah / Lune & Craft)

demo/
  mobile-demo.html    # Interactive mobile demo (WhatsApp chat simulation)

shopify-app/
  server.js           # Node.js backend (Express + Shopify API + Stripe)
  package.json        # Dependencies
  .env.example        # Environment variable template (copy to .env)
  activate-stripe.js  # One-command Stripe setup: node activate-stripe.js pk_xxx sk_xxx
  scripts/
    setup-stripe-products.js  # Create Stripe products/prices

mvp-config/
  SOUL.md             # AI agent persona (role, tone, escalation rules)
  AGENTS.md           # Conversation strategy + Shopify webhook triggers

gtm-ppt/
  pitch-deck.md       # 10-slide pitch deck (import to gamma.app)
  customer-scripts.md # 3 outreach scripts (cold / warm / English)

deploy.sh             # Server sync: git pull + copy to /opt/whatsclaw/landing/
setup.sh              # First-time server setup
```

---

## Deploy to server

```bash
# First time
git clone https://github.com/mingdengdu/whatsclaw-.git /opt/whatsclaw/repo
bash /opt/whatsclaw/repo/deploy.sh

# Every update after
cd /opt/whatsclaw/repo && git pull && bash deploy.sh
```

---

## Environment setup

```bash
cd shopify-app
cp .env.example .env
# Fill in STRIPE_SECRET_KEY, SHOPIFY_API_KEY, etc.
node activate-stripe.js pk_live_xxx sk_live_xxx  # auto-creates Stripe products
npm start
```

---

## Pricing

| Plan | Price | Key features |
|------|-------|-------------|
| Starter | $29/mo | 1 WhatsApp number, unlimited AI chats, order tracking |
| Growth | $79/mo | 3 numbers, cart recovery, CRM sync, analytics |
| Enterprise | $199/mo | Private deployment, unlimited numbers, custom AI |

14-day free trial on all plans.

---

## Contact

hello@whatsclaw.xyz · https://whatsclaw.xyz
