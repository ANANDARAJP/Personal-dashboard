import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { goalApi } from '../services/api'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import ConfirmModal from '../components/common/ConfirmModal'

const GOAL_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED']
const GOAL_TYPES = ['SHORT_TERM', 'LONG_TERM']

const statusColors = {
  NOT_STARTED: 'badge-yellow',
  IN_PROGRESS: 'badge-blue',
  COMPLETED: 'badge-green',
  PAUSED: 'bg-slate-700 text-slate-300 badge',
  CANCELLED: 'badge-red',
}

function GoalModal({ goal, onClose, onSave }) {
  const [form, setForm] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    type: goal?.type || 'SHORT_TERM',
    status: goal?.status || 'NOT_STARTED',
    targetDate: goal?.targetDate || '',
    progressPercentage: goal?.progressPercentage || 0,
    category: goal?.category || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="border rounded-xl w-full max-w-lg" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">{goal ? 'Edit Goal' : 'New Goal'}</h2>
          <button onClick={onClose} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. Learn a new language" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" placeholder="Provide more details about your goal..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {GOAL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {GOAL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Date</label>
              <input type="date" className="input" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} />
            </div>
            <div>
              <label className="label">Progress ({form.progressPercentage}%)</label>
              <input type="range" min="0" max="100" className="w-full accent-primary-500" value={form.progressPercentage} onChange={e => setForm({...form, progressPercentage: Number(e.target.value)})} />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" placeholder="e.g. Health, Career, Finance" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Goal</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default function GoalsPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading } = useQuery('goals', () =>
    goalApi.getGoals({ size: 100 }).then(data => data || [])
  )

  const invalidateQueries = () => {
    queryClient.invalidateQueries('goals')
    queryClient.invalidateQueries('dashboard')
  }

  const createMutation = useMutation(goalApi.createGoal, {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Goal created!'); 
      setShowModal(false) 
    },
    onError: () => toast.error('Failed to create goal'),
  })

  const updateMutation = useMutation(({ id, data }) => goalApi.updateGoal(id, data), {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Goal updated!'); 
      setEditGoal(null) 
    },
    onError: () => toast.error('Failed to update goal'),
  })

  const deleteMutation = useMutation(goalApi.deleteGoal, {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Goal deleted') 
      setDeleteId(null)
    },
    onError: () => {
      toast.error('Failed to delete goal')
      setDeleteId(null)
    },
  })

  const goals = data || []
  const filtered = filter === 'ALL' ? goals : goals.filter(g => g.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold select-none">Goal Management</h1>
          <p className="text-slate-400 text-sm">Set, track, and achieve your long-term milestones and personal objectives.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Goal
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ALL', ...GOAL_STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              filter === s ? 'bg-primary-600 text-white border-primary-600' : 'hover:opacity-80'
            }`}
            style={filter !== s ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' } : {}}
          >
            {s === 'ALL' ? 'ALL' : s.replace(/_/g, ' ')}
            {s !== 'ALL' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({goals.filter(g => g.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p style={{ color: 'var(--text-muted)' }}>No goals found. Create your first goal!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(goal => (
            <div key={goal.id} className="card transition-colors hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{goal.title}</h3>
                  {goal.category && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{goal.category}</span>
                  )}
                </div>
                <span className={statusColors[goal.status] || 'badge'}>{(goal.status || '').replace(/_/g, ' ')}</span>
              </div>

              {goal.description && (
                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{goal.description}</p>
              )}

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  <span>Progress</span>
                  <span>{goal.progressPercentage}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${goal.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {goal.targetDate && `Due: ${new Date(goal.targetDate).toLocaleDateString()}`}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditGoal(goal)}
                    className="p-1.5 rounded transition-colors hover:text-blue-500 hover:bg-blue-500/10"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(goal.id)}
                    className="p-1.5 rounded transition-colors hover:text-red-500 hover:bg-red-500/10"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <GoalModal
          onClose={() => setShowModal(false)}
          onSave={(data) => createMutation.mutate(data)}
        />
      )}
      {editGoal && (
        <GoalModal
          goal={editGoal}
          onClose={() => setEditGoal(null)}
          onSave={(data) => updateMutation.mutate({ id: editGoal.id, data })}
        />
      )}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? All associated tasks will also be deleted."
      />
    </div>
  )
}
