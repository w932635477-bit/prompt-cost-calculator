# 邮件采集组件实现方案

**状态**: 待实施
**目标**: 给 codehelper.xyz 上 13 个工具页加统一的邮件订阅入口，启动鱼塘建设
**预期产出**: 3-6 个月内积累 500-2000 个邮箱，作为未来付费产品上线时的首批用户池
**部署窗口**: 当天可上线（Buttondown 注册 + 组件实现 + 全站部署 < 4 小时）

---

## 1. 服务商选择：Buttondown

| 维度 | Buttondown | Resend Audiences | ConvertKit | Mailchimp |
|------|-----------|------------------|------------|-----------|
| 免费额度 | 100 订阅 | 3000 订阅/月 3000 邮件 | 1000 订阅 | 500 订阅 |
| 付费起步 | $9/月 (1000订阅) | $20/月 (50000邮件) | $15/月 (300订阅) | $13/月 |
| 接入难度 | REST API 5分钟 | API 设计干净 | 复杂 | 复杂 |
| 反垃圾合规 | 自动 double opt-in | 需自己实现 | 自动 | 自动 |
| 中国用户体验 | 邮件送达稳定 | 同 | 一般 | 一般 |
| 支付主体 | 美国 | 美国 | 美国 | 美国 |

**选 Buttondown。** 理由：double opt-in 自带、API 极简、独立开发者友好（每月发 1 封 digest 用不到付费层）、$9 跨过 1000 订阅的门槛刚好对应你 3-6 个月的预期增长。

**为什么不是 Resend Audiences？** Resend 的 Audiences 是配合 Resend 邮件发送用的，你还得自己写 double opt-in 流程、退订链接、邮件模板。3 个月内不必要。

**为什么不直接 Vercel KV / Postgres 自存？** 退订合规（CAN-SPAM、GDPR）、双重确认流程、退订率统计、bounce 处理，都得自己写。一个独立开发者 3 个月内做不完，做完也没必要。

## 2. UI 形态：Footer Slim 横幅

不要做弹窗（pop-up），不要做停留触发，不要做 exit-intent。**这些手段都会损伤 SEO 跳出率，且和 codehelper.xyz 当前的"工具型站点"调性不符。**

只做一种形态：**每个工具页底部的 slim 横幅**。

```
┌─────────────────────────────────────────────────────────────┐
│  Get one new dev tool every Friday.                         │
│  No spam. Unsubscribe anytime.                              │
│  ┌──────────────────────────┐  ┌─────────┐                  │
│  │ your@email.com           │  │ Subscribe│                  │
│  └──────────────────────────┘  └─────────┘                  │
│  Joined by 247 builders. View past issues →                 │
└─────────────────────────────────────────────────────────────┘
```

设计要点：
- 文案明确价值：**"one new dev tool every Friday"**，不是模糊的 "stay updated"
- 单一字段：邮箱。不要姓名、不要公司。
- 提交后原地变 `Check your inbox to confirm ✓`，不跳页。
- "Joined by N builders" 用真实数字，从 Buttondown API 拉，缓存 24h。前 100 不显示数字（避免 "Joined by 3 builders" 反向劝退）。
- "View past issues" 链到 Buttondown 自带的 archive 页（免费）。

## 3. 技术实现

### 3.1 后端：Vercel Serverless Function

新增 `api/subscribe.ts`：

```typescript
// api/subscribe.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

const BUTTONDOWN_API = 'https://api.buttondown.com/v1/subscribers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, source } = req.body || {}
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const r = await fetch(BUTTONDOWN_API, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      tags: source ? [`tool:${source}`] : [],
    }),
  })

  // Buttondown returns 201 on new, 400 if already subscribed (which we treat as success)
  if (r.ok || r.status === 400) {
    return res.status(200).json({ ok: true })
  }
  const body = await r.text()
  console.error('Buttondown error:', r.status, body)
  return res.status(500).json({ error: 'Subscription failed, try again' })
}
```

环境变量：在 Vercel Project Settings 加 `BUTTONDOWN_API_KEY`。本地 `.env.local` 同步。

### 3.2 前端：复用组件

新增 `src/components/EmailCapture.tsx`：

```tsx
import { useState } from 'react'

interface Props {
  source: string  // 工具标识，如 "cron-generator", "alternatives"
}

export function EmailCapture({ source }: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      if (r.ok) {
        setState('done')
      } else {
        const data = await r.json().catch(() => ({}))
        setErrorMsg(data.error || 'Something went wrong')
        setState('error')
      }
    } catch {
      setErrorMsg('Network error')
      setState('error')
    }
  }

  return (
    <section className="border-t border-[#e8e8ed] bg-[#f5f5f7] mt-16">
      <div className="max-w-[680px] mx-auto px-4 py-10 text-center">
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          Get one new dev tool every Friday.
        </h2>
        <p className="text-sm text-[#86868b] mt-1">
          Hand-picked free tools, source code included. No spam. Unsubscribe anytime.
        </p>

        {state === 'done' ? (
          <p className="mt-5 text-[#0071E3] text-sm font-medium">
            Check your inbox to confirm.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={state === 'loading'}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#d2d2d7] text-sm focus:outline-none focus:border-[#0071E3]"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="px-5 py-2.5 rounded-lg bg-[#0071E3] text-white text-sm font-medium disabled:opacity-50"
            >
              {state === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}

        {state === 'error' && (
          <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
        )}

        <p className="mt-4 text-xs text-[#86868b]">
          <a href="https://buttondown.com/codehelper/archive/" target="_blank" rel="noopener" className="hover:text-[#0071E3]">
            View past issues →
          </a>
        </p>
      </div>
    </section>
  )
}
```

