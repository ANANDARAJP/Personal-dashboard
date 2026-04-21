import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  FlagIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  FolderIcon,
  UserIcon,
  XMarkIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { path: '/habits', icon: FireIcon, label: 'Habits' },
      { path: '/goals', icon: FlagIcon, label: 'Goals' },
      { path: '/tasks', icon: ClipboardDocumentListIcon, label: 'Planner' },
      { path: '/journal', icon: BookOpenIcon, label: 'Journal' },
      { path: '/personal-files', icon: FolderIcon, label: 'Files' },
    ],
  },
  {
    label: 'Office',
    items: [
      { path: '/office', icon: BuildingOfficeIcon, label: 'Office' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/finance', icon: CurrencyDollarIcon, label: 'Finance' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { path: '/profile', icon: UserIcon, label: 'Profile Settings' },
    ],
  },
]

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth()
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-60 transform transition-transform duration-300 flex flex-col
          lg:relative lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-wide">LifeTracker</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-2 px-3 mb-1.5 text-slate-500">
                {group.icon && <group.icon className="w-3.5 h-3.5" />}
                <p className="text-xs font-semibold uppercase tracking-wider">
                  {group.label}
                </p>
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/8'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

      </aside>
    </>
  )
}
