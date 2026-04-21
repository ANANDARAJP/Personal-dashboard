import { createPortal } from 'react-dom'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  confirmText = 'Delete', 
  cancelText = 'Cancel',
  type = 'danger' // 'danger' or 'warning'
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="border rounded-2xl w-full max-w-sm shadow-2xl transform transition-all animate-scale-in" 
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-full ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onConfirm} 
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                type === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {confirmText}
            </button>
            <button 
              onClick={onClose} 
              className="flex-1 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
