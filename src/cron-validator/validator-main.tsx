import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '../index.css'
import ValidatorPage from './ValidatorPage'
import type { ValidatorSubPage } from './lib/types'

const el = document.getElementById('seo-data')
if (!el) throw new Error('Missing #seo-data element')
const page: ValidatorSubPage = JSON.parse(el.textContent!)
document.title = page.title

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ValidatorPage page={page} />
    <Analytics />
  </StrictMode>,
)
