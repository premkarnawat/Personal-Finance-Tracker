import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useUPISync, SUPPORTED_BANKS } from '../hooks/useUPISync'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function Section({ title, children }) {
  return (
    <div className="card dark:bg-gray-900 dark:border-gray-800 mb-5">
      <h2 className="text-sm font-semibold text-ink-tertiary dark:text-gray-400 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  )
}

function SettingRow({ icon, label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-2 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-medium text-ink-primary dark:text-white">{label}</p>
          {description && <p className="text-xs text-ink-tertiary dark:text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-sky-500' : 'bg-surface-3'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center text-[11px] ${isDark ? 'translate-x-6' : ''}`}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { connectionStatus, connectBank, disconnectBank, syncing, lastSynced, syncBankTransactions } = useUPISync()
  const [smsInput, setSmsInput] = useState('')
  const { processSMS } = useUPISync()
  const [smsLoading, setSmsLoading] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??'
  const displayName = user?.name || user?.email?.split('@')[0] || 'User'

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  const handleConnect = async (bank) => {
    const result = await connectBank(bank.id)
    if (result.success) {
      toast.success(`${bank.name} connected!`)
    } else {
      toast.error(result.message || 'Connection failed')
    }
  }

  const handleDisconnect = async (bank) => {
    await disconnectBank(bank.id)
    toast.success(`${bank.name} disconnected`)
  }

  const handleSync = async (bankId) => {
    const result = await syncBankTransactions(bankId)
    if (result.success) {
      toast.success(`Synced ${result.count} new transactions`)
    } else {
      toast.error(result.message)
    }
  }

  const handleSMSImport = async () => {
    if (!smsInput.trim()) return
    setSmsLoading(true)
    const result = await processSMS(smsInput.trim())
    setSmsLoading(false)
    if (result.success) {
      toast.success(`Transaction imported: ₹${result.transaction?.amount} — ${result.transaction?.description}`)
      setSmsInput('')
    } else {
      toast.error(result.reason || 'Could not parse this SMS')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="page-header dark:text-white">Profile & Settings</h1>
        <p className="text-ink-tertiary dark:text-gray-400 text-sm mt-1">Manage your account, integrations and preferences</p>
      </motion.div>

      {/* User card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="card dark:bg-gray-900 dark:border-gray-800 mb-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink-primary dark:text-white capitalize text-lg leading-tight">{displayName}</p>
          <p className="text-sm text-ink-tertiary dark:text-gray-400">{user?.email}</p>
        </div>
        <span className="badge bg-success/10 text-success text-xs">Active</span>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Appearance">
          <SettingRow icon="🌗" label="Dark Mode" description="Switch between light and dark theme">
            <ThemeToggle />
          </SettingRow>
        </Section>
      </motion.div>

      {/* Bank & UPI Connections */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="🏦 Bank & UPI Connections">
          <p className="text-xs text-ink-tertiary dark:text-gray-500 mb-4 leading-relaxed">
            Connect your bank or UPI app to auto-import and categorize transactions. Uses RBI-compliant Account Aggregator framework.
          </p>

          {/* UPI Apps */}
          <p className="text-xs font-semibold text-ink-tertiary dark:text-gray-500 uppercase tracking-wide mb-2">UPI Apps</p>
          <div className="space-y-2 mb-5">
            {SUPPORTED_BANKS.filter(b => b.type === 'upi').map(bank => {
              const connected = connectionStatus[bank.id]?.connected
              return (
                <div key={bank.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-1 dark:bg-gray-800 border border-surface-3 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{bank.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink-primary dark:text-white">{bank.name}</p>
                      <p className="text-xs text-ink-tertiary dark:text-gray-500">{bank.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connected && (
                      <button
                        onClick={() => handleSync(bank.id)}
                        disabled={syncing}
                        className="text-xs px-2 py-1 rounded-lg bg-brand-50 dark:bg-sky-900/30 text-brand-600 dark:text-sky-400 font-medium hover:bg-brand-100 transition-colors"
                      >
                        {syncing ? '...' : 'Sync'}
                      </button>
                    )}
                    <button
                      onClick={() => connected ? handleDisconnect(bank) : handleConnect(bank)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        connected
                          ? 'bg-danger/10 text-danger hover:bg-danger/20'
                          : 'bg-brand-600 text-white hover:bg-brand-700'
                      }`}
                    >
                      {connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Banks */}
          <p className="text-xs font-semibold text-ink-tertiary dark:text-gray-500 uppercase tracking-wide mb-2">Bank Accounts</p>
          <div className="space-y-2">
            {SUPPORTED_BANKS.filter(b => b.type === 'bank').map(bank => {
              const connected = connectionStatus[bank.id]?.connected
              return (
                <div key={bank.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-1 dark:bg-gray-800 border border-surface-3 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{bank.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink-primary dark:text-white">{bank.name}</p>
                      <p className="text-xs text-ink-tertiary dark:text-gray-500">{bank.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connected && (
                      <button onClick={() => handleSync(bank.id)} disabled={syncing}
                        className="text-xs px-2 py-1 rounded-lg bg-brand-50 dark:bg-sky-900/30 text-brand-600 dark:text-sky-400 font-medium hover:bg-brand-100 transition-colors">
                        {syncing ? '...' : 'Sync'}
                      </button>
                    )}
                    <button
                      onClick={() => connected ? handleDisconnect(bank) : handleConnect(bank)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${connected ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
                    >
                      {connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {lastSynced && (
            <p className="text-xs text-ink-tertiary dark:text-gray-500 mt-3 text-right">
              Last synced: {lastSynced.toLocaleString('en-IN')}
            </p>
          )}
        </Section>
      </motion.div>

      {/* SMS Import */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="📱 SMS Transaction Import">
          <p className="text-xs text-ink-tertiary dark:text-gray-500 mb-3 leading-relaxed">
            Paste a bank SMS to instantly parse and import it as a transaction. Works with all major Indian banks.
          </p>
          <textarea
            value={smsInput}
            onChange={e => setSmsInput(e.target.value)}
            placeholder={'Paste bank SMS here...\nExample: "Your SBI A/c XXXX is debited by Rs.450.00 on 25-Apr at SWIGGY UPI ref 123456789012"'}
            className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 h-24 resize-none font-mono text-xs"
          />
          <button
            onClick={handleSMSImport}
            disabled={smsLoading || !smsInput.trim()}
            className="btn-primary mt-2 w-full disabled:opacity-50"
          >
            {smsLoading ? 'Parsing...' : '⚡ Import Transaction from SMS'}
          </button>
        </Section>
      </motion.div>

      {/* Account Settings */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Section title="Account">
          <SettingRow icon="🔔" label="Notifications" description="Budget alerts and weekly summaries">
            <span className="text-xs text-ink-tertiary dark:text-gray-500 bg-surface-2 dark:bg-gray-800 px-2 py-1 rounded-lg">Coming soon</span>
          </SettingRow>
          <SettingRow icon="📤" label="Export Data" description="Download your transactions as CSV">
            <button
              onClick={() => toast('Export feature — connect your backend /export endpoint', { icon: 'ℹ️' })}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-2 dark:bg-gray-800 text-ink-secondary dark:text-gray-400 font-medium hover:bg-surface-3 dark:hover:bg-gray-700 transition-colors"
            >
              Export CSV
            </button>
          </SettingRow>
          <SettingRow icon="🔐" label="Change Password" description="Update your account password">
            <button className="text-xs px-3 py-1.5 rounded-lg bg-surface-2 dark:bg-gray-800 text-ink-secondary dark:text-gray-400 font-medium hover:bg-surface-3 dark:hover:bg-gray-700 transition-colors">
              Update
            </button>
          </SettingRow>
        </Section>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="card dark:bg-gray-900 dark:border-gray-800 border-danger/20">
          <h2 className="text-sm font-semibold text-danger uppercase tracking-wider mb-4">Danger Zone</h2>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-danger/10 text-danger font-semibold text-sm hover:bg-danger/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </motion.div>
    </div>
  )
}
