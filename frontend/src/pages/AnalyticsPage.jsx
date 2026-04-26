import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAnalytics } from '../hooks/useData'
import { formatCurrency, formatMonth, CATEGORY_COLORS } from '../utils/format'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const DONUT_COLORS = ['#7c3aed', '#f97316', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#a855f7']

const stagger = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.3 },
})

function CategoryBudgetCard({ name, amount, total, color, emoji }) {
  const pct = total > 0 ? Math.min(100, Math.round((amount / total) * 100)) : 0
  const budget = amount * 1.4 // simulated budget = 140% of spend
  const left = budget - amount
  const leftPct = Math.round((left / budget) * 100)

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <p className="text-sm font-semibold text-gray-800">{name}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-1">{formatCurrency(left)} Left</p>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${leftPct}%`, background: color }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1 text-right">{leftPct}%</p>
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

export default function AnalyticsPage() {
  const [tab, setTab] = useState('expense')
  const [period, setPeriod] = useState('week')
  const { data: analytics, loading } = useAnalytics()

  const categoryData = analytics?.spendingByCategory || []
  const monthlyData = analytics?.monthlyData || []
  const totalExpenses = analytics?.summary?.totalExpenses || 0
  const totalIncome = analytics?.summary?.totalIncome || 0

  const displayTotal = tab === 'expense' ? totalExpenses : totalIncome

  const barData = monthlyData.slice(-7).map(m => ({
    label: m.month,
    value: tab === 'expense' ? m.expense : m.income,
  }))

  return (
    <div className="max-w-lg mx-auto lg:max-w-4xl">
      {/* Header */}
      <motion.div {...stagger(0)} className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Statistics</h1>
        <button className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
          <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </motion.div>

      {/* Tab Toggle — exact match to design */}
      <motion.div {...stagger(1)} className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        {['expense', 'income'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
              tab === t
                ? 'bg-[#2d1b69] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Total + Donut */}
      <motion.div {...stagger(2)} className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100">
        <div className="text-center mb-2">
          <p className="text-xs text-gray-400 mb-1">Total {tab === 'expense' ? 'Expenses' : 'Income'}</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{formatCurrency(displayTotal)}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categoryData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={95}
                  paddingAngle={2}
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
            <div className="flex flex-wrap gap-2 justify-center">
              {categoryData.map((c, i) => (
                <span key={c.category} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  {c.category}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">No data yet</div>
        )}
      </motion.div>

      {/* Bar Chart */}
      <motion.div {...stagger(3)} className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400">Total {tab === 'expense' ? 'Expenses' : 'Income'}</p>
            <p className="text-xl font-bold text-gray-900 tabular-nums">{formatCurrency(displayTotal)}</p>
          </div>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="text-xs font-medium text-gray-500 bg-gray-100 rounded-xl px-3 py-2 border-0 focus:outline-none cursor-pointer"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={i === barData.length - 1 ? '#7c3aed' : '#c4b5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">Not enough data for chart</div>
        )}

        {/* Insight chip */}
        {barData.length >= 2 && (() => {
          const last = barData[barData.length - 1]?.value || 0
          const prev = barData[barData.length - 2]?.value || 0
          const diff = last - prev
          return (
            <div className="mt-3 flex items-center gap-2 bg-amber-50 rounded-xl p-3 flex-wrap">
              <span className="text-xs text-gray-600">This week {tab}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg text-white ${diff <= 0 ? 'bg-green-500' : 'bg-red-400'}`}>
                {diff <= 0 ? `▼ ${formatCurrency(Math.abs(diff))}` : `▲ ${formatCurrency(diff)}`}
              </span>
              <span className="text-xs text-gray-400">than last period</span>
            </div>
          )
        })()}
      </motion.div>

      {/* Category Budget Cards */}
      {categoryData.length > 0 && (
        <motion.div {...stagger(4)}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Categories</h2>
            <button className="text-xs font-semibold text-white bg-[#2d1b69] px-3 py-1.5 rounded-xl">+ Add More</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categoryData.slice(0, 6).map((c, i) => (
              <motion.div key={c.category} {...stagger(5 + i)}>
                <CategoryBudgetCard
                  name={c.category}
                  amount={c.amount}
                  total={totalExpenses}
                  color={DONUT_COLORS[i % DONUT_COLORS.length]}
                  emoji={getCategoryEmoji(c.category)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )

}
