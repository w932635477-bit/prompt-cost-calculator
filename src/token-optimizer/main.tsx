import { createRoot } from 'react-dom/client'
import '../index.css'
import TokenOptimizerApp from './TokenOptimizerApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <TokenOptimizerApp />
    <EmailCapture source="token-optimizer" />
  </>,
)
