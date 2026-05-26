# 4 款产品设计文档（2026-05-26）

**作者**：启点 / 魏磊
**日期**：2026-05-26
**适用版本**：codehelper.xyz v0.5（已上线 8 条产品线 + 266 sitemap URL）
**评审依据**：
- BuilderPulse 5/24 + 5/26 信号验证
- 刘小排七层方法论 + "4 不做"反向过滤（[[liu-xiaopai-methodology-20260521]]）
- 长尾 SEO 狙击策略（[[long-tail-seo-sniper-strategy-20260524]]）
- 现有代码资产（[[self-hosted-alternatives-tool-20260523]]、19 vs 对比页、ScenarioTag 30+ 标签）

---

# 总览

| # | 产品 | 路由 | 工程量 | 启动条件 | 完成标准 |
|---|------|------|-------|---------|---------|
| 1 | Self-Hosted 笔记选型器 | `/finder/notes/` | 1.5 天 | 立刻可启 | 上线 + 索引提交 |
| 2 | Alternatives 内链升级 | 无新路由（升级现有） | 0.5 天 | 立刻可启 | 36 页内链矩阵 + GSC 重抓 |
| 3 | Free Stock Photos Finder | `/photos/` + 子路由 | 4 天 | API key 就绪 | MVP 可搜可下载 |
| 4 | Cron Generator 维护 | 无新路由 | 0.5 天 | 立刻可启 | GSC 全量索引 + 流量监控仪表 |

**总工程量：6.5 天**。建议执行顺序：4 → 2 → 1 → 3（按"已建产品先激活"原则）。

---

# 产品 1：Self-Hosted 笔记选型器

## 1.1 一句话定义

> 输入"我是个人/小团队/企业"+ 4 个核心需求，1 分钟内返回 3 个最匹配的开源笔记应用 + Docker Compose 一键代码 + 维度评分卡。

## 1.2 用户故事

| # | 角色 | 场景 | 期待结果 |
|---|------|------|---------|
| US-1 | 个人开发者 | 想从 Notion 迁出来，搜过 Reddit 看晕 | 1 分钟拿到 3 个候选 + 各自 Pros/Cons |
| US-2 | 5 人小团队 leader | 要选团队 wiki，但不想要 SaaS 订阅 | 看到"团队规模=小团队"维度筛后的推荐 |
| US-3 | 树莓派玩家 | 要在 1GB 内存机器上跑笔记 | 筛"低资源"+"docker_ready"出 Memos/Trilium |
| US-4 | 普通用户 | 只想要本地优先 + 加密 | 选"e2e_encryption"+"local-first"出 Joplin/Logseq |

## 1.3 信息架构 + 路由

```
/finder/                          → Finder 总入口（未来扩展其他垂直）
/finder/notes/                    → 笔记应用选型器主页（本设计目标）
/finder/notes/result/             → 推荐结果页（动态，URL 编码场景参数）
/finder/notes/result/?team=solo&tech=beginner&host=docker&need=privacy
                                  → 永久链接，可分享、可索引部分长尾
```

> **不做独立工具**：作为 alternatives 的"选型升级层"，所有数据复用 `alternatives-data.ts` 的 Note-Taking 类目（已含 notion/evernote/onenote 9 款工具）。

## 1.4 数据模型

复用现有 `SelfHostedAlt`，扩展 1 个文件 `src/finder/notes/finder-data.ts`：

