import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      '/linguflow-api': {
        target: 'http://linguflow-api:8000/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/linguflow-api/, '')
      }
    }
  }
})
