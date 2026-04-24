import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // FIX: historyApiFallback makes Vite serve index.html for all unknown routes.
    // Without this, refreshing any page like /dashboard returns a 404 because
    // Vite looks for an actual file at that path and finds nothing.
    historyApiFallback: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/transactions': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/analytics': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/export': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    }
  }
})
