// src/testing-strategy/strategy-data.ts
// Testing Strategy Picker — project types, test categories, recommendation rules

export type ProjectType = 'web_app' | 'api' | 'mobile' | 'desktop' | 'cli'
export type TeamSize = 'solo' | 'small' | 'large'
export type ProjectStage = 'mvp' | 'growth' | 'mature'
export type RiskPriority = 'bugs' | 'performance' | 'security' | 'ux'
export type BudgetLevel = 'free' | 'open_source' | 'paid'

export interface WizardAnswers {
  projectType: ProjectType
  teamSize: TeamSize
  stage: ProjectStage
  riskPriority: RiskPriority
  budget: BudgetLevel
}

export interface TestLayer {
  id: string
  name: string
  icon: string
  description: string
  priority: 'critical' | 'recommended' | 'optional'
  tools: TestTool[]
  estimatedSetupHours: number
}

export interface TestTool {
  name: string
  url: string
  license: string
  bestFor: string
}

export interface StrategyResult {
  projectName: string
  pyramid: TestLayer[]
  totalSetupHours: number
  skippedLayers: { name: string; risk: string }[]
  summary: string
}

// ── Tool catalog ──

const TOOLS = {
  // Unit testing
  jest: { name: 'Jest', url: 'https://jestjs.io', license: 'MIT', bestFor: 'JavaScript/TypeScript unit tests' },
  vitest: { name: 'Vitest', url: 'https://vitest.dev', license: 'MIT', bestFor: 'Vite projects, fast unit tests' },
  pytest: { name: 'pytest', url: 'https://pytest.org', license: 'MIT', bestFor: 'Python unit + integration tests' },
  junit: { name: 'JUnit 5', url: 'https://junit.org', license: 'EPL', bestFor: 'Java/Kotlin unit tests' },
  go_test: { name: 'go test', url: 'https://go.dev/doc/tutorial/add-a-test', license: 'BSD', bestFor: 'Go built-in testing' },
  rust_test: { name: 'cargo test', url: 'https://doc.rust-lang.org/cargo/commands/cargo-test.html', license: 'MIT/Apache', bestFor: 'Rust built-in testing' },
  swift_test: { name: 'XCTest', url: 'https://developer.apple.com/documentation/xctest', license: 'Apache-2.0', bestFor: 'Swift/iOS unit tests' },
  dotnet_test: { name: 'xUnit', url: 'https://xunit.net', license: 'Apache-2.0', bestFor: '.NET unit tests' },

  // Integration testing
  testing_library: { name: 'Testing Library', url: 'https://testing-library.com', license: 'MIT', bestFor: 'Component integration tests' },
  supertest: { name: 'Supertest', url: 'https://github.com/visionmedia/supertest', license: 'MIT', bestFor: 'HTTP API integration tests' },
  testcontainers: { name: 'Testcontainers', url: 'https://testcontainers.com', license: 'MIT', bestFor: 'Database/service integration' },

  // E2E testing
  playwright: { name: 'Playwright', url: 'https://playwright.dev', license: 'Apache-2.0', bestFor: 'Cross-browser E2E testing' },
  cypress: { name: 'Cypress', url: 'https://cypress.io', license: 'MIT', bestFor: 'Developer-friendly E2E testing' },
  detox: { name: 'Detox', url: 'https://wix.github.io/Detox/', license: 'MIT', bestFor: 'React Native E2E testing' },
  xcuittest: { name: 'XCUITest', url: 'https://developer.apple.com/documentation/xctest', license: 'Apache-2.0', bestFor: 'iOS native UI testing' },
  espresso: { name: 'Espresso', url: 'https://developer.android.com/training/testing/espresso', license: 'Apache-2.0', bestFor: 'Android native UI testing' },
  appium: { name: 'Appium', url: 'https://appium.io', license: 'Apache-2.0', bestFor: 'Cross-platform mobile E2E' },

  // Performance testing
  k6: { name: 'k6', url: 'https://k6.io', license: 'AGPL-3.0', bestFor: 'Load and performance testing' },
  artillery: { name: 'Artillery', url: 'https://artillery.io', license: 'MPL-2.0', bestFor: 'HTTP load testing' },
  lighthouse: { name: 'Lighthouse', url: 'https://developer.chrome.com/docs/lighthouse', license: 'Apache-2.0', bestFor: 'Web performance auditing' },
  jmeter: { name: 'Apache JMeter', url: 'https://jmeter.apache.org', license: 'Apache-2.0', bestFor: 'Enterprise load testing' },
  locust: { name: 'Locust', url: 'https://locust.io', license: 'MIT', bestFor: 'Python-based load testing' },

  // Security testing
  owasp_zap: { name: 'OWASP ZAP', url: 'https://zaproxy.org', license: 'Apache-2.0', bestFor: 'Web app security scanning' },
  snyk: { name: 'Snyk', url: 'https://snyk.io', license: 'Freemium', bestFor: 'Dependency vulnerability scanning' },
  bandit: { name: 'Bandit', url: 'https://bandit.readthedocs.io', license: 'Apache-2.0', bestFor: 'Python security linting' },
  brakeman: { name: 'Brakeman', url: 'https://brakemanscanner.org', license: 'MIT', bestFor: 'Rails security scanning' },
  trivy: { name: 'Trivy', url: 'https://trivy.dev', license: 'Apache-2.0', bestFor: 'Container security scanning' },

  // Accessibility testing
  axe: { name: 'axe-core', url: 'https://dequeuniversity.com/rules/axe', license: 'MPL-2.0', bestFor: 'Automated accessibility testing' },
  storybook_a11y: { name: 'Storybook + a11y addon', url: 'https://storybook.js.org', license: 'MIT', bestFor: 'Component accessibility checks' },

  // Visual regression
  chromatic: { name: 'Chromatic', url: 'https://chromatic.com', license: 'Freemium', bestFor: 'Visual regression with Storybook' },
  playwright_visual: { name: 'Playwright Screenshots', url: 'https://playwright.dev/docs/test-snapshots', license: 'Apache-2.0', bestFor: 'Free visual regression' },
  backstopjs: { name: 'BackstopJS', url: 'https://github.com/garris/BackstopJS', license: 'MIT', bestFor: 'CSS visual regression' },
} as const

