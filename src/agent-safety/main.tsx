import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '../index.css'
import AgentSafetyApp from './AgentSafetyApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AgentSafetyApp />
    <EmailCapture source="agent-safety" />
    <Analytics />
  </StrictMode>,
)
