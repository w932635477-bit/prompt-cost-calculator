import { createRoot } from 'react-dom/client'
import '../index.css'
import PIIRedactorApp from './PIIRedactorApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <PIIRedactorApp />
    <EmailCapture source="pii-redactor" />
  </>,
)
