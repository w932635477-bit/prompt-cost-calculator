import { createRoot } from 'react-dom/client'
import '../../index.css'
import ChatFinder from './ChatFinder'
import { EmailCapture } from '../../components/EmailCapture'

createRoot(document.getElementById('root')!).render(
  <>
    <ChatFinder />
    <EmailCapture source="chat-finder" />
  </>,
)
