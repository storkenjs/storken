# Authentication Example

Complete user authentication system using Storken with JWT tokens, login/logout flow, and protected routes.

## Features

- 🔐 JWT token authentication
- 👤 User registration and login
- 🔒 Protected routes and components
- 💾 Persistent login state
- 🚪 Automatic logout on token expiry
- 📱 Responsive auth forms

## Setup

```bash
# Install dependencies
npm install storken

# Copy example files
cp -r examples/authentication/* your-project/
```

## File Structure

```
authentication/
├── src/
│   ├── auth/
│   │   ├── auth-store.ts      # Auth state management
│   │   ├── auth-service.ts    # API calls
│   │   └── auth-types.ts      # TypeScript types
│   ├── components/
│   │   ├── LoginForm.tsx      # Login component
│   │   ├── RegisterForm.tsx   # Registration component
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   └── UserProfile.tsx    # User profile display
│   └── hooks/
│       └── useAuth.ts         # Auth hook
├── README.md
└── package.json
```

## Core Implementation

### Auth Store

```typescript
// src/auth/auth-store.ts
import { create } from 'storken'
import { authService } from './auth-service'
import type { User, AuthState } from './auth-types'

export const [useAuth] = create({
  initialValues: {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true
    } as AuthState
  },

  getters: {
    // Auto-login on app start
    auth: async (): Promise<AuthState> => {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        return { user: null, token: null, isAuthenticated: false, loading: false }
      }

      try {
        const user = await authService.verifyToken(token)
        return { user, token, isAuthenticated: true, loading: false }
      } catch {
        localStorage.removeItem('auth_token')
        return { user: null, token: null, isAuthenticated: false, loading: false }
      }
    }
  },

  setters: {
    // Persist token on auth state change
    auth: async (storken, authState: AuthState) => {
      if (authState.token) {
        localStorage.setItem('auth_token', authState.token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }
})
```

### Auth Hook

```typescript
// src/hooks/useAuth.ts
import { useAuth as useAuthStore } from '../auth/auth-store'
import { authService } from '../auth/auth-service'
import type { LoginCredentials, RegisterData } from '../auth/auth-types'

export function useAuth() {
  const [auth, setAuth] = useAuthStore<AuthState>('auth')

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user, token } = await authService.login(credentials)
      setAuth({ user, token, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const { user, token } = await authService.register(data)
      setAuth({ user, token, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (error) {
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
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    login,
    register,
    logout,
    updateProfile
  }
}
```

### Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
import React from 'react'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return fallback || <div>Please log in to access this page.</div>
  }

  return <>{children}</>
}
```

### Login Form Component

```typescript
// src/components/LoginForm.tsx
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const { login, loading } = useAuth()
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await login(credentials)
    if (!result.success) {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Login</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({
            ...prev,
            email: e.target.value
          }))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({
            ...prev,
            password: e.target.value
          }))}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

## Usage

```typescript
// App.tsx
import React from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/LoginForm'
import { UserProfile } from './components/UserProfile'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="app">
      {isAuthenticated ? (
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      ) : (
        <LoginForm />
      )}
    </div>
  )
}
```

## Key Features

### 1. **Automatic Token Validation**
- Checks token validity on app start
- Auto-logout on token expiry
- Seamless user experience

### 2. **Persistent State**
- Login state survives page refresh
- Secure token storage
- Automatic cleanup

### 3. **Type Safety**
- Full TypeScript support
- Type-safe API calls
- IntelliSense support

### 4. **Error Handling**
- Graceful error handling
- User-friendly error messages
- Fallback states

## API Integration

This example works with any backend that provides:

```typescript
// Expected API endpoints
POST /auth/login      // Login with email/password
POST /auth/register   // Register new user
GET  /auth/me         // Get current user
PUT  /auth/profile    // Update user profile
POST /auth/logout     // Logout (optional)
```

## Security Best Practices

- ✅ Tokens stored in localStorage (consider httpOnly cookies for production)
- ✅ Token validation on every app start
- ✅ Automatic logout on token expiry
- ✅ Protected routes and components
- ✅ Secure API communication

## Next Steps

- Add refresh token rotation
- Implement role-based access control
- Add social authentication
- Integrate with your backend API

---

*This example demonstrates Storken's flexibility for complex state management scenarios.*