type ToolKey = keyof typeof TOOLS

// ── Recommendation rules ──

interface StrategyRule {
  projectType: ProjectType[]
  stages: ProjectStage[]
  layers: {
    id: string
    name: string
    icon: string
    description: string
    priority: 'critical' | 'recommended' | 'optional'
    baseTools: ToolKey[]
    soloOverride?: ToolKey[]
    freeOnly?: ToolKey[]
    paidOk?: ToolKey[]
    setupHours: number
  }[]
}

const STRATEGY_RULES: StrategyRule[] = [
  // Web Application
  {
    projectType: ['web_app'],
    stages: ['mvp', 'growth', 'mature'],
    layers: [
      {
        id: 'unit',
        name: 'Unit Tests',
        icon: '🧪',
        description: 'Test individual functions and components in isolation',
        priority: 'critical',
        baseTools: ['vitest', 'jest'],
        setupHours: 2,
      },
      {
        id: 'integration',
        name: 'Integration Tests',
        icon: '🔗',
        description: 'Test how components work together with APIs and data',
        priority: 'critical',
        baseTools: ['testing_library', 'supertest'],
        setupHours: 3,
      },
      {
        id: 'e2e',
        name: 'End-to-End Tests',
        icon: '🌐',
        description: 'Test complete user flows through the browser',
        priority: 'recommended',
        baseTools: ['playwright', 'cypress'],
        freeOnly: ['playwright'],
        setupHours: 4,
      },
      {
        id: 'performance',
        name: 'Performance Tests',
        icon: '⚡',
        description: 'Measure load times, throughput, and resource usage',
        priority: 'optional',
        baseTools: ['lighthouse', 'k6'],
        freeOnly: ['lighthouse', 'artillery'],
        setupHours: 2,
      },
      {
        id: 'security',
        name: 'Security Tests',
        icon: '🔒',
        description: 'Scan for vulnerabilities in dependencies and web app',
        priority: 'recommended',
        baseTools: ['owasp_zap', 'snyk'],
        freeOnly: ['owasp_zap', 'trivy'],
        setupHours: 2,
      },
      {
        id: 'accessibility',
        name: 'Accessibility Tests',
        icon: '♿',
        description: 'Ensure your app works for users with disabilities',
        priority: 'optional',
        baseTools: ['axe', 'storybook_a11y'],
        setupHours: 1,
      },
      {
        id: 'visual',
        name: 'Visual Regression',
        icon: '👁️',
        description: 'Catch unintended visual changes between deploys',
        priority: 'optional',
        baseTools: ['playwright_visual', 'chromatic'],
        freeOnly: ['playwright_visual', 'backstopjs'],
        setupHours: 2,
      },
    ],
  },
  // API / Backend
  {
    projectType: ['api'],
    stages: ['mvp', 'growth', 'mature'],
    layers: [
      {
        id: 'unit',
        name: 'Unit Tests',
        icon: '🧪',
        description: 'Test individual functions, handlers, and business logic',
        priority: 'critical',
        baseTools: ['jest', 'pytest', 'go_test'],
        setupHours: 2,
      },
      {
        id: 'integration',
        name: 'Integration Tests',
        icon: '🔗',
        description: 'Test API endpoints with real database and services',
        priority: 'critical',
        baseTools: ['supertest', 'testcontainers'],
        setupHours: 4,
      },
      {
        id: 'e2e',
        name: 'Contract Tests',
        icon: '📜',
        description: 'Verify API contracts between services and consumers',
        priority: 'recommended',
        baseTools: ['supertest', 'playwright'],
        freeOnly: ['supertest'],
        setupHours: 3,
      },
      {
        id: 'performance',
        name: 'Load Tests',
        icon: '⚡',
        description: 'Stress test API throughput and latency under load',
        priority: 'recommended',
        baseTools: ['k6', 'artillery'],
        freeOnly: ['artillery', 'locust'],
        setupHours: 3,
      },
      {
        id: 'security',
        name: 'Security Tests',
        icon: '🔒',
        description: 'Scan for auth flaws, injection, and dependency vulnerabilities',
        priority: 'critical',
        baseTools: ['owasp_zap', 'snyk', 'trivy'],
        freeOnly: ['owasp_zap', 'trivy'],
        setupHours: 2,
      },
    ],
  },
  // Mobile
  {
    projectType: ['mobile'],
    stages: ['mvp', 'growth', 'mature'],
    layers: [
      {
        id: 'unit',
        name: 'Unit Tests',
        icon: '🧪',
        description: 'Test business logic and data layer in isolation',
        priority: 'critical',
        baseTools: ['jest', 'swift_test', 'junit'],
        setupHours: 2,
      },
      {
        id: 'integration',
        name: 'Integration Tests',
        icon: '🔗',
        description: 'Test component interactions and state management',
        priority: 'recommended',
        baseTools: ['testing_library', 'xcuittest'],
        setupHours: 3,
      },
      {
        id: 'e2e',
        name: 'E2E Tests',
        icon: '📱',
        description: 'Test complete user flows on simulators and real devices',
        priority: 'critical',
        baseTools: ['detox', 'appium'],
        freeOnly: ['detox'],
        setupHours: 6,
      },
      {
        id: 'performance',
        name: 'Performance Tests',
        icon: '⚡',
        description: 'Measure startup time, frame rate, and memory usage',
        priority: 'optional',
        baseTools: ['lighthouse'],
        setupHours: 2,
      },
      {
        id: 'security',
        name: 'Security Tests',
        icon: '🔒',
        description: 'Scan for insecure data storage and network communication',
        priority: 'recommended',
        baseTools: ['owasp_zap', 'snyk'],
        freeOnly: ['owasp_zap'],
        setupHours: 2,
      },
    ],
  },
  // Desktop
  {
    projectType: ['desktop'],
    stages: ['mvp', 'growth', 'mature'],
    layers: [
      {
        id: 'unit',
        name: 'Unit Tests',
        icon: '🧪',
        description: 'Test core logic and data processing functions',
        priority: 'critical',
        baseTools: ['jest', 'rust_test', 'dotnet_test'],
        setupHours: 2,
      },
      {
        id: 'integration',
        name: 'Integration Tests',
        icon: '🔗',
        description: 'Test how modules interact with OS APIs and file system',
        priority: 'recommended',
        baseTools: ['testing_library'],
        setupHours: 3,
      },
      {
        id: 'e2e',
        name: 'E2E Tests',
        icon: '🖥️',
        description: 'Automate UI interactions on the desktop app',
        priority: 'recommended',
        baseTools: ['playwright'],
        setupHours: 4,
      },
      {
        id: 'security',
        name: 'Security Tests',
        icon: '🔒',
        description: 'Scan for vulnerabilities in dependencies',
        priority: 'optional',
        baseTools: ['snyk', 'trivy'],
        freeOnly: ['trivy'],
        setupHours: 1,
      },
    ],
  },
  // CLI
  {
    projectType: ['cli'],
    stages: ['mvp', 'growth', 'mature'],
    layers: [
      {
        id: 'unit',
        name: 'Unit Tests',
        icon: '🧪',
        description: 'Test individual commands and flag handling',
        priority: 'critical',
        baseTools: ['jest', 'pytest', 'go_test', 'rust_test'],
        setupHours: 1,
      },
      {
        id: 'integration',
        name: 'Integration Tests',
        icon: '🔗',
        description: 'Test CLI against real file system and external services',
        priority: 'critical',
        baseTools: ['testcontainers'],
        setupHours: 2,
      },
      {
        id: 'security',
        name: 'Security Tests',
        icon: '🔒',
        description: 'Scan for dependency vulnerabilities',
        priority: 'optional',
        baseTools: ['snyk', 'trivy'],
        freeOnly: ['trivy'],
        setupHours: 1,
      },
    ],
  },
]

