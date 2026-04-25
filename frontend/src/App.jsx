import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import SplashScreen from './components/SplashScreen'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import GoalsPage from './pages/GoalsPage'
import LoansPage from './pages/LoansPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-1 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-ink-tertiary font-medium">Loading…</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-1 dark:bg-gray-950">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per session
    return !sessionStorage.getItem('fintra_splash_seen')
  })

  const handleSplashFinish = () => {
    sessionStorage.setItem('fintra_splash_seen', '1')
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Sora, sans-serif',
            padding: '12px 16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login"  element={<PublicRoute><LoginPage  /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* Protected — all wrapped by Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage    />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="analytics"    element={<AnalyticsPage    />} />
          <Route path="goals"        element={<GoalsPage        />} />
          <Route path="loans"        element={<LoansPage        />} />
          <Route path="profile"      element={<ProfilePage      />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
