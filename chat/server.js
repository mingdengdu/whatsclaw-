// WhatsClaw Chat Widget API
// MiniMax-powered sales agent with conversion-focused system prompt
// Deploy: /opt/whatsclaw/chat/server.js | pm2 start server.js --name chat-api

const express = require('express');
const app = express();
app.use(express.json());

// ─── PRODUCT KNOWLEDGE BASE ───────────────────────────────────────────────────
const PRODUCT_KB = `
## WhatsClaw — WhatsApp AI for Shopify Stores

### What is WhatsClaw?
WhatsClaw is a WhatsApp AI assistant built specifically for Shopify store owners.
It automatically handles customer inquiries, recovers abandoned carts, tracks orders,
and drives sales — all via WhatsApp. No coding required, 5-minute setup.

### Key Benefits
- 98% WhatsApp open rate (vs 20% email)
- 3x better cart recovery than email campaigns
- $0 per-message fee (flat monthly pricing)
- Answers questions 24/7 instantly
- Takes 5 minutes to go live

### Real Customer Story (Sarah's Jewelry Store)
Sarah was spending 40+ minutes/day manually replying to WhatsApp messages,
missing overnight messages, losing sales. After WhatsClaw:
- Recovered 12 abandoned carts in the first week
- Saved 40+ minutes daily
- Customers got instant replies 24/7
- Revenue increased without extra effort

### Pricing Plans
1. **Starter — $29/month**
   - 1 WhatsApp number
   - Unlimited AI chats
   - Order tracking
   - Cart recovery
   - 14-day free trial

2. **Growth — $79/month** ⭐ Most Popular
   - 3 WhatsApp numbers
   - Auto discount codes
   - CRM integration
   - Analytics dashboard
   - 14-day free trial

3. **Enterprise — $199/month**
   - Private deployment
   - Unlimited numbers
   - Custom AI training
   - Dedicated support
   - Custom pricing available

### Payment Options
- Credit card via Stripe
- WeChat Pay (CNY & HKD supported)

### Free Trial
All plans include a 14-day free trial. No credit card required to start.
Start here: https://buy.stripe.com/6oU9AM5vG6xlcYQ23I3oA01

### Setup & Integration
- Works with any Shopify store
- Setup guide: https://whatsclaw.xyz/shopify.html
- Takes about 5 minutes to connect
- No coding or technical knowledge needed

### Contact & Support
- Email: hello@whatsclaw.xyz
- WhatsApp: https://wa.me/85251300733
- Book a demo: https://whatsclaw.xyz/demo.html

### Academy (Learn & Earn)
WhatsClaw Academy teaches merchants how to use WhatsApp AI to drive revenue.
Includes case studies, monetization methods, and step-by-step journeys.
Visit: https://whatsclaw.xyz/academy/
`;

// ─── SALES PLAYBOOK ───────────────────────────────────────────────────────────
const SALES_PLAYBOOK = `
## Sales Conversation Playbook

### Visitor Segments & Responses

**Curious / Just Looking**
- Acknowledge their interest warmly
- Lead with the #1 pain point: "Are you still manually answering WhatsApp messages?"
- Share Sarah's story briefly
- End with: "Want to see how it works for your store?" → link to demo

**Price Objectors**
- "That seems expensive" → Compare to cost of lost sales from missed messages
- "Is there a free trial?" → Yes! 14 days, no credit card needed
- Anchor: one recovered cart often covers a month's subscription

**Ready to Buy / Comparing Plans**
- Starter: Perfect for solo stores, 1 WhatsApp number, budget-friendly
- Growth: Best for stores with multiple staff or channels (RECOMMEND THIS)
- Enterprise: Custom needs, large teams, white-label
- Always recommend Growth as the default

**Technical Questions**
- "Does it work with my store?" → Yes, any Shopify store, 5-min setup
- "Do I need a developer?" → No, zero coding required
- "What about WhatsApp Business API?" → Handled for you, we manage it

**Hesitant / Need Time**
- "I'll think about it" → Offer to book a 15-min demo instead
- Share the Sarah story as social proof
- Mention 14-day free trial removes all risk

### Conversion Triggers (use naturally in conversation)
- 98% open rate (vs 20% for email)
- 14-day FREE trial, cancel anytime
- 5-minute setup
- $0 per message (unlike SMS/other tools)
- Real customer: recovered 12 carts in first week

### CTA Priority Order
1. Start free trial → https://buy.stripe.com/6oU9AM5vG6xlcYQ23I3oA01
2. Book a demo → https://whatsclaw.xyz/demo.html  
3. WhatsApp us directly → https://wa.me/85251300733
`;

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Claw, the friendly AI sales assistant for WhatsClaw — a WhatsApp AI tool for Shopify store owners.

