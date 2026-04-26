import { useState } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAnalytics } from '../hooks/useData'
import { formatCurrency, CATEGORY_COLORS } from '../utils/format'

// Each ring gets a distinct bright color matching design reference
const RING_COLORS = [
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#8b5cf6', // purple
  '#10b981', // green
  '#ec4899', // pink
  '#f59e0b', // amber
  '#3b82f6', // blue
]

// Progress bar colors per category
const PROGRESS_COLORS = [
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

// Multi-ring concentric donut chart — each category = own ring
function MultiRingDonut({ categories, total }) {
  const maxAmount = Math.max(...categories.map(c => c.amount), 1)
  const size = 260
  const cx = size / 2
  const cy = size / 2
  const ringGap = 10
  const ringWidth = 12

  // Innermost ring starts at r=50, each successive ring +22
  const rings = categories.slice(0, 6).map((cat, i) => {
    const r = 50 + i * (ringWidth + ringGap)
    const pct = cat.amount / maxAmount
    const circumference = 2 * Math.PI * r
    const dash = pct * circumference * 0.85 // 85% fill max so gaps show
    return { ...cat, r, circumference, dash, color: RING_COLORS[i] }
  })

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {rings.map((ring, i) => (
          <g key={ring.category}>
            {/* Background track */}
            <circle
              cx={cx} cy={cy} r={ring.r}
              fill="none" stroke="#f1f5f9" strokeWidth={ringWidth}
            />
            {/* Colored arc */}
            <circle
              cx={cx} cy={cy} r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth={ringWidth}
              strokeLinecap="round"
              strokeDasharray={`${ring.dash} ${ring.circumference}`}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{
                transition: 'stroke-dasharray 1s ease-out',
                filter: `drop-shadow(0 0 4px ${ring.color}40)`,
              }}
            />
          </g>
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 12} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Sora,sans-serif" fontWeight="500">
          Total Balance
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#1a1a2e" fontSize="16" fontFamily="Sora,sans-serif" fontWeight="700">
          {formatCurrency(total)}
        </text>
      </svg>
    </div>
  )
}

// Category chip row under the donut
function CategoryChips({ categories }) {
  // Show up to 5 chips
  const chips = categories.slice(0, 5).map((cat, i) => ({
    name: cat.category,
    color: RING_COLORS[i],
  }))

  // Group into rows matching design (row1: 3 chips, row2: 2 chips)
  const row1 = chips.slice(0, 3)
  const row2 = chips.slice(3)

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="flex gap-2 flex-wrap justify-center">
        {row1.map(chip => (
          <span
            key={chip.name}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: '#f8f7ff', color: '#374151', border: '1px solid #e5e7eb' }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: chip.color }} />
            {chip.name}
          </span>
        ))}
      </div>
      {row2.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {row2.map(chip => (
            <span
              key={chip.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: '#f8f7ff', color: '#374151', border: '1px solid #e5e7eb' }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: chip.color }} />
              {chip.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Single category budget card — matches design exactly
function CategoryCard({ cat, amount, total, colorIndex }) {
  const color = PROGRESS_COLORS[colorIndex % PROGRESS_COLORS.length]
  // Simulated budget = 140% of spend
  const budget = amount * 1.4
  const left = Math.max(0, budget - amount)
  const pct = Math.min(100, Math.round((left / budget) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: colorIndex * 0.05 }}
      className="bg-white rounded-2xl p-4"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{cat}</span>
        {/* Small colored progress circle */}
        <div
          className="w-5 h-5 rounded-full flex-shrink-0"
          style={{
            background: `conic-gradient(${color} ${pct * 3.6}deg, #f1f5f9 0deg)`,
          }}
        />
      </div>
      <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
        {formatCurrency(left)} Left
      </p>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: colorIndex * 0.08, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{pct}%</p>
    </motion.div>
  )
}

export default function BudgetPage() {
  const { data: analytics, loading } = useAnalytics()

  const categoryData = analytics?.spendingByCategory || []
  const totalExpenses = analytics?.summary?.totalExpenses || 0

  return (
    <div
      className="max-w-md mx-auto pb-10"
      style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #fef9f0 100%)', minHeight: '100vh' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between pt-2 pb-4 px-1">
        <h1 style={{ fontFamily: 'Sora,sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#1a1a2e' }}>
          Budget Management
        </h1>
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-sm">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full border border-white" />
        </button>
      </div>

      {/* ── Multi-ring Donut ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl p-5 mb-4 shadow-sm flex flex-col items-center"
      >
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categoryData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-sm text-gray-400">No expense data yet</p>
            <p className="text-xs text-gray-300 mt-1">Add transactions to see your budget breakdown</p>
          </div>
        ) : (
          <>
            <MultiRingDonut categories={categoryData} total={totalExpenses} />
            <CategoryChips categories={categoryData} />
          </>
        )}
      </motion.div>

      {/* ── Categories Section ── */}
      {categoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>Categories</h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-white text-xs font-semibold"
              style={{ background: '#2d1b69', boxShadow: '0 2px 8px rgba(45,27,105,0.3)' }}
            >
              Add More
            </motion.button>
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-3">
            {categoryData.map((cat, i) => (
              <CategoryCard
                key={cat.category}
                cat={cat.category}
                amount={cat.amount}
                total={totalExpenses}
                colorIndex={i}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

