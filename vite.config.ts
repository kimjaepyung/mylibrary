import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const localCacheModules = path.resolve(
  process.env.USERPROFILE || '',
  '.gemini/antigravity-ide/workspace_cache/mylibrary/node_modules'
)

const hasLocalCache = fs.existsSync(localCacheModules)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: hasLocalCache
      ? [
          { find: /^katex$/, replacement: path.join(localCacheModules, 'katex/dist/katex.mjs') },
          { find: /^lucide-react$/, replacement: path.join(localCacheModules, 'lucide-react') },
          { find: /^canvas-confetti$/, replacement: path.join(localCacheModules, 'canvas-confetti') }
        ]
      : []
  },
  server: {
    port: 5173,
    host: true
  }
})
