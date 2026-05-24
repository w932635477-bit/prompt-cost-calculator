import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '../index.css'
import { VercelCronPage } from './VercelCronPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VercelCronPage />
    <Analytics />,
  </StrictMode>,
)
