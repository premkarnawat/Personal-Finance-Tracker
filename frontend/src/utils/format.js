export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Rent',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Utilities',
  'Savings',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
]

export const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  'Transportation': '#3b82f6',
  'Housing & Rent': '#8b5cf6',
  'Healthcare': '#ef4444',
  'Entertainment': '#ec4899',
  'Shopping': '#f59e0b',
  'Education': '#06b6d4',
  'Travel': '#10b981',
  'Utilities': '#64748b',
  'Savings': '#0ea5e9',
  'Salary': '#22c55e',
  'Freelance': '#a855f7',
  'Investment': '#14b8a6',
  'Other': '#94a3b8',
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-')
  return new Date(year, month - 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  })
}

export function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}
