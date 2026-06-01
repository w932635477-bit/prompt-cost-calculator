import { createRoot } from 'react-dom/client'
import '../../index.css'
import ProductivityFinder from './ProductivityFinder'
import { EmailCapture } from '../../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <ProductivityFinder />
    <EmailCapture source="productivity-finder" />
  </>,
)
