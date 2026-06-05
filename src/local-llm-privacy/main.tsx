import { createRoot } from 'react-dom/client'
import '../index.css'
import PrivacyProbeApp from './PrivacyProbeApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <PrivacyProbeApp />
    <EmailCapture source="local-llm-privacy" />
  </>,
)
