import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import fs from 'fs'

const LOCALES = ['zh', 'ja', 'es', 'pt', 'fr', 'de', 'ko']

const localeInputs = Object.fromEntries(
  LOCALES.map(l => [`cron-${l}`, resolve(__dirname, `cron-generator/${l}/index.html`)])
)

// Load long-tail page inputs from generated data
const dataFile = resolve(__dirname, 'src/cron/seo/long-tail-data.ts')
const dataContent = fs.readFileSync(dataFile, 'utf-8')
const slugMatches = [...dataContent.matchAll(/slug: '([^']+)'/g)]
const longTailInputs = Object.fromEntries(
  slugMatches.map(m => [`cron-lt-${m[1]}`, resolve(__dirname, `cron-generator/${m[1]}/index.html`)])
)

// Load alternatives page inputs from generated data
const altDataFile = resolve(__dirname, 'src/alternatives/seo/alternatives-data.ts')
const altDataContent = fs.readFileSync(altDataFile, 'utf-8')
const altSlugMatches = [...altDataContent.matchAll(/slug: '([^']+)'/g)]
const altInputs = Object.fromEntries(
  altSlugMatches.map(m => [`alt-lt-${m[1]}`, resolve(__dirname, `alternatives/${m[1]}/index.html`)])
)

// Load deploy page inputs from generated data
const deployDataFile = resolve(__dirname, 'src/deploy/seo/deploy-data.ts')
const deployDataContent = fs.readFileSync(deployDataFile, 'utf-8')
const deploySlugMatches = [...deployDataContent.matchAll(/slug: '([^']+)'/g)]
const deployInputs = Object.fromEntries(
  deploySlugMatches.map(m => [`deploy-lt-${m[1]}`, resolve(__dirname, `deploy/${m[1]}/index.html`)])
)

// Load compare page inputs from generated data
const compareDataFile = resolve(__dirname, 'src/compare/seo/compare-data.ts')
const compareDataContent = fs.readFileSync(compareDataFile, 'utf-8')
const compareSlugMatches = [...compareDataContent.matchAll(/slug: '([^']+)'/g)]
const compareInputs = Object.fromEntries(
  compareSlugMatches.map(m => [`cmp-lt-${m[1]}`, resolve(__dirname, `compare/${m[1]}/index.html`)])
)

// Load token tracker scene page inputs from generated data
const trackerDataFile = resolve(__dirname, 'src/token-tracker/seo/scene-data.ts')
const trackerDataContent = fs.readFileSync(trackerDataFile, 'utf-8')
const trackerSlugMatches = [...trackerDataContent.matchAll(/slug: '([^']+)'/g)]
const trackerInputs = Object.fromEntries(
  trackerSlugMatches.map(m => [`tracker-lt-${m[1]}`, resolve(__dirname, `token-tracker/${m[1]}/index.html`)])
)

// Load mcp detail page inputs from generated data
const mcpDataFile = resolve(__dirname, 'src/mcp/seo/mcp-data.ts')
const mcpDataContent = fs.readFileSync(mcpDataFile, 'utf-8')
const mcpSlugMatches = [...mcpDataContent.matchAll(/slug: '([^']+)'/g)]
const mcpInputs = Object.fromEntries(
  mcpSlugMatches.map(m => [`mcp-d-${m[1]}`, resolve(__dirname, `mcp-servers/${m[1]}/index.html`)])
)

// Load llm-pricing SEO page inputs from generated data
const pricingSeoDataFile = resolve(__dirname, 'src/llm-pricing/seo/pricing-seo-data.ts')
const pricingSeoDataContent = fs.readFileSync(pricingSeoDataFile, 'utf-8')
const pricingSeoSlugMatches = [...pricingSeoDataContent.matchAll(/slug: '([^']+)'/g)]
const pricingSeoInputs = Object.fromEntries(
  pricingSeoSlugMatches.map(m => [`pricing-lt-${m[1]}`, resolve(__dirname, `llm-pricing/${m[1]}/index.html`)])
)

