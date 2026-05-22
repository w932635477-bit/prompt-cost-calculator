import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import CronGeneratorApp from './CronGeneratorApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CronGeneratorApp />
  </StrictMode>,
)
