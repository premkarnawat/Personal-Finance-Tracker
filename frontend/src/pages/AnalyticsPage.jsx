import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell as BarCell,
} from 'recharts'
import { useAnalytics } from '../hooks/useData'
import { useTransactions } from '../hooks/useData'
import { formatCurrency, formatMonth, CATEGORY_COLORS } from '../utils/format'
import { Link } from 'react-router-dom'

// Multi-color donut matching the design (red, cyan, orange, purple, green, pink)
const DONUT_COLORS = ['#ef4444', '#06b6d4', '#f97316', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b', '#3b82f6']

// Category chip colors matching design (small colored dot)
const CHIP_COLORS = {
  'Groceries':      '#8b5cf6',
  'Shopping':       '#f97316',
  'Rent':           '#ef4444',
  'Fuel':           '#06b6d4',
  'Other Expenses': '#f59e0b',
  'Food & Dining':  '#f97316',
  'Transportation': '#06b6d4',
  'Housing & Rent': '#ef4444',
  'Healthcare':     '#10b981',
  'Entertainment':  '#ec4899',
  'Education':      '#3b82f6',
  'Travel':         '#8b5cf6',
  'Utilities':      '#64748b',
  'Savings':        '#22c55e',
  'Salary':         '#6366f1',
  'Freelance':      '#a855f7',
  'Investment':     '#14b8a6',
  'Other':          '#f59e0b',
}

// Progress bar colors per category
const BAR_COLORS = [
  '#8b5cf6', '#f97316', '#ef4444', '#06b6d4',
  '#10b981', '#ec4899', '#f59e0b', '#3b82f6',
]

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

// Center label rendered inside donut
function DonutCenterLabel({ cx, cy, total }) {
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Sora,sans-serif">
        Total Balance
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#1a1a2e" fontSize="17" fontWeight="700" fontFamily="Sora,sans-serif">
        {formatCurrency(total)}
      </text>
    </g>
  )
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState('expense')
  const [period, setPeriod] = useState('week')
  const { data: analytics, loading } = useAnalytics()
  const { transactions, loading: txLoading } = useTransactions({ limit: 5 })

  const categoryData = analytics?.spendingByCategory || []
  const monthlyData  = analytics?.monthlyData || []
  const totalExpenses = analytics?.summary?.totalExpenses || 0
  const totalIncome   = analytics?.summary?.totalIncome  || 0
  const displayTotal  = tab === 'expense' ? totalExpenses : totalIncome

  // Bar chart: show last 7 months or simulated week days
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const barData = monthlyData.length >= 2
    ? monthlyData.slice(-7).map((m, i) => ({
        label: formatMonth(m.month).split(' ')[0],
        value: tab === 'expense' ? (m.expense || 0) : (m.income || 0),
      }))
    : weekDays.map((d) => ({ label: d, value: 0 }))

  // Insight: compare last two periods
  const insightDiff = barData.length >= 2
    ? barData[barData.length - 1].value - barData[barData.length - 2].value
    : 0

  return (
    <div
      className="max-w-md mx-auto pb-10"
      style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #fef9f0 100%)', minHeight: '100vh' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-2 pb-4 px-1">
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1a1a2e' }}>
          Statistics
        </h1>
        {/* Bell icon */}
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-sm">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full border border-white" />
        </button>
      </div>

      {/* ── Expense / Income Toggle ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex rounded-2xl overflow-hidden mb-5"
        style={{ background: '#ede9fe', padding: '4px' }}
      >
        {['expense', 'income'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize"
            style={{
              background: tab === t ? '#2d1b69' : 'transparent',
              color: tab === t ? '#ffffff' : '#64748b',
              boxShadow: tab === t ? '0 2px 8px rgba(45,27,105,0.3)' : 'none',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* ── Total + Bar Chart Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-5 mb-4 shadow-sm"
      >
        <div className="flex items-end justify-between mb-3">
          <div>
            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
              Total {tab === 'expense' ? 'Expenses' : 'Income'}
            </p>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }} className="tabular-nums">
              {loading ? '—' : formatCurrency(displayTotal)}
            </p>
          </div>
          {/* Period selector */}
          <div
            className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
            style={{ color: '#1a1a2e' }}
            onClick={() => setPeriod(p => p === 'week' ? 'month' : 'week')}
          >
            {period === 'week' ? 'Week' : 'Month'}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={barData} barCategoryGap="30%" margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} horizontal={true} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Sora,sans-serif' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Sora,sans-serif' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => v === 0 ? '0' : `${Math.round(v / 100)}`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(139,92,246,0.06)', radius: 6 }}
              formatter={(v) => [formatCurrency(v), tab === 'expense' ? 'Expense' : 'Income']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }}
            />
            <Bar dataKey="value" radius={[6, 6, 4, 4]} maxBarSize={32}>
              {barData.map((entry, i) => (
                <BarCell
                  key={i}
                  fill={i === barData.length - 1 ? '#8b5cf6' : '#ddd6fe'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Insight Strip ── */}
      {barData.some(d => d.value > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
          style={{ background: '#fef08a' }}
        >
          <span style={{ fontSize: '12px', color: '#713f12', fontWeight: 500 }}>
            This week {tab === 'expense' ? 'Expense' : 'Income'}
          </span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold text-white"
            style={{ background: insightDiff <= 0 ? '#22c55e' : '#ef4444', minWidth: 60, justifyContent: 'center' }}
          >
            {insightDiff <= 0 ? '↓' : '↑'} {formatCurrency(Math.abs(insightDiff))}
          </span>
          <span style={{ fontSize: '12px', color: '#713f12', fontWeight: 500 }}>
            than last {period}
          </span>
        </motion.div>
      )}

      {/* ── Recent Transactions ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="bg-white rounded-3xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>Recent Transactions</h2>
          <Link to="/transactions" style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>View all</Link>
        </div>

        {txLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-32" />
                  <div className="h-2 bg-gray-100 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : !transactions?.length ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">💳</p>
            <p className="text-sm text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, i) => {
              const color = CATEGORY_COLORS[tx.category] || '#94a3b8'
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  {/* Icon circle */}
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: color + '18' }}
                  >
                    {getCategoryEmoji(tx.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }} className="truncate">
                      {tx.description || tx.category}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {tx.category} · {new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: '13px', fontWeight: 700,
                      color: tx.type === 'income' ? '#22c55e' : '#ef4444',
                    }}
                    className="tabular-nums"
                  >
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