### 3.3 接入清单

13 个工具页（按当前 GlobalNav 顺序）：

```
1. /                              source="home"
2. /cron-generator/               source="cron-generator"
3. /alternatives/                 source="alternatives"
4. /finder/notes/                 source="notes-finder"
5. /photos/                       source="photos-finder"
6. /compare/                      source="compare"
7. /deploy/                       source="docker-deploy"
8. /voice-agent-pricing/          source="voice-pricing"
9. /token-tracker/                source="token-tracker"
10. /prompt-cache-calculator/     source="cache-calculator"
11. /mcp-servers/                 source="mcp-servers"
12. /pii-redactor/                source="pii-redactor"
13. /agent-safety/                source="agent-safety"
```

每个 React 入口 App 在最底部加：

```tsx
import { EmailCapture } from './components/EmailCapture'
// ...
<EmailCapture source="cron-generator" />
```

静态 HTML 生成的页面（cron-generator、alternatives、deploy、mcp-servers 是脚本生成的）改对应的 generator 模板，append 一段含完整 HTML form 的 inline 实现（不依赖 React）。

### 3.4 静态页的兜底实现

`scripts/generate-*.cjs` 系列里的 footer 模板加：

```html
<form id="email-capture" data-source="cron-generator" class="...">
  <input type="email" name="email" required placeholder="your@email.com" />
  <button type="submit">Subscribe</button>
</form>
<script>
document.getElementById('email-capture').addEventListener('submit', async function(e) {
  e.preventDefault();
  var email = e.target.email.value;
  var source = e.target.dataset.source;
  var btn = e.target.querySelector('button');
  btn.disabled = true; btn.textContent = '...';
  try {
    var r = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, source: source })
    });
    e.target.outerHTML = r.ok
      ? '<p style="color:#0071E3">Check your inbox to confirm.</p>'
      : '<p style="color:red">Failed, try again.</p>';
  } catch (err) {
    btn.disabled = false; btn.textContent = 'Subscribe';
  }
});
</script>
```

## 4. 隐私和合规

- Buttondown 自带 double opt-in（用户先收一封确认邮件），符合 GDPR 和中国《个人信息保护法》对"明示同意"的要求
- 退订链接由 Buttondown 自动加在每封邮件底部，符合 CAN-SPAM 法案
- 不收集姓名、IP、cookie，最小化数据采集
- 在 footer 表单下加一行小字: `By subscribing, you agree to receive emails from codehelper.xyz. Unsubscribe anytime.`

## 5. 埋点和监控

每次成功订阅触发一次 Vercel Analytics 自定义事件：

```tsx
import { track } from '@vercel/analytics'
// 在 setState('done') 之后
track('email_subscribe', { source })
```

每周看 Vercel Analytics 看哪个工具的转化率最高，把那个工具的设计模式复制到其他工具。

## 6. 内容产出节奏（订阅后用户预期）

每周五一封邮件。统一 4 段式模板：

```
1. This week's tool: [名称 + 链接 + 一句话价值]
2. Why I built it: [遇到的问题 + 解决方式]
3. The data so far: [真实流量、订阅数、踩坑]
4. What's next: [下周做什么]
```

每封邮件 < 200 词。起步阶段订阅数 < 50 时，可以考虑双周一封。

**邮件由你写，不要全 AI 生成。** 邮件订阅用户对 AI 味敏感，会取消订阅。可以让 AI 起草、你来重写。

## 7. 启动里程碑

| 时间 | 目标 | 触发动作 |
|------|------|---------|
| Day 1 | Buttondown 账号 + API key + 1 个工具上线组件 | 验证回路打通 |
| Day 2 | 13 个工具全部接入 | 部署 |
| Day 7 | 首封 digest 邮件发出 | 反向校验：你自己收到了吗？ |
| Day 30 | 100 订阅 | 复盘哪个工具转化最高 |
| Day 90 | 500 订阅 | 评估是否升级 Buttondown 付费层 |
| Day 180 | 2000 订阅 | 准备付费产品 waitlist |

## 8. 风险和回退

- **Buttondown 服务异常**：API 调用失败时 `api/subscribe.ts` 把邮箱写到 Vercel KV 兜底，每天定时同步。先不实现，等达到日均 10+ 订阅再加。
- **被滥用提交垃圾邮箱**：Buttondown 自带 double opt-in 和 bounce 检测，先不加 captcha。如果一天来 100+ 假邮箱再加 Cloudflare Turnstile（免费）。
- **退订率异常**：每周看 Buttondown 后台。如果某次发信退订率 > 5%，下次内容收紧。

## 9. 实施顺序（一日内完成）

```
[ ] 1. Buttondown 注册 codehelper 账号 (10min)
[ ] 2. 拿到 API token，加 BUTTONDOWN_API_KEY 到 .env.local 和 Vercel Project Env (5min)
[ ] 3. 写 api/subscribe.ts 并部署，curl 测试一次 (30min)
[ ] 4. 写 src/components/EmailCapture.tsx (30min)
[ ] 5. 在 src/App.tsx 接入第一个工具，测试 (15min)
[ ] 6. 复制接入到其余 8 个 React 工具页 (45min)
[ ] 7. 修改 4 个静态生成 generator 脚本，加 inline 表单和脚本 (60min)
[ ] 8. 全站 build + deploy (15min)
[ ] 9. 用 $B browse 跑一遍 13 个页面，验证表单存在和提交成功 (30min)
[ ] 10. Buttondown 后台看到首条订阅记录 (你的真邮箱测一遍)
```

合计约 4 小时，单人单日可完成。
