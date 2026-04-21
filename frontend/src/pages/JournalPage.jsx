import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { journalApi } from '../services/api'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import ConfirmModal from '../components/common/ConfirmModal'

const MOODS = ['VERY_BAD', 'BAD', 'NEUTRAL', 'GOOD', 'VERY_GOOD', 'EXCELLENT']
const MOOD_EMOJIS = { VERY_BAD: '😫', BAD: '😢', NEUTRAL: '😐', GOOD: '🙂', VERY_GOOD: '😊', EXCELLENT: '😁' }
const MOOD_COLORS = {
  VERY_BAD: 'text-red-500',
  BAD: 'text-orange-500',
  NEUTRAL: 'text-yellow-400',
  GOOD: 'text-lime-400',
  VERY_GOOD: 'text-green-400',
  EXCELLENT: 'text-emerald-400',
}
const MOOD_BORDER_COLORS = {
  VERY_BAD: '#ef4444',
  BAD: '#f97316',
  NEUTRAL: '#facc15',
  GOOD: '#a3e635',
  VERY_GOOD: '#4ade80',
  EXCELLENT: '#34d399',
}

function JournalModal({ entry, onClose, onSave }) {
  const [form, setForm] = useState({
    title: entry?.title || '',
    content: entry?.content || '',
    entryDate: entry?.entryDate || new Date().toISOString().split('T')[0],
    mood: entry?.mood || 'NEUTRAL',
    moodScore: entry?.moodScore || 5,
    gratitude: entry?.gratitude || '',
    reflection: entry?.reflection || '',
    tags: entry?.tags || '',
    isPrivate: entry?.isPrivate ?? true,
  })

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="flex flex-col border rounded-xl w-full max-w-2xl max-h-[90vh]" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between p-5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">{entry ? 'Edit Entry' : 'New Journal Entry'}</h2>
          <button onClick={onClose} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Today's reflection..." />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.entryDate} onChange={e => setForm({...form, entryDate: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="label">Mood</label>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({...form, mood: m})}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                    form.mood === m
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'hover:opacity-80'
                  }`}
                  style={form.mood !== m ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' } : {}}
                >
                  {MOOD_EMOJIS[m]} {m.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Mood Score (1-10): {form.moodScore}</label>
            <input type="range" min="1" max="10" className="w-full accent-primary-500" value={form.moodScore} onChange={e => setForm({...form, moodScore: Number(e.target.value)})} />
          </div>

          <div>
            <label className="label">Journal Entry</label>
            <textarea className="input h-28 resize-none" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Write about your day..." />
          </div>

          <div>
            <label className="label">Gratitude (3 things you're grateful for)</label>
            <textarea className="input h-20 resize-none" value={form.gratitude} onChange={e => setForm({...form, gratitude: e.target.value})} placeholder="1. 2. 3." />
          </div>

          <div>
            <label className="label">Reflection</label>
            <textarea className="input h-20 resize-none" value={form.reflection} onChange={e => setForm({...form, reflection: e.target.value})} placeholder="What did you learn today?" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tags</label>
              <input className="input" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="work, personal, health" />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.isPrivate} onChange={e => setForm({...form, isPrivate: e.target.checked})} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                <span className="ml-2 text-sm text-slate-400">Private</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Entry</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default function JournalPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: entries, isLoading } = useQuery('journal', () =>
    journalApi.getEntries({ size: 50, sort: 'entryDate,desc' }).then(data => data || [])
  )

  const invalidateQueries = () => {
    queryClient.invalidateQueries('journal')
    queryClient.invalidateQueries('dashboard')
  }

  const createMutation = useMutation(journalApi.createEntry, {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Entry saved!'); 
      setShowModal(false) 
    },
    onError: () => toast.error('Failed to save entry'),
  })

  const updateMutation = useMutation(({ id, data }) => journalApi.updateEntry(id, data), {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Entry updated!'); 
      setEditEntry(null) 
    },
    onError: () => toast.error('Failed to update entry'),
  })

  const deleteMutation = useMutation(journalApi.deleteEntry, {
    onSuccess: () => { 
      invalidateQueries(); 
      toast.success('Entry deleted') 
      setDeleteId(null)
    },
    onError: () => {
      toast.error('Failed to delete entry')
      setDeleteId(null)
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold select-none">Journal</h1>
          <p className="text-slate-400 text-sm">Record your thoughts, experiences, and daily reflections in a private space.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)}
        </div>
      ) : entries?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📔</p>
          <p className="text-slate-400">Start your journaling journey today!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {entries.map(entry => (
            <div 
              key={entry.id} 
              className="card group hover:border-slate-500 transition-colors relative overflow-hidden flex flex-col h-full"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1.5" 
                style={{ backgroundColor: entry.mood ? MOOD_BORDER_COLORS[entry.mood] : 'var(--border)' }} 
              />
              <div className="flex items-start justify-between mb-4 mt-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {entry.mood && (
                      <span className="text-2xl" title={entry.mood.replace(/_/g, ' ')}>{MOOD_EMOJIS[entry.mood]}</span>
                    )}
                    <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>{entry.title}</h3>
                    {entry.isPrivate && (
                      <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {new Date(entry.entryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {entry.moodScore && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Mood: {entry.moodScore}/10</span>}
                  </p>
                </div>
                <div className="flex gap-1 transition-opacity shrink-0 ml-3">
                  <button onClick={() => setEditEntry(entry)} className="p-1.5 rounded-full transition-colors hover:bg-primary-500/10 hover:text-primary-500" style={{ color: 'var(--text-muted)' }}>
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(entry.id)} className="p-1.5 rounded-full transition-colors hover:bg-red-500/10 hover:text-red-500" style={{ color: 'var(--text-muted)' }}>
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {entry.content && (
                <div className="text-sm leading-relaxed mb-5 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {entry.content}
                </div>
              )}
              
              <div className="mt-auto space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                {entry.gratitude && (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                    <p className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1.5">
                      <span className="text-sm">🍃</span> Gratitude
                    </p>
                    <p className="text-sm text-green-700/80 dark:text-green-200/80 leading-snug whitespace-pre-wrap">{entry.gratitude}</p>
                  </div>
                )}
                {entry.reflection && (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1.5">
                      <span className="text-sm">💡</span> Reflection
                    </p>
                    <p className="text-sm text-blue-700/80 dark:text-blue-200/80 leading-snug whitespace-pre-wrap">{entry.reflection}</p>
                  </div>
                )}
                {entry.tags && (
                  <div className="flex gap-1.5 flex-wrap pt-2">
                    {entry.tags.split(',').map(tag => {
                      const t = tag.trim()
                      if (!t) return null
                      return <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{t}</span>
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <JournalModal onClose={() => setShowModal(false)} onSave={(data) => createMutation.mutate(data)} />}
      {editEntry && <JournalModal entry={editEntry} onClose={() => setEditEntry(null)} onSave={(data) => updateMutation.mutate({ id: editEntry.id, data })} />}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Journal Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
      />
    </div>
  )
}
