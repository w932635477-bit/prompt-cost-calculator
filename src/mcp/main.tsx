import { createRoot } from 'react-dom/client'
import '../index.css'
import MCPHubApp from './MCPHubApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <MCPHubApp />
    <EmailCapture source="mcp-servers" />
  </>,
)
