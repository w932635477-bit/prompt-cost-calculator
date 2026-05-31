# Cron Expression Validator — 设计文档 v2

> Codex 审查修订版。v1 → v2 变更：砍范围 7→4 页，加方言验证层，补构建集成，加测试计划。

## 背景

BuilderPulse 5/31 + Codex 第二意见确认：Cron Validator 是 aicalc.cloud 当前最高优先级 SEO 工具。

**为什么是它：**
- Google Suggest "cron expression validator" 返回 10 条联想词（npm, python, c#, quartz, online...）
- KD 8-18，落在长尾狙击区间
- 已有 cron-generator 的 **主题权威**（topical authority），validator 是自然扩展
- 竞争对手薄：crontab.guru 占头部词，但 validator 细分词 SERP 上只有 cronhub、freeformatter，UX 过时

**SEO 目标词（优先级排序）：**

| 关键词 | 类型 | 目标 KD | 备注 |
|--------|------|---------|------|
| cron expression validator | 枢纽页 | 8-12 | 主词 |
| cron expression validator online | 枢纽页变体 | 8-12 | |
| cron validator | 枢纽页变体 | 10-15 | |
| cron expression checker | 枢纽页变体 | 8-12 | |
| validate cron expression | 长尾 | 5-10 | |
| cron expression validator quartz | 子页 | 8-15 | |
| cron expression validator kubernetes | 子页 | 8-15 | 新增 |
| cron expression validator aws | 子页 | 8-15 | 新增 |
| invalid cron expression | FAQ 内容 | 5-10 | |
| ~~cron expression validator spring~~ | ~~子页~~ | — | 推迟：和 quartz 重叠 |
| ~~cron expression validator npm~~ | ~~子页~~ | — | 推迟：意图弱（用户要包文档不是 web 工具）|
| ~~cron expression validator python~~ | ~~子页~~ | — | 推迟：croniter 碎片化 |

## 范围决策（v2 关键变更）

**首版 4 页，用 GSC 数据验证后再扩。**

| 子页 | 首版 | 理由 |
|------|------|------|
| 枢纽页 `/cron-validator/` | ✅ | 主工具 |
| `/cron-validator/quartz/` | ✅ | 语法差异大（? L W #），真实困惑，高搜索量 |
| `/cron-validator/kubernetes/` | ✅ | 5-field 但有额外约束（秒字段、时区），平台独特 |
| `/cron-validator/aws-eventbridge/` | ✅ | 明确不同语法（6-field 无年），AWS 用户痛点 |
| `/cron-validator/github-actions/` | 🔜 v2 | 和 Unix 几乎相同，加 UTC 限制说明即可，低差异化 |
| `/cron-validator/spring/` | 🔜 v3 | 和 quartz 重叠，用户搜 spring 实际要 quartz |
| `/cron-validator/python/` | 🔜 v3 | croniter 库碎片化，低转化 |

## URL 结构

```
/cron-validator/                           ← 枢纽页（主工具）
/cron-validator/quartz/                    ← Quartz 6-7 field 验证
/cron-validator/kubernetes/               ← Kubernetes CronJob 验证
/cron-validator/aws-eventbridge/          ← AWS EventBridge 验证
```

共 4 页。与 cron-generator 的 120+ 页共享内链网络。

## i18n 决策

**首版 English-only。** 理由：SEO 目标词 100% 英文；中文/日文用户搜 cron validator 的搜索量极低。不投入 i18n 基础设施。后续如需多语言，复用 cron-generator 的 i18n 框架。

## 架构

复用现有 cron-generator 的基础设施，**不新建独立工具**。

### 复用清单

| 组件 | 来源 | 用途 |
|------|------|------|
| `cron-parser` ^5.5.5 | 已有依赖 | 基础解析（但不够，见下方验证层） |
| `cron-adapter.ts` | `src/cron/lib/` | `isValidCron()`, `parseCron()`, dialect 转换 |
| `DialectSwitcher` | `src/cron/components/` | Unix/Quartz/AWS 切换 |
| `NextRuns` | `src/cron/components/` | 下次执行时间显示 |
| `CopyButton` | `src/cron/components/` | 复制 cron 表达式 |
| `GlobalNav` | `src/components/` | 全站导航 |
| `long-tail-data.ts` 模式 | `src/cron/seo/` | 长尾页数据结构 |
| `generate-*-html.cjs` 模式 | `scripts/` | HTML 生成脚本 |
| `generate-sitemap.cjs` | `scripts/` | 自动收录新 URL |

