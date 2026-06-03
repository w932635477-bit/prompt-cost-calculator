import { createRoot } from 'react-dom/client'
import '../index.css'
import AgentSecurityApp from './AgentSecurityApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <AgentSecurityApp />
    <EmailCapture source="ai-agent-security" />
  </>,
)
