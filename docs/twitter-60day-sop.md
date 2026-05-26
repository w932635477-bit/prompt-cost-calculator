# Twitter (X) 60 天养号 SOP

**目标**: 60 天内从 0 粉到 200-500 真粉，建立 10-20 个能转推你的同领域 builder 关系，可在 D60+ 用于产品发布的扩散。
**约束**: 每天 30 分钟，全部在中午 12 点-下午 2 点（北美开发者上班前后窗口）操作。
**底线**: 永远不发"check out my tool"式的硬广。每条推文要么解决问题、要么有数据、要么有观点。

---

## 阶段 0: 账号准备（D-1 一次性，30 分钟）

```
[ ] 1. 用谷歌账号注册 Twitter，handle 用 codehelperxyz 或 weilei_xyz（站点关联清晰）
[ ] 2. 头像：真人照片或简单几何 logo。不要 AI 生成头像（被识别为 bot）
[ ] 3. Banner: codehelper.xyz 截图 + slogan "Free dev tools, source code included"
[ ] 4. Bio: "Building free dev tools at codehelper.xyz | Indie hacker | Currently shipping 1 tool/week"
[ ] 5. Pinned tweet: 暂留空，D14 之后再 pin 第一篇 thread
[ ] 6. 在 Settings → Privacy → 关闭 "Discoverability by email"（避免被邮箱列表 spam）
[ ] 7. 关注 50 个目标账号（见下方 §核心账号清单）
[ ] 8. 加入 1-2 个 Twitter list: "Indie Hackers", "AI Dev Tools"（搜索现成的）
```

## 核心账号清单（D-1 全部 follow）

**一线 indie hackers (10)**
- @levelsio (Pieter Levels)
- @marckohlbrugge (Mark from WIP)
- @csallen (Courtland Allen, IH 创始人)
- @dannypostmaa (Danny Postma)
- @dvassallo (Daniel Vassallo)
- @arvidkahl (Arvid Kahl)
- @swyx (Shawn Wang)
- @transitive_bs (Travis Fischer)
- @rauchg (Guillermo Rauch, Vercel CEO)
- @jasonlk (Jason Lemkin)

**AI/dev tool builders (10)**
- @ericzakariasson (v0)
- @sherlockxu (Sherlock from Resend)
- @t3dotgg (Theo)
- @jaredpalmer (Jared, formerly Vercel)
- @leeerob (Lee Robinson)
- @ahmadawais
- @adamwathan (Tailwind)
- @steventey (Dub)
- @chrisbiscardi
- @samselikoff

**中国出海开发者 (10)**
- @bourneliu66 (刘小排)
- @geekplux
- @yangshun
- @shadcn
- @huozhi
- @leerob
- @tw93
- @lebab_io
- @soyaplus
- @wong2_

**SEO/programmatic SEO (5)**
- @aliabdaal
- @seotomarketer
- @bibblybobbly
- @robertotassi
- @marie_haynes

**Newsletter operators (5)**
- @harrydry (Marketing Examples)
- @anukarttm (Bytes)
- @TLDRnewsletter
- @swyx (DX newsletter)
- @JoshWComeau

**关键词搜索发现（10）**: 在 Twitter 搜 `"shipped my" tool`, `"500 stars"`, `"free tool"`, `prompt cache`, `MCP server`, `cron generator` 等关键词，followers 50-2000 的 builder follow 之。

---

## 阶段 1: 潜伏（D1-D14, 每天 30 分钟）

**目标**: 不发推。建立信号源。看懂 Twitter 这个圈子的话语习惯。

每天动作:
```
[ ] 12:00 - 12:15  浏览 timeline 15 分钟
              - 读 follow 的 50 个账号当天的推文
              - 看哪些推文火（>50 likes）
              - 截图保存 5 条"我希望我能写出这种推文"的样本到 Notes
[ ] 12:15 - 12:25  Reply 5 条
              - 不要加链接、不要带 @
              - 给目标账号的推文写 1-2 句有内容的回复
              - 内容类型：补充数据、分享类似经验、问一个具体问题
              - 例: "我也试过 Buttondown，500 订阅时 deliverability 比 Mailchimp 好。你的退订率怎么样？"
[ ] 12:25 - 12:30  Like 10 条
              - 只 like 你真觉得有价值的，不刷量
```

