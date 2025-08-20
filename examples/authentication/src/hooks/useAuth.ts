import { useAuth as useAuthStore } from '../auth/auth-store'
import { authService } from '../auth/auth-service'
import type { LoginCredentials, RegisterData, User } from '../auth/auth-types'

export function useAuth() {
  const [auth, setAuth, , loading] = useAuthStore('auth')

  // Initialize auth from localStorage (without verification for now to avoid loops)
  // For production, implement token verification with proper debouncing
  const initializeAuth = async () => {
    const token = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser)
        // For demo purposes, we trust the saved user data
        // In production, you'd verify the token with the backend
        setAuth({ user, token, isAuthenticated: true, loading: false })
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        setAuth({ user: null, token: null, isAuthenticated: false, loading: false })
      }
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuth(prev => ({ ...prev, loading: true }))
      const { user, token } = await authService.login(credentials)
      setAuth({ user, token, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (error: any) {
      setAuth(prev => ({ ...prev, loading: false }))
      return { success: false, error: error.message }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setAuth(prev => ({ ...prev, loading: true }))
      const { user, token } = await authService.register(data)
      setAuth({ user, token, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (error: any) {
      setAuth(prev => ({ ...prev, loading: false }))
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setAuth({ user: null, token: null, isAuthenticated: false, loading: false })
  }

  const updateProfile = async (userData: Partial<User>) => {
    if (!auth.user) return { success: false, error: 'Not authenticated' }

    try {
      const updatedUser = await authService.updateProfile(userData)
      setAuth(prev => ({ ...prev, user: updatedUser }))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    user: auth?.user || null,
    isAuthenticated: auth?.isAuthenticated || false,
    loading: loading || (auth?.loading || false),
    login,
    register,
    logout,
    updateProfile,
    initializeAuth
  }
}