import React from 'react'
import { useAuth } from '../hooks/useAuth'

interface NavigationProps {
  currentPage: 'login' | 'register' | 'profile' | 'dashboard'
  onNavigate: (page: 'login' | 'register' | 'profile' | 'dashboard') => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { isAuthenticated, user } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              🔐 Storken Auth Demo
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('profile')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Profile
                </button>
                <div className="flex items-center space-x-2">
                  {user?.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {user?.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'login'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 'register'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}