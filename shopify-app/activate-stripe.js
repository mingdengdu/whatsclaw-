#!/usr/bin/env node
/**
 * ClawApp Stripe 一键激活脚本
 * 用法：node activate-stripe.js pk_test_xxx sk_test_xxx
 * 
 * 做以下所有事：
 * 1. 验证 key 有效
 * 2. 创建三档产品 + 价格
 * 3. 自动写入 .env
 * 4. 自动更新 landing/index.html 的 STRIPE_PK
 * 5. 输出 Stripe Dashboard 链接供验证
 */

const stripe = require('stripe');
const fs = require('fs');
const path = require('path');

const [,, pk, sk] = process.argv;

if (!pk || !sk) {
  console.log(`
用法：node activate-stripe.js <publishable_key> <secret_key>

例：node activate-stripe.js pk_test_abc123 sk_test_xyz789
  `);
  process.exit(1);
}

async function run() {
  console.log('\n🦞 ClawApp Stripe 激活中...\n');
  
  const client = stripe(sk);

  // 1. 验证 key
  try {
    const account = await client.accounts.retrieve();
    console.log(`✅ Stripe 账号验证通过`);
    console.log(`   账号 ID: ${account.id}`);
    console.log(`   国家/地区: ${account.country}`);
  } catch(e) {
    console.error(`❌ Secret key 无效: ${e.message}`);
    process.exit(1);
  }

  // 2. 创建产品 + 价格
  const plans = [
    { key: 'starter',    name: 'ClawApp Starter',    amount: 2900,  envKey: 'STRIPE_PRICE_STARTER'    },
    { key: 'growth',     name: 'ClawApp Growth',     amount: 7900,  envKey: 'STRIPE_PRICE_GROWTH'     },
    { key: 'enterprise', name: 'ClawApp Enterprise', amount: 19900, envKey: 'STRIPE_PRICE_ENTERPRISE' },
  ];

  const priceIds = {};

  for (const plan of plans) {
    try {
      // 检查是否已存在（避免重复创建）
      const existing = await client.products.search({ query: `metadata['clawapp_plan']:'${plan.key}'`, limit: 1 }).catch(() => ({ data: [] }));
      
      let product;
      if (existing.data.length > 0) {
        product = existing.data[0];
        console.log(`⏭️  产品已存在: ${plan.name}`);
      } else {
        product = await client.products.create({
          name: plan.name,
          metadata: { clawapp_plan: plan.key }
        });
        console.log(`✅ 创建产品: ${plan.name}`);
      }

      const price = await client.prices.create({
        product: product.id,
        unit_amount: plan.amount,
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: plan.name,
      });

      priceIds[plan.envKey] = price.id;
      console.log(`   价格 ID: ${price.id} ($${plan.amount/100}/mo)`);
    } catch(e) {
      console.error(`❌ 创建 ${plan.name} 失败: ${e.message}`);
    }
  }

  // 3. 写入 .env
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  
  // 替换或追加
  const updates = {
    STRIPE_PUBLISHABLE_KEY: pk,
    STRIPE_SECRET_KEY: sk,
    ...priceIds,
  };

  for (const [key, value] of Object.entries(updates)) {
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log(`\n✅ .env 已更新`);

  // 4. 更新 landing/index.html 的 PK
  const landingPath = path.join(__dirname, '..', 'landing', 'index.html');
  if (fs.existsSync(landingPath)) {
    let html = fs.readFileSync(landingPath, 'utf8');
    html = html.replace(
      /const STRIPE_PK = ['"].*['"]/,
      `const STRIPE_PK = '${pk}'`
    );
    fs.writeFileSync(landingPath, html);
    console.log(`✅ landing/index.html Stripe key 已更新`);
  }

  // 5. 汇总
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 激活完成！

Stripe Dashboard: https://dashboard.stripe.com/test/products
测试收款: 用卡号 4242 4242 4242 4242，任意有效期和 CVV

下一步：
  1. 启动服务器: node server.js
  2. 打开落地页: http://localhost:4000
  3. 点击 "Start Free Trial" 测试支付
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

run().catch(e => {
  console.error('错误:', e.message);
  process.exit(1);
});
