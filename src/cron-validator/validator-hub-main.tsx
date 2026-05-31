import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '../index.css'
import ValidatorApp from './ValidatorApp'

document.title = 'Cron Expression Validator — Check & Test Cron Online Free'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ValidatorApp />
    <Analytics />,
  </StrictMode>,
)
