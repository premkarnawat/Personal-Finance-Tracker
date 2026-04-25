import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import { useState } from 'react'

// Bottom nav — mobile (4 items)
const bottomNavItems = [
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
    to: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

// Sidebar nav — desktop
const sidebarNavItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    to: '/loans',
    label: 'Loans & EMIs',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
]

const sidebarBottomItems = [
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${isDark ? 'bg-brand-600' : 'bg-surface-3'} ${className}`}
      aria-label="Toggle theme"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center text-[10px] ${isDark ? 'translate-x-5' : 'translate-x-0'}`}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??'

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen flex bg-surface-1 dark:bg-gray-950">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-surface-3 dark:border-gray-800 fixed inset-y-0 left-0 z-30">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-3 dark:border-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-ink-primary dark:text-white tracking-tight">Fintra</span>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="section-label px-3 mb-3 dark:text-gray-500">Menu</p>
          {sidebarNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white ${isActive ? 'active dark:!bg-sky-900/40 dark:!text-sky-400' : ''}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="section-label px-3 mb-3 dark:text-gray-500">Account</p>
            {sidebarBottomItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-link dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white ${isActive ? 'active dark:!bg-sky-900/40 dark:!text-sky-400' : ''}`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Sidebar footer: theme + user + logout */}
        <div className="p-4 border-t border-surface-3 dark:border-gray-800 space-y-3">
          {/* Theme toggle row */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-ink-tertiary dark:text-gray-500">Dark mode</span>
            <ThemeToggle />
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-sky-900 text-brand-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink-primary dark:text-white truncate capitalize">{displayName}</p>
              <p className="text-[10px] text-ink-tertiary dark:text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-ink-tertiary hover:text-danger dark:hover:text-red-400 transition-colors p-1"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-b border-surface-3 dark:border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-base font-bold text-ink-primary dark:text-white">Fintra</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-2 dark:hover:bg-gray-800 text-ink-primary dark:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-surface-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-bold text-ink-primary dark:text-white">Fintra</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-ink-tertiary dark:text-gray-400 hover:text-ink-primary dark:hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
                <p className="section-label px-3 mb-3 dark:text-gray-500">Menu</p>
                {sidebarNavItems.map((item) => (
                  <NavLink
                    key={item.to} to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `nav-link dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white ${isActive ? 'active dark:!bg-sky-900/40 dark:!text-sky-400' : ''}`
                    }
                  >
                    {item.icon}{item.label}
                  </NavLink>
                ))}
                <div className="pt-4">
                  <p className="section-label px-3 mb-3 dark:text-gray-500">Account</p>
                  {sidebarBottomItems.map((item) => (
                    <NavLink
                      key={item.to} to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `nav-link dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white ${isActive ? 'active dark:!bg-sky-900/40 dark:!text-sky-400' : ''}`
                      }
                    >
                      {item.icon}{item.label}
                    </NavLink>
                  ))}
                </div>
              </nav>

              <div className="p-4 border-t border-surface-3 dark:border-gray-800">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64 pt-[60px] lg:pt-0 pb-20 lg:pb-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="min-h-screen p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-surface-3 dark:border-gray-800 flex items-stretch h-16 safe-area-bottom">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-sky-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className={`transition-colors duration-200 ${isActive ? 'text-sky-500' : 'text-ink-tertiary dark:text-gray-500'}`}>
                {item.icon(isActive)}
              </span>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-sky-500' : 'text-ink-tertiary dark:text-gray-500'}`}>
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
