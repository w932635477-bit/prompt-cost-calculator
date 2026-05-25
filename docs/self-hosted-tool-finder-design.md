# Self-Hosted Tool Finder — 设计开发文档

> 场景化决策框架，不是排行榜

## 1. 产品定义

**一句话**: 用户选择场景（团队规模、技术水平、服务器、核心需求），系统给出匹配推荐 + 推荐理由。

**不是**: 排行榜、评分排名、"最佳"推荐。
**是**: "你告诉我场景，我告诉你哪个适合你以及为什么"。

**形态**: 升级现有 `/alternatives` 列表页，添加交互式 Tool Finder 组件。不建独立页面，复用 SEO 资产。

## 2. 现有资产

| 资产 | 位置 | 规模 |
|------|------|------|
| 数据文件 | `src/alternatives/seo/alternatives-data.ts` | 908行，42个SaaS页面 |
| 列表页 | `src/alternatives/AlternativesApp.tsx` | 分类+搜索+卡片网格 |
| 详情页 | `src/alternatives/LongTailAltPage.tsx` | 单工具详情 |
| 静态生成 | `scripts/generate-alternatives-html.cjs` | SSG构建 |
| 路由 | `vercel.json` rewrites | `/alternatives/:slug` |

## 3. 用户流程

```
进入 /alternatives/
  → 看到 Tool Finder 卡片（页面顶部，hero区域）
  → Step 1: 选一个SaaS（已有搜索）
  → Step 2: 4个场景维度（下拉/按钮选择）
  → 点击 "Find My Match"
  → 结果: 2-3个推荐，每个附带维度匹配说明
  → 下方仍是完整的分类列表（SEO保留）
```

## 4. 数据模型变更

### 4.1 SelfHostedAlt 新增字段

```typescript
export interface SelfHostedAlt {
  // ... existing fields ...

  // GitHub 活跃度（后端聚合，非实时）
  githubStars?: number           // e.g. 42000
  lastCommitDate?: string        // ISO 8601 '2026-05-20'
  releaseCadence?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'irregular'
  maintenanceStatus?: 'active' | 'maintenance' | 'declining' | 'archived'

  // 场景标签（人工标注）
  scenarioTags?: ScenarioTag[]
}

type ScenarioTag =
  // 用户类型
  | 'solo_dev' | 'small_team' | 'enterprise'
  // 技术水平
  | 'beginner' | 'intermediate' | 'advanced'
  // 部署方式
  | 'docker_only' | 'native_install' | 'managed_hosting'
  // 核心需求
  | 'file_sync' | 'sharing' | 'collaboration' | 'backup'
  | 'auth' | 'rbac' | 'ldap' | 'sso' | 'mfa'
  | 'api_access' | 'webhook' | 'cli'
  | 'end_to_end_encryption' | 'audit_log' | 'compliance'
  | 'mobile_app' | 'desktop_app' | 'web_only'
  | 'scalability' | 'high_availability' | 'clustering'
```

### 4.2 场景选择器模型

```typescript
interface ScenarioInput {
  teamSize: 'solo' | 'small' | 'large'
  techLevel: 'beginner' | 'intermediate' | 'advanced'
  server: 'shared_hosting' | 'vps' | 'dedicated' | 'nas'
  priority: 'ease' | 'features' | 'performance' | 'security'
}
```

### 4.3 推荐结果模型

```typescript
interface Recommendation {
  alt: SelfHostedAlt
  matchDimensions: DimensionMatch[]
  summary: string  // 1-2句为什么推荐
}

interface DimensionMatch {
  dimension: string       // e.g. '部署难度'
  status: 'strong' | 'moderate' | 'weak'
  reason: string         // e.g. 'Docker一键部署，适合VPS'
  dataSource: string     // e.g. '项目文档' | 'GitHub API (2026-05-25)'
}
```

## 5. 场景权重映射

不同场景组合 → 不同 `ScenarioTag` 权重。纯前端计算，无需后端。

```typescript
const SCENARIO_WEIGHTS: Record<string, Record<ScenarioTag, number>> = {
  'solo-beginner-vps-ease': {
    docker_only: 3, beginner: 3, solo_dev: 2,
    // ...
  },
  'large-advanced-dedicated-security': {
    rbac: 3, ldap: 3, sso: 2, audit_log: 2, scalability: 3,
    // ...
  },
  // ... 共 3×3×4×4 = 144 种组合，但多数共享权重模板
}
```

实际实现: 4个维度分别有权重贡献，最终加权求和，不需要144个独立条目。

## 6. GitHub 数据聚合

### 6.1 为什么需要

- Stars数、最后提交日期、发布频率 → 维护活跃度维度
- 匿名API 60次/hr，认证5000次/hr → 必须后端聚合

### 6.2 实现方案

**Vercel Cron + Serverless Function**:

