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

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cron: resolve(__dirname, 'cron-generator/index.html'),
        'cron-patterns': resolve(__dirname, 'cron-generator/common-patterns/index.html'),
        ...localeInputs,
        ...longTailInputs,
      },
    },
  },
})
