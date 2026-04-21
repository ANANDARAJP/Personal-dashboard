import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../services/api'
import toast from 'react-hot-toast'
import { 
  CameraIcon, 
  XMarkIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  UsersIcon,
  EnvelopeIcon,
  KeyIcon,
  IdentificationIcon,
  PlusIcon,
  PencilIcon,
  GlobeAmericasIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  FingerPrintIcon,
  CommandLineIcon,
  ClockIcon
} from '@heroicons/react/24/outline'


function UpdateProfileModal({ user, onClose, onProfileSave, onEmailChange, onPasswordChange }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  })
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [changingEmail, setChangingEmail] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onProfileSave(form)
    setSaving(false)
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setChangingEmail(true)
    await onEmailChange(emailForm)
    setChangingEmail(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      const success = await onPasswordChange(passwordForm)
      if (success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setActiveTab('profile')
      }
    } catch (err) {
      console.error('Password change error:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setChangingPassword(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">Update Profile</h2>
          <button onClick={onClose} className="hover:bg-black/10 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="border-b px-5 flex gap-4 bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--border)' }}>
          {[
            { id: 'profile', label: 'Personal Info', icon: UserIcon },
            { id: 'email', label: 'Email', icon: EnvelopeIcon },
            { id: 'password', label: 'Password', icon: KeyIcon }
          ].map(tab => (
            <button 
              key={tab.id}
              type="button"
              className={`py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-500 hover:text-primary-400'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5" style={{ minHeight: '300px' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4 animate-slide-in-bottom">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input className="input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="e.g. Anand" />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input className="input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="e.g. Doe" />
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea className="input h-24 resize-none" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell us about yourself..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="btn-primary flex-1 shadow-lg shadow-primary-500/20">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 animate-slide-in-bottom">
              <div>
                <label className="label">New Email</label>
                <input type="email" required className="input" value={emailForm.newEmail} onChange={e => setEmailForm({...emailForm, newEmail: e.target.value})} placeholder="e.g. yourdata@example.com" />
              </div>
              <div>
                <label className="label">Current Password</label>
                <input type="password" required className="input" value={emailForm.password} onChange={e => setEmailForm({...emailForm, password: e.target.value})} placeholder="Enter current password to verify" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={changingEmail} className="btn-primary flex-1 shadow-lg shadow-primary-500/20">
                  {changingEmail ? 'Updating...' : 'Change Email'}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-slide-in-bottom">
              <div>
                <label className="label">Current Password</label>
                <input 
                  type="password" 
                  required 
                  className="input" 
                  value={passwordForm.currentPassword} 
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                  placeholder="Enter current password" 
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input 
                  type="password" 
                  required 
                  minLength={8}
                  className="input" 
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                  placeholder="Minimum 8 characters" 
                />
              </div>
              <div>
                <label className="label">Re-enter Password</label>
                <input 
                  type="password" 
                  required 
                  className="input" 
                  value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                  placeholder="Re-enter new password" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={changingPassword} className="btn-primary flex-1 shadow-lg shadow-primary-500/20">
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>,
    document.body
  )
}

function ChangePasswordModal({ onClose, onPasswordChange }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [savingPwd, setSavingPwd] = useState(false)

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setSavingPwd(true)
    const success = await onPasswordChange(passwordForm)
    if (success) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
    setSavingPwd(false)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
              <KeyIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>
          <button onClick={onClose} className="hover:bg-black/10 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-slide-in-bottom">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">current password</label>
              <input 
                type="password" 
                required 
                className="input" 
                value={passwordForm.currentPassword} 
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                placeholder="Enter current password" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">new password</label>
              <input 
                type="password" 
                required 
                minLength={8} 
                className="input" 
                value={passwordForm.newPassword} 
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                placeholder="Minimum 8 characters" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">re-enter password</label>
              <input 
                type="password" 
                required 
                className="input" 
                value={passwordForm.confirmPassword} 
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                placeholder="Re-enter your new password" 
              />
            </div>
            <div className="flex gap-3 pt-6">
              <button type="submit" disabled={savingPwd} className="btn-primary flex-1 shadow-lg shadow-primary-500/20 py-4">
                {savingPwd ? (
                  <div className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : 'Update Password'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary px-6">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

function AdminUserCreationSection() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [loading, setLoading] = useState(false)

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-10 animate-slow-fade p-2 md:p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-3xl bg-red-500/10 text-red-500 shadow-inner">
            <PlusIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Connect Account</h3>
            <p className="text-sm text-slate-400 font-medium">Link other platforms or add new users (Admin only)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-10 flex flex-col justify-between min-h-[300px] border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-4">
              <FingerPrintIcon className="w-12 h-12 text-primary-400" />
              <h4 className="text-3xl font-black tracking-tight leading-tight">Admin Privileges Required</h4>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">Only administrators have the power to invite new members to this workspace.</p>
            </div>
            <button className="relative z-10 w-fit px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-black transition-all border border-white/20 backdrop-blur-sm">
              Learn about roles
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Google', color: 'bg-white', text: 'text-slate-900', connected: true },
              { name: 'Github', color: 'bg-slate-900', text: 'text-white', connected: false },
              { name: 'Apple', color: 'bg-black', text: 'text-white', connected: false },
              { name: 'Discord', color: 'bg-indigo-600', text: 'text-white', connected: false },
            ].map((social, idx) => (
              <div key={idx} className={`p-6 rounded-[2rem] border transition-all duration-300 hover:scale-[1.05] hover:rotate-2 shadow-sm flex flex-col items-center justify-center gap-4 text-center ${social.connected ? 'bg-primary-500/5 border-primary-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                <div className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center font-black ${social.color} ${social.text}`}>
                  {social.name[0]}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{social.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${social.connected ? 'text-primary-500' : 'text-slate-400'}`}>
                    {social.connected ? 'Connected' : 'Connect'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userApi.adminCreateUser(form)
      toast.success('User created successfully!')
      setForm({ name: '', email: '', password: '', role: 'USER' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10 animate-slow-fade p-2 md:p-6">
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-3xl bg-primary-500/10 text-primary-500 shadow-inner">
          <PlusIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Add New Account</h3>
          <p className="text-sm text-slate-400 font-medium">Create a new user seat in your workspace</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-morphism dark:glass-morphism-dark p-8 md:p-10 rounded-[3rem] space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Full Name</label>
                <input
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Initial Password</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-4">User Role</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-sm font-black focus:ring-2 focus:ring-primary-500 transition-all"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="USER">Standard User</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="group relative w-full md:w-auto px-12 py-5 bg-primary-500 text-white rounded-3xl font-black text-sm transition-all duration-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loading ? 'Processing...' : 'Create New User Account'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
              <FingerPrintIcon className="w-6 h-6 animate-pulse" />
              <h4 className="font-black text-lg">Secure Invite</h4>
            </div>
            <p className="text-sm text-amber-700/80 dark:text-amber-500/80 leading-relaxed font-medium">
              Adding new users will consume one seat from your current subscription plan. New users will receive an email to complete their setup.
            </p>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 space-y-4">
            <h4 className="font-black text-lg text-indigo-600 dark:text-indigo-400 tracking-tight">Enterprise Controls</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-indigo-500/60">
                <span>Active Seats</span>
                <span>4 / 10</span>
              </div>
              <div className="w-full h-2 bg-indigo-500/20 rounded-full overflow-hidden">
                <div className="w-[40%] h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserProfileSection({ user, onUpdateClick, onImageUpload, uploading, fileInputRef }) {
  return (
    <div className="space-y-10 animate-slow-fade p-2 md:p-6">
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 dark:border-slate-800 p-8 md:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className={`relative p-1 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 shadow-2xl transition-all duration-500 hover:rotate-3 ${uploading ? 'animate-spin' : ''}`}>
              <div className="overflow-hidden rounded-full w-40 h-40 md:w-48 md:h-48 border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <UserIcon className="w-20 h-20 text-slate-400 dark:text-slate-500" />
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-4 right-4 w-12 h-12 glass-morphism dark:glass-morphism-dark rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-primary-500/40 group/btn overflow-hidden"
              title="Change Photo"
            >
              <div className="absolute inset-0 bg-primary-500 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
              <CameraIcon className={`w-6 h-6 ${uploading ? 'animate-bounce' : 'text-primary-500'}`} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h3 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                  {user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'Anonymous User'}
                </h3>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm border ${user?.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary-500/10 text-primary-500 border-primary-500/20'}`}>
                  {user?.role}
                </span>
              </div>
              <p className="text-lg text-slate-400 font-medium tracking-tight">
                {user?.email}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button 
                onClick={onUpdateClick} 
                className="group relative px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative flex items-center gap-2">
                  <IdentificationIcon className="w-5 h-5" />
                  Edit Profile Details
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'First Name', value: user?.firstName || '—', icon: IdentificationIcon },
          { label: 'Last Name', value: user?.lastName || '—', icon: IdentificationIcon },
          { label: 'Phone Number', value: user?.phone || '—', icon: PhoneIcon },
        ].map((field, idx) => (
          <div key={idx} className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/5 hover:-translate-y-2">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-all duration-300">
                <field.icon className="w-6 h-6" />
              </div>
              <button onClick={onUpdateClick} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-primary-500 transition-all">
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{field.label}</p>
            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{field.value}</p>
          </div>
        ))}
      </div>

      {/* Bio Card */}
      <div className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/5 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-all duration-300">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Biography</h4>
              <p className="text-xs text-slate-400 font-medium">A brief description of yourself</p>
            </div>
          </div>
          <button 
            onClick={onUpdateClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary-500 hover:bg-primary-500/5 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Edit Bio
          </button>
        </div>
        <div className="relative">
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {user?.bio || 'No bio provided yet. Tell us more about yourself to help others get to know you better.'}
          </p>
          {!user?.bio && (
            <div className="mt-4 p-4 rounded-2xl bg-blue-500/5 border border-dashed border-blue-500/20 text-blue-500 text-sm font-medium">
              💡 Pro tip: Users with completed bios are 3x more likely to connect!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AccountSection({ user, onChangePasswordClick }) {
  return (
    <div className="space-y-10 animate-slow-fade p-2 md:p-6">
      {/* Security Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-3xl bg-primary-500/10 text-primary-500 shadow-inner">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account & Security</h3>
            <p className="text-sm text-slate-400 font-medium">Protect your account with advanced security features</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
          <ClockIcon className="w-4 h-4" />
          Last update: 2 hours ago
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Password & Authentication Card */}
        <div className="group rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 transition-all hover:shadow-2xl hover:shadow-primary-500/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <KeyIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">Authentication</h4>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white">Password</p>
                <p className="text-xs text-slate-400 font-medium">Last changed 3 months ago</p>
              </div>
              <button 
                onClick={onChangePasswordClick}
                className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-black shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Change
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400 font-medium">Add an extra layer of security</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer group/toggle">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-12 h-7 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Activity Card */}
        <div className="group rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 transition-all hover:shadow-2xl hover:shadow-primary-500/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <CommandLineIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">Recent Activity</h4>
          </div>
          
          <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
            {[
              { event: 'Logged in from Chrome on MacOS', time: '10 minutes ago', location: 'New York, USA', status: 'success' },
              { event: 'Password changed successfully', time: '3 months ago', location: 'London, UK', status: 'warning' },
              { event: 'New device detected: iPhone 15', time: '5 months ago', location: 'Paris, France', status: 'info' },
            ].map((activity, idx) => (
              <div key={idx} className="relative pl-12">
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center bg-slate-50 dark:bg-slate-800 z-10 
                  ${activity.status === 'success' ? 'text-green-500' : activity.status === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{activity.event}</p>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                    {activity.time} • {activity.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Management Card */}
        <div className="lg:col-span-2 group rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 transition-all hover:shadow-2xl hover:shadow-primary-500/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                <DevicePhoneMobileIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">Active Sessions</h4>
                <p className="text-xs text-slate-400 font-medium">Manage and logout your sessions on other devices</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl text-sm font-black transition-all border border-red-500/20">
              Logout All Other Sessions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { device: 'MacBook Pro 16"', browser: 'Chrome 122', ip: '192.168.1.1', current: true },
              { device: 'iPhone 15 Pro', browser: 'Safari Mobile', ip: '172.16.0.4', current: false },
            ].map((session, idx) => (
              <div key={idx} className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${session.current ? 'bg-primary-500/5 border-primary-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${session.current ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {session.device.includes('iPhone') ? <DevicePhoneMobileIcon className="w-6 h-6" /> : <CommandLineIcon className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{session.device}</p>
                      {session.current && <span className="px-2 py-0.5 rounded-md bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest">Current</span>}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{session.browser} • {session.ip}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeOption, setActiveOption] = useState('profile')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleProfileSave = async (form) => {
    try {
      const updatedUser = await userApi.updateProfile(form)
      updateUser(updatedUser)
      toast.success('Profile updated successfully!')
      setIsModalOpen(false)
    } catch (err) {
      console.error('Update profile error:', err)
      toast.error('Failed to update profile')
    }
  }

  const handlePasswordChange = async (passwordForm) => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setIsPasswordModalOpen(false)
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
      return false
    }
  }

  const handleEmailChange = async (emailForm) => {
    try {
      await userApi.changeEmail({ newEmail: emailForm.newEmail, password: emailForm.password })
      toast.success('Email changed! Please log in again.')
      localStorage.clear()
      window.location.href = '/login'
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change email')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    try {
      const imageUrl = await userApi.uploadProfileImage(formData)
      updateUser({ profileImageUrl: imageUrl })
      toast.success('Profile image updated!')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const navItems = [
    { id: 'profile', label: 'User Profile', icon: UserIcon },
    { id: 'account', label: 'Account & Security', icon: ShieldCheckIcon },
    { id: 'admin', label: 'Add Account', icon: UsersIcon }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-slow-fade pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-slate-400 text-lg font-medium">Manage your workspace preferences and security settings</p>
        </div>
        <div className="flex items-center gap-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="px-4 py-2 text-sm font-bold text-slate-500 flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-500 text-sm font-bold border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            Connected
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-8 z-10">
          <div className="glass-morphism dark:glass-morphism-dark p-3 rounded-[2.5rem] space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveOption(item.id)}
                className={`w-full relative flex items-center justify-between px-6 py-5 rounded-[2rem] text-sm font-black transition-all duration-500 group overflow-hidden ${
                  activeOption === item.id 
                  ? 'text-white shadow-[0_15px_30px_rgba(0,0,0,0.15)] scale-[1.02]' 
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {activeOption === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 animate-gradient-x" />
                )}
                
                <span className="relative flex items-center gap-4">
                  <item.icon className={`w-6 h-6 transition-all duration-500 ${activeOption === item.id ? 'scale-110 rotate-0' : 'group-hover:scale-110 group-hover:-rotate-12'}`} />
                  <span className="tracking-tight">{item.label}</span>
                </span>
                
                {activeOption === item.id && (
                  <div className="relative w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            <h4 className="text-xl font-black mb-2 opacity-90">Need Help?</h4>
            <p className="text-sm text-slate-400 font-medium mb-6">Our support team is available 24/7 to help you with anything.</p>
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-black transition-all border border-white/10">
              Get Support
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-h-[600px]">
          {activeOption === 'profile' && (
            <UserProfileSection 
              user={user} 
              onUpdateClick={() => setIsModalOpen(true)}
              onImageUpload={handleImageUpload}
              uploading={uploading}
              fileInputRef={fileInputRef}
            />
          )}
          {activeOption === 'account' && (
            <AccountSection user={user} onChangePasswordClick={() => setIsPasswordModalOpen(true)} />
          )}
          {activeOption === 'admin' && (
            <AdminUserCreationSection />
          )}
        </main>
      </div>

      {isModalOpen && (
        <UpdateProfileModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onProfileSave={handleProfileSave}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
        />
      )}

      {isPasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onPasswordChange={handlePasswordChange}
        />
      )}
    </div>
  )
}