// ── Stage filters (what changes per stage) ──

const STAGE_PRIORITIES: Record<ProjectStage, Record<string, 'critical' | 'recommended' | 'optional'>> = {
  mvp: {
    unit: 'critical',
    integration: 'recommended',
    e2e: 'optional',
    performance: 'optional',
    security: 'optional',
    accessibility: 'optional',
    visual: 'optional',
  },
  growth: {
    unit: 'critical',
    integration: 'critical',
    e2e: 'recommended',
    performance: 'recommended',
    security: 'recommended',
    accessibility: 'optional',
    visual: 'optional',
  },
  mature: {
    unit: 'critical',
    integration: 'critical',
    e2e: 'critical',
    performance: 'critical',
    security: 'critical',
    accessibility: 'recommended',
    visual: 'recommended',
  },
}

// ── Risk boosters ──

const RISK_BOOST: Record<RiskPriority, string[]> = {
  bugs: ['unit', 'integration'],
  performance: ['performance'],
  security: ['security'],
  ux: ['e2e', 'accessibility', 'visual'],
}

// ── Project type labels ──

export const PROJECT_LABELS: Record<ProjectType, string> = {
  web_app: 'Web Application',
  api: 'API / Backend',
  mobile: 'Mobile App',
  desktop: 'Desktop App',
  cli: 'CLI Tool',
}

