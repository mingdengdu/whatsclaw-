/**
 * ClawApp — Shopify App Server
 * Handles: Shopify OAuth, webhooks, Stripe subscriptions, OpenClaw relay
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios   = require('axios');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());

// Raw body needed for Stripe & Shopify webhook verification
app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.static('../landing'));  // serve landing page

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// ── Stripe: Create Subscription ───────────────────────────────────────────────
app.post('/api/create-subscription', async (req, res) => {
  const { name, email, store, plan } = req.body;

  const priceMap = {
    starter:    process.env.STRIPE_PRICE_STARTER,
    growth:     process.env.STRIPE_PRICE_GROWTH,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  };

  try {
    // Create or retrieve Stripe customer
    let customer;
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({
        name, email,
        metadata: { shopify_store: store }
      });
    }

    // Create SetupIntent for collecting payment method with trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceMap[plan] }],
      trial_period_days: 14,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });

  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ── Stripe Webhooks ───────────────────────────────────────────────────────────
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.trial_will_end':
      console.log('New subscription:', event.data.object.id);
      // TODO: provision OpenClaw instance for this customer
      await provisionClawApp(event.data.object);
      break;

    case 'invoice.payment_failed':
      console.log('Payment failed, notify customer');
      // TODO: send WhatsApp warning via OpenClaw
      break;

    case 'customer.subscription.deleted':
      console.log('Subscription cancelled, deprovision');
      break;
  }

  res.json({ received: true });
});

// ── Shopify OAuth ─────────────────────────────────────────────────────────────
app.get('/shopify/install', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop parameter');

  const scopes = process.env.SHOPIFY_SCOPES;
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/shopify/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

app.get('/shopify/callback', async (req, res) => {
  const { shop, code } = req.query;

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id:     process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    });

    const accessToken = tokenRes.data.access_token;

    // Store token (in production: use a real DB)
    console.log(`✅ Shop ${shop} connected. Token: ${accessToken.substring(0, 8)}...`);

    // Register webhooks for this shop
    await registerShopifyWebhooks(shop, accessToken);

    // Redirect to onboarding / WhatsApp connect screen
    res.redirect(`${process.env.SHOPIFY_APP_URL}/onboard?shop=${shop}`);

  } catch (err) {
    console.error('Shopify OAuth error:', err.message);
    res.status(500).send('OAuth failed');
  }
});

// ── Shopify Webhooks ──────────────────────────────────────────────────────────
app.post('/webhooks/shopify/:topic', async (req, res) => {
  const { topic } = req.params;
  const data = JSON.parse(req.body.toString());

  console.log(`📦 Shopify webhook: ${topic}`, data.id || '');

  switch (topic) {
    case 'orders-created':
      await sendWhatsAppMessage(data.customer?.phone, buildOrderConfirmation(data));
      break;

    case 'orders-fulfilled':
      await sendWhatsAppMessage(data.customer?.phone, buildShippingUpdate(data));
      break;

    case 'checkouts-create':
      // Schedule cart abandonment message (1 hour delay)
      setTimeout(async () => {
        if (!data.completed_at) {  // still abandoned
          await sendWhatsAppMessage(data.customer?.phone, buildCartRecovery(data));
        }
      }, 60 * 60 * 1000);
      break;
  }

  res.json({ ok: true });
});

// ── Onboarding Page ───────────────────────────────────────────────────────────
app.get('/onboard', (req, res) => {
  const { shop } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html><head><title>ClawApp Setup</title>
    <style>
      body{font-family:system-ui;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
      .box{background:#111;border:1px solid #222;border-radius:16px;padding:48px;max-width:480px;text-align:center}
      h2{color:#25D366;font-size:28px;margin-bottom:16px}
      p{color:#888;margin-bottom:32px;line-height:1.6}
      .btn{background:#25D366;color:#000;border:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block}
      .step{background:#0d1f0d;border:1px solid #25D36630;border-radius:8px;padding:16px;margin-bottom:12px;text-align:left;font-size:14px;color:#aaa}
      .step strong{color:#25D366}
    </style></head>
    <body>
      <div class="box">
        <h2>🦞 Almost there!</h2>
        <p>Your Shopify store <strong style="color:#fff">${shop}</strong> is connected.<br>
        One last step: connect your WhatsApp number.</p>
        
        <div class="step"><strong>Step 1 ✓</strong> — Shopify connected</div>
        <div class="step"><strong>Step 2</strong> — Connect WhatsApp (scan QR code below)</div>
        <div class="step"><strong>Step 3</strong> — Test your AI assistant</div>

        <p style="margin-top:24px">
          <a href="/api/whatsapp/qr?shop=${shop}" class="btn">Connect WhatsApp →</a>
        </p>
        <p style="font-size:12px;color:#555;margin-top:16px">Takes ~60 seconds. No Meta review needed.</p>
      </div>
    </body></html>
  `);
});

// ── WhatsApp QR (OpenClaw relay) ──────────────────────────────────────────────
app.get('/api/whatsapp/qr', async (req, res) => {
  // In production: call OpenClaw API to generate a new instance + QR
  // For MVP demo: return a placeholder
  res.send(`
    <html><body style="background:#0a0a0a;color:#fff;font-family:system-ui;text-align:center;padding:60px">
      <h2 style="color:#25D366">Scan with WhatsApp</h2>
      <p style="color:#888">Open WhatsApp → Settings → Linked Devices → Link a Device</p>
      <div style="background:#fff;width:200px;height:200px;margin:32px auto;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#000;font-size:12px">
        QR Code<br>(OpenClaw generates this<br>at runtime)
      </div>
      <p style="color:#555;font-size:13px">Your AI assistant will be active within 30 seconds of scanning</p>
    </body></html>
  `);
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sendWhatsAppMessage(phone, message) {
  if (!phone) return;
  try {
    await axios.post(`${process.env.OPENCLAW_API_URL}/api/send`, {
      channel: 'whatsapp',
      to: phone,
      message,
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENCLAW_API_KEY}` }
    });
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
  }
}

function buildOrderConfirmation(order) {
  return `✅ Order confirmed! Hi ${order.customer?.first_name}, your order #${order.order_number} is confirmed. Total: $${order.total_price}. We'll message you when it ships! 📦`;
}

function buildShippingUpdate(order) {
  const tracking = order.fulfillments?.[0]?.tracking_url || 'check your email';
  return `📦 Your order #${order.order_number} is on its way! Track here: ${tracking}`;
}

function buildCartRecovery(checkout) {
  const item = checkout.line_items?.[0];
  const name = item?.title || 'your items';
  return `Hey! You left ${name} in your cart 🛒 Complete your order here: ${checkout.abandoned_checkout_url}\n\nUse code SAVE10 for 10% off — expires in 24 hours!`;
}

async function registerShopifyWebhooks(shop, accessToken) {
  const webhooks = [
    { topic: 'orders/create',     address: `${process.env.SHOPIFY_APP_URL}/webhooks/shopify/orders-created` },
    { topic: 'orders/fulfilled',  address: `${process.env.SHOPIFY_APP_URL}/webhooks/shopify/orders-fulfilled` },
    { topic: 'checkouts/create',  address: `${process.env.SHOPIFY_APP_URL}/webhooks/shopify/checkouts-create` },
  ];

  for (const wh of webhooks) {
    try {
      await axios.post(`https://${shop}/admin/api/2024-01/webhooks.json`,
        { webhook: { ...wh, format: 'json' } },
        { headers: { 'X-Shopify-Access-Token': accessToken } }
      );
      console.log(`✅ Webhook registered: ${wh.topic}`);
    } catch (err) {
      console.error(`Webhook failed ${wh.topic}:`, err.response?.data || err.message);
    }
  }
}

async function provisionClawApp(subscription) {
  // TODO: create OpenClaw instance, configure with store's SOUL.md
  console.log('Provisioning ClawApp for subscription:', subscription.id);
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🦞 ClawApp server running on port ${PORT}`);
  console.log(`   Landing page: http://localhost:${PORT}`);
  console.log(`   Shopify install: http://localhost:${PORT}/shopify/install?shop=YOUR_STORE.myshopify.com`);
});
