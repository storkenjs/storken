import React, { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { Navigation } from './components/Navigation'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'
import { UserProfile } from './components/UserProfile'
import { Dashboard } from './components/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

type Page = 'login' | 'register' | 'profile' | 'dashboard'

export default function App() {
  const { isAuthenticated, loading, initializeAuth } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('login')

  // Auth initialization - run only once on mount
  useEffect(() => {
    initializeAuth()
  }, []) // Empty deps - we only want this once

  // Redirect to dashboard when user logs in
  useEffect(() => {
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('dashboard')
    } else if (!isAuthenticated && (currentPage === 'profile' || currentPage === 'dashboard')) {
      setCurrentPage('login')
    }
  }, [isAuthenticated, currentPage])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginForm />
      case 'register':
        return <RegisterForm />
      case 'profile':
        return (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        )
      case 'dashboard':
        return (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      default:
        return <LoginForm />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!isAuthenticated && currentPage !== 'register' && (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Storken Authentication Demo
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Complete authentication system with JWT tokens, protected routes, and persistent sessions
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPage('login')}
                className={`px-6 py-2 rounded-lg font-medium ${
                  currentPage === 'login'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-blue-500 border border-blue-500'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className={`px-6 py-2 rounded-lg font-medium ${
                  currentPage === 'register'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-green-500 border border-green-500'
                }`}
              >
                Register
              </button>
            </div>
          </div>
        )}
        
        {renderCurrentPage()}
        
        {/* Features Showcase - Only show when not authenticated */}
        {!isAuthenticated && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-center mb-8">Authentication Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h3 className="font-semibold mb-2">JWT Authentication</h3>
                  <p className="text-sm text-gray-600">Secure token-based authentication with automatic validation</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💾</span>
                  </div>
                  <h3 className="font-semibold mb-2">Persistent Sessions</h3>
                  <p className="text-sm text-gray-600">Login state survives page refresh using localStorage</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h3 className="font-semibold mb-2">Protected Routes</h3>
                  <p className="text-sm text-gray-600">Automatic route protection with fallback components</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="font-semibold mb-2">Storken Integration</h3>
                  <p className="text-sm text-gray-600">Seamless state management with getters, setters, and plugins</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚪</span>
                  </div>
                  <h3 className="font-semibold mb-2">Auto Logout</h3>
                  <p className="text-sm text-gray-600">Automatic logout when tokens expire</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="font-semibold mb-2">Profile Management</h3>
                  <p className="text-sm text-gray-600">Complete user profile with edit capabilities</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}