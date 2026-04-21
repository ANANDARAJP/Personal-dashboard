import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { habitApi } from '../services/api'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, FireIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline'
import ConfirmModal from '../components/common/ConfirmModal'

function HabitModal({ habit, onClose, onSave }) {
  const [form, setForm] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    category: habit?.category || '',
    targetDaysPerWeek: habit?.targetDaysPerWeek || 7,
    reminderTime: habit?.reminderTime || '',
    color: habit?.color || '#3B82F6',
    icon: habit?.icon || '',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-xl transition-colors">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold">{habit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="p-5 space-y-4">
          <div>
            <label className="label">Habit Name *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Morning meditation" />
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Health, Learning, Fitness" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Days/Week</label>
              <input type="number" min="1" max="7" className="input" value={form.targetDaysPerWeek} onChange={e => setForm({...form, targetDaysPerWeek: Number(e.target.value)})} />
            </div>
            <div>
              <label className="label">Reminder Time</label>
              <input type="time" className="input" value={form.reminderTime} onChange={e => setForm({...form, reminderTime: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
              <input className="input flex-1" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Habit</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function HabitsPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editHabit, setEditHabit] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const today = new Date().toISOString().split('T')[0]

  const { data: habits, isLoading } = useQuery('habits', () =>
    habitApi.getHabits().then(data => data || [])
  )

  const { data: logs, isLoading: isLogsLoading } = useQuery(['habitsLogs', selectedDate], () =>
    habitApi.getLogsByDate(selectedDate).then(data => data || [])
  )

  const logMap = {}
  logs?.forEach(log => {
    logMap[log.habitId] = log
  })

  const handleCloseModal = () => {
    setEditHabit(null)
    setShowModal(false)
  }

  const invalidateQueries = () => {
    queryClient.invalidateQueries('habits')
    queryClient.invalidateQueries(['habitsLogs', selectedDate])
    queryClient.invalidateQueries('dashboard')
  }

  const createMutation = useMutation(habitApi.createHabit, {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Habit created!'); 
      handleCloseModal() 
    },
    onError: () => toast.error('Failed to create habit'),
  })

  const updateMutation = useMutation(({ id, data }) => habitApi.updateHabit(id, data), {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Habit updated!'); 
      handleCloseModal() 
    },
    onError: () => toast.error('Failed to update habit'),
  })

  const deleteMutation = useMutation(habitApi.deleteHabit, {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Habit removed') 
      setDeleteId(null)
    },
    onError: () => {
      toast.error('Failed to delete habit')
      setDeleteId(null)
    },
  })

  const logMutation = useMutation(({ id, data }) => habitApi.logHabit(id, data), {
    onSuccess: () => invalidateQueries(),
    onError: () => toast.error('Failed to log habit'),
  })

  const handleEdit = (habit) => {
    setEditHabit(habit)
    setShowModal(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Habits tracker</h1>
          <p className="text-slate-400 text-sm">Build consistency and track your daily progress across different categories.</p>
        </div>
        <button onClick={() => { setEditHabit(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Habit
        </button>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-slate-500" />
          </button>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
            />
          </div>

          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {selectedDate !== today && (
          <button 
            onClick={() => setSelectedDate(today)}
            className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Go to Today
          </button>
        )}
      </div>

      {isLoading || isLogsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-36" />)}
        </div>
      ) : habits?.length === 0 ? (
        <div className="card text-center py-12">
          <FireIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No habits yet. Start building good habits!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map(habit => {
            const log = logMap[habit.id]
            const isCompleted = log?.status?.toLowerCase() === 'success'

            return (
              <div
                key={habit.id}
                className={`card p-4 transition-colors border-l-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted 
                    ? 'border-l-green-500 bg-green-50/30 dark:bg-green-900/5 shadow-sm ring-1 ring-green-500/20' 
                    : 'border-l-red-500 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-red-500/10'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${habit.color}20`, color: habit.color }}>
                    <FireIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{habit.name}</h3>
                      {habit.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                          {habit.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <FireIcon className="w-4 h-4 text-orange-400" />
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{habit.currentStreak}</span>
                        <span className="text-slate-500">streak</span>
                      </div>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-500">Best: {habit.longestStreak}</span>
                      <span className="text-slate-500">•</span>
                      <span className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${isCompleted ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : 'text-red-600 bg-red-100 dark:bg-red-900/30'}`}>
                        {isCompleted ? 'Completed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => logMutation.mutate({ id: habit.id, data: { date: selectedDate, status: isCompleted ? 'failed' : 'success' } })}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                      isCompleted ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600' : 'bg-red-500 border-red-500 dark:bg-red-600 dark:border-red-600'
                    }`}
                    title={isCompleted ? "Set as Failed" : "Set as Completed"}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isCompleted ? 'translate-x-7' : 'translate-x-1'
                      } shadow-sm`}
                    />
                  </button>
                  <button
                    onClick={() => handleEdit(habit)}
                    className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex-shrink-0"
                    title="Edit"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(habit.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                    title="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <HabitModal
          habit={editHabit}
          onClose={handleCloseModal}
          onSave={(data) => {
            if (editHabit) {
              updateMutation.mutate({ id: editHabit.id, data })
            } else {
              createMutation.mutate(data)
            }
          }}
        />
      )}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? All tracking history will be permanently removed."
      />
    </div>
  )
}