```
/api/cron/sync-github-data  →  Vercel Cron每天执行一次
  → 遍历所有 alternatives 的 github URL
  → 批量查询 GitHub API (认证token)
  → 更新 JSON 数据文件或 KV 存储
  → 前端构建时读取
```

### 6.3 数据流

```
GitHub API → Vercel Cron (daily) → /data/github-stats.json (static)
                                         ↓
                              构建时注入 → alternatives-data.ts 扩展
```

备选: 不用Cron，构建时获取。42个页面×平均2.5个alt = ~105个repo，认证API 5000/hr足够。

## 7. UI组件设计

### 7.1 Tool Finder Card（页面顶部）

```
┌─────────────────────────────────────────────────┐
│  🔍 Find the Right Self-Hosted Tool for You     │
│                                                  │
│  [Select a SaaS tool ▼]  ← 下拉，复用已有数据    │
│                                                  │
│  Team:    [Solo] [Small] [Large]                 │
│  Skills:  [Beginner] [Intermediate] [Advanced]   │
│  Server:  [VPS] [Dedicated] [NAS] [Shared]       │
│  Priority:[Easy setup] [Features] [Speed] [Security] │
│                                                  │
│  [ Find My Match → ]                            │
└─────────────────────────────────────────────────┘
```

### 7.2 推荐结果

```
┌─────────────────────────────────────────────────┐
│  ✅ Best Match: Nextcloud                        │
│  "Best fit because: Docker-ready, active         │
│   community, scales with your team"              │
│                                                  │
│  维护活跃度  ●●●●○  Strong                       │
│    GitHub: 42K stars, last commit 2 days ago     │
│  部署难度    ●●●●●  Strong                       │
│    Docker one-command deploy                     │
│  安全特性    ●●●○○  Moderate                     │
│    Has MFA, no LDAP (you'd need plugin)          │
│                                                  │
│  [View Details →]                                │
├─────────────────────────────────────────────────┤
│  👍 Also Consider: Seafile                       │
│  "Simpler setup, faster sync, fewer features"   │
│  ...                                             │
└─────────────────────────────────────────────────┘
```

### 7.3 关键UI规则

- **不显示总分**，只有逐维度指示器
- 每个维度标注数据源和时间戳
- 推荐理由是自然语言，不是分数
- 最多显示3个推荐
- 下方完整列表保留不变（SEO）

## 8. SEO策略

### 8.1 HCU防御清单

| 项目 | 状态 | 说明 |
|------|------|------|
| 交互式组件 | 新增 | Tool Finder = 交互工具 |
| 真实案例 | 待补充 | 每个推荐附带简短案例 |
| 代码示例 | 已有 | dockerCommand 字段 |
| FAQ Schema | 已有 | 每个页面的faq字段 |
| 内部链接 | 已有 | 工具间交叉引用 |

### 8.2 目标关键词

```
主词: self-hosted tool finder (KD预估 <15)
长尾: best self-hosted [tool] for [scenario]
  - best self-hosted cloud storage for small team
  - self-hosted password manager for solo developer
  - easiest self-hosted note-taking docker
```

### 8.3 URL结构

Tool Finder 不新增URL，嵌在 `/alternatives/` 页面。推荐结果通过客户端状态管理，不需要新路由。

## 9. 开发计划

### Phase 1: 标签分类 (0.5天)

1. 定义完整的 `ScenarioTag` 枚举（~30个标签）
2. 为42个SaaS页面的所有alternatives标注 `scenarioTags`
3. 标注质量检查：每个alt至少4个标签

### Phase 2: 场景选择器 + 匹配引擎 (0.5天)

4. 实现 `ScenarioInput` → `ScenarioTag[]` 权重映射
5. 实现匹配算法：输入场景 → 加权排序 → 取Top3
6. 单元测试：不同场景输入 → 验证推荐合理性

### Phase 3: UI组件 (0.5天)

7. `ToolFinderCard` 组件：场景选择表单
8. `RecommendationCard` 组件：推荐结果 + 维度指示器
9. 集成到 `AlternativesApp.tsx` 顶部

### Phase 4: GitHub数据 (可选, 0.5天)

10. Vercel Serverless Function: 批量获取GitHub stats
11. 构建时注入 `githubStars` / `lastCommitDate` 等字段
12. 前端展示数据源标注

## 10. 不做什么

- 不做排行榜、Top10、"Best of"列表
- 不做用户账号、保存配置
- 不做实时GitHub API调用
- 不做AI/LLM推荐（纯规则匹配）
- 不做对比表格（后续可扩展）

## 11. 成功指标

| 指标 | 基线 | 目标 |
|------|------|------|
| /alternatives/ 页面停留时间 | 当前值 | +30% |
| Tool Finder交互率 | 0% | >15%访客使用 |
| 长尾关键词排名 | 无 | 10+关键词进入Top30 |
| 页面分享率 | 当前值 | +20% |
