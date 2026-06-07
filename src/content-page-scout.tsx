import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import ContentPageComponent from './components/ContentPage'
import { EmailCapture } from './components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentPageComponent />
    <EmailCapture source="microsoft-scout" />
    <Analytics />
  </StrictMode>,
)
