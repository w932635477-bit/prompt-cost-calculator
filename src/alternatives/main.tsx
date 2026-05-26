import { createRoot } from 'react-dom/client'
import '../index.css'
import AlternativesApp from './AlternativesApp'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <AlternativesApp />
    <EmailCapture source="alternatives" />
  </>,
)
