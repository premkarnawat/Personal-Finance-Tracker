import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { theme, toggle, isDark } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const username = user?.email?.split('@')[0] || 'User'
  const initials = username.charAt(0).toUpperCase()
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently'

  const menuItems = [
    {
      section: 'Preferences',
      items: [
        {
          label: 'Theme',
          desc: isDark ? 'Dark mode' : 'Light mode',
          icon: isDark ? (
            <svg className="w-5 h-5 text-[#f5c842]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ),
          action: toggle,
          trailing: (
            <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${isDark ? 'bg-brand-600' : 'bg-surface-3'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${isDark ? 'left-6' : 'left-1'}`} />
            </div>
          ),
        },
      ],
    },
    {
      section: 'Account',
      items: [
        {
          label: 'Financial Goals',
          desc: 'Set and track your goals',
          icon: <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
          action: () => navigate('/goals'),
        },
        {
          label: 'Loan Manager',
          desc: 'Track loans and EMIs',
          icon: <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
          action: () => navigate('/loans'),
        },
      ],
    },
    {
      section: 'Danger Zone',
      items: [
        {
          label: 'Log Out',
          desc: 'Sign out of your account',
          icon: <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
          action: handleLogout,
          danger: true,
        },
      ],
    },
  ]

  return (
    <div className="max-w-lg mx-auto">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black capitalize truncate" style={{ color: 'var(--text-primary)' }}>{username}</h2>
            <p className="text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>{user?.email}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Member since {joined}</p>
          </div>
        </div>

        {/* UPI Notice */}
        <div className="mt-5 rounded-xl p-4" style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d4a843]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>UPI / Bank Auto-sync</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Automatic UPI & bank integration requires RBI-approved account aggregator access. This feature is on the roadmap. For now, add transactions manually.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Menu sections */}
      {menuItems.map((section, si) => (
        <motion.div key={section.section}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (si + 1) * 0.08 }}
          className="mb-4"
        >
          <p className="section-label px-1 mb-2">{section.section}</p>
          <div className="card p-2 space-y-1">
            {section.items.map((item) => (
              <button key={item.label} onClick={item.action}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all text-left"
                style={{ ':hover': { background: 'var(--bg-card2)' } }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg-card2)' }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: item.danger ? '#ef4444' : 'var(--text-primary)' }}>
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
                </div>
                {item.trailing || (
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      ))}

      <p className="text-center text-xs mt-6" style={{ color: 'var(--text-tertiary)' }}>
        FINTRA v2.0 · Made with ♥
      </p>
    </div>
  )
}
