import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import '../../styles/global.css'

if (import.meta.env.DEV) {
  import('eruda').then((module) => module.default.init())
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-left"
      toastOptions={{
        duration: 3200,
        style: {
          borderRadius: '18px',
          background: 'rgba(15, 23, 42, 0.92)',
          color: '#fff',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 16px 48px rgba(15, 23, 42, 0.2)',
        },
      }}
    />
  </React.StrictMode>,
)
