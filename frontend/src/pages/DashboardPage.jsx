import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useAnalytics, useTransactions } from '../hooks/useData'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/format'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Link } from 'react-router-dom'

// Matching the color palette in the design reference
const DONUT_COLORS = ['#7c3aed', '#f97316', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']

const stagger = (i) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07, duration: 0.35 } })

function BalanceCard({ income, expenses, loading }) {
  const net = (income || 0) - (expenses || 0)
  return (
    <motion.div
      {...stagger(0)}
      className="rounded-3xl p-5 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4c1d95 50%, #6d28d9 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
      <div className="absolute -bottom-4 -right-12 w-36 h-36 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.4)' }} />

      <div className="flex items-center justify-between mb-4">
        <p className="text-purple-200 text-xs font-medium uppercase tracking-widest">Total Balance</p>
        <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      <p className="text-3xl font-bold tabular-nums tracking-tight mb-5">
        {loading ? '—' : formatCurrency(net)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-purple-200">Income</p>
            <p className="text-sm font-bold">{loading ? '—' : formatCurrency(income)}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-purple-200">Expense</p>
            <p className="text-sm font-bold">{loading ? '—' : formatCurrency(expenses)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, change, color, bg, icon, i }) {
  return (
    <motion.div {...stagger(i)} className="rounded-2xl p-4" style={{ background: bg }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium" style={{ color }}>{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
          </span>
        </div>
      )}
    </motion.div>
  )
}

// Savings plan progress item
function SavingsPlanItem({ label, current, target, color }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div className="bg-white rounded-2xl p-3 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-gray-700 truncate">{label}</p>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: color }}>
          {pct >= 100 ? 'Done' : 'Active'}
        </span>
      </div>
      <p className="text-xs text-gray-500">{formatCurrency(current)}</p>
      <p className="text-xs font-semibold text-gray-400">{formatCurrency(target)}</p>
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: analytics, loading } = useAnalytics()
  const { transactions, loading: txLoading } = useTransactions({ limit: 5 })

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name || user?.email?.split('@')[0] || 'there'

  const income = analytics?.summary?.totalIncome || 0
  const expenses = analytics?.summary?.totalExpenses || 0

  const categoryData = analytics?.spendingByCategory || []
  const monthlyData = analytics?.monthlyData || []

  return (
    <div className="max-w-lg mx-auto lg:max-w-4xl">
      {/* Header */}
      <motion.div {...stagger(0)} className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-gray-400 font-medium">Hello! 👋</p>
          <h1 className="text-xl font-bold text-gray-900 capitalize">{firstName}</h1>
        </div>
        <button className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shadow-md relative">
          <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </motion.div>

      {/* Balance Card */}
      <div className="mb-5">
        <BalanceCard income={income} expenses={expenses} loading={loading} />
      </div>

      {/* Statistics row */}
      <motion.div {...stagger(1)} className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">Statistics</h2>
        <span className="text-xs text-gray-400 font-medium">This month ▾</span>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard i={2} label="Income" value={loading ? '—' : formatCurrency(income)} color="#059669" bg="#ecfdf5" icon="💰" />
        <StatCard i={3} label="Expense" value={loading ? '—' : formatCurrency(expenses)} color="#dc2626" bg="#fef2f2" icon="💸" />
      </div>

      {/* Savings Plan */}
      <motion.div {...stagger(4)} className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">My Savings Plan</h2>
          <Link to="/goals" className="text-xs text-purple-600 font-semibold">View all</Link>
        </div>
        <div className="flex gap-3">
          <SavingsPlanItem label="Emergency Fund" current={income * 0.15} target={50000} color="#7c3aed" />
          <SavingsPlanItem label="Vacation" current={income * 0.08} target={30000} color="#06b6d4" />
        </div>
      </motion.div>

      {/* Spending Categories Donut */}
      {categoryData.length > 0 && (
        <motion.div {...stagger(5)} className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Spending by Category</h2>
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {categoryData.slice(0, 5).map((c, i) => (
                <span key={c.category} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-50 rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  {c.category}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Monthly Bar Chart */}
      {monthlyData.length > 1 && (
        <motion.div {...stagger(6)} className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Monthly Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="income" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Insight banner */}
          {monthlyData.length >= 2 && (() => {
            const last = monthlyData[monthlyData.length - 1]
            const prev = monthlyData[monthlyData.length - 2]
            const diff = last.expense - prev.expense
            const pct = prev.expense > 0 ? Math.abs(Math.round((diff / prev.expense) * 100)) : 0
            return (
              <div className="mt-3 flex items-center gap-2 bg-amber-50 rounded-xl p-3">
                <span className="text-xs text-gray-600 font-medium">This month expense</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${diff < 0 ? 'bg-green-500 text-white' : 'bg-red-100 text-red-600'}`}>
                  {diff < 0 ? `▼ ₹${Math.abs(diff).toFixed(0)}` : `▲ ₹${diff.toFixed(0)}`}
                </span>
                <span className="text-xs text-gray-400">{diff < 0 ? 'less' : 'more'} than last month</span>
              </div>
            )
          })()}
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div {...stagger(7)} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-purple-600 font-semibold">View all</Link>
        </div>
        {txLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-gray-100" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded w-24 mb-1" />
                  <div className="h-2 bg-gray-100 rounded w-16" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-2">💳</p>
            <p className="text-sm text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, i) => {
              const color = CATEGORY_COLORS[tx.category] || '#94a3b8'
              return (
                <motion.div key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: color + '20' }}>
                    <span>{getCategoryEmoji(tx.category)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{tx.description || tx.category}</p>
                    <p className="text-xs text-gray-400">{tx.category} · {formatDate(tx.date)}</p>
                  </div>
                  <p className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '−'} {formatCurrency(tx.amount)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function getCategoryEmoji(cat) {
  const map = {
    'Food & Dining': '🍔', 'Transportation': '🚗', 'Housing & Rent': '🏠',
    'Healthcare': '💊', 'Entertainment': '🎬', 'Shopping': '🛍️',
    'Education': '📚', 'Travel': '✈️', 'Utilities': '⚡',
    'Savings': '💰', 'Salary': '💼', 'Freelance': '💻',
    'Investment': '📈', 'Other': '📦',
  }
  return map[cat] || '💳'
}