**D7 自查**: 你被多少个目标账号 follow back 了？目标 ≥ 5 个。如果 0 个，说明 reply 不够具体，回到样本看别人怎么 reply 的。

**D14 里程碑**:
- 至少 reply 70 条（5/天 × 14 天）
- 被 10+ 个目标账号 follow back
- 自然涨粉到 30-80（来自 reply 露出）

## 阶段 2: 输出（D15-D30, 每天 30 分钟）

**目标**: 开始发推。每天 1 条，绝不"check out my tool"式硬广。

发推内容六种模板（轮换使用）:

### 模板 A: Build in public 进度
```
Day 47 of building free dev tools.

This week's data:
- 3 tools live
- 1,247 unique visitors
- 8 GitHub stars
- $0 revenue

Next: adding email capture to all tools.
```

### 模板 B: 真实问题 + 解决方案
```
Just spent 4 hours debugging why my Vercel cron was firing twice.

Root cause: I had the same path in both vercel.json and a deploy hook.

Posting in case it saves someone else half a day.
```

### 模板 C: 反直觉观点（容易被转发）
```
Hot take: SEO is the only zero-cost acquisition channel for indie hackers in 2026.

Reddit will shadowban you. HN downranks new accounts. Twitter favors followers you don't have.

Long-tail keywords + interactive tools + 6 months of patience. That's it.
```

### 模板 D: 工具发布 thread（每周 1 次，每个新工具用一次）
第一条:
```
Shipped a free PII redactor that runs entirely in your browser.

No backend. Your data never leaves your laptop.

Useful for redacting client logs before pasting into ChatGPT.

Source code + how I built it ↓
```
Thread 后续 5-7 条：技术决策、踩坑、数据、谢谢的人。最后一条放链接。

### 模板 E: 拆别人的产品（建立审美）
```
Why @v0 's empty state copy is better than 99% of dev tools:

"Make me a..." not "What do you want to build?"

The first puts the user in command mode.
The second puts them in interview mode.

Ship-ready vs explain-yourself.
```

### 模板 F: Reply guy 的最高形态——做别人推文的"扩展"
看到一条 100 likes 以上的相关推文（比如 dvassallo 谈 indie hacking），写一条引用转推（quote tweet），加 100 字补充。这种推文转化率最高，因为蹭了原推流量。

每天动作:
```
[ ] 12:00 - 12:05  写 1 条原创推文（用 6 模板轮换）
[ ] 12:05 - 12:10  发出后立即 reply 自己的推文，加 1 条 elaboration
              - 这是 X 算法的隐藏技巧：作者自己 reply 自己的推会推高曝光
[ ] 12:10 - 12:25  Reply 5 条目标账号 + Like 10 条（同 D1-D14）
[ ] 12:25 - 12:30  检查昨天发的推数据。如果某条 >50 impressions，记下来下次模仿
```

**D21 自查**: 推文平均 impression 数。<100 说明发的内容太硬广或太自说自话；>500 说明开始有人看了。

**D30 里程碑**:
- 至少 16 条原创推文
- 平均 impression > 200
- Followers 100-200
- 1 条推文 break out（>1000 impressions）

## 阶段 3: 互动深化（D31-D45, 每天 30 分钟）

**目标**: 把"被认识"升级为"被记住"。开始建立 1-on-1 关系。

每天动作:
```
[ ] 12:00 - 12:10  发 1 条原创推 (同 D15-D30)
[ ] 12:10 - 12:20  Reply 5 条 + Like 10 条 (同上)
[ ] 12:20 - 12:30  DM 1 个 builder
              - 对象：最近 reply 互动过 3+ 次的人
              - 内容：极短，针对他们的某个产品提具体问题或反馈
              - 例: "Hey, just tried [tool]. The Cron syntax preview is so good. Did you build the parser yourself or use cron-parser?"
              - 不要附带链接、不要请求关注、不要"check out my thing"
              - 目标：建立 1 个真实对话往复
```

