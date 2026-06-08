import { createRoot } from 'react-dom/client'
import '../index.css'
import TestingStrategyPicker from './TestingStrategyPicker'
import { EmailCapture } from '../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <TestingStrategyPicker />
    <EmailCapture source="testing-strategy-picker" />
  </>,
)