### 新增文件

```
src/cron-validator/
  ValidatorApp.tsx              ← 枢纽页 React 组件
  ValidatorPage.tsx             ← 子页 React 组件
  validator-data.ts             ← 子页 SEO 数据（3 条：quartz, k8s, aws）
  lib/
    dialect-constraints.ts      ← 方言专属验证层（parser 之上）
    error-explainer.ts          ← cron-parser 错误 → 人类可读建议
    dialect-convert.ts          ← 方言互转预览（Unix ⇄ Quartz ⇄ AWS）

scripts/
  generate-validator-html.cjs   ← 生成子页 HTML 壳

cron-validator/
  index.html                    ← 枢纽页 HTML 壳
  quartz/index.html             ← 子页 HTML 壳
  kubernetes/index.html         ← 子页 HTML 壳
  aws-eventbridge/index.html    ← 子页 HTML 壳
```

### 方言验证层 `dialect-constraints.ts`（v2 新增）

**Codex 关键发现：cron-parser 接受的形式，实际平台可能拒绝。** 需要在 parser 之上加一层方言专属约束验证。

```typescript
// 每种方言的约束定义
interface DialectConstraints {
  fieldCount: [number, number]       // [min, max] 字段数
  allowedTokens: string[]            // 允许的特殊 token
  forbiddenTokens: string[]          // 禁止的 token
  platformRules: PlatformRule[]      // 平台特定规则
}

// 验证结果：parser 通过 + 方言约束通过 = ✅
// parser 通过 + 方言约束失败 = ⚠️ 合法但不适用于此平台
interface ValidationResult {
  valid: boolean
  warnings: ValidationWarning[]      // 合法但有坑
  errors: ValidationError[]          // 硬错误
  fixSuggestions: string[]           // 可操作的修复建议
}
```

各方言约束要点：

| 方言 | 字段数 | 特殊 token | 关键约束 |
|------|--------|-----------|---------|
| Unix | 5 | * , - / | 无 ? L W # |
| Quartz | 6-7 | ? L W # * , - / | 日和周必须有一个是 ?；秒是第 1 字段 |
| AWS EventBridge | 6 | * , - / ? L W | 无 #；年字段可选；日和周必须有一个是 ? |
| Kubernetes | 5 | * , - / | 同 Unix 但：可选秒字段（第 1 位）；timezone 注释 `TZ=xxx` |

**验证流程（v2 修订）：**

```
输入 cron 表达式
  → 选择方言（默认 Unix）
  → cron-parser 尝试解析
    → 失败: ❌ Invalid + error-explainer 翻译 + 修复建议
    → 成功: 进入方言约束层
      → 约束失败: ⚠️ "Parser accepts this, but {platform} may reject it"
        → 给出具体原因 + 改写建议
      → 约束通过:
        → ✅ Valid + 人类描述 + 下次执行 + 字段拆解
        → 方言互转预览（"在 Quartz 中等价于 ..."）
        → 平台就绪片段（K8s YAML、EventBridge JSON）
        → 警告类检查（二月 30 号、每分钟执行等）
```

## 页面设计

### 枢纽页 `/cron-validator/`

**SEO：**
- `<title>`: Cron Expression Validator — Check & Test Cron Online Free
- `<meta description>`: Validate any cron expression instantly. See if your cron is valid, get human-readable explanation, next run times, and fix common errors. Supports Unix, Quartz, and AWS cron formats.
- canonical: `https://aicalc.cloud/cron-validator/`
- Schema: `WebApplication` + `FAQPage`（5 条 FAQ）

**布局（ASCII）：**

