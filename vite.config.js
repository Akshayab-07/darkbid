import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from 'url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    // ✅ vite-plugin-node-polyfills: Polyfills Node.js modules for browser use
    // Supports: buffer, process, global, and other Node modules
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
      globals: {
        global: true,
        process: true,
        Buffer: true,
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  define: {
    global: 'globalThis',
    // ✅ CRITICAL: Ensure Buffer is available globally
    Buffer: 'globalThis.Buffer',
  },

  optimizeDeps: {
    // ✅ Pre-bundle these to avoid polyfill conflicts
    include: ['@solana/web3.js', '@coral-xyz/anchor', 'buffer'],
  },
})