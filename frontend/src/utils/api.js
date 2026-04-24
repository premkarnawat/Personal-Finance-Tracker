import axios from 'axios'

// Vite proxies /auth, /transactions, /analytics, /export → http://localhost:5000
const api = axios.create({
  baseURL: '',
  timeout: 15000,
})

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip redirect for /auth/me — it's the initial session check in AuthContext.
      // Redirecting here causes a full page reload loop → white screen.
      const isAuthCheck = error.config?.url?.includes('/auth/me')
      if (!isAuthCheck) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
