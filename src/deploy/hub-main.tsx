import { createRoot } from 'react-dom/client'
import '../index.css'
import DeployApp from './DeployApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <DeployApp />
    <EmailCapture source="deploy" />
  </>,
)
