import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import AlternativesGuidePillar from './AlternativesGuidePillar'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlternativesGuidePillar />
  </StrictMode>
)
