// src/testing-strategy/seo-main.tsx
// Entry point for long-tail SEO landing pages

import { createRoot } from 'react-dom/client'
import '../index.css'
import StrategySeoPage from './StrategySeoPage'
import { SEO_PAGES } from './seo-data'

const slug = (window as any).__SEO_PAGE_SLUG__
const page = SEO_PAGES.find(p => p.slug === slug) || SEO_PAGES[0]

createRoot(document.getElementById('root')!).render(<StrategySeoPage page={page} />)
