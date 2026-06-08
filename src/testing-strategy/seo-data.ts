// src/testing-strategy/seo-data.ts
// Long-tail SEO landing pages for testing strategy picker

export interface StrategySeoPage {
  slug: string
  title: string
  metaDescription: string
  h1: string
  intro: string
  projectType: 'web_app' | 'api' | 'mobile'
  teamSize: 'solo' | 'small' | 'large'
  stage: 'mvp' | 'growth' | 'mature'
  riskPriority: 'bugs' | 'performance' | 'security' | 'ux'
  budget: 'free' | 'open_source' | 'paid'
  contentH2: string
  contentParagraphs: string[]
}

export const SEO_PAGES: StrategySeoPage[] = [
  {
    slug: 'web-app',
    title: 'Testing Strategy for Web Applications — React, Vue, Next.js',
    metaDescription: 'Get a personalized testing strategy for your web application. Covers unit tests, integration tests, E2E with Playwright, performance, security, and accessibility testing.',
    h1: 'Testing Strategy for Web Applications',
    intro: 'Building a web app with React, Vue, Next.js, or Svelte? This tool generates a testing strategy tailored to your specific project, team, and stage.',
    projectType: 'web_app',
    teamSize: 'small',
    stage: 'growth',
    riskPriority: 'bugs',
    budget: 'open_source',
    contentH2: 'What testing does a web app need?',
    contentParagraphs: [
      'A typical web application testing strategy includes unit tests for individual components and functions, integration tests for API calls and data flow, and end-to-end tests that simulate real user interactions through the browser.',
      'Modern tools like Vitest and Playwright make it fast to set up all three layers. Performance testing with Lighthouse catches slow page loads. Security scanning with OWASP ZAP finds common web vulnerabilities. Accessibility testing with axe-core ensures your app works for all users.',
      'The right mix depends on your project stage. An MVP might only need unit tests. A production web app with thousands of users needs all layers. Answer 5 questions above to get your personalized strategy.',
    ],
  },
  {
    slug: 'api',
    title: 'API Testing Strategy — REST, GraphQL, Microservices',
    metaDescription: 'Generate a testing strategy for your API or backend service. Covers unit tests, integration tests with Testcontainers, load testing with k6, and security scanning.',
    h1: 'Testing Strategy for APIs & Backend Services',
    intro: 'Building a REST API, GraphQL server, or microservice? Get a testing strategy that covers endpoint validation, database integration, load testing, and security scanning.',
    projectType: 'api',
    teamSize: 'small',
    stage: 'growth',
    riskPriority: 'security',
    budget: 'open_source',
    contentH2: 'What testing does an API need?',
    contentParagraphs: [
      'API testing starts with unit tests for business logic and request handlers. Integration tests verify that endpoints work correctly with real databases and external services. Tools like Testcontainers spin up real databases in Docker for reliable integration testing.',
      'Load testing with k6 or Artillery reveals how your API performs under traffic. Security testing scans for SQL injection, authentication flaws, and dependency vulnerabilities. Contract testing ensures API consumers get consistent responses.',
      'For a solo MVP, unit tests plus basic endpoint tests are often sufficient. As your API grows and serves more clients, add integration and load tests. Answer the questions above to get your exact recommendation.',
    ],
  },
  {
    slug: 'mobile',
    title: 'Mobile App Testing Strategy — iOS, Android, React Native, Flutter',
    metaDescription: 'Get a testing strategy for your mobile app. Covers unit tests, E2E with Detox and Appium, performance profiling, and security scanning for iOS and Android.',
    h1: 'Testing Strategy for Mobile Apps',
    intro: 'Building an iOS, Android, React Native, or Flutter app? Get a testing strategy that covers unit tests, E2E on simulators and real devices, performance, and security.',
    projectType: 'mobile',
    teamSize: 'small',
    stage: 'growth',
    riskPriority: 'bugs',
    budget: 'open_source',
    contentH2: 'What testing does a mobile app need?',
    contentParagraphs: [
      'Mobile app testing starts with unit tests for business logic and data layers. Integration tests verify state management and component interactions. E2E tests automate real user flows on simulators and physical devices.',
      'For React Native, Detox provides fast E2E testing. For native iOS, XCUITest integrates with Xcode. For Android, Espresso handles UI automation. Cross-platform apps benefit from Appium, which works across both platforms.',
      'Performance testing catches slow startup times and memory leaks. Security scanning finds insecure data storage and network communication issues. The right strategy depends on your framework and stage — use the tool above to get yours.',
    ],
  },
]
