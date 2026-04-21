import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { taskApi } from '../services/api'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { PlusIcon, CalendarIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import ConfirmModal from '../components/common/ConfirmModal'
import clsx from 'clsx'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']

const priorityColors = {
  LOW: 'text-blue-500 bg-blue-500/10 border border-blue-500/20',
  MEDIUM: 'bg-yellow-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  URGENT: 'bg-red-500 text-white',
}

const statusColors = {
  TODO: 'badge-yellow',
  IN_PROGRESS: 'badge-blue',
  DONE: 'badge-green',
  CANCELLED: 'bg-slate-700 text-slate-300 badge',
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || 'TODO',
    dueDate: task?.dueDate || new Date().toISOString().split('T')[0],
    category: task?.category || '',
    tags: task?.tags || '',
  })
  
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="border rounded-xl w-full max-w-md" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="p-5 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. Complete quarterly report" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" placeholder="Add more details about your task..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {STATUSES.map(s => <option key={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Task</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default function TasksPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [view, setView] = useState('today')
  const [deleteId, setDeleteId] = useState(null)

  const queryKey = ['tasks', view]
  const fetchFn = view === 'today' ? taskApi.getTodayTasks :
                  view === 'week' ? taskApi.getWeeklyTasks :
                  view === 'overdue' ? taskApi.getOverdueTasks :
                  () => taskApi.getTasks({ size: 100 })

  const { data: tasks, isLoading } = useQuery(queryKey, () =>
    fetchFn().then(data => data || [])
  )

  const invalidateQueries = () => {
    queryClient.invalidateQueries('tasks')
    queryClient.invalidateQueries('dashboard')
  }

  const createMutation = useMutation(taskApi.createTask, {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Task created!'); 
      setShowModal(false) 
    },
    onError: () => toast.error('Failed to create task'),
  })

  const updateMutation = useMutation(({ id, data }) => taskApi.updateTask(id, data), {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Task updated!'); 
      setEditTask(null) 
    },
    onError: () => toast.error('Failed to update task'),
  })

  const deleteMutation = useMutation(taskApi.deleteTask, {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Task deleted') 
      setDeleteId(null)
    },
    onError: () => {
      toast.error('Failed to delete task')
      setDeleteId(null)
    },
  })

  const quickComplete = (task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE'
    updateMutation.mutate({ id: task.id, data: { ...task, status: newStatus } })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold select-none">Planner & Tasks</h1>
          <p className="text-slate-400 text-sm">Stay organized and manage your daily tasks and schedule effectively.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'today', label: 'TODAY' },
          { key: 'week', label: 'THIS WEEK' },
          { key: 'all', label: 'ALL TASKS' },
          { key: 'overdue', label: 'OVERDUE' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              view === key ? 'bg-primary-600 text-white border-primary-600' : 'hover:opacity-80'
            }`}
            style={view !== key ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
        </div>
      ) : tasks?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">No tasks for this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {tasks.map(task => (
            <div
              key={task.id}
              className={clsx('card flex flex-col hover:border-slate-500 transition-colors relative h-full', {
                'opacity-60 grayscale-[0.5]': task.status === 'DONE',
              })}
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <button
                  onClick={() => quickComplete(task)}
                  className="flex-shrink-0 mt-0.5"
                >
                  <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors', {
                    'border-green-500 bg-green-500': task.status === 'DONE',
                    'border-slate-500 hover:border-primary-500': task.status !== 'DONE',
                  })}>
                    {task.status === 'DONE' && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={clsx('font-semibold text-lg leading-tight mb-1', { 'line-through text-slate-500': task.status === 'DONE' })} style={{ color: task.status === 'DONE' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {task.title}
                  </h3>
                  {task.category && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.category}</p>
                  )}
                </div>
              </div>

              {task.description && (
                <p className="text-sm line-clamp-3 mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {task.description}
                </p>
              )}

              <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className={clsx('text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded', priorityColors[task.priority])}>
                    {task.priority}
                  </span>
                  <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', statusColors[task.status])}>
                    {(task.status || '').replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditTask(task)} className="p-1.5 rounded transition-colors hover:text-blue-500 hover:bg-blue-500/10">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(task.id)} className="p-1.5 rounded transition-colors hover:text-red-500 hover:bg-red-500/10">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <TaskModal onClose={() => setShowModal(false)} onSave={(data) => createMutation.mutate(data)} />}
      {editTask && <TaskModal task={editTask} onClose={() => setEditTask(null)} onSave={(data) => updateMutation.mutate({ id: editTask.id, data })} />}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  )
}
