import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { officeApi } from '../services/api'
import toast from 'react-hot-toast'

const fmt = (time) => {
  if (!time) return '—'
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const todayStr = () => new Date().toISOString().split('T')[0]
const nowTime = () => new Date().toTimeString().slice(0, 5)

function ClockCard({ label, time, color, onMark }) {
  const [manualTime, setManualTime] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const showInputs = !time || isEditing

  return (
    <div className="card flex flex-col items-center gap-3 py-8">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
        style={{ backgroundColor: color + '20', color }}
      >
        {label === 'In Time' ? '🕐' : '🕔'}
      </div>
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
          {time ? fmt(time) : '—'}
        </p>
      </div>
      {showInputs ? (
        <div className="flex flex-col gap-2 mt-2 w-full max-w-[200px]">
          <button onClick={() => { onMark(); setIsEditing(false); }} className="btn-primary text-sm py-1.5 w-full">
            Mark Now (Auto)
          </button>
          <div className="flex gap-2 mt-1">
            <input 
              type="time" 
              className="input text-sm px-2 py-1 flex-1 min-h-[32px]"
              value={manualTime}
              onChange={e => setManualTime(e.target.value)}
            />
            <button 
              disabled={!manualTime}
              onClick={() => { onMark(manualTime); setIsEditing(false); setManualTime(''); }} 
              className="btn-secondary text-sm px-3 disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {isEditing && (
            <button onClick={() => setIsEditing(false)} className="text-xs text-slate-500 mt-1 hover:underline">
              Cancel Edit
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 mt-1">
          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: color + '20', color }}>
            Recorded
          </span>
          <button onClick={() => setIsEditing(true)} className="text-xs text-primary-500 hover:text-primary-600 transition-colors mt-1">
            Edit Time
          </button>
        </div>
      )}
    </div>
  )
}

function SummaryModal({ open, onClose, onSave, existing }) {
  const [formData, setFormData] = useState({ morning: '', afternoon: '', today: '' })

  useEffect(() => {
    if (!open) return
    try {
      const parsed = existing ? JSON.parse(existing) : { morning: '', afternoon: '', today: '' }
      setFormData({
        morning: parsed.morning || '',
        afternoon: parsed.afternoon || '',
        today: parsed.today || ''
      })
    } catch (e) {
      setFormData({ morning: '', afternoon: '', today: existing || '' })
    }
  }, [existing, open])

  const handleSave = () => {
    if (!formData.morning.trim() && !formData.afternoon.trim() && !formData.today.trim()) return
    onSave(JSON.stringify(formData))
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl border p-6 z-10 max-h-[90vh] flex flex-col"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <h3 className="text-base font-semibold mb-4 shrink-0" style={{ color: 'var(--text-primary)' }}>
          Today's Work Summary
        </h3>
        
        <div className="space-y-4 overflow-y-auto pr-2">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Morning Summary</label>
            <textarea
              rows={3}
              placeholder="What did you do this morning?"
              value={formData.morning}
              onChange={e => setFormData({...formData, morning: e.target.value})}
              className="input resize-none text-sm w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Afternoon Summary</label>
            <textarea
              rows={3}
              placeholder="What did you do this afternoon?"
              value={formData.afternoon}
              onChange={e => setFormData({...formData, afternoon: e.target.value})}
              className="input resize-none text-sm w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>End of Day Summary</label>
            <textarea
              rows={3}
              placeholder="Final accomplishments, blockers..."
              value={formData.today}
              onChange={e => setFormData({...formData, today: e.target.value})}
              className="input resize-none text-sm w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 shrink-0">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={handleSave} className="btn-primary text-sm">Save</button>
        </div>
      </div>
    </div>
  )
}