Your personality:
- Warm, helpful, and conversational (not pushy or corporate)
- You speak like a knowledgeable friend, not a salesperson
- Concise replies (2-4 sentences max unless explaining something complex)
- Use emojis occasionally to feel human 🦞
- Always in English unless the visitor writes in another language

Your goals (in priority order):
1. Understand the visitor's pain point / situation
2. Show how WhatsClaw solves their specific problem
3. Guide them toward starting the free trial or booking a demo
4. Never be pushy — if they're not ready, provide value and stay helpful

CRITICAL RULES:
- Never make up features or pricing not in the knowledge base
- Never promise things you can't verify
- If you don't know something, say "Let me connect you with the team" and give hello@whatsclaw.xyz
- Keep responses SHORT — this is a chat widget, not an essay
- Always end with a clear next step or question

${PRODUCT_KB}

${SALES_PLAYBOOK}

Remember: Your job is to help visitors understand if WhatsClaw is right for them, and make it easy to take the next step. Quality over quantity in every reply.`;

// ─── CONVERSATION MEMORY (in-memory, per session) ────────────────────────────
const sessions = new Map();

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      messages: [],
      createdAt: Date.now()
    });
  }
  return sessions.get(sessionId);
}

// Clean up sessions older than 2 hours
setInterval(() => {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, session] of sessions.entries()) {
    if (session.createdAt < twoHoursAgo) sessions.delete(id);
  }
}, 30 * 60 * 1000);

// ─── MINIMAX API CALL ─────────────────────────────────────────────────────────
async function callMiniMax(messages) {
  const apiKey = process.env.MINIMAX_API_KEY;
  const groupId = process.env.MINIMAX_GROUP_ID;

  if (!apiKey || !groupId) {
    throw new Error('MiniMax credentials not configured');
  }

  const response = await fetch(
    `https://api.minimax.chat/v1/text/chatcompletion_v2`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I had trouble responding. Please try again!';
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !message.trim()) {
    return res.json({ reply: 'Please send a message.' });
  }

  const sid = sessionId || 'anonymous-' + Math.random().toString(36).slice(2);
  const session = getOrCreateSession(sid);

  // Add user message to history
  session.messages.push({ role: 'user', content: message.trim() });

  // Keep last 10 turns to avoid token bloat
  const recentMessages = session.messages.slice(-10);

  try {
    const reply = await callMiniMax(recentMessages);
    // Add assistant reply to history
    session.messages.push({ role: 'assistant', content: reply });
    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.json({
      reply: "I'm having a quick coffee break ☕ Try again in a moment, or reach us directly at hello@whatsclaw.xyz"
    });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', sessions: sessions.size }));

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🦞 WhatsClaw Chat API running on port ${PORT}`);
  console.log(`   MiniMax key: ${process.env.MINIMAX_API_KEY ? '✅ configured' : '❌ MISSING'}`);
  console.log(`   MiniMax group: ${process.env.MINIMAX_GROUP_ID ? '✅ configured' : '❌ MISSING'}`);
});
