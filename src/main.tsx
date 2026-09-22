import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Dashboard } from './Dashboard.tsx'

const page = window.location.pathname === '/dashboard' ? <Dashboard /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
