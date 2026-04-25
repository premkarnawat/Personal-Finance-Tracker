import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useAnalytics, useTransactions } from '../hooks/useData'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/format'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: analytics, loading } = useAnalytics()
  const { transactions, loading: txLoading } = useTransactions({ limit: 5 })

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.email?.split('@')[0] || 'there'

  const totalIncome = analytics?.summary?.totalIncome || 0
  const totalExpenses = analytics?.summary?.totalExpenses || 0
  const netSavings = analytics?.summary?.netSavings || 0

  // Weekly chart: last 7 days from monthly data or dummy
  const weeklyData = analytics?.monthlyData?.slice(-7).map((d, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] || d.month,
    amount: d.expense || 0,
  })) || []

  return (
    <div className="max-w-2xl mx-auto lg:max-w-5xl">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Hello! 👋</p>
            <h1 className="text-base font-bold capitalize" style={{ color: 'var(--text-primary)' }}>{firstName}</h1>
          </div>
        </div>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center relative"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger" />
        </button>
      </motion.div>

      {/* ── Balance Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="balance-card mb-5"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-medium text-white/60 mb-1">Total Balance</p>
              {loading
                ? <div className="skeleton h-9 w-40 rounded-lg" />
                : <h2 className="text-3xl font-black text-white tabular-nums">{formatCurrency(netSavings)}</h2>
              }
            </div>
            <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/70 capitalize">{firstName}</p>
            <button className="w-9 h-9 rounded-full bg-[#d4a843] flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-[#0f1117]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-52 h-52 rounded-full bg-white/5" />
      </motion.div>

      {/* ── Income / Expense mini stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-5"
      >
        <div className="stat-mini-income">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-success/80">Income</p>
            <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>
          {loading
            ? <div className="skeleton h-6 w-24 rounded" />
            : <p className="text-xl font-black text-success tabular-nums">{formatCurrency(totalIncome)}</p>
          }
        </div>
        <div className="stat-mini-expense">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-danger/80">Expense</p>
            <div className="w-7 h-7 rounded-full bg-danger/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {loading
            ? <div className="skeleton h-6 w-24 rounded" />
            : <p className="text-xl font-black text-danger tabular-nums">{formatCurrency(totalExpenses)}</p>
          }
        </div>
      </motion.div>

      {/* ── Statistics header with month filter ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card mb-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Statistics</h3>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-card2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            {new Date().toLocaleDateString('en', { month: 'short' })} ▾
          </button>
        </div>

        {loading || !weeklyData.length ? (
          <div className="skeleton h-32 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => formatCurrency(v)}
                contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 11 }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}
                fill="url(#barGrad)"
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#c4b5fd" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── Spending by Category (donut + tags) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card mb-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Budget Management</h3>
          <Link to="/analytics" className="text-xs font-semibold text-brand-500">See all →</Link>
        </div>

        {loading ? (
          <div className="skeleton h-40 rounded-xl" />
        ) : !analytics?.spendingByCategory?.length ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>No expense data yet</div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={analytics.spendingByCategory.slice(0, 5)}
                      dataKey="amount"
                      cx="50%" cy="50%"
                      outerRadius={90} innerRadius={55}
                      paddingAngle={3}
                      animationBegin={0} animationDuration={800}
                      strokeWidth={0}
                    >
                      {analytics.spendingByCategory.slice(0, 5).map((entry) => (
                        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Total Balance</p>
                  <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(analytics.spendingByCategory.reduce((s, e) => s + e.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
            {/* Category tags */}
            <div className="flex flex-wrap gap-2 justify-center">
              {analytics.spendingByCategory.slice(0, 5).map((entry) => (
                <span key={entry.category} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: `${CATEGORY_COLORS[entry.category]}18`, color: 'var(--text-secondary)', border: `1px solid ${CATEGORY_COLORS[entry.category]}30` }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[entry.category] }} />
                  {entry.category}
                </span>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* ── Recent Transactions ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
          <Link to="/transactions" className="text-xs font-semibold text-brand-500">View all →</Link>
        </div>

        {txLoading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1"><div className="skeleton h-4 w-32 mb-1.5 rounded" /><div className="skeleton h-3 w-20 rounded" /></div>
                <div className="skeleton h-5 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : !transactions?.length ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center" style={{ background: 'var(--bg-card2)' }}>
              <svg className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>No transactions yet</p>
            <Link to="/transactions" className="btn-primary text-xs px-4 py-2 mt-2">Add transaction</Link>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                className="flex items-center gap-3 py-2.5 rounded-xl px-2 transition-colors hover:bg-[var(--bg-card2)]"
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${CATEGORY_COLORS[t.category] || '#94a3b8'}18` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[t.category] || '#94a3b8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t.description || t.category}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t.category} · {formatDate(t.date)}</p>
                </div>
                <span className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {t.type === 'income' ? '+ ' : '- '}{formatCurrency(t.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
