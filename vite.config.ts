import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

const LOCALES = ['zh', 'ja', 'es', 'pt', 'fr', 'de', 'ko']

const localeInputs = Object.fromEntries(
  LOCALES.map(l => [`cron-${l}`, resolve(__dirname, `cron-generator/${l}/index.html`)])
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cron: resolve(__dirname, 'cron-generator/index.html'),
        ...localeInputs,
      },
    },
  },
})
