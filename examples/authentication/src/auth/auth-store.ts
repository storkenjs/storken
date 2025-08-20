import { create } from 'storken'
import { authService } from './auth-service'
import type { AuthState } from './auth-types'

export const [useAuth] = create({
  initialValues: {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false  // Start with false - only true during async operations
    } as AuthState
  },

  // Note: Removed async getter to prevent infinite re-render loops
  // Token verification is now handled in the useAuth hook's initializeAuth function

  setters: {
    // Persist token and user on auth state change - no API calls here
    auth: (storken: any, authState: AuthState) => {
      if (authState.token && authState.user) {
        localStorage.setItem('auth_token', authState.token)
        localStorage.setItem('auth_user', JSON.stringify(authState.user))
      } else {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  },

  plugins: {
    // Auto logout on token expiry
    tokenMonitor: (storken: any) => {
      let intervalId: NodeJS.Timeout

      const checkTokenExpiry = () => {
        const token = localStorage.getItem('auth_token')
        if (!token) return

        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (Date.now() / 1000 > payload.exp) {
            // Token expired, logout user
            storken.set('auth', {
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false
            })
          }
        } catch (error) {
          console.error('Token validation error:', error)
        }
      }

      // Check every minute
      intervalId = setInterval(checkTokenExpiry, 60000)

      return {
        cleanup: () => {
          if (intervalId) clearInterval(intervalId)
        }
      }
    }
  }
})