// Load llm-cost SEO page inputs from generated data
const costSeoDataFile = resolve(__dirname, 'src/llm-pricing/seo/cost-seo-data.ts')
const costSeoDataContent = fs.readFileSync(costSeoDataFile, 'utf-8')
const costSeoSlugMatches = [...costSeoDataContent.matchAll(/slug: '([^']+)'/g)]
const costSeoInputs = Object.fromEntries(
  costSeoSlugMatches.map(m => [`cost-lt-${m[1]}`, resolve(__dirname, `llm-pricing/${m[1]}/index.html`)])
)

// Load cron-validator sub-page inputs from generated data
const validatorDataFile = resolve(__dirname, 'src/cron-validator/seo/validator-data.ts')
const validatorDataContent = fs.readFileSync(validatorDataFile, 'utf-8')
const validatorSlugMatches = [...validatorDataContent.matchAll(/slug: '([^']+)'/g)]
const validatorInputs = Object.fromEntries(
  validatorSlugMatches.map(m => [`validator-lt-${m[1]}`, resolve(__dirname, `cron-validator/${m[1]}/index.html`)])
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cron: resolve(__dirname, 'cron-generator/index.html'),
        'cron-patterns': resolve(__dirname, 'cron-generator/common-patterns/index.html'),
        'vercel-cron': resolve(__dirname, 'cron-generator/vercel-cron/index.html'),
        alternatives: resolve(__dirname, 'alternatives/index.html'),
        deploy: resolve(__dirname, 'deploy/index.html'),
        'agent-safety': resolve(__dirname, 'agent-safety/index.html'),
        'voice-pricing': resolve(__dirname, 'voice-agent-pricing/index.html'),
        compare: resolve(__dirname, 'compare/index.html'),
        'token-tracker': resolve(__dirname, 'token-tracker/index.html'),
        'token-counter': resolve(__dirname, 'token-counter/index.html'),
        'admin-dashboard': resolve(__dirname, 'admin/dashboard/index.html'),
        'finder-notes': resolve(__dirname, 'finder/notes/index.html'),
        'finder-chat': resolve(__dirname, 'finder/chat/index.html'),
        'finder-productivity': resolve(__dirname, 'finder/productivity/index.html'),
        photos: resolve(__dirname, 'photos/index.html'),
        'prompt-cache-calculator': resolve(__dirname, 'prompt-cache-calculator/index.html'),
        'mcp-servers': resolve(__dirname, 'mcp-servers/index.html'),
        'csp-generator': resolve(__dirname, 'csp-generator/index.html'),
        'pii-redactor': resolve(__dirname, 'pii-redactor/index.html'),
        'env-scanner': resolve(__dirname, 'env-scanner/index.html'),
        'ai-code-review': resolve(__dirname, 'ai-code-review/index.html'),
        'ai-review-guide': resolve(__dirname, 'ai-code-review/how-to-review-ai-generated-code/index.html'),
        'ai-pr-checklist': resolve(__dirname, 'ai-code-review/ai-pr-review-checklist/index.html'),
        'ai-agent-data-access': resolve(__dirname, 'ai-agent-data-access/index.html'),
        'llm-pricing': resolve(__dirname, 'llm-pricing/index.html'),
        'cron-validator': resolve(__dirname, 'cron-validator/index.html'),
        'dep-shield': resolve(__dirname, 'dep-shield/index.html'),
        'ai-agent-security': resolve(__dirname, 'ai-agent-security/index.html'),
        'local-llm-privacy': resolve(__dirname, 'local-llm-privacy/index.html'),
        ...localeInputs,
        ...longTailInputs,
        ...altInputs,
        ...deployInputs,
        ...compareInputs,
        ...trackerInputs,
        ...mcpInputs,
        ...pricingSeoInputs,
        ...costSeoInputs,
        ...validatorInputs,
      },
    },
  },
})
