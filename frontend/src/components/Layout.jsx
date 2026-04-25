import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { useState } from 'react'

const navItems = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Stats',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
      style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}
      title="Toggle theme"
    >
      {isDark ? (
        <svg className="w-4 h-4 text-[#f5c842]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-[#475569]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = user?.email?.charAt(0).toUpperCase() || '?'
  const username = user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30"
        style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#1e2535]">
            <svg width="18" height="22" viewBox="0 0 80 96" fill="none">
              <polygon points="10,8 72,8 80,20 10,20" fill="#d4a843" />
              <polygon points="10,38 55,38 63,50 10,50" fill="#d4a843" />
              <rect x="10" y="8" width="14" height="80" fill="#d4a843" />
            </svg>
          </div>
          <div>
            <span className="text-base font-black tracking-widest" style={{ color: 'var(--text-primary)' }}>FINTRA</span>
            <p className="text-[9px] tracking-widest text-[#d4a843] font-medium -mt-0.5">TRACK YOUR FINANCE</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="section-label px-3 mb-3">Navigation</p>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {({ isActive }) => (<>{item.icon(isActive)}{item.label}</>)}
            </NavLink>
          ))}
          <div className="pt-4">
            <p className="section-label px-3 mb-3">More</p>
            <NavLink to="/loans" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {({ isActive }) => (
                <>
                  <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Loans
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User + theme */}
        <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-card2)' }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate capitalize" style={{ color: 'var(--text-primary)' }}>{username}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleLogout} title="Logout"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-danger transition-all hover:bg-danger/10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1e2535]">
            <svg width="14" height="17" viewBox="0 0 80 96" fill="none">
              <polygon points="10,8 72,8 80,20 10,20" fill="#d4a843" />
              <polygon points="10,38 55,38 63,50 10,50" fill="#d4a843" />
              <rect x="10" y="8" width="14" height="80" fill="#d4a843" />
            </svg>
          </div>
          <span className="text-sm font-black tracking-widest" style={{ color: 'var(--text-primary)' }}>FINTRA</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-64 pt-[56px] lg:pt-0 pb-20 lg:pb-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="min-h-screen p-4 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden bottom-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
          return (
            <NavLink key={item.to} to={item.to}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
              {item.icon(isActive)}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          )
        })}
        <NavLink to="/loans"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          {({ isActive }) => (
            <>
              <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-[10px] font-semibold">Loans</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  )
}
