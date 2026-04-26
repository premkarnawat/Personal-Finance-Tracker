export function formatCurrency(amount = 0, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `Today, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
  if (hours < 48) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatMonth(monthStr = '') {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-IN', { month: 'short' })
}

export const CATEGORY_COLORS = {
  'Food & Dining':    '#f97316',
  'Transportation':   '#06b6d4',
  'Housing & Rent':   '#7c3aed',
  'Healthcare':       '#10b981',
  'Entertainment':    '#ec4899',
  'Shopping':         '#f59e0b',
  'Education':        '#3b82f6',
  'Travel':           '#8b5cf6',
  'Utilities':        '#14b8a6',
  'Savings':          '#22c55e',
  'Salary':           '#6366f1',
  'Freelance':        '#a855f7',
  'Investment':       '#0ea5e9',
  'Other':            '#94a3b8',
}

export const CATEGORIES = Object.keys(CATEGORY_COLORS)
