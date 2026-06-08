// scripts/generate-testing-strategy-html.cjs
// Generate 3 long-tail SEO landing pages for testing-strategy-picker

const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, '..', 'dist')
const BASE = 'https://aicalc.cloud/testing-strategy-picker'

const PAGES = [
  {
    slug: 'web-app',
    title: 'Testing Strategy for Web Applications — React, Vue, Next.js',
    metaDescription: 'Get a personalized testing strategy for your web application. Covers unit tests, integration tests, E2E with Playwright, performance, security, and accessibility testing.',
    canonical: `${BASE}/web-app/`,
    h1: 'Testing Strategy for Web Applications',
    intro: 'Building a web app with React, Vue, Next.js, or Svelte? This tool generates a testing strategy tailored to your specific project, team, and stage.',
    contentH2: 'What testing does a web app need?',
    paragraphs: [
      'A typical web application testing strategy includes unit tests for individual components and functions, integration tests for API calls and data flow, and end-to-end tests that simulate real user interactions through the browser.',
      'Modern tools like Vitest and Playwright make it fast to set up all three layers. Performance testing with Lighthouse catches slow page loads. Security scanning with OWASP ZAP finds common web vulnerabilities. Accessibility testing with axe-core ensures your app works for all users.',
      'The right mix depends on your project stage. An MVP might only need unit tests. A production web app with thousands of users needs all layers. Answer 5 questions to get your personalized strategy.',
    ],
  },
  {
    slug: 'api',
    title: 'API Testing Strategy — REST, GraphQL, Microservices',
    metaDescription: 'Generate a testing strategy for your API or backend service. Covers unit tests, integration tests with Testcontainers, load testing with k6, and security scanning.',
    canonical: `${BASE}/api/`,
    h1: 'Testing Strategy for APIs & Backend Services',
    intro: 'Building a REST API, GraphQL server, or microservice? Get a testing strategy that covers endpoint validation, database integration, load testing, and security scanning.',
    contentH2: 'What testing does an API need?',
    paragraphs: [
      'API testing starts with unit tests for business logic and request handlers. Integration tests verify that endpoints work correctly with real databases and external services. Tools like Testcontainers spin up real databases in Docker for reliable integration testing.',
      'Load testing with k6 or Artillery reveals how your API performs under traffic. Security testing scans for SQL injection, authentication flaws, and dependency vulnerabilities. Contract testing ensures API consumers get consistent responses.',
      'For a solo MVP, unit tests plus basic endpoint tests are often sufficient. As your API grows and serves more clients, add integration and load tests.',
    ],
  },
  {
    slug: 'mobile',
    title: 'Mobile App Testing Strategy — iOS, Android, React Native, Flutter',
    metaDescription: 'Get a testing strategy for your mobile app. Covers unit tests, E2E with Detox and Appium, performance profiling, and security scanning for iOS and Android.',
    canonical: `${BASE}/mobile/`,
    h1: 'Testing Strategy for Mobile Apps',
    intro: 'Building an iOS, Android, React Native, or Flutter app? Get a testing strategy that covers unit tests, E2E on simulators and real devices, performance, and security.',
    contentH2: 'What testing does a mobile app need?',
    paragraphs: [
      'Mobile app testing starts with unit tests for business logic and data layers. Integration tests verify state management and component interactions. E2E tests automate real user flows on simulators and physical devices.',
      'For React Native, Detox provides fast E2E testing. For native iOS, XCUITest integrates with Xcode. For Android, Espresso handles UI automation. Cross-platform apps benefit from Appium, which works across both platforms.',
      'Performance testing catches slow startup times and memory leaks. Security scanning finds insecure data storage and network communication issues. The right strategy depends on your framework and stage.',
    ],
  },
]

function generateHtml(page) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${page.title}</title>
    <meta name="description" content="${page.metaDescription}" />
    <link rel="canonical" href="${page.canonical}" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.metaDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${page.canonical}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/testing-strategy/seo-main.tsx"></script>
    <script>window.__SEO_PAGE_SLUG__ = "${page.slug}";</script>
  </body>
</html>`
}

// Write vite inputs file for dynamic imports
const viteInputs = PAGES.map(p => `  'strategy-seo-${p.slug}': resolve(__dirname, 'testing-strategy-picker/${p.slug}/index.html'),`).join('\n')

// Generate HTML files for each slug
for (const page of PAGES) {
  const dir = path.join(DIST_DIR, 'testing-strategy-picker', page.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), generateHtml(page))
  console.log(`Generated: testing-strategy-picker/${page.slug}/index.html`)
}

// Also create source HTML files for vite
for (const page of PAGES) {
  const srcDir = path.join(__dirname, '..', 'testing-strategy-picker', page.slug)
  fs.mkdirSync(srcDir, { recursive: true })
  fs.writeFileSync(path.join(srcDir, 'index.html'), generateHtml(page))
}

console.log(`Generated ${PAGES.length} testing strategy SEO pages`)
