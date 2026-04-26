import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { useState } from 'react'

// Desktop sidebar nav items
const sidebarItems = [
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

// Mobile bottom nav — 4 icons + center FAB
// Left: Home, Analytics | Right: Transactions, Profile
// Center: floating money bag FAB

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'none' : 'none'} stroke={active ? '#facc15' : 'rgba(255,255,255,0.7)'} strokeWidth={active ? 2.2 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const AnalyticsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#facc15' : 'rgba(255,255,255,0.7)'} strokeWidth={active ? 2.2 : 1.8}>
    <rect x="2" y="12" width="4" height="10" rx="1" stroke={active ? '#facc15' : 'rgba(255,255,255,0.7)'} />
    <rect x="9" y="7" width="4" height="15" rx="1" stroke={active ? '#facc15' : 'rgba(255,255,255,0.7)'} />
    <rect x="16" y="2" width="4" height="20" rx="1" stroke={active ? '#facc15' : 'rgba(255,255,255,0.7)'} />
  </svg>
)

const TransactionsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#facc15' : 'rgba(255,255,255,0.7)'} strokeWidth={active ? 2.2 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#facc15' : 'rgba(255,255,255,0.7)'} strokeWidth={active ? 2.2 : 1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const MoneyBagIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="#1a1a1a">
    <path d="M12 2C10.5 2 9.5 2.9 9 4H8C6.9 4 6 4.9 6 6C6 6.7 6.4 7.3 7 7.7C5.8 9 5 10.9 5 13C5 17.4 8.1 21 12 21C15.9 21 19 17.4 19 13C19 10.9 18.2 9 17 7.7C17.6 7.3 18 6.7 18 6C18 4.9 17.1 4 16 4H15C14.5 2.9 13.5 2 12 2ZM12 4C12.6 4 13 4.4 13 5H11C11 4.4 11.4 4 12 4ZM8 6H16C16 6.1 16 6.1 15.9 6.2C14.7 5.8 13.4 5.5 12 5.5C10.6 5.5 9.3 5.8 8.1 6.2C8 6.1 8 6.1 8 6ZM12 7.5C14.8 7.5 17 10 17 13C17 16.3 14.8 19 12 19C9.2 19 7 16.3 7 13C7 10 9.2 7.5 12 7.5ZM11 10V11H10C9.4 11 9 11.4 9 12C9 12.6 9.4 13 10 13H11V14H10C9.4 14 9 14.4 9 15C9 15.6 9.4 16 10 16H11V17H13V16H14C14.6 16 15 15.6 15 15C15 14.4 14.6 14 14 14H13V13H14C14.6 13 15 12.6 15 12C15 11.4 14.6 11 14 11H13V10H11Z" />
  </svg>
)

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
    : user?.email?.charAt(0).toUpperCase() || '?'

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen flex bg-surface-1">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-surface-3 fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-surface-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-ink-primary tracking-tight">Fintra</span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="section-label px-3 mb-3">Menu</p>
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-surface-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ink-primary truncate">{user?.name || user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-ink-tertiary hover:text-danger transition-colors p-1" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-surface-3 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-base font-bold text-ink-primary">Fintra</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-surface-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile Slide Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-surface-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-bold text-ink-primary">Fintra</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-ink-tertiary hover:text-ink-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => (
                  <NavLink
                    key={item.to} to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.icon}{item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 border-t border-surface-3">
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
      <main className="flex-1 lg:ml-64 pt-[60px] lg:pt-0 pb-32 lg:pb-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="min-h-screen p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ══════════════════════════════════════════════════
          MOBILE BOTTOM NAV — pill-shaped floating bar
          Exact match to design image
      ══════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-5 left-0 right-0 z-50 flex justify-center px-5">
        {/* Outer wrapper — positions the center FAB above the pill */}
        <div className="relative w-full max-w-sm">

          {/* ── Center FAB: yellow money-bag button ── */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10">
            <motion.button
              onClick={() => navigate('/transactions')}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative"
              aria-label="Transactions"
            >
              {/* White ring */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: '#ffffff',
                  padding: '3px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}
              >
                {/* Yellow circle */}
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{ background: '#facc15' }}
                >
                  <MoneyBagIcon />
                </div>
              </div>
            </motion.button>
          </div>

          {/* ── Pill navbar ── */}
          <div
            className="flex items-center h-16 rounded-full px-4"
            style={{
              background: '#2d1b69',
              boxShadow: '0 8px 32px rgba(45,27,105,0.45)',
            }}
          >
            {/* Left side: Home + Analytics */}
            <div className="flex flex-1 items-center justify-around">
              {/* Home */}
              <NavLink to="/dashboard" className="flex flex-col items-center justify-center gap-0.5 p-2">
                {({ isActive: ia }) => (
                  <>
                    <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                      <HomeIcon active={ia} />
                    </motion.div>
                    {ia && <span className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5" />}
                  </>
                )}
              </NavLink>

              {/* Analytics — with yellow border highlight when active */}
              <NavLink to="/analytics" className="flex flex-col items-center justify-center gap-0.5 p-2">
                {({ isActive: ia }) => (
                  <>
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={ia ? {
                        border: '2px solid #facc15',
                        borderRadius: '10px',
                        padding: '4px',
                      } : { padding: '6px' }}
                    >
                      <AnalyticsIcon active={ia} />
                    </motion.div>
                    {ia && <span className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5" />}
                  </>
                )}
              </NavLink>
            </div>

            {/* Center spacer for FAB */}
            <div className="w-16 flex-shrink-0" />

            {/* Right side: Transactions list + Profile */}
            <div className="flex flex-1 items-center justify-around">
              {/* Transactions list */}
              <NavLink to="/transactions" className="flex flex-col items-center justify-center gap-0.5 p-2">
                {({ isActive: ia }) => (
                  <>
                    <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                      <TransactionsIcon active={ia} />
                    </motion.div>
                    {ia && <span className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5" />}
                  </>
                )}
              </NavLink>

              {/* Profile */}
              <NavLink to="/profile" className="flex flex-col items-center justify-center gap-0.5 p-2">
                {({ isActive: ia }) => (
                  <>
                    <motion.div whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                      <ProfileIcon active={ia} />
                    </motion.div>
                    {ia && <span className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5" />}
                  </>
                )}
              </NavLink>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