```typescript
export type WizardDimension = 'team' | 'tech' | 'host' | 'need'

export type WizardOption = {
  team: 'solo_dev' | 'small_team' | 'enterprise'
  tech: 'beginner_friendly' | 'intermediate' | 'advanced_setup'
  host: 'docker_ready' | 'lightweight' | 'low_resource' | 'native_app'
  need: 'collaboration' | 'privacy' | 'offline_first' | 'database_features'
}

export interface DimensionScore {
  dimension: WizardDimension
  score: number          // 0-10
  reason: string         // "Native E2E encryption + local files"
  evidence: string       // GitHub stars/last commit/license
}

export interface FinderRecommendation {
  tool: SelfHostedAlt    // 复用现有类型
  matchScore: number     // 0-100，仅作排序用，不向用户显示总分
  dimensionScores: DimensionScore[]
  dockerCompose: string  // 新增：完整 docker-compose.yml 字符串
  whyThisOne: string     // 30 字推荐理由
  whyNotAlternatives: { tool: string; reason: string }[]  // 解释为什么没选另外两个
}

export interface ScenarioWeights {
  // 标签 → 权重（0-3），4 维选项叠加得到
  [tag in ScenarioTag]?: number
}

// 4 维度选项 → 权重映射表（核心规则）
export const SCENARIO_WEIGHT_MAP: Record<keyof WizardOption, Record<string, ScenarioWeights>> = {
  team: {
    solo_dev:      { lightweight: 3, beginner_friendly: 2, raspberry_pi: 1 },
    small_team:    { collaboration: 3, sharing: 2, sso: 1 },
    enterprise:    { rbac: 3, sso: 3, ldap: 2, audit_log: 2, scalable: 2 },
  },
  tech: {
    beginner_friendly: { beginner_friendly: 3, lightweight: 2, docker_ready: 2 },
    intermediate:      { docker_ready: 2, intermediate: 1 },
    advanced_setup:    { advanced_setup: 1, federation: 1, scalable: 1 },
  },
  host: {
    docker_ready:  { docker_ready: 3 },
    lightweight:   { lightweight: 3, low_resource: 2 },
    low_resource:  { lightweight: 3, low_resource: 3, raspberry_pi: 2 },
    native_app:    { desktop_app: 3, mobile_app: 2 },
  },
  need: {
    collaboration:     { collaboration: 3, sharing: 2, wiki: 2 },
    privacy:           { e2e_encryption: 3, zero_knowledge: 3, audit_log: 1 },
    offline_first:     { lightweight: 2, desktop_app: 2 },
    database_features: { wiki: 2, kanban: 2 },
  },
}
```

## 1.5 评分算法（透明、可解释）

```typescript
function recommendNotes(opts: WizardOption): FinderRecommendation[] {
  // 1. 按维度叠加权重
  const weights = mergeWeights(opts)

  // 2. 每个候选工具按 4 个维度独立打分（0-10）
  const candidates = NOTE_TAKING_TOOLS.map(tool => {
    const dimensionScores = (['team', 'tech', 'host', 'need'] as const).map(dim => {
      const matchedTags = tool.scenarioTags?.filter(t => SCENARIO_WEIGHT_MAP[dim][opts[dim]]?.[t]) ?? []
      const score = Math.min(10, matchedTags.reduce((s, t) => s + (SCENARIO_WEIGHT_MAP[dim][opts[dim]]![t] ?? 0) * 2, 0))
      return { dimension: dim, score, reason: explainMatch(tool, dim, matchedTags), evidence: githubEvidence(tool) }
    })
    return { tool, matchScore: dimensionScores.reduce((s, d) => s + d.score, 0), dimensionScores, ... }
  })

  // 3. 取 top 3，附带 docker-compose 和"为什么不选另两个"
  return candidates.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3).map(annotateAlternatives)
}
```

**关键**：**只显示 4 个维度的独立评分（条形图）+ 推荐理由文字，不显示总分**——这是 Codex 6 项改进里的硬要求，避免被当排行榜。

## 1.6 UI 组件（顺序）

