import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const GOAL_ICONS = {
  Education: '🎓',
  Vacation: '✈️',
  Savings: '💰',
  Emergency: '🛡️',
  Home: '🏠',
  Car: '🚗',
  Other: '⭐',
}

const GOAL_COLORS = {
  Education: '#06b6d4',
  Vacation: '#10b981',
  Savings: '#0ea5e9',
  Emergency: '#f59e0b',
  Home: '#8b5cf6',
  Car: '#f97316',
  Other: '#94a3b8',
}

const STORAGE_KEY = 'fintra-goals'

function loadGoals() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function saveGoals(goals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

const defaultForm = { name: '', category: 'Savings', target: '', saved: '', deadline: '' }

function GoalModal({ open, onClose, onSave, goal }) {
  const [form, setForm] = useState(defaultForm)
  const isEdit = !!goal

  useEffect(() => {
    setForm(goal ? { ...goal } : defaultForm)
  }, [goal, open])

  if (!open) return null

  const handleSubmit = () => {
    if (!form.name || !form.target || parseFloat(form.target) <= 0) {
      toast.error('Goal name and target amount are required')
      return
    }
    onSave({
      ...form,
      id: goal?.id || Date.now().toString(),
      target: parseFloat(form.target),
      saved: parseFloat(form.saved) || 0,
      createdAt: goal?.createdAt || new Date().toISOString(),
    })
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isEdit ? 'Edit Goal' : 'Set New Goal'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card2)' }}>
              <svg className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="label">Goal Name</label>
              <input className="input-field" placeholder="e.g. Europe Trip" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {Object.keys(GOAL_ICONS).map(c => <option key={c} value={c}>{GOAL_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Target Amount (₹)</label>
                <input type="number" className="input-field" placeholder="50000" value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })} />
              </div>
              <div>
                <label className="label">Saved So Far (₹)</label>
                <input type="number" className="input-field" placeholder="0" value={form.saved}
                  onChange={(e) => setForm({ ...form, saved: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Target Date (optional)</label>
              <input type="date" className="input-field" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-1">
              <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
              <button className="btn-primary flex-1" onClick={handleSubmit}>
                {isEdit ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState(loadGoals)
  const [modalOpen, setModalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState(null)

  const handleSave = (goal) => {
    const updated = editGoal
      ? goals.map(g => g.id === goal.id ? goal : g)
      : [...goals, goal]
    setGoals(updated)
    saveGoals(updated)
    setModalOpen(false)
    setEditGoal(null)
    toast.success(editGoal ? 'Goal updated!' : 'Goal created! 🎯')
  }

  const handleDelete = (id) => {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)
    saveGoals(updated)
    toast.success('Goal removed')
  }

  const handleAddSavings = (id, amount) => {
    const updated = goals.map(g => g.id === id
      ? { ...g, saved: Math.min(g.saved + amount, g.target) }
      : g)
    setGoals(updated)
    saveGoals(updated)
  }

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Financial Goals</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Track your savings progress</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm"
          onClick={() => { setEditGoal(null); setModalOpen(true) }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      {!goals.length ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No goals yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>Set a financial goal to track your savings progress</p>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>Set your first goal</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal, i) => {
            const pct = Math.min((goal.saved / goal.target) * 100, 100)
            const color = GOAL_COLORS[goal.category] || '#94a3b8'
            const remaining = goal.target - goal.saved
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000)
              : null

            return (
              <motion.div key={goal.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{GOAL_ICONS[goal.category] || '⭐'}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{goal.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{goal.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {pct >= 100 && <span className="text-xs font-semibold text-success px-2 py-0.5 rounded-full bg-success/10">Done ✓</span>}
                    <button onClick={() => { setEditGoal(goal); setModalOpen(true) }}
                      className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-card2)]">
                      <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(goal.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-danger/10">
                      <svg className="w-3.5 h-3.5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      ₹{goal.saved.toLocaleString('en-IN')} saved
                    </span>
                    <span className="text-xs font-bold" style={{ color }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <motion.div className="progress-fill" style={{ background: color }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      ₹{remaining.toLocaleString('en-IN')} remaining
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      ₹{goal.target.toLocaleString('en-IN')} goal
                    </span>
                  </div>
                </div>

                {daysLeft !== null && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <svg className="w-3.5 h-3.5" style={{ color: daysLeft < 30 ? '#ef4444' : 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs" style={{ color: daysLeft < 30 ? '#ef4444' : 'var(--text-tertiary)' }}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                    </span>
                  </div>
                )}

                {/* Quick add savings */}
                {pct < 100 && (
                  <div className="flex gap-2">
                    {[500, 1000, 5000].map(amt => (
                      <button key={amt} onClick={() => handleAddSavings(goal.id, amt)}
                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all active:scale-95"
                        style={{ background: `${color}18`, color }}>
                        +₹{(amt/100).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      <GoalModal open={modalOpen} onClose={() => { setModalOpen(false); setEditGoal(null) }}
        onSave={handleSave} goal={editGoal} />
    </div>
  )
}
