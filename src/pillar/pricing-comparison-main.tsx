import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import PricingComparisonPillar from './PricingComparisonPillar'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PricingComparisonPillar />
  </StrictMode>
)
