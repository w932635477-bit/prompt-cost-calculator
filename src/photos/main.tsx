import { createRoot } from 'react-dom/client'
import '../index.css'
import PhotosApp from './PhotosApp'
import { EmailCapture } from '../components/EmailCapture'

const params = new URLSearchParams(window.location.search)
const initialQuery = params.get('q') || ''

createRoot(document.getElementById('root')!).render(
  <>
    <PhotosApp initialQuery={initialQuery} />
    <EmailCapture source="photos" />
  </>,
)
