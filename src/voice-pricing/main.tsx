import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '../index.css'
import VoicePricingApp from './VoicePricingApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VoicePricingApp />
    <EmailCapture source="voice-pricing" />
    <Analytics />
  </StrictMode>,
)