```
┌─────────────────────────────────────────────┐
│ <GlobalNav current="/finder/notes/" />     │
├─────────────────────────────────────────────┤
│  H1: Find your perfect self-hosted notes    │
│  Sub: Answer 4 questions, get tailored      │
│       recommendations in 60 seconds.        │
├─────────────────────────────────────────────┤
│  <ScenarioWizard>  4 步问答（单页 stepper）  │
│    Step 1: Team size                        │
│    Step 2: Technical comfort                │
│    Step 3: Hosting environment              │
│    Step 4: Most important feature           │
│  </ScenarioWizard>                          │
├─────────────────────────────────────────────┤
│  [Result panel — 触发后展开]                │
│  <RecommendationCard rank=1 />              │
│  <RecommendationCard rank=2 />              │
│  <RecommendationCard rank=3 />              │
│                                             │
│  Each card:                                 │
│    Tool name + logo + license + difficulty  │
│    4 dimension bars (Team/Tech/Host/Need)   │
│    "Why this one" 30-char reason            │
│    "Why not [other 2]" expandable           │
│    Docker Compose code block + Copy btn     │
│    GitHub star + last commit + maintenance  │
│    [Try it] external + [Compare side-by-    │
│    side] internal link to /compare/        │
├─────────────────────────────────────────────┤
│  <RelatedQuestions> FAQ 6 条 - 复用 alt FAQ  │
│  <SimilarFinders>  "试试 wiki/cloud finder"  │
│  <Footer>                                    │
└─────────────────────────────────────────────┘
```

复用现有组件：
- `GlobalNav` — `src/components/GlobalNav.tsx`
- `CopyButton` — `src/compare/ComparePage.tsx:12`
- `FeatureValue` — 同上

新建组件：
- `src/finder/notes/ScenarioWizard.tsx` — 4 步问答（约 200 行）
- `src/finder/notes/RecommendationCard.tsx` — 推荐卡（约 250 行）
- `src/finder/notes/DimensionBar.tsx` — 单维度条形图（约 50 行）
- `src/finder/notes/finder-engine.ts` — 评分引擎（约 150 行）

## 1.7 SEO 策略

**主页 `/finder/notes/`**：
- title: `Self-Hosted Note-Taking App Finder — Notion, Obsidian, Joplin Compared by Your Use Case`
- meta description: `Answer 4 questions about your team, tech level, and needs. Get 3 tailored open-source note-taking recommendations with Docker setup.`
- H1: `Find Your Self-Hosted Note-Taking App`

**目标关键词命中**（5/24 + 5/26 已验证）：
- `best free note taking apps` (+200% 5/26 验证)
- `self-hosted notion alternative`（已有 /alternatives/notion/）
- `obsidian vs notion` (2,900/月)
- `notion vs obsidian` (1,900/月)
- `joplin vs obsidian` (480/月)
- `appflowy vs notion`（长尾）
- `local first note taking app`
- `e2e encrypted notes self hosted`

**结构化数据**：
- `WebApplication` schema（applicationCategory: ProductivityApplication）
- `FAQPage` schema（6 条 FAQ）
- `BreadcrumbList` schema

**内链矩阵**：
- 上行：`/alternatives/`、`/alternatives/notion/`、`/alternatives/evernote/`
- 平行：`/compare/notion-vs-obsidian/`、`/compare/joplin-vs-obsidian/`、`/compare/obsidian-vs-notion/`
- 下行（未来）：`/finder/cloud-storage/`、`/finder/wiki/`

## 1.8 变现路径（刘小排水印漏斗）

| 层级 | 内容 | 价格 |
|------|------|------|
| 免费 | 4 维选型 + 3 推荐 + Docker Compose + Pros/Cons | $0 |
| 漏 | 高级筛选（"必须支持 OIDC""必须支持 PostgreSQL"等 12 个高级标签）| 灰按钮提示升级 |
| 收 | 个人版 $4/月 / Pro 版 $9.99/月 | 解锁高级筛选 + 邮件订阅"我推荐的工具有重大更新" |

**第一阶段不上付费**——先验证流量，3 周内自然搜索 ≥ 50 UV/月再开 Pro。

## 1.9 工程拆解

