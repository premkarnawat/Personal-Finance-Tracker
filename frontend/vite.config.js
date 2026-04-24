import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:5000',
      '/transactions': 'http://localhost:5000',
      '/analytics': 'http://localhost:5000',
      '/export': 'http://localhost:5000',
    }
  }
})
