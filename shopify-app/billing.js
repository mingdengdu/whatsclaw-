/**
 * WhatsClaw — Shopify Billing API Integration
 * Required for App Store listing: all charges must go through Shopify Billing
 * 
 * Flow:
 * 1. Merchant installs app (OAuth)
 * 2. Server creates RecurringApplicationCharge via Shopify Billing API
 * 3. Merchant approves charge on Shopify's page
 * 4. Shopify redirects back → activate charge → app goes live
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Plan definitions
const PLANS = {
  starter: {
    name: 'WhatsClaw Starter',
    price: '29.00',
    trial_days: 14,
    terms: '1 WhatsApp number, unlimited AI conversations, order tracking'
  },
  growth: {
    name: 'WhatsClaw Growth',
    price: '79.00',
    trial_days: 14,
    terms: '3 WhatsApp numbers, cart recovery, analytics dashboard'
  },
  enterprise: {
    name: 'WhatsClaw Enterprise',
    price: '199.00',
    trial_days: 14,
    terms: 'Unlimited numbers, private deployment, white-label'
  }
};

/**
 * Step 1: Create subscription charge
 * GET /billing/subscribe?shop=xxx.myshopify.com&plan=starter
 */
router.get('/subscribe', async (req, res) => {
  const { shop, plan = 'starter', token } = req.query;
  
  if (!shop || !token) {
    return res.status(400).json({ error: 'Missing shop or token' });
  }

  const planConfig = PLANS[plan];
  if (!planConfig) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    const response = await axios.post(
      `https://${shop}/admin/api/2024-01/recurring_application_charges.json`,
      {
        recurring_application_charge: {
          name: planConfig.name,
          price: planConfig.price,
          trial_days: planConfig.trial_days,
          terms: planConfig.terms,
          return_url: `${process.env.SHOPIFY_APP_URL}/billing/callback?shop=${shop}&plan=${plan}`,
          test: process.env.NODE_ENV !== 'production' // test mode in dev
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        }
      }
    );

    const charge = response.data.recurring_application_charge;
    console.log(`💳 Charge created for ${shop}: ${charge.id} (${planConfig.name} $${planConfig.price}/mo)`);
    
    // Redirect merchant to Shopify's approval page
    res.redirect(charge.confirmation_url);

  } catch (err) {
    console.error('Billing error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create charge' });
  }
});

/**
 * Step 2: Merchant approved → activate charge
 * GET /billing/callback?shop=xxx&plan=starter&charge_id=xxx
 */
router.get('/callback', async (req, res) => {
  const { shop, plan, charge_id } = req.query;

  if (!shop || !charge_id) {
    return res.redirect(`${process.env.SHOPIFY_APP_URL}?error=missing_params`);
  }

  try {
    // Get stored token for this shop (in production, use a DB)
    const token = process.env.SHOPIFY_ACCESS_TOKEN; // TODO: per-shop token storage

    // Activate the charge
    const response = await axios.post(
      `https://${shop}/admin/api/2024-01/recurring_application_charges/${charge_id}/activate.json`,
      { recurring_application_charge: { id: charge_id } },
      { headers: { 'X-Shopify-Access-Token': token } }
    );

    const charge = response.data.recurring_application_charge;
    console.log(`✅ Charge activated: ${charge.id} | ${charge.name} | ${charge.status}`);

    if (charge.status === 'active') {
      // TODO: provision the merchant's WhatsClaw instance
      // - Save shop + plan to DB
      // - Send welcome WhatsApp message
      // - Create OpenClaw webhook listener
      console.log(`🎉 ${shop} subscribed to ${plan}!`);
      res.redirect(`${process.env.SHOPIFY_APP_URL}/onboard?shop=${shop}&plan=${plan}&activated=true`);
    } else {
      res.redirect(`${process.env.SHOPIFY_APP_URL}?error=charge_not_active&status=${charge.status}`);
    }

  } catch (err) {
    console.error('Activation error:', err.response?.data || err.message);
    res.redirect(`${process.env.SHOPIFY_APP_URL}?error=activation_failed`);
  }
});

/**
 * Check current subscription status
 * GET /billing/status?shop=xxx
 */
router.get('/status', async (req, res) => {
  const { shop } = req.query;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;

  try {
    const response = await axios.get(
      `https://${shop}/admin/api/2024-01/recurring_application_charges.json`,
      { headers: { 'X-Shopify-Access-Token': token } }
    );

    const charges = response.data.recurring_application_charges;
    const active = charges.find(c => c.status === 'active');
    const trial = charges.find(c => c.status === 'pending');

    res.json({
      shop,
      active: active ? {
        id: active.id,
        name: active.name,
        price: active.price,
        trial_ends_on: active.trial_ends_on,
        billing_on: active.billing_on
      } : null,
      pending: trial ? { id: trial.id, name: trial.name } : null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