```
┌──────────────────────────────────────────────────────┐
│ GlobalNav                                             │
├──────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Cron Validator                    │
│                                                       │
│ H1: Cron Expression Validator                        │
│ Subtitle: Paste any cron expression. Get instant     │
│           validation, explanation, and next runs.    │
│                                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │  [Dialect: Unix v | Quartz v | AWS v]            │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ */5 * * * *                        [Clear] │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                   │ │
│ │  ✅ Valid cron expression                        │ │
│ │  "Every 5 minutes"                               │ │
│ │                                                   │ │
│ │  Next 5 runs:                                    │ │
│ │  2026-05-31 16:00:00 UTC                         │ │
│ │  2026-05-31 16:05:00 UTC                         │ │
│ │  ...                                             │ │
│ │                                                   │ │
│ │  Field breakdown:                                │ │
│ │  ┌─────┬────────────┬────────────────────────┐  │ │
│ │  │ */5 │ *          │ *    │ *   │ *    │     │  │ │
│ │  │ min │ hour       │ dom  │ mon │ dow  │     │  │ │
│ │  │ every│ every     │ every│ every│ every│     │  │ │
│ │  │ 5min │ hour      │ day  │ month│ day  │     │  │ │
│ │  └─────┴────────────┴──────┴─────┴──────┘     │  │
│ │                                                   │ │
│ │  ┌─ Dialect Convert Preview ──────────────────┐  │ │
│ │  │ Quartz: 0 */5 * * * ?                      │  │ │
│ │  │ AWS:    0/5 * * * ? *                      │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                   │ │
│ │  [Copy Expression] [Open in Generator →]         │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─ Why use this over crontab.guru? ───────────────┐ │
│ │ ✅ Multi-dialect (Quartz, AWS, K8s, not just    │ │
│ │    Unix)                                         │ │
│ │ ✅ Platform-specific lint (catches what parser   │ │
│ │    misses)                                       │ │
│ │ ✅ Cross-dialect conversion preview              │ │
│ │ ✅ Fix suggestions with one-click apply          │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─ Platform-specific Validators ──────────────────┐ │
│ │ [Quartz Cron Validator] [K8s CronJob Validator] │ │
│ │ [AWS EventBridge Validator]                      │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ┌─ FAQ ────────────────────────────────────────────┐ │
│ │ ▸ What makes a cron expression invalid?           │ │
│ │ ▸ How to fix "bad minute" or "bad hour" errors?  │ │
│ │ ▸ Difference between Unix and Quartz cron?        │ │
│ │ ▸ How to test cron without waiting?               │ │
│ │ ▸ Why does my cron work locally but fails in K8s? │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ Internal links:                                      │
│ "Need to build a cron? → Cron Generator"             │
│ "See common patterns → Cron Patterns"                │
│                                                       │
│ Footer (GlobalNav footer)                            │
└──────────────────────────────────────────────────────┘
```

### 子页 `/cron-validator/{dialect}/`

结构与枢纽页类似，但：
- H1 包含方言名（如 "Quartz Cron Expression Validator"）
- Dialect 预选对应方言
- 额外的方言专属内容：
  - Quartz：年字段说明、? L W # token 表
  - K8s：秒字段、时区注释 `TZ=`、successfulJobsHistoryLimit 提示
  - AWS：6-field 无年、`?` 规则、rate() 表达式替代方案
- 平台就绪复制片段：
  - K8s → `CronJob` YAML 模板
  - AWS → EventBridge rule JSON
  - Quartz → `@Scheduled` 注解代码
- FAQ 包含方言特定问题 + FAQ schema 变体

### 错误状态设计

当输入无效 cron 时：

```
│  ❌ Invalid cron expression                          │
│  Error: "Minute field must be 0-59, got 99"         │
│  Fix: Change 99 to a value between 0-59             │
│                                                       │
│  Did you mean: */5 * * * * ?                         │
│  (Levenshtein suggestion from nl-parser)             │
```

当 parser 通过但方言约束失败时：

```
│  ⚠️ Valid cron, but Quartz may reject it             │
│  Issue: Day-of-month and day-of-week both specified  │
│  Fix: Replace one with ? → 0 */5 * * ? *            │
│                                                       │
│  [Apply Fix] [Switch to Unix dialect]                │
```

`error-explainer.ts` 将 cron-parser 的技术错误翻译成人类可读的建议。

## 内链策略（v2 具体位置）

**反蚕食规则：** `/cron-generator/` 拦截"创建"意图，`/cron-validator/` 拦截"验证"意图。两者 H1/Title 不重叠。

