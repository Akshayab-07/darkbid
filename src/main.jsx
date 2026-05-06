import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// ✅ CRITICAL: Polyfill Buffer BEFORE anything else
// This ensures Node.js modules (like @solana/web3.js) can use Buffer in the browser
import { Buffer as BufferPolyfill } from 'buffer'

// Make Buffer available globally to all scripts
if (typeof window !== 'undefined') {
  window.Buffer = BufferPolyfill
  // Ensure globalThis also has access (used by modern polyfills)
  if (typeof globalThis !== 'undefined') {
    globalThis.Buffer = BufferPolyfill
  }
}

// Also polyfill process.env if needed by any libraries
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  window.process = {
    env: {
      NODE_ENV: import.meta.env.MODE
    }
  }
}

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
