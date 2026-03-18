# WhatsClaw MCP Server

> **WhatsApp × Shopify AI Commerce Tools**
> Connect your AI agent to WhatsClaw — send messages, track orders, recover carts, run campaigns.

## Quick Start

### Claude Desktop
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "whatsclaw": {
      "command": "npx",
      "args": ["-y", "@whatsclaw/mcp-server"],
      "env": {
        "SHOPIFY_STORE": "your-store.myshopify.com",
        "SHOPIFY_TOKEN": "shpat_xxxx",
        "CLAWAPP_URL": "http://localhost:4000",
        "WHATSCLAW_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Cursor / Windsurf / Cline
Same config — add to your MCP settings JSON.

### OpenClaw (via mcporter)
```bash
mcporter add whatsclaw --cmd "npx @whatsclaw/mcp-server" \
  --env SHOPIFY_STORE=your-store.myshopify.com \
  --env SHOPIFY_TOKEN=shpat_xxxx \
  --env CLAWAPP_URL=http://localhost:4000
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_STORE` | ✅ | e.g. `your-store.myshopify.com` |
| `SHOPIFY_TOKEN` | ✅ | Admin API access token (`shpat_...`) |
| `CLAWAPP_URL` | Optional | WhatsClaw server URL (default: `http://localhost:4000`) |
| `WHATSCLAW_API_KEY` | Optional | API key for authenticated endpoints |

---

## Tools (15 total)

### 🛍️ Commerce
| Tool | Description |
|------|-------------|
| `get_products` | List products with optional keyword filter |
| `get_order` | Look up order by number, email, or phone |
| `send_order_notification` | Send WhatsApp order status update |
| `create_cart_recovery` | Send abandoned cart recovery message |
| `get_store_stats` | Revenue, orders, AOV for any period |

### 🎧 Customer Service
| Tool | Description |
|------|-------------|
| `classify_intent` | Classify customer message intent + suggested action |
| `generate_reply` | Auto-generate contextual WhatsApp reply |
| `lookup_order_by_phone` | Find all orders by WhatsApp number |
| `escalate_to_human` | Flag conversation for human takeover |

### 📢 Campaigns
| Tool | Description |
|------|-------------|
| `send_broadcast` | Broadcast to customer segments |
| `get_campaign_stats` | Delivery/open/reply/conversion stats |
| `create_message_template` | Reusable message templates |

### 📱 WhatsApp Direct
| Tool | Description |
|------|-------------|
| `send_message` | Send direct WhatsApp message |
| `get_conversation_history` | Recent chat history with a customer |
| `get_connection_status` | Check WhatsApp connection health |

---

## Example Prompts

Once connected, try these with your AI agent:

```
"Check my store stats for the last 7 days"
"Send an order shipped notification to +447700900123 for order #1042"
"What products do we have in stock under $50?"
"A customer is asking about their order — their WhatsApp is +447700900123"
"Send a flash sale broadcast to all customers who bought in the last 30 days"
"Create a cart recovery message for checkout abc123"
```

---

## Pricing

| Plan | Price | Included |
|------|-------|---------|
| **Free** | $0 | 100 API calls/month, core tools |
| **Pro** | $29/mo | Unlimited calls, all tools, campaigns |
| **Growth** | $79/mo | Multi-store, analytics, priority support |
| **Enterprise** | Custom | Private deployment, custom tools, SLA |

[Get started → whatsclaw.xyz](https://whatsclaw.xyz)

---

## Registries

This MCP server is listed on:
- [Smithery](https://smithery.ai/server/whatsclaw)
- [MCPize](https://mcpize.com/servers/whatsclaw)
- [Glama](https://glama.ai/mcp/servers/whatsclaw)
- [mcp.so](https://mcp.so/server/whatsclaw)

---

## License
MIT © WhatsClaw