| Task | 估时 | 文件 | 依赖 |
|------|------|------|------|
| T1 数据：扩展 NOTE_TAKING_TOOLS | 1h | `src/finder/notes/finder-data.ts` | 复用 alternatives-data.ts |
| T2 算法：评分引擎 + 单元测试 | 3h | `src/finder/notes/finder-engine.ts` + `.test.ts` | T1 |
| T3 UI：ScenarioWizard 4 步问答 | 3h | `src/finder/notes/ScenarioWizard.tsx` | - |
| T4 UI：RecommendationCard | 3h | `src/finder/notes/RecommendationCard.tsx` | T2, T3 |
| T5 路由：Vite 多入口 + 静态生成脚本 | 2h | `vite.config.ts`, `scripts/generate-finder-html.cjs` | T4 |
| T6 SEO：FAQ + JSON-LD | 1h | `src/finder/notes/main.tsx` | T4 |
| T7 sitemap 接入 | 0.5h | `scripts/generate-sitemap.cjs` | T5 |
| T8 内链矩阵注入 | 0.5h | 修改 alternatives 页 + compare 页底部链 | - |
| T9 GSC 提交 | 0.5h | 手动 | 部署后 |
| **总** | **14h ≈ 1.5 天** | | |

## 1.10 验收标准

- [ ] `/finder/notes/` 返回 200 OK
- [ ] 4 步问答全部完成 < 60 秒（人工测试）
- [ ] 推荐结果包含 3 个候选 + 4 维度评分 + Docker Compose
- [ ] sitemap.xml 含新 URL
- [ ] Lighthouse mobile 分数 ≥ 90
- [ ] 12 个组合场景人工抽测推荐合理（如 solo_dev + privacy + low_resource → 出 Joplin/Memos）
- [ ] 评分引擎单元测试覆盖率 ≥ 80%

## 1.11 风险与对冲

| 风险 | 概率 | 影响 | 对冲 |
|------|------|------|------|
| 评分被觉得"还是排行榜" | 中 | 中 | 隐藏总分，每个维度独立显示 + 文字解释 |
| 数据陈旧（GitHub stars 不更新）| 高 | 中 | 已有 fetch-github-stats.cjs 每周跑一次 |
| 同类竞品 alternativeto.com | 中 | 低 | 我们的差异是"4 维场景 + Docker 一键" |

---

# 产品 2：Alternatives 内链升级

## 2.1 一句话定义

> 把 36 个 alternatives 页 + 19 个 compare 页用智能内链编织成 600+ 双向链接矩阵，提升每页 SEO 权重和用户停留。

## 2.2 用户故事

| # | 角色 | 场景 | 期待结果 |
|---|------|------|---------|
| US-1 | 搜 "self-hosted notion" 进 alternatives 页 | 看完 AppFlowy 介绍想知道它和 Notion 详细差距 | 一键跳到 `/compare/appflowy-vs-notion/` |
| US-2 | 搜 "obsidian vs notion" 进 compare 页 | 想看更多 obsidian 的同类候选 | 一键跳 `/alternatives/notion/`（看全部 9 个候选）|
| US-3 | 搜引擎爬虫 | 抓取页面 | 每页内部锚文本 5-15 个，权重均衡传递 |

## 2.3 改动清单

```
src/alternatives/AlternativesApp.tsx
  └─ 在每个 SelfHostedAlt 卡片底部添加 "Compare X vs Y" 链接
src/alternatives/LongTailAltPage.tsx
  └─ 添加 "Related comparisons" 章节（3-4 条 compare 链接）

src/compare/ComparePage.tsx (line 220-242 已有 RelatedComparisons)
  └─ 升级：再加 "See all alternatives to X" 链接到 alternatives 页

src/finder/notes/RecommendationCard.tsx
  └─ 推荐卡内加 "Compare side-by-side" 按钮 → /compare/

新建 scripts/build-internal-links.cjs
  └─ 离线计算每对页面的关联度，生成 internal-links-map.json
  └─ 在构建时注入到每个静态页面的 <RelatedLinks> 组件
```

## 2.4 内链规则（避免 over-linking 被 Google 惩罚）

