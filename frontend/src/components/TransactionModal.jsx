import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { CATEGORIES } from '../utils/format'

const defaultForm = {
  type: 'expense',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
}

export default function TransactionModal({ open, onClose, onSuccess, transaction }) {
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const isEdit = !!transaction

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        date: new Date(transaction.date).toISOString().split('T')[0],
        description: transaction.description || '',
      })
    } else {
      setForm(defaultForm)
    }
  }, [transaction, open])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || !form.category || !form.date) {
      toast.error('Amount, category, and date are required')
      return
    }
    if (parseFloat(form.amount) <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/transactions/${transaction.id}`, {
          ...form,
          amount: parseFloat(form.amount),
        })
        toast.success('Transaction updated')
      } else {
        await api.post('/transactions', {
          ...form,
          amount: parseFloat(form.amount),
        })
        toast.success('Transaction added')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-surface-3">
                <h2 className="text-base font-bold text-ink-primary">
                  {isEdit ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-2 transition-colors text-ink-tertiary"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Type toggle */}
                <div>
                  <label className="label">Type</label>
                  <div className="flex gap-2 p-1 bg-surface-2 rounded-xl">
                    {['expense', 'income'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type })}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${
                          form.type === type
                            ? type === 'income'
                              ? 'bg-white text-success shadow-soft'
                              : 'bg-white text-danger shadow-soft'
                            : 'text-ink-tertiary hover:text-ink-secondary'
                        }`}
                      >
                        {type === 'income' ? '↑ Income' : '↓ Expense'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="label" htmlFor="amount">Amount (₹)</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="label" htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="label" htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="label" htmlFor="description">Description <span className="text-ink-tertiary normal-case font-normal">(optional)</span></label>
                  <input
                    id="description"
                    name="description"
                    type="text"
                    value={form.description}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. Lunch with team"
                    maxLength={200}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isEdit ? 'Save changes' : 'Add transaction'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
