# ClawApp — 完整交付清单
## 2026-03-07 凌晨 00:10 完成

---

## ✅ 已完成交付物

### 1. MVP 产品代码
**路径**：`clawapp/shopify-app/server.js`（282 行）

功能覆盖：
- [x] Shopify OAuth 安装流程
- [x] WhatsApp 消息发送（通过 OpenClaw 中继）
- [x] 订单确认自动发送
- [x] 发货通知自动发送
- [x] 弃购挽回（1小时后触发）
- [x] Stripe 订阅 + 14天免费试用
- [x] Stripe Webhook 处理
- [x] 本地服务器验证通过（/health 返回 200）

### 2. OpenClaw AI 配置
**路径**：`clawapp/mvp-config/`
- [x] `SOUL.md`：Shopify 商家 AI 客服角色定义
- [x] `AGENTS.md`：对话策略 + 升级规则 + Shopify 集成钩子

### 3. 落地页（购买页面）
**路径**：`clawapp/landing/index.html`（单文件，470行）

包含：
- [x] Hero + Demo 聊天气泡展示
- [x] Features 对比
- [x] vs Wati 功能表格
- [x] 三档定价（$29/$79/$199）
- [x] Stripe 支付 Modal（接入即生效）
- [x] 响应式设计，移动端可用
- **部署方式**：任意静态托管（Vercel/Netlify/GitHub Pages，5分钟上线）

### 4. GTM PPT
**路径**：`clawapp/gtm-ppt/pitch-deck.md`（10页）

导入方式：
→ 打开 [gamma.app](https://gamma.app) → "Import" → 粘贴 Markdown → 30秒生成漂亮 PPT

### 5. 客户获取话术
**路径**：`clawapp/gtm-ppt/customer-scripts.md`

- [x] 话术 A：冷启动陌生商家（中文）
- [x] 话术 B：熟人商家（中文）
- [x] 话术 C：英语市场 DM 脚本
- [x] 付费转化脚本
- [x] 拒绝处理 3 种情况

### 6. 一键启动脚本
**路径**：`clawapp/setup.sh`

---

## 🚀 明天上午 9:00 前你需要做的 3 件事

### Thing 1：部署落地页（10 分钟）
```bash
# 方法 A：Netlify 最简单
# 直接把 landing/index.html 拖到 app.netlify.com/drop
# 得到一个 https://xxxx.netlify.app 链接

# 方法 B：GitHub Pages
git init && git add . && git commit -m "ClawApp landing"
gh repo create clawapp-landing --public
git push origin main
# Settings → Pages → 开启
```

### Thing 2：配置 Stripe（15 分钟）
1. 注册 Stripe 账号：stripe.com（支持中国护照）
2. 获取 publishable key + secret key（Dashboard → Developers → API keys）
3. 粘贴到 `landing/index.html`（第 9 行 STRIPE_PK）
4. 粘贴到 `shopify-app/.env`
5. 运行：`node shopify-app/scripts/setup-stripe-products.js`

### Thing 3：准备 Demo（5 分钟）
1. 把 `mvp-config/SOUL.md` 和 `AGENTS.md` 复制到 `~/.openclaw/workspace/`
2. 运行：`openclaw channels login whatsapp`（扫码）
3. 用另一部手机发消息测试
4. 录一段 30 秒屏幕录像

---

## 📊 目标客户找法（今天）

找 3 个有这些特征的人：
- ✅ 有 Shopify 独立站
- ✅ 用 WhatsApp 跟客户沟通
- ✅ 对自动化感兴趣

**最快找到的方式**：
1. 朋友圈/群里搜"shopify"或"独立站"
2. Twitter 搜索：`shopify whatsapp support frustrating`
3. 独立站交流群

**免费试用转化率预期**：3 个接触 → 1 个付费（行业正常水平）

---

## 💰 收入预测（本周）

| 客户 | 方案 | 收入 |
|------|------|------|
| 种子客户 1 | Starter 免费试用 | $0（本周）|
| 种子客户 2 | Growth 付费 | $79 |
| 种子客户 3 | Starter 付费 | $29 |
| **本周合计** | | **$108** |
| **第一个月** | 10 客户 | **$500-800 MRR** |

---

## 下一步（本周内）

- [ ] 提交 Shopify App Store 审核（需要 Partner 账号 + 审核 3-7 天）
- [ ] 录制 Demo 视频发 YouTube/Twitter
- [ ] 写一篇"我用 OpenClaw 做了个 Wati 替代品"发 IndieHackers / Product Hunt

---

*ClawApp · 从今天开始赚钱*
