import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'https://personal-dashboard-1-6bo4.onrender.com/api/v1')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    // If the response is wrapped in our ApiResponse format, unwrap it
    if (response.data && response.data.hasOwnProperty('success') && response.data.hasOwnProperty('data')) {
      return response.data.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          // Note: Use axios directly here to avoid the interceptor unwrapping during refresh check
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
          const { accessToken } = response.data.data
          localStorage.setItem('accessToken', accessToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/auth/me'),
}

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
}

export const goalApi = {
  getGoals: (params) => api.get('/goals', { params }),
  getGoal: (id) => api.get(`/goals/${id}`),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  getOverdueGoals: () => api.get('/goals/overdue'),
}

export const taskApi = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getTodayTasks: () => api.get('/tasks/today'),
  getWeeklyTasks: () => api.get('/tasks/week'),
  getOverdueTasks: () => api.get('/tasks/overdue'),
}

export const financeApi = {
  getTransactions: (params) => api.get('/finance/transactions', { params }),
  getTransaction: (id) => api.get(`/finance/transactions/${id}`),
  createTransaction: (data) => api.post('/finance/transactions', data),
  updateTransaction: (id, data) => api.put(`/finance/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/finance/transactions/${id}`),
  getSummary: (from, to) => api.get('/finance/summary', { params: { from, to } }),
  getByDateRange: (from, to) => api.get('/finance/transactions/range', { params: { from, to } }),
}

export const journalApi = {
  getEntries: (params) => api.get('/journal', { params }),
  getEntry: (id) => api.get(`/journal/${id}`),
  createEntry: (data) => api.post('/journal', data),
  updateEntry: (id, data) => api.put(`/journal/${id}`, data),
  deleteEntry: (id) => api.delete(`/journal/${id}`),
  getByDateRange: (from, to) => api.get('/journal/range', { params: { from, to } }),
}

export const officeApi = {
  getToday: () => api.get('/office/today'),
  getHistory: (params) => api.get('/office/history', { params }),
  markAttendance: (data) => api.post('/office/attendance', data),
  saveSummary: (data) => api.post('/office/summary', data),
}

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  uploadProfileImage: (formData) => api.post('/users/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.patch('/users/change-password', data),
  changeEmail: (data) => api.patch('/users/change-email', data),
  adminCreateUser: (data) => api.post('/users/create', data),
}

export const habitApi = {
  getHabits: () => api.get('/habits'),
  createHabit: (data) => api.post('/habits', data),
  updateHabit: (id, data) => api.put(`/habits/${id}`, data),
  deleteHabit: (id) => api.delete(`/habits/${id}`),
  logHabit: (id, data) => api.post(`/habits/${id}/log`, data),
  getHabitLogs: (id, params) => api.get(`/habits/${id}/logs`, { params }),
  getTodayLogs: () => api.get('/habits/today'),
  getLogsByDate: (date) => api.get('/habits/logs/by-date', { params: { date } }),
}

export default api
