import { createRoot } from 'react-dom/client'
import '../index.css'
import AICodeReviewApp from './AICodeReviewApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <AICodeReviewApp />
    <EmailCapture source="ai-code-review" />
  </>,
)
