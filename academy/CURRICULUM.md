# ClawAcademy 培训课程体系 v1.0

## 产品线定价

| 产品 | 价格 | 内容 |
|------|------|------|
| 基础教程包 | ¥20 | PDF+视频，OpenClaw 安装到跑通全流程 |
| 安装服务 | ¥100 | 帮装 OpenClaw + 赠1个月腾讯云 Lighthouse |
| 商业化闭环套餐 | ¥299 | 基础教程 + WhatsApp接入 + 首个付费产品上线 |
| 网站+电商实战 | ¥399 | 含香港电话卡/银行/Stripe/Shopify全流程 |
| 年度会员专区 | ¥599/年 | 全部教程 + 10种赚钱方法 + 社群 + 持续更新 |

---

## 第一阶段：L1 起步课（对应¥20基础包）

### 模块1：1美金服务器起跑
- 腾讯云 Lighthouse 注册（国际版/香港区）
- 选配置：1核1G，1美金/月，香港节点
- SSH 连接方式（Windows/Mac）
- OpenClaw 一键安装命令

### 模块2：OpenClaw 初始化
- 首次启动，BOOTSTRAP.md 引导
- 设置 SOUL.md / USER.md / IDENTITY.md
- 理解 workspace 目录结构
- 接入企业微信机器人（openclaw-wecom-bot）

### 模块3：验证跑通
- 发送第一条消息
- 让 AI 帮你搜索/写文章/生成图片
- 理解什么是「技能(Skills)」

---

## 第二阶段：L2 接入课（对应¥299闭环套餐）

### 模块4：WhatsApp 接入（0成本）
- 用 Linked Devices，不需要 Meta Business API
- 运行 `openclaw onboard --install-daemon`
- 扫码绑定个人/商业号
- 测试第一条 AI 自动回复

### 模块5：域名+落地页（¥60/年）
- 在 Cloudflare / DNSPod 买域名
- Nginx 搭建静态落地页
- 接入 Stripe 国际收款
- 接入微信支付（CNY/HKD 双档）

### 模块6：第一笔收款（MVP验证）
- 创建 Stripe 付款链接
- 制作最简产品页
- 发布到 WhatsApp / 朋友圈
- ✅ 完成1元收款闭环验证

---

## 第三阶段：L3 电商课（对应¥399实战套餐）

### 模块7：香港主体搭建
- 香港电话卡获取（推荐：3HK/CSL充值卡）
- 香港银行开户（推荐：ZA Bank/Neat/Airwallex）
- Stripe HK 账号注册（支持 HKD/USD 多币种）
- Shopify 店铺注册（国家选香港）

### 模块8：Shopify 全流程
- 创建产品 / 定价 / 图片
- 配置 Stripe + PayPal + Afterpay
- 开通多货币（HKD/USD/EUR/GBP）
- 上架 App Store（需 billing.js + 截图 + 审核）

### 模块9：AI 智能客服接入
- WhatsClaw bot 路由系统
- 订单查询自动回复
- 弃购挽回自动发送
- 客户转化话术 SOP

---

## 第四阶段：L4 会员专区（¥599/年）

### 10种 WhatsApp+OpenClaw 赚钱方法论

| # | 方法名 | 月收入目标 | 启动成本 |
|---|--------|-----------|---------|
| 1 | WhatsClaw Shopify Bot | $500-3000/mo | $1（服务器）|
| 2 | AI社媒代运营服务 | ¥3000-10000/mo | 0 |
| 3 | WhatsApp群发营销代理 | ¥2000-8000/mo | 0 |
| 4 | 本地商家AI助手外包 | ¥5000-20000/mo | 小 |
| 5 | OpenClaw教程售卖 | ¥3000-15000/mo | 0 |
| 6 | AI写作/SEO内容服务 | ¥2000-8000/mo | 0 |
| 7 | 跨境电商选品助手 | $1000-5000/mo | 小 |
| 8 | 企业微信AI客服SaaS | ¥10000+/mo | 中 |
| 9 | AI网红/KOL孵化工具 | ¥5000-20000/mo | 小 |
| 10 | 海外华人生活服务Bot | $500-2000/mo | 0 |

每种方法含：
- 完整操作SOP
- 真实客户脚本
- 定价策略
- 第一单获客方法

---

## 视频教程规划（直播/录播）

### 视频1：《1美金服务器到AI助手》（30分钟）
- 覆盖模块1-3
- 素材：腾讯云注册截图、SSH连接、OpenClaw安装

### 视频2：《接入WhatsApp，0成本AI客服》（45分钟）
- 覆盖模块4
- 素材：扫码绑定过程、测试对话截图

### 视频3：《建站+收款，第一笔收入》（60分钟）
- 覆盖模块5-6
- 素材：Stripe后台、落地页、付款成功截图

### 视频4：《香港主体+Shopify全球电商》（90分钟）
- 覆盖模块7-8
- 素材：ZA Bank开户、Shopify配置、App Store截图

### 视频5：《10种赚钱方式实战解析》（120分钟）
- 覆盖L4全部内容
- 会员专属直播，Q&A互动

---

## 网站专区规划（whatsclaw.xyz/academy）

### 页面结构
```
/academy              首页：课程介绍 + 购买入口
/academy/l1           L1 免费预览
/academy/l2           L2 付费内容
/academy/l3           L3 付费内容
/academy/member       会员专区（登录后可见）
/academy/methods      10种赚钱方法（会员）
```

### CTA 设计
- 首页：免费领取「OpenClaw快速起步指南」（引流）
- 付费转化：微信扫码支付 or Stripe
- 社群：加入专属微信群（购买后）
