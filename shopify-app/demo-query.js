#!/usr/bin/env node
/**
 * WhatsClaw Demo Query — 用真实 Shopify 数据回答 WhatsApp 问题
 * 用法: node demo-query.js "What snowboards do you have?"
 */

const https = require('https');

// Load from .env (never hardcode secrets in source)
require('dotenv').config();
const SHOPIFY_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_STORE = process.env.SHOPIFY_STORE_URL;

function shopifyGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOPIFY_STORE,
      path: `/admin/api/2024-01${path}`,
      headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function answerQuestion(question) {
  const q = question.toLowerCase();
  
  console.log(`\n📱 Customer asks: "${question}"\n`);
  console.log('🤖 WhatsClaw fetching store data...\n');

  // 产品查询
  if (q.includes('product') || q.includes('sell') || q.includes('have') || 
      q.includes('snowboard') || q.includes('ski') || q.includes('item')) {
    const data = await shopifyGet('/products.json?limit=5');
    const products = data.products;
    
    let reply = `Hi! 👋 Here's what we have in stock:\n\n`;
    products.forEach(p => {
      const price = p.variants[0]?.price || '—';
      const stock = p.variants[0]?.inventory_quantity;
      const stockStr = stock > 0 ? `✅ ${stock} in stock` : '📦 Available to order';
      reply += `• *${p.title}* — $${price}\n  ${stockStr}\n\n`;
    });
    reply += `Which one interests you? I can tell you more or help you order! 🛍️\n\n— WhatsClaw 🦞`;
    
    console.log('💬 WhatsClaw replies:');
    console.log('─'.repeat(50));
    console.log(reply);
    console.log('─'.repeat(50));
    return;
  }

  // 订单查询
  if (q.includes('order') || q.includes('track') || q.includes('ship') || q.includes('where')) {
    const data = await shopifyGet('/orders.json?limit=5&status=any');
    const orders = data.orders;
    
    if (orders.length === 0) {
      const reply = `Hi! To track your order, please reply with your order number (e.g. #1001) or the email you used at checkout.\n\nI'll pull it up instantly! 📦\n\n— WhatsClaw 🦞`;
      console.log('💬 WhatsClaw replies:');
      console.log('─'.repeat(50));
      console.log(reply);
      console.log('─'.repeat(50));
    } else {
      orders.forEach(o => {
        console.log(`  Order #${o.order_number}: ${o.financial_status} — $${o.total_price}`);
      });
    }
    return;
  }

  // 价格查询
  if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('cheap')) {
    const data = await shopifyGet('/products.json?limit=5');
    const prices = data.products.map(p => ({
      name: p.title,
      price: parseFloat(p.variants[0]?.price || 0)
    })).sort((a,b) => a.price - b.price);
    
    let reply = `Here's a quick price overview 💰\n\n`;
    prices.forEach(p => {
      reply += `• ${p.name}: $${p.price.toFixed(2)}\n`;
    });
    reply += `\nAll prices in USD. Want to know more about any item?\n\n— WhatsClaw 🦞`;
    
    console.log('💬 WhatsClaw replies:');
    console.log('─'.repeat(50));
    console.log(reply);
    console.log('─'.repeat(50));
    return;
  }

  // Default
  const reply = `Hi! Thanks for reaching out 👋\n\nI'm the WhatsClaw AI assistant for this store. I can help you with:\n• 🛍️ Product info & availability\n• 📦 Order tracking\n• 💰 Pricing & promotions\n• ❓ Any questions about our store\n\nWhat would you like to know?\n\n— WhatsClaw 🦞`;
  console.log('💬 WhatsClaw replies:');
  console.log('─'.repeat(50));
  console.log(reply);
  console.log('─'.repeat(50));
}

const question = process.argv[2] || 'What products do you sell?';
answerQuestion(question).catch(console.error);