| 页面类型 | 上行链接数 | 平行链接数 | 下行链接数 | 总数上限 |
|---------|----------|----------|----------|---------|
| `/alternatives/notion/` | 1（→ `/alternatives/`）| 4-6（同 Note-Taking 类）| 3-4（→ compare 页）| 12 |
| `/compare/notion-vs-obsidian/` | 2（→ alt notion + alt obsidian）| 4（同子领域 compare）| 0 | 6 |
| `/finder/notes/` | 1（→ `/finder/`）| 3（其他 finder）| 6（→ 推荐工具的 alt 页）| 10 |

锚文本：使用工具名 + 关键词（如"self-hosted Notion alternative"），不重复全站同一锚文本。

## 2.5 工程拆解

| Task | 估时 | 文件 |
|------|------|------|
| T1 写 build-internal-links.cjs | 2h | `scripts/build-internal-links.cjs` |
| T2 修改 AlternativesApp + LongTailAltPage 渲染 | 1h | 2 个 .tsx |
| T3 修改 ComparePage RelatedComparisons | 0.5h | 1 个 .tsx |
| T4 sitemap 重生成 | 0.2h | 自动 |
| T5 GSC 重抓 + 监控 | 0.3h | 手动 |
| **总** | **4h ≈ 0.5 天** | |

## 2.6 验收标准

- [ ] 任一 alternatives 页底部至少有 3 条 compare 链接
- [ ] 任一 compare 页底部至少有 2 条 alternatives 链接
- [ ] 没有页面内链 > 12 条
- [ ] 5/27 GSC 重抓后展示量 7 天内 ≥ 上一周 +20%

---

# 产品 3：Free Stock Photos Finder

## 3.1 一句话定义

> 输入关键词，一次搜遍 Unsplash + Pexels + Pixabay 三家免费图库，每张图明确标注"商用 / 不需署名 / 无限制"绿灯。

## 3.2 用户故事

| # | 角色 | 场景 | 期待结果 |
|---|------|------|---------|
| US-1 | 博客作者 | 写 SaaS 文章配图，需要"laptop coffee"主题 | 输入关键词 → 30 张候选 + 各自许可证清晰标注 |
| US-2 | 跨境电商 | 商详页配图，必须"商用 + 无需署名" | 一键筛"绿灯安全图"过滤所有需署名的 |
| US-3 | YouTube 创作者 | 视频缩略图，要 1920×1080 横版 | 筛尺寸"≥1920x1080" + 横向比例 |
| US-4 | 内容农场（边缘）| 一次下 50 张做素材库 | 免费层限 10 张/天，付费层批量打包 |

## 3.3 路由 + 信息架构

```
/photos/                          → 主页：搜索框 + 热门关键词预览
/photos/?q=laptop+coffee          → 搜索结果（URL 编码，可分享 + 部分被索引）
/photos/laptop/                   → 长尾页：预渲染"laptop"关键词页（SEO 入口）
/photos/business/                 → 同上 50 个高频词
/photos/license-guide/            → 教育页：CC0 / Pexels License / Unsplash License 区别
/photos/about-attribution/        → "什么是无需署名" 教育页
```

## 3.4 数据模型

```typescript
// src/photos/types.ts
export interface PhotoResult {
  id: string                       // unsplash_xyz / pexels_123
  source: 'unsplash' | 'pexels' | 'pixabay'
  url: { thumb: string; full: string; download: string }
  dimensions: { width: number; height: number }
  author: { name: string; profileUrl: string }
  license: PhotoLicense
  tags: string[]
  fetchedAt: string                // ISO timestamp
}

export interface PhotoLicense {
  type: 'cc0' | 'unsplash' | 'pexels' | 'pixabay'
  commercialUse: boolean          // 商用允许
  attributionRequired: boolean    // 是否需署名
  modifications: boolean          // 允许修改
  trafficRestrictions?: string    // 任何限制说明
  greenLight: boolean             // = !attributionRequired && commercialUse
}

// 长尾关键词预渲染页（50 个）
export interface PhotoLongTailPage {
  slug: string                     // 'laptop' / 'business-meeting'
  keyword: string
  title: string                    // 'Free Laptop Photos No Attribution Required'
  description: string
  searchVolume?: number            // seodata 验证后填入
  precomputedIds?: string[]        // 服务端预取的 24 张图 ID（首屏）
}
```

