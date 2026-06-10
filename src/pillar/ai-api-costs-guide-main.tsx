import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import AiApiCostsGuidePillar from './AiApiCostsGuidePillar'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AiApiCostsGuidePillar />
  </StrictMode>
)
