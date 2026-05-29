import { createRoot } from 'react-dom/client'
import '../index.css'
import CSPGeneratorApp from './CSPGeneratorApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <CSPGeneratorApp />
    <EmailCapture source="csp-generator" />
  </>,
)