## 3.5 数据源（API）

| 源 | 免费额度 | 鉴权 | 文档 |
|----|---------|------|------|
| Unsplash | 50 req/h（开发）/ 5000 req/h（生产）| Access Key | unsplash.com/developers |
| Pexels | 200 req/h / 20000 req/月 | API Key | pexels.com/api |
| Pixabay | 5000 req/h | API Key | pixabay.com/api/docs |

**密钥管理**：放 `.env.local`（前缀 `VITE_` 才暴露给前端，否则放后端）。建议**全部走后端 API**避免泄漏 + 缓存命中。

**架构**：Vercel Edge Function 作为代理。前端 → `/api/photos/search?q=X&page=1` → Edge Function 并行调三家 → 合并去重 → 返回带许可证标记的统一格式。

```
src/photos/
├── PhotosApp.tsx                # 主页 + 搜索
├── PhotoCard.tsx                # 单图卡（含许可证绿灯）
├── PhotoLongTailPage.tsx        # 长尾页
├── LicenseGuide.tsx             # 教育页
├── api-client.ts                # fetch /api/photos
└── seo/
    ├── photos-data.ts           # 50 个长尾词
    └── license-data.ts          # 三家许可证规则

api/photos/
├── search.ts                    # Vercel Edge Function 主搜
├── _adapters.ts                 # unsplash/pexels/pixabay 适配
└── _license.ts                  # 许可证翻译
```

## 3.6 UI 关键组件

```
┌────────────────────────────────────────┐
│ <Search bar with autocomplete>         │
│ [Quick filters: green-light only |     │
│  ≥1920px | landscape | portrait]       │
├────────────────────────────────────────┤
│ <PhotoGrid masonry>                    │
│   <PhotoCard>                          │
│     [thumbnail]                        │
│     ✓ Commercial use   ✓ No attrib    │  ← 绿灯标识
│     1920×1080 · Unsplash · @author    │
│     [Download original] [Copy URL]    │
│   </PhotoCard>  ×30                    │
│ </PhotoGrid>                           │
├────────────────────────────────────────┤
│ <Pagination>                           │
│ <RelatedKeywords>                      │
│ <FAQ>                                  │
└────────────────────────────────────────┘
```

## 3.7 SEO 策略

**主入口词集群**（5/26 BuilderPulse 已验 breakout）：
- `free stock photos no attribution`
- `royalty free images commercial use`
- `free images no copyright`

**长尾页（50 个高频关键词）**：
- `laptop` / `office` / `coffee` / `meeting` / `nature` / `technology` / `business`...
- 每页 H1：`Free [Keyword] Photos No Attribution Required`
- 预渲染 24 张图 + 许可证表 + FAQ

**结构化数据**：
- `ImageObject` schema（每张图）
- `Dataset` schema（许可证表）
- `FAQPage` schema

## 3.8 变现路径（标准刘小排水印漏斗）

| 层级 | 内容 | 价格 |
|------|------|------|
| **免费** | 搜索 + 浏览无限 + 单张下载 | $0 |
| **限制** | 每天 ≤10 张下载，每张需点击源站确认 | 看到 "Pro: skip clicks" 灰按钮 |
| **Pro $9.99/月** | 无限下载 + ZIP 打包 + 商用证明 PDF + 高级筛选 | 漏斗收口 |

**关键水印**：免费版下载页加 "Powered by codehelper.xyz" 浮水印（可选关闭按钮 → 引到 Pro）。

## 3.9 工程拆解