```
从 cron-generator 到 validator:
  CronGeneratorApp.tsx — 结果区底部加 "Validate this cron →" 链接
  LongTailPage.tsx — 每个长尾页 FAQ 加一条 "How to verify this works? → Cron Validator"
  common-patterns/ — 每个模式旁加 "✓ Validate" 小链接

从 validator 到 cron-generator:
  ValidatorApp.tsx — "Need to build a cron? → Cron Generator" CTA
  ValidatorPage.tsx — 面包屑 + "Create cron expressions → Cron Generator"
  每个 valid 结果 — "Open in Generator →" 按钮

子页到枢纽页:
  每个子页 — 面包屑 Home > Cron Validator > {Dialect}（回链枢纽）
  每个子页 — "Try another dialect → Cron Validator" CTA
```

## 文件级集成图（v2 新增）

```
构建顺序：

1. validator-data.ts          ← 手动编写 3 条子页数据
2. dialect-constraints.ts     ← 新建：方言约束定义
3. error-explainer.ts         ← 新建：错误翻译器
4. dialect-convert.ts         ← 新建：方言互转
5. ValidatorApp.tsx           ← 新建：枢纽页组件
6. ValidatorPage.tsx          ← 新建：子页组件
7. index.html × 4             ← 新建：HTML 壳
8. generate-validator-html.cjs ← 新建：HTML 生成脚本
9. vite.config.ts             ← 改动：加 validator slug 自动加载
10. generate-sitemap.cjs       ← 改动：扫描 validator-data.ts
11. package.json               ← 改动：build chain 加 generate-validator-html
12. CronGeneratorApp.tsx       ← 改动：加 "Validate this cron →" 链接
13. LongTailPage.tsx           ← 改动：FAQ 加验证链接

改动文件 vs 新增文件：
  新建: 1-8（8 个新文件）
  改动: 9-13（5 个现有文件）
```

### vite.config.ts 集成

```typescript
// 现有 cron-generator 的自动加载模式：
// const cronSlugs = fs.readFileSync('src/cron/seo/long-tail-data.ts', 'utf8')
//   .match(/slug:\s*'([^']+)'/g)?.map(...) || []

// 新增 validator 自动加载（同样模式）：
const validatorSlugs = fs.readFileSync('src/cron-validator/validator-data.ts', 'utf8')
  .match(/slug:\s*'([^']+)'/g)?.map(s => s.replace(/slug:\s*'/, '').replace(/'/, '')) || []

// rollupOptions.input 中加入：
// 'cron-validator/index': resolve(__dirname, 'cron-validator/index.html'),
// ...validatorSlugs.map(s => ({
//   [`cron-validator/${s}/index`]: resolve(__dirname, `cron-validator/${s}/index.html`)
// }))
```

### package.json build chain

```json
{
  "build": "node scripts/generate-long-tail-html.cjs && node scripts/generate-validator-html.cjs && ... && vite build && node scripts/generate-sitemap.cjs"
}
```

位置：`generate-validator-html.cjs` 在 `generate-long-tail-html.cjs` 之后、`vite build` 之前。

### generate-sitemap.cjs 改动

扫描 `validator-data.ts`（同扫描 `long-tail-data.ts` 的逻辑），将 4 个 validator URL 加入 sitemap。

## 测试计划（v2 新增）

### 单元测试

| 文件 | 测试内容 | 用例数 |
|------|---------|--------|
| dialect-constraints.ts | 各方言 field count / token 规则 / 平台约束 | ~30 |
| error-explainer.ts | cron-parser 错误 → 人类建议映射 | ~15 |
| dialect-convert.ts | Unix→Quartz、Quartz→AWS 等互转正确性 | ~20 |
| validator-data.ts | 3 条数据的 title/description/faqs 完整性 | ~6 |

**Golden cases（核心验证）：**

