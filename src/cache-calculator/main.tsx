import { createRoot } from 'react-dom/client'
import '../index.css'
import CacheCalculatorApp from './CacheCalculatorApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <CacheCalculatorApp />
    <EmailCapture source="cache-calculator" />
  </>,
)