| Task | 估时 | 文件 |
|------|------|------|
| T1 申请三家 API key + .env 配置 | 0.5h | `.env.local` |
| T2 写 Edge Function 后端 | 4h | `api/photos/search.ts` + adapters |
| T3 PhotosApp + Search + Grid | 5h | `src/photos/*.tsx` |
| T4 PhotoCard 含许可证绿灯 | 2h | `src/photos/PhotoCard.tsx` |
| T5 LicenseGuide 教育页 | 1h | `src/photos/LicenseGuide.tsx` |
| T6 50 个长尾词数据 + 静态生成 | 3h | `src/photos/seo/photos-data.ts` + 脚本 |
| T7 Vite 多入口 + sitemap | 1h | `vite.config.ts` |
| T8 SEO meta + JSON-LD | 1.5h | 各页 main.tsx |
| T9 速率限制 + 缓存（KV）| 2h | `api/photos/search.ts` |
| T10 GSC 提交 + 监控 | 0.5h | 手动 |
| T11 跨域水印浮层（免费版下载页）| 1h | `PhotoCard` |
| T12 Pro 占位（不实现支付，留 wait list）| 1.5h | `src/photos/Upgrade.tsx` |
| **总** | **23h ≈ 4 天** | |

## 3.10 验收标准

- [ ] 关键词搜索 < 2 秒返回三家合并结果
- [ ] 每张图清楚显示绿灯/红灯许可证
- [ ] 50 个长尾页全部 200 OK
- [ ] sitemap 含新增 ~55 URL
- [ ] Lighthouse mobile ≥ 85（图多分数会低，可接受）
- [ ] Edge Function 单次调用 < 1.5 秒
- [ ] API 密钥不在前端泄漏（grep 检查）
- [ ] 三家 API quota 不超限（监控仪表）

## 3.11 风险与对冲

| 风险 | 概率 | 影响 | 对冲 |
|------|------|------|------|
| 三家 API 限流 | 高 | 高 | KV 缓存（24h TTL）+ 错误时降级显示单家 |
| 上游变更许可证条款 | 低 | 高 | 每周自动 check 三家 ToS 页面 |
| 用户绕过水印直下源站 | 高 | 中 | 接受。免费层本来就是漏斗顶 |
| Google 视为内容农场 | 中 | 高 | 长尾页加深度内容（许可证教育 + 用例案例）|

---

# 产品 4：Cron Generator 维护

## 4.1 一句话定义

> 不增功能，只做：①完成 GSC 全量索引，②建流量监控仪表，③把已有 161 个长尾页修剪 + 优化 metadata 提分。

## 4.2 当前现状

- 已上线 161 个长尾页（5/22）
- 已迁到 codehelper.xyz（5/25）
- GSC 5/26 已提交 8 条 deploy + 2 条 cron 长尾，剩余 ~150 条 cron 长尾未提交
- 流量监控：缺一个看板（目前用 GSC + Vercel Analytics 两处对账）

## 4.3 用户故事（开发者侧）

| # | 谁 | 场景 | 期待 |
|---|---|------|------|
| US-1 | 我（开发者）| 每天看 cron 工具的进展 | 一个 dashboard：印象/点击/曝光关键词 top 10 |
| US-2 | 我 | 决定下一步是否扩展 cron | 看 cron-vs-竞品的 SOV（share of voice）|
| US-3 | 我 | 防 SEO 退化 | 监控页面跑分异常告警 |

## 4.4 行动清单

### 4.4.1 GSC 全量索引（最高优先）

```
A. 5/27 起每天手动 10 条提交（GSC 配额限制），16 天跑完 161 cron + 36 alt + 19 compare
B. 智能批次：每天先提交"上周展示量增长" top 10 的页面 → 加速复合
C. 写脚本 scripts/gsc-quota-tracker.cjs：记录已提交，避免重复
```

### 4.4.2 流量监控看板

新建 `/admin/dashboard/`（私有路径，cookie 鉴权）：