export const TEAM_LABELS: Record<TeamSize, string> = {
  solo: 'Solo developer',
  small: 'Small team (2-10)',
  large: 'Large team (10+)',
}

export const STAGE_LABELS: Record<ProjectStage, string> = {
  mvp: 'MVP / Prototype',
  growth: 'Growing product',
  mature: 'Mature / Production',
}

export const RISK_LABELS: Record<RiskPriority, string> = {
  bugs: 'Functional bugs',
  performance: 'Performance & speed',
  security: 'Security & data safety',
  ux: 'User experience',
}

export const BUDGET_LABELS: Record<BudgetLevel, string> = {
  free: 'Zero budget only',
  open_source: 'Open source preferred',
  paid: 'Paid tools OK',
}

// ── Engine ──

export function generateStrategy(answers: WizardAnswers): StrategyResult {
  const rule = STRATEGY_RULES.find(r => r.projectType.includes(answers.projectType))
  if (!rule) {
    return {
      projectName: PROJECT_LABELS[answers.projectType],
      pyramid: [],
      totalSetupHours: 0,
      skippedLayers: [],
      summary: 'No strategy found for this project type.',
    }
  }

  const stagePriority = STAGE_PRIORITIES[answers.stage]
  const riskBoost = RISK_BOOST[answers.riskPriority]
  const isFree = answers.budget === 'free'

  const pyramid: TestLayer[] = []
  const skippedLayers: StrategyResult['skippedLayers'] = []
  let totalSetupHours = 0

  for (const layer of rule.layers) {
    // Determine effective priority: stage baseline + risk boost
    let effectivePriority = stagePriority[layer.id] || layer.priority
    if (riskBoost.includes(layer.id) && effectivePriority === 'optional') {
      effectivePriority = 'recommended'
    }
    if (riskBoost.includes(layer.id) && effectivePriority === 'recommended') {
      effectivePriority = 'critical'
    }

    // Skip optional layers for solo MVP with free budget (minimize overhead)
    if (answers.stage === 'mvp' && answers.teamSize === 'solo' && effectivePriority === 'optional') {
      skippedLayers.push({
        name: layer.name,
        risk: `${layer.name} would catch issues before users report them. Add when you have users.`,
      })
      continue
    }

    // Select tools based on budget
    let toolKeys: ToolKey[] = [...layer.baseTools]
    if (isFree && layer.freeOnly) {
      toolKeys = [...layer.freeOnly]
    } else if (answers.budget === 'open_source' && layer.freeOnly) {
      toolKeys = [...layer.freeOnly]
    } else if (layer.paidOk) {
      toolKeys = [...layer.baseTools, ...layer.paidOk]
    }

    // Deduplicate tools
    const seenTools = new Set<string>()
    const uniqueTools: TestTool[] = []
    for (const key of toolKeys) {
      const tool = TOOLS[key]
      if (!seenTools.has(tool.name)) {
        seenTools.add(tool.name)
        uniqueTools.push({
          name: tool.name,
          url: tool.url,
          license: tool.license,
          bestFor: tool.bestFor,
        })
      }
    }

    pyramid.push({
      id: layer.id,
      name: layer.name,
      icon: layer.icon,
      description: layer.description,
      priority: effectivePriority,
      tools: uniqueTools.slice(0, 3), // Max 3 tools per layer
      estimatedSetupHours: layer.setupHours,
    })
    totalSetupHours += layer.setupHours
  }

  // Sort: critical first, then recommended, then optional
  const priorityOrder = { critical: 0, recommended: 1, optional: 2 }
  pyramid.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  const summary = buildSummary(answers, pyramid, totalSetupHours)

  return {
    projectName: PROJECT_LABELS[answers.projectType],
    pyramid,
    totalSetupHours,
    skippedLayers,
    summary,
  }
}

function buildSummary(answers: WizardAnswers, pyramid: TestLayer[], totalHours: number): string {
  const critical = pyramid.filter(l => l.priority === 'critical').length
  const recommended = pyramid.filter(l => l.priority === 'recommended').length
  const stage = answers.stage === 'mvp' ? 'MVP stage' : answers.stage === 'growth' ? 'growth stage' : 'production'
  return `For your ${PROJECT_LABELS[answers.projectType].toLowerCase()} in ${stage}, we recommend ${critical} critical + ${recommended} recommended test layers. Estimated setup: ~${totalHours} hours.`
}
