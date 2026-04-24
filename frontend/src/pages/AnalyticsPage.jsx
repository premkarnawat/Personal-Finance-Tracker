import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from 'recharts'
import { useAnalytics } from '../hooks/useData'
import { formatCurrency, formatMonth, CATEGORY_COLORS } from '../utils/format'

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-3 rounded-xl shadow-elevated p-3 min-w-[160px]">
      <p className="text-xs font-semibold text-ink-secondary mb-2">{formatMonth(label)}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-ink-secondary capitalize">{p.dataKey}</span>
          </div>
          <span className="text-xs font-bold text-ink-primary tabular-nums">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const { data, loading } = useAnalytics(dateRange)

  const summary = data?.summary || {}

  const summaryCards = [
    { label: 'Total Income', value: summary.totalIncome || 0, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Expenses', value: summary.totalExpenses || 0, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Net Savings', value: summary.netSavings || 0, color: summary.netSavings >= 0 ? 'text-brand-600' : 'text-danger', bg: 'bg-brand-50' },
    { label: 'Savings Rate', value: null, rate: summary.savingsRate || 0, color: (summary.savingsRate || 0) >= 0 ? 'text-brand-600' : 'text-danger', bg: 'bg-brand-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-header">Analytics</h1>
          <p className="text-sm text-ink-tertiary mt-0.5">Insights into your financial health</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
              className="input-field text-sm"
              placeholder="From"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
              className="input-field text-sm"
            />
          </div>
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="btn-secondary text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="stat-card"
          >
            <p className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide mb-3">{card.label}</p>
            {loading ? (
              <div className="skeleton h-8 w-24 rounded" />
            ) : card.value !== null ? (
              <p className={`text-xl font-bold tabular-nums ${card.color}`}>{formatCurrency(card.value)}</p>
            ) : (
              <p className={`text-xl font-bold tabular-nums ${card.color}`}>{card.rate?.toFixed(1)}%</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie chart - spending by category */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <p className="section-label mb-6">Spending by Category</p>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data?.spendingByCategory?.length ? (
            <div className="flex items-center justify-center h-64 text-ink-tertiary text-sm">
              No expense data available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.spendingByCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    labelLine={false}
                    label={renderCustomLabel}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {data.spendingByCategory.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.spendingByCategory.slice(0, 6).map((entry) => {
                  const total = data.spendingByCategory.reduce((s, e) => s + e.amount, 0)
                  return (
                    <div key={entry.category} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.category] || '#94a3b8' }} />
                      <span className="text-xs text-ink-secondary flex-1 truncate">{entry.category}</span>
                      <span className="text-xs text-ink-tertiary">{((entry.amount / total) * 100).toFixed(1)}%</span>
                      <span className="text-xs font-semibold text-ink-primary tabular-nums">{formatCurrency(entry.amount)}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Savings rate */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <p className="section-label mb-6">Savings Rate Gauge</p>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="skeleton w-48 h-48 rounded-full" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 gap-6">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={(summary.savingsRate || 0) >= 0 ? '#0ea5e9' : '#ef4444'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.abs(Math.min(summary.savingsRate || 0, 100)) * 2.639} 263.9`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold tabular-nums ${(summary.savingsRate || 0) >= 0 ? 'text-brand-600' : 'text-danger'}`}>
                    {(summary.savingsRate || 0).toFixed(1)}%
                  </span>
                  <span className="text-xs text-ink-tertiary mt-1">Savings Rate</span>
                </div>
              </div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${(summary.savingsRate || 0) >= 20 ? 'text-success' : (summary.savingsRate || 0) >= 10 ? 'text-warning' : 'text-danger'}`}>
                  {(summary.savingsRate || 0) >= 20 ? '🟢 Excellent' : (summary.savingsRate || 0) >= 10 ? '🟡 Good' : '🔴 Needs attention'}
                </p>
                <p className="text-xs text-ink-tertiary mt-1">Aim for 20%+ savings rate</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly income vs expenses */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <p className="section-label mb-6">Monthly Income vs Expenses</p>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.monthlyData?.length ? (
          <div className="flex items-center justify-center h-64 text-ink-tertiary text-sm">
            No monthly data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                formatter={(value) => <span className="capitalize text-ink-secondary">{value}</span>}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  )
}
