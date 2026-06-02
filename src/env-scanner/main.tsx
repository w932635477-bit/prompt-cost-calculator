import { createRoot } from 'react-dom/client'
import '../index.css'
import EnvScannerApp from './EnvScannerApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <EnvScannerApp />
    <EmailCapture source="env-scanner" />
  </>,
)
