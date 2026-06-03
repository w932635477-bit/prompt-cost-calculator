import { createRoot } from 'react-dom/client'
import '../index.css'
import DepShieldApp from './DepShieldApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <DepShieldApp />
    <EmailCapture source="dep-shield" />
  </>,
)
