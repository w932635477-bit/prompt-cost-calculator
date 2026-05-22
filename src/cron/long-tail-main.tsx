import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '../index.css'
import { LongTailPage } from './LongTailPage'
import type { LongTailPage as LongTailPageData } from './seo/long-tail-data'

const el = document.getElementById('seo-data')
if (!el) throw new Error('Missing #seo-data element')
const page: LongTailPageData = JSON.parse(el.textContent!)
document.title = page.title

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LongTailPage page={page} />
    <Analytics />
  </StrictMode>,
)
