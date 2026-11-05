// Vite build configuration for the GitHub Pages project site. The base path must match the repository Pages URL; the @ alias keeps source imports rooted at src/.
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages project-site base path.
export default defineConfig({
  base: '/sad-saga-galaxy/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
