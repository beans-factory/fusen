import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Monaco throws cancelation objects (not real errors) when operations are interrupted
// (e.g. switching notes while the command palette is open). Suppress these.
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.type === 'cancelation') e.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