```typescript
const GOLDEN_CASES = [
  // Unix
  { input: '*/5 * * * *', dialect: 'unix', expected: 'valid' },
  { input: '60 * * * *', dialect: 'unix', expected: 'invalid', field: 'minute' },
  { input: '* * 31 2 *', dialect: 'unix', expected: 'warning', reason: 'Feb never has 31st' },

  // Quartz
  { input: '0 */5 * * * ?', dialect: 'quartz', expected: 'valid' },
  { input: '0 */5 * * * *', dialect: 'quartz', expected: 'error', reason: 'day and week both specified, one must be ?' },
  { input: '0 0 12 LW * ?', dialect: 'quartz', expected: 'valid' },

  // AWS EventBridge
  { input: '0/5 * * * ? *', dialect: 'aws', expected: 'valid' },
  { input: '0/5 * * * * *', dialect: 'aws', expected: 'error', reason: 'day and week both specified' },

  // Kubernetes
  { input: '*/5 * * * *', dialect: 'kubernetes', expected: 'valid' },
  { input: '@daily', dialect: 'kubernetes', expected: 'error', reason: 'K8s does not support @ shorthand' },
]
```

### E2E 测试

| 测试 | 步骤 |
|------|------|
| 枢纽页加载 | 访问 /cron-validator/，验证 H1、input、dialect switcher 存在 |
| 有效表达式验证 | 输入 `*/5 * * * *`，验证显示 ✅ + "Every 5 minutes" + next runs |
| 无效表达式修复 | 输入 `99 * * * *`，验证显示 ❌ + 修复建议 |
| 方言切换 | 切换到 Quartz，输入 `0 */5 * * * ?`，验证 ✅ |
| 子页加载 | 访问 /cron-validator/quartz/，验证 dialect 预选 Quartz |
| 内链导航 | 点击 "Open in Generator →"，验证跳转到 /cron-generator/ |

## canonical / noindex 策略

| 页面 | canonical | noindex |
|------|-----------|---------|
| `/cron-validator/` | `https://aicalc.cloud/cron-validator/` | 否 |
| `/cron-validator/quartz/` | `https://aicalc.cloud/cron-validator/quartz/` | 否 |
| `/cron-validator/kubernetes/` | `https://aicalc.cloud/cron-validator/kubernetes/` | 否 |
| `/cron-validator/aws-eventbridge/` | `https://aicalc.cloud/cron-validator/aws-eventbridge/` | 否 |

所有 4 页有独立 canonical、独立 title/description、独立 FAQ。不设 noindex。

**反蚕食：** 与 cron-generator 的区分靠意图（创建 vs 验证）和 H1/Title 用词。如果 GSC 数据显示自竞争，在 cron-generator 长尾页加 `rel="canonical"` 指向主工具页。

## 开发排期

| 步骤 | 内容 | 估计 |
|------|------|------|
| 1 | `validator-data.ts`（3 条子页数据） | 30 min |
| 2 | `dialect-constraints.ts`（4 种方言约束定义） | 2 h |
| 3 | `error-explainer.ts`（错误翻译器） | 1 h |
| 4 | `dialect-convert.ts`（方言互转） | 1.5 h |
| 5 | `ValidatorApp.tsx`（枢纽页组件） | 2 h |
| 6 | `ValidatorPage.tsx`（子页组件） | 1 h |
| 7 | `generate-validator-html.cjs` + HTML 壳 | 1 h |
| 8 | `vite.config.ts` + `generate-sitemap.cjs` + `package.json` | 1 h |
| 9 | 内链改动（CronGeneratorApp + LongTailPage） | 30 min |
| 10 | 单元测试（golden cases + error explainer） | 2 h |
| 11 | E2E 测试 | 1 h |
| **总计** | | **~14 h（2 天）** |

## 成功指标

- [ ] 4 页全部上线，sitemap 收录
- [ ] GSC 索引通过
- [ ] "cron expression validator" 3 个月内进入 GSC 前 100
- [ ] 内链从 cron-generator 120+ 页传递权威
- [ ] Golden cases 100% 通过
- [ ] E2E 测试 6 条全过

## 后续扩展（首版不实施）

- v2: 加 `/cron-validator/github-actions/`（UTC 限制说明）
- v2: 方言互转 UX 优化（拖拽、side-by-side diff）
- v3: 加 spring、python 子页
- v3: 模糊匹配 + Levenshtein 建议（需 nl-parser 扩展）
- v3: DST 时区边界警告（需 moment-timezone）
- v3: 分析跟踪（验证次数、错误分类、方言分布）
