import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { financeApi } from '../services/api'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import ConfirmModal from '../components/common/ConfirmModal'
import {
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE', 'SAVINGS', 'INVESTMENT']
const TYPE_COLORS = { INCOME: '#22c55e', EXPENSE: '#ef4444', SAVINGS: '#3b82f6', INVESTMENT: '#a855f7' }

const CATEGORIES = {
  INCOME: ['Salary', 'Freelance', 'Investment Returns', 'Other Income'],
  EXPENSE: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Rent', 'Other'],
  SAVINGS: ['Emergency Fund', 'Goal Savings', 'Fixed Deposit'],
  INVESTMENT: ['Stocks', 'Mutual Funds', 'Crypto', 'Real Estate'],
}

function TransactionModal({ onClose, onSave, entry = null }) {
  const [form, setForm] = useState({
    title: entry?.title || '',
    titleName: entry?.titleName || '',
    amount: entry?.amount || '',
    type: entry?.type || 'EXPENSE',
    category: entry?.category || '',
    transactionDate: entry?.transactionDate ? new Date(entry.transactionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: entry?.description || '',
    paymentMethod: entry?.paymentMethod || '',
  })
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="border rounded-xl w-full max-w-md" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">{entry ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({...form, amount: Number(form.amount)}) }} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name (Title Name) *</label>
              <input className="input" value={form.titleName} onChange={e => setForm({...form, titleName: e.target.value})} required placeholder="e.g. Anandth" />
            </div>
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Life fund" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount *</label>
              <input type="number" min="0.01" step="0.01" className="input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required placeholder="0.00" />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value, category: ''})}>
                {TRANSACTION_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="">Select...</option>
                {(CATEGORIES[form.type] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <input className="input" placeholder="e.g. Credit Card, Cash" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">{entry ? 'Save Changes' : 'Add Transaction'}</button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default function FinancePage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editTransaction, setEditTransaction] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterType, setFilterType] = useState('ALL')

  const today = new Date()
  const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const to = today.toISOString().split('T')[0]

  const { data: summary } = useQuery('financeSummary', () =>
    financeApi.getSummary(from, to).then(r => r || {})
  )

  const { data: transactions, isLoading } = useQuery('transactions', () =>
    financeApi.getTransactions({ size: 100, sort: 'transactionDate,desc' }).then(r => r?.content || [])
  )

  const createMutation = useMutation(financeApi.createTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries('transactions')
      queryClient.invalidateQueries('financeSummary')
      toast.success('Transaction added!')
      setShowModal(false)
    },
    onError: () => toast.error('Failed to add transaction'),
  })

  const deleteMutation = useMutation(financeApi.deleteTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries('transactions')
      queryClient.invalidateQueries('financeSummary')
      toast.success('Transaction deleted')
      setDeleteId(null)
    },
    onError: () => {
      toast.error('Failed to delete transaction')
      setDeleteId(null)
    }
  })

  const updateMutation = useMutation(
    (data) => financeApi.updateTransaction(editTransaction.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('transactions')
        queryClient.invalidateQueries('financeSummary')
        toast.success('Transaction updated!')
        setEditTransaction(null)
      },
      onError: () => toast.error('Failed to update transaction'),
    }
  )

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  const filtered = filterType === 'ALL' ? (transactions || []) : (transactions || []).filter(t => t.type === filterType)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold select-none">Finance Tracker</h1>
          <p className="text-slate-400 text-sm">Monitor your income, expenses, and manage your personal budget seamlessly.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Income', key: 'income', color: 'text-green-400' },
          { label: 'Expenses', key: 'expenses', color: 'text-red-400' },
          { label: 'Savings', key: 'savings', color: 'text-blue-400' },
          { label: 'Investments', key: 'investments', color: 'text-purple-400' },
        ].map(({ label, key, color }) => (
          <div key={key} className="card text-center">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{formatCurrency(summary?.[key])}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Transactions</h3>
          <div className="flex gap-2">
            {['ALL', ...TRANSACTION_TYPES].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  filterType === t ? 'bg-primary-600 text-white border-primary-600' : 'hover:opacity-80'
                }`}
                style={filterType !== t ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' } : {}}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-14" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-slate-400">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(t => (
              <div key={t.id} className="card-sm flex items-center gap-3 hover:border-slate-700 transition-colors">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: TYPE_COLORS[t.type] + '33', color: TYPE_COLORS[t.type] }}
                >
                  {t.type[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-primary)' }}>
                    {t.titleName || 'Personal'}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                    <h4 className="text-sm font-bold block truncate leading-tight" style={{ color: 'var(--text-secondary)' }}>
                      {t.title || 'Untitled'}
                    </h4>
                    <div className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 uppercase mt-0.5 sm:mt-0" style={{ color: 'var(--text-secondary)' }}>
                      <span className="opacity-30 hidden sm:inline">•</span>
                      <span>{t.category || 'Other'}</span>
                      <span className="opacity-30">•</span>
                      <span>{new Date(t.transactionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    t.type === 'INCOME' ? 'text-green-400' :
                    t.type === 'EXPENSE' ? 'text-red-400' :
                    t.type === 'SAVINGS' ? 'text-blue-400' : 'text-purple-400'
                  }`}>
                    {t.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(t.amount)}
                  </p>
                </div>
                <div className="flex gap-1 ml-1">
                  <button
                    onClick={() => setEditTransaction(t)}
                    className="p-1.5 text-slate-600 hover:text-primary-400 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSave={(data) => createMutation.mutate(data)} />}
      {editTransaction && <TransactionModal entry={editTransaction} onClose={() => setEditTransaction(null)} onSave={(data) => updateMutation.mutate(data)} />}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  )
}
