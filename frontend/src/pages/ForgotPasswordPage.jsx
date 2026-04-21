import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'
import { EnvelopeIcon, KeyIcon, LockClosedIcon, ChartBarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

const STEPS = {
  EMAIL: 'EMAIL',
  CODE: 'CODE',
  PASSWORD: 'PASSWORD'
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(STEPS.EMAIL)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })
  const navigate = useNavigate()

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(form.email)
      toast.success('Verification code sent!')
      setStep(STEPS.CODE)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    if (form.code.trim().length === 9) {
      setStep(STEPS.PASSWORD)
    } else {
      toast.error('Verification code must be 9 characters')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword({ 
        token: form.code.trim(), 
        newPassword: form.newPassword 
      })
      toast.success('Password updated successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-black text-slate-800 tracking-tight">LifeTracker</span>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              {step === STEPS.EMAIL && 'Reset Password'}
              {step === STEPS.CODE && 'Verify Code'}
              {step === STEPS.PASSWORD && 'New Password'}
            </h1>
            <p className="text-slate-500 font-medium">
              {step === STEPS.EMAIL && "Enter your email to receive a recovery code."}
              {step === STEPS.CODE && "Contact admin for the secure 9-character code"}
              {step === STEPS.PASSWORD && "Enter your new secure password below."}
            </p>
          </div>

          {step === STEPS.EMAIL && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Recovery Code'}
              </button>
            </form>
          )}

          {step === STEPS.CODE && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Verification Code</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all tracking-[0.5em] text-center"
                    placeholder="9 letters"
                    maxLength={9}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-primary-600/20"
              >
                Verify Code
              </button>
            </form>
          )}

          {step === STEPS.PASSWORD && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="••••••••"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors group"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
