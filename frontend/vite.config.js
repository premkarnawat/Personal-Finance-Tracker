import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    historyApiFallback: true, // local dev only
    proxy: {
      '/auth': { target: 'http://localhost:5000', changeOrigin: true },
      '/transactions': { target: 'http://localhost:5000', changeOrigin: true },
      '/analytics': { target: 'http://localhost:5000', changeOrigin: true },
      '/export': { target: 'http://localhost:5000', changeOrigin: true },
    }
  }
})
