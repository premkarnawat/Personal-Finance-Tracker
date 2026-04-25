import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatCurrency } from '../utils/format'

const STORAGE_KEY = 'fintra-loans'
function loadLoans() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] } }
function saveLoans(l) { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)) }

const defaultForm = { name: '', lender: '', totalAmount: '', paidAmount: '', emi: '', interestRate: '', startDate: '', endDate: '', type: 'Personal' }
const LOAN_TYPES = ['Personal', 'Home', 'Car', 'Education', 'Business', 'Other']
const TYPE_COLORS = { Personal: '#8b5cf6', Home: '#10b981', Car: '#f97316', Education: '#06b6d4', Business: '#0ea5e9', Other: '#94a3b8' }

function LoanModal({ open, onClose, onSave, loan }) {
  const [form, setForm] = useState(defaultForm)
  const isEdit = !!loan

  useEffect(() => { setForm(loan ? { ...loan } : defaultForm) }, [loan, open])
  if (!open) return null

  const handleSubmit = () => {
    if (!form.name || !form.totalAmount) { toast.error('Loan name and amount required'); return }
    onSave({
      ...form,
      id: loan?.id || Date.now().toString(),
      totalAmount: parseFloat(form.totalAmount),
      paidAmount: parseFloat(form.paidAmount) || 0,
      emi: parseFloat(form.emi) || 0,
      interestRate: parseFloat(form.interestRate) || 0,
      createdAt: loan?.createdAt || new Date().toISOString(),
    })
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Edit Loan' : 'Add Loan'}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card2)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="label">Loan Name</label>
              <input className="input-field" placeholder="e.g. Home Renovation" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Loan Type</label>
                <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Lender / Bank</label>
                <input className="input-field" placeholder="HDFC Bank" value={form.lender} onChange={e => setForm({ ...form, lender: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Total Amount (₹)</label>
                <input type="number" className="input-field" placeholder="100000" value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} />
              </div>
              <div>
                <label className="label">Amount Paid (₹)</label>
                <input type="number" className="input-field" placeholder="0" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Monthly EMI (₹)</label>
                <input type="number" className="input-field" placeholder="5000" value={form.emi} onChange={e => setForm({ ...form, emi: e.target.value })} />
              </div>
              <div>
                <label className="label">Interest Rate (%)</label>
                <input type="number" className="input-field" placeholder="10.5" step="0.1" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
              <button className="btn-primary flex-1" onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Add Loan'}</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function LoansPage() {
  const [loans, setLoans] = useState(loadLoans)
  const [modalOpen, setModalOpen] = useState(false)
  const [editLoan, setEditLoan] = useState(null)

  const handleSave = (loan) => {
    const updated = editLoan ? loans.map(l => l.id === loan.id ? loan : l) : [...loans, loan]
    setLoans(updated); saveLoans(updated)
    setModalOpen(false); setEditLoan(null)
    toast.success(editLoan ? 'Loan updated!' : 'Loan added!')
  }

  const handleDelete = (id) => {
    const updated = loans.filter(l => l.id !== id)
    setLoans(updated); saveLoans(updated)
    toast.success('Loan deleted')
  }

  const handlePayEMI = (id) => {
    const loan = loans.find(l => l.id === id)
    if (!loan) return
    const updated = loans.map(l => l.id === id
      ? { ...l, paidAmount: Math.min(l.paidAmount + (l.emi || 0), l.totalAmount) } : l)
    setLoans(updated); saveLoans(updated)
    toast.success(`EMI of ${formatCurrency(loan.emi)} recorded!`)
  }

  const totalDebt = loans.reduce((s, l) => s + (l.totalAmount - l.paidAmount), 0)
  const totalLoans = loans.reduce((s, l) => s + l.totalAmount, 0)
  const totalPaid = loans.reduce((s, l) => s + l.paidAmount, 0)

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Loan Manager</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Track all your loans & EMIs</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm"
          onClick={() => { setEditLoan(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Loan
        </button>
      </div>

      {/* Summary row */}
      {loans.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Loans', value: totalLoans, color: 'var(--text-primary)' },
            { label: 'Total Paid', value: totalPaid, color: '#10b981' },
            { label: 'Outstanding', value: totalDebt, color: '#ef4444' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
              <p className="text-base font-black tabular-nums" style={{ color: s.color }}>
                {formatCurrency(s.value)}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {!loans.length ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center py-16">
          <div className="text-5xl mb-4">💳</div>
          <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No loans added</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>Track your loans and EMIs in one place</p>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>Add your first loan</button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan, i) => {
            const pct = Math.min((loan.paidAmount / loan.totalAmount) * 100, 100)
            const remaining = loan.totalAmount - loan.paidAmount
            const color = TYPE_COLORS[loan.type] || '#94a3b8'
            const daysLeft = loan.endDate
              ? Math.ceil((new Date(loan.endDate) - new Date()) / 86400000)
              : null
            const emisLeft = loan.emi > 0 ? Math.ceil(remaining / loan.emi) : null

            return (
              <motion.div key={loan.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                      {loan.type.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{loan.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{loan.lender || loan.type} Loan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {pct >= 100 && (
                      <span className="text-xs font-bold text-success px-2 py-0.5 rounded-full bg-success/10 mr-1">Paid ✓</span>
                    )}
                    <button onClick={() => { setEditLoan(loan); setModalOpen(true) }}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card2)] transition-colors">
                      <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(loan.id)}
                      className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors">
                      <svg className="w-3.5 h-3.5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Amounts grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card2)' }}>
                    <p className="text-[10px] mb-1" style={{ color: 'var(--text-tertiary)' }}>Total</p>
                    <p className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(loan.totalAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card2)' }}>
                    <p className="text-[10px] mb-1" style={{ color: 'var(--text-tertiary)' }}>Paid</p>
                    <p className="text-xs font-bold tabular-nums text-success">{formatCurrency(loan.paidAmount)}</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card2)' }}>
                    <p className="text-[10px] mb-1" style={{ color: 'var(--text-tertiary)' }}>Left</p>
                    <p className="text-xs font-bold tabular-nums text-danger">{formatCurrency(remaining)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Repayment progress</span>
                    <span className="text-xs font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div className="progress-fill" style={{ background: color }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: 'easeOut' }} />
                  </div>
                </div>

                {/* Info row */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {loan.emi > 0 && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        EMI: <strong>{formatCurrency(loan.emi)}/mo</strong>
                        {emisLeft ? ` · ${emisLeft} left` : ''}
                      </span>
                    </div>
                  )}
                  {loan.interestRate > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Rate: <strong>{loan.interestRate}% p.a.</strong>
                      </span>
                    </div>
                  )}
                  {daysLeft !== null && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: daysLeft < 60 ? '#ef4444' : 'var(--text-tertiary)' }}>
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Overdue!'}
                      </span>
                    </div>
                  )}
                </div>

                {/* EMI button */}
                {pct < 100 && loan.emi > 0 && (
                  <button onClick={() => handlePayEMI(loan.id)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={{ background: `${color}18`, color }}>
                    ✓ Mark EMI Paid ({formatCurrency(loan.emi)})
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      <LoanModal open={modalOpen} onClose={() => { setModalOpen(false); setEditLoan(null) }}
        onSave={handleSave} loan={editLoan} />
    </div>
  )
}
