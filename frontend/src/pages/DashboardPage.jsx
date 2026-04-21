import { useState } from 'react'
import { useQuery } from 'react-query'
import { dashboardApi, goalApi, taskApi, financeApi, userApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  CheckCircleIcon,
  ClockIcon,
  FlagIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  CalendarIcon,
  WalletIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'

const PIE_COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#a855f7']

function StatCard({ title, value, subtitle, accent = '#3b82f6', icon, trend }) {
  return (
    <div className="card hover:border-primary-500/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: accent + '20', color: accent }}
        >
          {icon}
        </div>
        {trend !== undefined && ( trend !== 0 ) && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{title}</p>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  )
}

function ProgressBar({ label, value, max, color = '#3b82f6', showCount = true }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        {showCount && <span style={{ color: 'var(--text-muted)' }}>{value}/{max} ({pct}%)</span>}
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
  },
  labelStyle: { color: 'var(--text-secondary)' },
  itemStyle: { color: 'var(--text-primary)' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery(
    'dashboard',
    () => dashboardApi.getDashboard().then(data => data),
    { refetchInterval: 60000 }
  )

  const { data: recentGoals } = useQuery(['goals', 'dashboard'], () =>
    goalApi.getGoals({ size: 5, sort: 'createdAt,desc' }).then(data => data || [])
  )

  const { data: todayTasks } = useQuery(['tasks', 'dashToday'], () =>
    taskApi.getTodayTasks().then(data => data || [])
  )

  const { data: overdueTasks } = useQuery(['tasks', 'dashOverdue'], () =>
    taskApi.getOverdueTasks().then(data => data || [])
  )

  const { data: recentTransactions } = useQuery(['transactions', 'dashboard'], () =>
    financeApi.getTransactions({ size: 5, sort: 'transactionDate,desc' }).then(data => data || [])
  )

  const { data: financeSummary } = useQuery(['financeSummary', 'dashboard'], () => {
    const today = new Date()
    const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    const to = today.toISOString().split('T')[0]
    return financeApi.getSummary(from, to).then(data => data || {})
  })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card h-80" />
          <div className="card h-80" />
        </div>
      </div>
    )
  }

  const stats = data || {}
  const taskCompletionPct = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0
  
  const activityData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 700 },
  ]

  const statusData = [
    { name: 'Completed', value: stats.completedTasks || 0 },
    { name: 'Overdue', value: stats.overdueTasks || 0 },
    { name: 'Pending', value: (stats.totalTasks || 0) - (stats.completedTasks || 0) - (stats.overdueTasks || 0) },
  ]

  const TYPE_COLORS = { INCOME: '#22c55e', EXPENSE: '#ef4444', SAVINGS: '#3b82f6', INVESTMENT: '#a855f7' }
  const pieData = ['INCOME', 'EXPENSE', 'SAVINGS', 'INVESTMENT'].map(type => ({
    name: type,
    value: Number(financeSummary?.[type.toLowerCase()] || 0),
  })).filter(d => d.value > 0)

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting()}, <span className="text-primary-500">{user?.name}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Here's what's happening with your productivity today.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            View Schedule
          </button>
          <button className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Track Activity
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Progress"
          value={`${taskCompletionPct}%`}
          subtitle={`${stats.completedTasks || 0} tasks completed`}
          accent="#10b981"
          icon={<CheckCircleIcon className="w-6 h-6" />}
          trend={12}
        />
        <StatCard
          title="Active Goals"
          value={stats.activeGoals || 0}
          subtitle={`On track for ${new Date().toLocaleString('default', { month: 'long' })}`}
          accent="#3b82f6"
          icon={<FlagIcon className="w-6 h-6" />}
          trend={5}
        />
        <StatCard
          title="Habit Streak"
          value={stats.averageHabitStreak || 0}
          subtitle="Longest streak: 14 days"
          accent="#f59e0b"
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          trend={stats.averageHabitStreak > 0 ? 8 : 0}
        />
        <StatCard
          title="Overdue Items"
          value={stats.overdueTasks || 0}
          subtitle="Needs immediate attention"
          accent="#ef4444"
          icon={<ClockIcon className="w-6 h-6" />}
          trend={-3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <SectionHeader title="Productivity Trends" subtitle="Daily task completion activity over the last 7 days" />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip {...CHART_TOOLTIP_STYLE} cursor={{ stroke: 'var(--primary-500)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <SectionHeader title="Task Distribution" subtitle="Breakdown of task statuses" />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP_STYLE} />
                <Legend verticalAlign="bottom" height={36} content={({ payload }) => (
                  <div className="flex justify-center gap-4 text-xs mt-4">
                    {payload.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <SectionHeader title="Immediate Focus" subtitle="Tasks due today or overdue" />
              <span className="badge badge-red">{overdueTasks?.length || 0} OVERDUE</span>
            </div>
            <div className="space-y-4">
              {[...(overdueTasks || []), ...(todayTasks || [])].slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'URGENT' ? 'bg-red-500' : 'bg-primary-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{task.category || 'No Category'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${task.status === 'DONE' ? 'bg-green-500/10 text-green-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
              {(overdueTasks?.length === 0 && todayTasks?.length === 0) && (
                <div className="text-center py-8">
                  <ClipboardDocumentCheckIcon className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">All caught up for today!</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <SectionHeader title="Goal Momentum" subtitle="Progress overview of active goals" />
            <div className="space-y-6 mt-6">
              {(recentGoals || []).map(goal => (
                <ProgressBar
                  key={goal.id}
                  label={goal.title}
                  value={goal.progressPercentage || 0}
                  max={100}
                  color={goal.type === 'LONG_TERM' ? '#a855f7' : '#3b82f6'}
                />
              ))}
              {(!recentGoals || recentGoals.length === 0) && (
                <div className="text-center py-8">
                  <FlagIcon className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No active goals found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <SectionHeader title="Monthly Finance Breakdown" subtitle="Income vs Expenses overview" />
          <div className="h-64 mt-4">
            {pieData.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={TYPE_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip
                        {...CHART_TOOLTIP_STYLE}
                        formatter={(val) => formatCurrency(val)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {pieData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[entry.name] }} />
                      <span className="text-xs text-slate-400">{entry.name}</span>
                      <span className="text-xs text-white font-medium ml-auto">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <BanknotesIcon className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-3" />
                <p className="text-sm text-slate-400">No financial data for this month</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
