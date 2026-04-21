import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../services/api'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="py-8">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-primary-500 mx-auto mb-4" />
            <p className="text-slate-400">Verifying your email...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Email verified!</h2>
            <p className="text-slate-400 mb-6">Your account is now fully active.</p>
            <Link to="/login" className="btn-primary">Go to Login</Link>
          </div>
        )}
        {status === 'error' && (
          <div className="py-8">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Verification failed</h2>
            <p className="text-slate-400 mb-6">The link is invalid or has expired.</p>
            <Link to="/login" className="btn-secondary">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  )
}
