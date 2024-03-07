import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), mdPlugin({ mode: [Mode.HTML] })],
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