import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useTransactions } from '../hooks/useData'
import { formatCurrency, formatDate, CATEGORIES, CATEGORY_COLORS } from '../utils/format'
import TransactionModal from '../components/TransactionModal'

function DeleteConfirm({ open, onClose, onConfirm, loading }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-ink-primary mb-1">Delete transaction?</h3>
              <p className="text-sm text-ink-secondary mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 bg-danger hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [deleteTx, setDeleteTx] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const { transactions, pagination, loading, refetch } = useTransactions(filters)

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }))
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/transactions/${deleteTx.id}`)
      toast.success('Transaction deleted')
      setDeleteTx(null)
      refetch()
    } catch {
      toast.error('Failed to delete transaction')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.category) params.append('category', filters.category)
      if (filters.type) params.append('type', filters.type)

      const token = localStorage.getItem('token')
      const res = await fetch(`/export/csv?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exported successfully')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-header">Transactions</h1>
          <p className="text-sm text-ink-tertiary mt-0.5">
            {pagination ? `${pagination.total} total transactions` : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-ink-secondary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Export CSV
          </button>
          <button
            onClick={() => { setEditTx(null); setModalOpen(true) }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <p className="section-label mb-4">Filters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">From date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">To date</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>
        {(filters.startDate || filters.endDate || filters.category || filters.type) && (
          <button
            onClick={() => setFilters({ page: 1, limit: 20 })}
            className="mt-3 text-xs text-brand-600 font-semibold hover:text-brand-700"
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* Transactions list */}
      <div className="card">
        {loading ? (
          <div className="space-y-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-40 mb-2 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
                <div className="skeleton h-5 w-24 rounded" />
                <div className="skeleton h-7 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : transactions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-ink-secondary mb-1">No transactions found</p>
            <p className="text-xs text-ink-tertiary">
              {Object.keys(filters).some(k => !['page', 'limit'].includes(k) && filters[k])
                ? 'Try adjusting your filters'
                : 'Add your first transaction to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-surface-2 mb-2">
              <div className="col-span-3 section-label">Category</div>
              <div className="col-span-3 section-label">Description</div>
              <div className="col-span-2 section-label">Date</div>
              <div className="col-span-2 section-label">Type</div>
              <div className="col-span-1 section-label text-right">Amount</div>
              <div className="col-span-1" />
            </div>

            <div className="divide-y divide-surface-2">
              <AnimatePresence>
                {transactions.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: i * 0.03 }}
                    className="py-3 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center flex flex-col gap-2"
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${CATEGORY_COLORS[t.category] || '#94a3b8'}18` }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#94a3b8' }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-primary">{t.category}</p>
                          <p className="text-xs text-ink-tertiary">{formatDate(t.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditTx(t); setModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-tertiary transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => setDeleteTx(t)} className="p-1.5 rounded-lg hover:bg-danger/10 text-ink-tertiary hover:text-danger transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:flex col-span-3 items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${CATEGORY_COLORS[t.category] || '#94a3b8'}18` }}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#94a3b8' }} />
                      </div>
                      <span className="text-sm font-semibold text-ink-primary truncate">{t.category}</span>
                    </div>
                    <div className="hidden sm:block col-span-3 text-sm text-ink-secondary truncate">{t.description || '—'}</div>
                    <div className="hidden sm:block col-span-2 text-sm text-ink-secondary">{formatDate(t.date)}</div>
                    <div className="hidden sm:block col-span-2">
                      <span className={t.type === 'income' ? 'badge-income' : 'badge-expense'}>
                        {t.type === 'income' ? '↑ Income' : '↓ Expense'}
                      </span>
                    </div>
                    <div className={`hidden sm:block col-span-1 text-sm font-bold tabular-nums text-right ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <div className="hidden sm:flex col-span-1 items-center justify-end gap-1">
                      <button onClick={() => { setEditTx(t); setModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-tertiary transition-colors" title="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setDeleteTx(t)} className="p-1.5 rounded-lg hover:bg-danger/10 text-ink-tertiary hover:text-danger transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-2">
                <p className="text-xs text-ink-tertiary">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    className="btn-secondary text-xs px-4 py-2 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTx(null) }}
        onSuccess={refetch}
        transaction={editTx}
      />

      <DeleteConfirm
        open={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
