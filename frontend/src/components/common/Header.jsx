import { useState, useRef, useEffect } from 'react'
import { Bars3Icon, BellIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon, ArrowDownTrayIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLocation, NavLink } from 'react-router-dom'
import { exportToExcel } from '../../utils/exportUtils'
import toast from 'react-hot-toast'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/goals': 'Goal Management',
  '/tasks': 'Planner & Tasks',
  '/finance': 'Finance Tracker',
  '/journal': 'Journal',
  '/office': 'Office Tracker',
  '/profile': 'Profile Settings',
  '/personal-files': 'Personal Files',
  '/habits': 'Habits tracker',
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Personal Life Tracker'
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    const toastId = toast.loading('Generating Excel file...')
    try {
      await exportToExcel()
      toast.success('Data exported successfully!', { id: toastId })
    } catch (e) {
      console.error(e)
      toast.error('Failed to export data', { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  return (
    <header
      className="border-b px-6 py-3 flex items-center justify-between transition-colors duration-200"
      style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center border border-primary-700/20 shadow-sm">
            <ChartBarIcon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-bold">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Download Data Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          title="Download data as Excel"
          className="relative p-2 rounded-lg transition-colors duration-200 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowDownTrayIcon className={`w-5 h-5 ${isExporting ? 'animate-pulse' : ''}`} />
        </button>

        {/* Dark / Light mode toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="relative p-2 rounded-lg transition-colors duration-200 hover:bg-black/10 dark:hover:bg-white/10"
          style={{ color: 'var(--text-secondary)' }}
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-lg transition-colors duration-200 hover:bg-black/10 dark:hover:bg-white/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-11 w-72 rounded-xl shadow-xl border z-50 overflow-hidden"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              <div
                className="px-4 py-3 border-b text-sm font-semibold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Notifications
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {[
                  { icon: '🎯', text: 'You have 2 overdue goals', time: '5m ago' },
                  { icon: '🔥', text: 'Keep your 7-day streak going!', time: '1h ago' },
                  { icon: '📋', text: '3 tasks due today', time: '2h ago' },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span className="text-xl flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{n.text}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setNotifOpen(false)}
                className="w-full py-2.5 text-xs text-primary-500 hover:text-primary-400 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center focus:outline-none"
          >
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={initials}
                className="w-8 h-8 rounded-full object-cover border-2 border-primary-500 hover:border-primary-400 transition-all duration-200"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity border-2 border-primary-400">
                {initials}
              </div>
            )}
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border z-50 overflow-hidden transform origin-top-right transition-all duration-200"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.firstName || user?.lastName 
                    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() 
                    : 'Anonymous User'}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
              </div>
              <div className="p-1">
                <NavLink
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="text-base text-primary-500">👤</span> Profile Settings
                </NavLink>
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-red-500 hover:bg-red-500/10 transition-colors mt-1"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
