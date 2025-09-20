import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

// Import fonts at the top for better performance
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/700.css'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/700.css'

// Initialize Sentry for error tracking (only if valid DSN is provided)
if (import.meta.env.VITE_SENTRY_DSN && 
    import.meta.env.VITE_SENTRY_DSN !== 'your-sentry-dsn-here' && 
    import.meta.env.VITE_SENTRY_DSN.startsWith('https://')) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.MODE === 'development' ? 1.0 : 0.1,
  });
  console.log('Sentry initialized for error tracking');
} else {
  console.log('Sentry not initialized - no valid DSN provided (this is OK for development)');
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
