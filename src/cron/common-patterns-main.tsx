import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { CommonPatternsPage } from './CommonPatternsPage'
import { LONG_TAIL_PAGES } from './seo/long-tail-data'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CommonPatternsPage pages={LONG_TAIL_PAGES} />
  </StrictMode>,
)
