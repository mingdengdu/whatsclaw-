#!/usr/bin/env node
/**
 * ClawApp Stripe Product Setup Script
 * Run once: node scripts/setup-stripe-products.js
 * Creates products + prices in Stripe, outputs IDs for .env
 */
require('dotenv').config({ path: '../.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setup() {
  console.log('🦞 Setting up ClawApp Stripe products...\n');

  const plans = [
    {
      key: 'starter',
      name: 'ClawApp Starter',
      description: 'WhatsApp AI for Shopify — Starter Plan',
      amount: 2900,  // $29.00
      envKey: 'STRIPE_PRICE_STARTER',
    },
    {
      key: 'growth',
      name: 'ClawApp Growth',
      description: 'WhatsApp AI for Shopify — Growth Plan',
      amount: 7900,  // $79.00
      envKey: 'STRIPE_PRICE_GROWTH',
    },
    {
      key: 'enterprise',
      name: 'ClawApp Enterprise',
      description: 'WhatsApp AI for Shopify — Enterprise Plan (Private Deployment)',
      amount: 19900, // $199.00
      envKey: 'STRIPE_PRICE_ENTERPRISE',
    },
  ];

  const envLines = [];

  for (const plan of plans) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { clawapp_plan: plan.key },
      });

      // Create recurring price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.amount,
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: plan.name,
        metadata: { clawapp_plan: plan.key },
      });

      console.log(`✅ ${plan.name}`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Price ID:   ${price.id}\n`);

      envLines.push(`${plan.envKey}=${price.id}`);

    } catch (err) {
      console.error(`❌ Failed to create ${plan.name}:`, err.message);
    }
  }

  console.log('─────────────────────────────────');
  console.log('Add these to your .env file:\n');
  console.log(envLines.join('\n'));
  console.log('\nDone! 🎉');
}

setup().catch(console.error);