```
┌──────────────────────────────────────────┐
│ Last 7 days | Last 30 days | All time   │
├──────────────────────────────────────────┤
│ 总展示量 ████████░░ 12,400  +18% w/w   │
│ 总点击量 ██░░░░░░░░    87  +5%   w/w   │
│ CTR      0.7%                            │
│ 平均排名 38.2                            │
├──────────────────────────────────────────┤
│ Top 10 关键词（点击）                     │
│ 1. cron every 5 minutes      24 (#15)   │
│ 2. cron generator             18 (#22)   │
│ ...                                      │
├──────────────────────────────────────────┤
│ Top 10 页面（展示）                       │
│ 1. /cron-generator/every-5-minutes/     │
│ ...                                      │
├──────────────────────────────────────────┤
│ 异常告警 ⚠️                               │
│ /cron-generator/every-monday/ 展示掉 -45%│
└──────────────────────────────────────────┘
```

数据源：GSC API（Search Console Search Analytics API）+ Vercel Analytics REST API

### 4.4.3 metadata 优化（小动作大收益）

跑 `scripts/seo-health-check.cjs`（已存在）：
- 检查每个长尾页 title 是否 ≤60 字符
- meta description 是否 130-155 字符
- H1 是否唯一
- 是否有重复 keywords

修一遍历史页面，预计 30 个页面有问题。

## 4.5 工程拆解

| Task | 估时 | 备注 |
|------|------|------|
| T1 跑 seo-health-check 修异常 metadata | 2h | 已有脚本 |
| T2 写 gsc-quota-tracker.cjs | 1h | 防重复提交 |
| T3 dashboard 路由 + GSC API 接入 | 1.5h | 后端 Edge Function |
| T4 dashboard UI（极简，dark theme）| 1.5h | React |
| T5 异常告警阈值规则（展示掉 30%）| 0.5h | cron job 每天 |
| T6 5/27 起 GSC 每天 10 条提交（手动）| 16 天 ×0.2h = 3.2h | 异步 |
| **总（不含异步提交）** | **6.5h ≈ 1 天**（题目算 0.5 天因为不全做）| |

## 4.6 验收标准

- [ ] dashboard 显示真实 GSC 数据（不是 mock）
- [ ] seo-health-check 全绿
- [ ] gsc-quota-tracker.cjs 记录已提交 URL
- [ ] 6/15 之前 cron 全部 161 页索引覆盖率 ≥ 80%
- [ ] 6/30 之前自然搜索点击 ≥ 100/月（首个工具流量目标）

---

# 总执行顺序

```
第 1 天上半（0.5 天）│ 产品 4：Cron 维护 + dashboard 上线 + 修 SEO 健康
第 1 天下半（0.5 天）│ 产品 2：Alternatives 内链矩阵 + GSC 重抓
第 2-3 天（1.5 天）  │ 产品 1：笔记选型器（最高复用，最快流量）
第 4-7 天（4 天）    │ 产品 3：Free Stock Photos
第 8-21 天           │ 异步：每天 10 条 GSC 提交 + 监控 dashboard 看流量
```

## 全局 KPI（30 天检查）

| 指标 | 目标 | 来源 |
|------|------|------|
| 索引页面数 | 240+ / 266 | GSC Coverage |
| 自然搜索点击 | 200+/月 | GSC |
| Photos Finder MAU | 500+ | Vercel Analytics |
| Notes Finder 完成率（4 步走完）| ≥ 35% | 自定义事件 |

## 风险全局

1. **同时做 4 个产品有 context-switch 成本**——已按 0.5/0.5/1.5/4 天单线推进，规避并行
2. **GSC 索引慢**——节奏不可控，所以产品 1+2+3 都做 SEO 兜底但不指望 30 天内出大量自然流量
3. **API 密钥泄漏**——Stock Photos 全走后端代理，前端代码 grep 不到 key

---

# 下一步

写完此文档后建议立刻：
1. 把文档加入 git commit（`docs/design/2026-05-26-four-products.md`）
2. 把对应内容写入 memory（保留产品决策依据）
3. 更新 task list（task #5 升级为产品 1 + 新增产品 2/3/4 任务）
4. 启动产品 4（最快见效，0.5 天）

— 文档结束 —
