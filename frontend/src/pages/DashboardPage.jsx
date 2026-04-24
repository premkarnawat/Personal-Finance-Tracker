import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useAnalytics } from '../hooks/useData'
import { useTransactions } from '../hooks/useData'
import { formatCurrency, formatDate, formatMonth, CATEGORY_COLORS } from '../utils/format'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Link } from 'react-router-dom'

const statConfig = [
  { key: 'totalIncome', label: 'Total Income', icon: '↑', color: 'text-success', bg: 'bg-success/10' },
  { key: 'totalExpenses', label: 'Total Expenses', icon: '↓', color: 'text-danger', bg: 'bg-danger/10' },
  { key: 'netSavings', label: 'Net Savings', icon: '◆', color: 'text-brand-600', bg: 'bg-brand-50' },
]

function StatSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-4 w-20 mb-4 rounded" />
      <div className="skeleton h-8 w-32 mb-2 rounded" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: analytics, loading } = useAnalytics()
  const { transactions, loading: txLoading } = useTransactions({ limit: 5 })

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <p className="text-ink-tertiary text-sm font-medium mb-1">{greeting},</p>
          <h1 className="page-header capitalize">{firstName} 👋</h1>
        </motion.div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {loading
          ? Array(3).fill(0).map((_, i) => <StatSkeleton key={i} />)
          : statConfig.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide">{s.label}</p>
                <span className={`w-8 h-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center text-sm font-bold`}>{s.icon}</span>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>
                {formatCurrency(analytics?.summary?.[s.key] || 0)}
              </p>
            </motion.div>
          ))}
      </div>

      {/* Savings rate + pie row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Savings rate */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }} className="card">
          <p className="section-label mb-4">Savings Rate</p>
          {loading ? (
            <div className="flex flex-col items-center"><div className="skeleton w-32 h-32 rounded-full mb-4" /><div className="skeleton h-4 w-20" /></div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-3">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={analytics?.summary?.savingsRate >= 0 ? '#0ea5e9' : '#ef4444'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${Math.abs(Math.min(analytics?.summary?.savingsRate || 0, 100)) * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold tabular-nums ${(analytics?.summary?.savingsRate || 0) >= 0 ? 'text-brand-600' : 'text-danger'}`}>
                    {analytics?.summary?.savingsRate?.toFixed(0) || 0}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-ink-tertiary text-center">
                {(analytics?.summary?.savingsRate || 0) >= 20 ? '🟢 Excellent savings!' : (analytics?.summary?.savingsRate || 0) >= 10 ? '🟡 Good, keep going' : '🔴 Consider reducing expenses'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Spending by category mini pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Spending by Category</p>
            <Link to="/analytics" className="text-xs text-brand-600 font-semibold hover:text-brand-700">See all →</Link>
          </div>
          {loading ? (
            <div className="flex gap-6"><div className="skeleton w-32 h-32 rounded-full" /><div className="flex-1 space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}</div></div>
          ) : analytics?.spendingByCategory?.length === 0 ? (
            <div className="flex items-center justify-center h-28 text-ink-tertiary text-sm">No expense data yet</div>
          ) : (
            <div className="flex gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={analytics?.spendingByCategory?.slice(0, 6)} dataKey="amount" cx="50%" cy="50%" outerRadius={50} innerRadius={25}>
                    {analytics?.spendingByCategory?.slice(0, 6).map((entry) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {analytics?.spendingByCategory?.slice(0, 5).map((entry) => (
                  <div key={entry.category} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#94a3b8' }} />
                    <span className="text-xs text-ink-secondary flex-1 truncate">{entry.category}</span>
                    <span className="text-xs font-semibold text-ink-primary tabular-nums">{formatCurrency(entry.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly Income vs Expenses — Line Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.3 }} className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <p className="section-label">Monthly Income vs Expenses</p>
          <Link to="/analytics" className="text-xs text-brand-600 font-semibold hover:text-brand-700">Full analytics →</Link>
        </div>
        {loading ? (
          <div className="skeleton h-44 w-full rounded-xl" />
        ) : !analytics?.monthlyData?.length ? (
          <div className="flex items-center justify-center h-44 text-ink-tertiary text-sm">
            No monthly data yet — add transactions to see trends
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={analytics.monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, name) => [formatCurrency(v), name === 'income' ? 'Income' : 'Expense']}
                labelFormatter={formatMonth}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontFamily: 'Sora, sans-serif' }}
              />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} name="income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} name="expense" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }} className="card">
        <div className="flex items-center justify-between mb-5">
          <p className="section-label">Recent Transactions</p>
          <Link to="/transactions" className="text-xs text-brand-600 font-semibold hover:text-brand-700">View all →</Link>
        </div>
        {txLoading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1"><div className="skeleton h-4 w-32 mb-1.5 rounded" /><div className="skeleton h-3 w-20 rounded" /></div>
                <div className="skeleton h-5 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : transactions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 bg-surface-2 rounded-2xl flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-ink-secondary mb-1">No transactions yet</p>
            <p className="text-xs text-ink-tertiary mb-4">Add your first transaction to get started</p>
            <Link to="/transactions" className="btn-primary text-sm px-4 py-2">Add transaction</Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-2">
            {transactions.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-4 py-3"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: `${CATEGORY_COLORS[t.category] || '#94a3b8'}18` }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#94a3b8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-primary truncate">{t.category}</p>
                  <p className="text-xs text-ink-tertiary">{formatDate(t.date)}{t.description ? ` · ${t.description}` : ''}</p>
                </div>
                <span className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
