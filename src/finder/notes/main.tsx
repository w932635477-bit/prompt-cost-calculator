import { createRoot } from 'react-dom/client'
import '../../index.css'
import NotesFinder from './NotesFinder'
import { EmailCapture } from '../../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <NotesFinder />
    <EmailCapture source="notes-finder" />
  </>,
)
