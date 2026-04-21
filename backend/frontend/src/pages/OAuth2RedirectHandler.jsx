import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

export default function OAuth2RedirectHandler() {
    const navigate = useNavigate()
    const location = useLocation()
    const { updateUser } = useAuth()

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const token = params.get('token')
        const refreshToken = params.get('refreshToken')

        if (token) {
            localStorage.setItem('accessToken', token)
            localStorage.setItem('refreshToken', refreshToken)
            
            // Load user profile after successful login
            authApi.getCurrentUser()
                .then(user => {
                    updateUser(user)
                    toast.success('Successfully logged in with Google!')
                    navigate('/dashboard')
                })
                .catch(err => {
                    console.error('Failed to fetch user after Google login:', err)
                    toast.error('Authentication failed')
                    navigate('/login')
                })
        } else {
            const error = params.get('error')
            toast.error(error || 'Failed to login with Google')
            navigate('/login')
        }
    }, [location, navigate, updateUser])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    )
}
