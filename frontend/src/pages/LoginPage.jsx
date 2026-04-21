import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import loginBg from '../assets/login_bg.png'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error details:', err.response?.data)
      const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center" 
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[22rem]">
        <div className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-[1.5rem] p-8 relative overflow-hidden">
          {/* Logo inside login box */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center border border-primary-700/20 shadow-lg">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-primary-600 text-lg tracking-wider drop-shadow-md">LifeTracker</span>
          </div>

          <h1 className="text-2xl font-black text-center tracking-wider mb-8 uppercase text-slate-800">Login</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/40 backdrop-blur-md border border-red-500/50 rounded-lg text-red-100 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Email</label>
              <div className="flex items-center border-b-[1.5px] border-slate-800/60 pb-1">
                <input
                  type="email"
                  className="appearance-none bg-transparent border-none w-full text-slate-900 mr-3 py-1 px-1 leading-tight focus:outline-none focus:ring-0 placeholder-slate-600/50 font-medium"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
                <EnvelopeIcon className="h-5 w-5 text-slate-800" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
              <div className="flex items-center border-b-[1.5px] border-slate-800/60 pb-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="appearance-none bg-transparent border-none w-full text-slate-900 mr-8 py-1 px-1 leading-tight focus:outline-none focus:ring-0 placeholder-slate-600/50 font-medium"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-slate-800 hover:text-slate-900 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-[11px] font-bold text-slate-900 hover:text-slate-700 transition">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-400 text-slate-800 focus:ring-slate-800 bg-white/40 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-sm font-bold text-slate-800 cursor-pointer">
                Remember Me
              </label>
            </div>

            {/* Login Button */}
            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-md border border-white/50 text-slate-900 font-extrabold py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative">{loading ? 'Logging in...' : 'Login'}</span>
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
    </div>
  )
}