export default function OfficePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const today = todayStr()
  const [summaryOpen, setSummaryOpen] = useState(false)

  const { data: attendance, isLoading } = useQuery(
    ['office', today],
    () => officeApi.getToday(),
    { retry: false, onError: () => {} }
  )

  const { data: history } = useQuery(
    'officeHistory',
    () => officeApi.getHistory({ size: 14 }).then(r => Array.isArray(r) ? r : r?.content || []),
    { onError: () => {} }
  )

  const markMutation = useMutation(
    ({ type, time }) => officeApi.markAttendance({ date: today, type, time: time || nowTime() }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['office', today])
        qc.invalidateQueries('officeHistory')
        toast.success('Attendance recorded!')
      },
      onError: () => toast.error('Failed to record attendance'),
    }
  )

  const summaryMutation = useMutation(
    (summary) => officeApi.saveSummary({ date: today, summary }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['office', today])
        toast.success('Summary saved!')
      },
      onError: () => toast.error('Failed to save summary'),
    }
  )

  const workDuration = () => {
    if (!attendance?.inTime || !attendance?.outTime) return null
    const [ih, im] = attendance.inTime.split(':').map(Number)
    const [oh, om] = attendance.outTime.split(':').map(Number)
    const mins = Math.abs((oh * 60 + om) - (ih * 60 + im))
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  const duration = workDuration()

  return (
    <div className="space-y-6 animate-fade-in">
      <SummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        onSave={(text) => summaryMutation.mutate(text)}
        existing={attendance?.summary}
      />

      <div>
        <h1 className="text-xl font-bold">Office Tracker</h1>
        <p className="text-slate-400 text-sm">Track your workplace attendance, daily summaries, and history.</p>
      </div>

      {/* In / Out clocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ClockCard
          label="In Time"
          time={attendance?.inTime}
          color="#22c55e"
          onMark={(t) => markMutation.mutate({ type: 'IN', time: t })}
        />
        <ClockCard
          label="Out Time"
          time={attendance?.outTime}
          color="#ef4444"
          onMark={(t) => markMutation.mutate({ type: 'OUT', time: t })}
        />

        {/* Duration card */}
        <div className="card flex flex-col items-center gap-3 py-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
            ⏱️
          </div>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Duration</p>
            <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {duration || '—'}
            </p>
          </div>
          {attendance?.inTime && !attendance?.outTime && (
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
              In progress
            </span>
          )}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Today's Summary</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>What you accomplished today</p>
          </div>
          <button
            onClick={() => setSummaryOpen(true)}
            className="btn-primary text-sm px-4"
          >
            {attendance?.summary ? 'Edit Summary' : '+ Add Summary'}
          </button>
        </div>

        {attendance?.summary ? (
          <div className="space-y-4">
            {(() => {
              try {
                const p = JSON.parse(attendance.summary)
                return (
                  <>
                    {p.morning && (
                      <div className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderLeft: '3px solid #eab308' }}>
                        <h4 className="font-semibold text-xs mb-1 uppercase tracking-wide" style={{ color: '#eab308' }}>Morning</h4>
                        {p.morning}
                      </div>
                    )}
                    {p.afternoon && (
                      <div className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderLeft: '3px solid #f97316' }}>
                        <h4 className="font-semibold text-xs mb-1 uppercase tracking-wide" style={{ color: '#f97316' }}>Afternoon</h4>
                        {p.afternoon}
                      </div>
                    )}
                    {p.today && (
                      <div className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderLeft: '3px solid #3b82f6' }}>
                        <h4 className="font-semibold text-xs mb-1 uppercase tracking-wide" style={{ color: '#3b82f6' }}>End of Day</h4>
                        {p.today}
                      </div>
                    )}
                  </>
                )
              } catch (e) {
                return (
                  <div className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderLeft: '3px solid #3b82f6' }}>
                    {attendance.summary}
                  </div>
                )
              }
            })()}
          </div>
        ) : (
          <div
            className="p-6 rounded-xl text-center border-2 border-dashed"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No summary added yet for today</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Click "Add Summary" to write what you did today</p>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="card">
        <h2 className="text-base font-semibold mb-4">Recent Attendance</h2>
        {!history || history.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No attendance records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'In', 'Out', 'Duration', 'Summary'].map(h => (
                    <th key={h} className="pb-2 text-left font-medium text-xs uppercase tracking-wide pr-4 last:pr-0" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((rec, i) => {
                  let dur = null
                  if (rec.inTime && rec.outTime) {
                    const [ih, im] = rec.inTime.split(':').map(Number)
                    const [oh, om] = rec.outTime.split(':').map(Number)
                    const m = (oh * 60 + om) - (ih * 60 + im)
                    if (m > 0) dur = `${Math.floor(m / 60)}h ${m % 60}m`
                  }
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2.5 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </td>
                      <td className="py-2.5 pr-4" style={{ color: '#22c55e' }}>{fmt(rec.inTime)}</td>
                      <td className="py-2.5 pr-4" style={{ color: '#ef4444' }}>{fmt(rec.outTime)}</td>
                      <td className="py-2.5 pr-4" style={{ color: 'var(--text-secondary)' }}>{dur || '—'}</td>
                      <td className="py-2.5 max-w-xs truncate" style={{ color: 'var(--text-muted)' }} title={rec.summary}>
                        {(() => {
                          if (!rec.summary) return '—'
                          try {
                            const p = JSON.parse(rec.summary)
                            return p.today || p.afternoon || p.morning || '—'
                          } catch (e) {
                            return rec.summary
                          }
                        })()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
