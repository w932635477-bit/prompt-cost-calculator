import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import DeployPage from './DeployPage'
import '../index.css'

inject()
createRoot(document.getElementById('root')!).render(<DeployPage />)
