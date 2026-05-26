import { createRoot } from 'react-dom/client'
import '../index.css'
import CompareHub from './CompareHub'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <CompareHub />
    <EmailCapture source="compare" />
  </>,
)