每周一额外动作:
```
[ ] 给一个 builder 的产品写 1 条独立推文做免费推荐（不是 retweet，是原创）
    - 例: "@dannypostmaa's bg.app is criminally underused. Replaces $50 SaaS subscriptions."
    - 80% 概率会被原作者 retweet，给你扩散
```

**D45 里程碑**:
- 5+ 个 builder 跟你 DM 来回过 3+ 条
- Followers 200-400
- 至少 2 条推文被 1k+ 粉丝的人转推

## 阶段 4: 建立标志（D46-D60, 每天 30 分钟）

**目标**: 让别人能用一句话描述你是干嘛的。

每天动作（不变）:
```
[ ] 12:00 - 12:10  发原创推
[ ] 12:10 - 12:20  Reply + Like
[ ] 12:20 - 12:30  深化 DM 关系（3 个核心 builder 每周至少 1 次接触）
```

每周新动作:
```
[ ] 周三发一篇深度 thread (10-15 条)
    - 主题：codehelper.xyz 系列工具的某次踩坑或发现
    - 数据先行：开篇必须有数字
    - 最后一条放工具链接
[ ] 周五发一篇 "this week's data" 推文
    - 累积 build in public 资产
[ ] Pin 推文换成你最好的那条 thread
```

**D60 里程碑**:
- Followers 300-600
- 至少 3 条 thread > 5k impressions
- 5+ 个一线 builder（>10k 粉）至少互动过一次
- 你的推文里有 "I'm building free dev tools at codehelper.xyz" 这个标签反复出现，被人记住

---

## 七大禁忌（任何阶段都不能做）

1. **不发"check out my tool"** — 单纯求点击的推文是 X 算法最压制的类型
2. **不刷粉** — 算法识别假粉互动，会永久降低你的曝光权重
3. **不发链接（在主推文）** — X 对带外链推文的曝光降权 40-60%。链接放回复或 thread 末尾
4. **不参与口水架** — 政治、AI 反对者、indie 圈八卦
5. **不连发同质内容** — 一周内不要发 3 条都是"我又发布了一个工具"
6. **不 DM 群发** — 一次只 DM 一个人，且必须针对 ta 个人
7. **不在阶段 1-2 求关注** — "looking for first 100 followers" 这种推文反向劝退

---

## 关键指标看板（每周日花 5 分钟看一次）

| 指标 | D15 目标 | D30 目标 | D45 目标 | D60 目标 |
|------|---------|---------|---------|---------|
| Followers | 30-80 | 100-200 | 200-400 | 300-600 |
| 平均 impression | n/a | 200 | 500 | 1000 |
| 7天内 reply 数 | 35 | 35 | 35 | 35 |
| Builder DM 关系 | 0 | 0 | 5 | 10 |
| Break out 推文 (>5k imp) | 0 | 1 | 2 | 5 |

如果连续 2 周没达标，回到样本（D1-D14 截图的 5 条样本）重新分析为什么别人能写出那种推文，你写不出。问题永远在内容质量，不在频率。

---

## D60 之后

D60 的下一个里程碑是 D90，目标 followers 1000+。
那时候开始可以：
- 启动付费产品 waitlist 推文
- 做第一次 Twitter Spaces (audio room)
- 跟 1-2 个 builder 做 cross-promotion thread

但这都是 D60 之后再考虑。**先稳定地走完前 60 天，比任何花哨策略都重要。**

---

## 风险预案

- **D30 时 followers < 50**: 内容质量问题。停止发推一周，回到阶段 1 reply 模式。同时把 30 条最好的样本推文打印出来贴在桌前。
- **某条推文意外破圈（>50k impressions）**: 立刻在该推文 reply 一条 "Following up: here's what I'm building → codehelper.xyz"，把流量导到产品。
- **被 shadowban**: 突然 impression 跌 90%。多半是发链接或被举报。停发 7 天，期间只 like 和 reply。
