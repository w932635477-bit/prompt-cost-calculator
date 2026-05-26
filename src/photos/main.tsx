import { createRoot } from 'react-dom/client'
import '../index.css'
import PhotosApp from './PhotosApp'

const params = new URLSearchParams(window.location.search)
const initialQuery = params.get('q') || ''

createRoot(document.getElementById('root')!).render(<PhotosApp initialQuery={initialQuery} />)
