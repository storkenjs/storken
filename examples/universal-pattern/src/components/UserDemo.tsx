import React, { useState } from 'react'
import { useUniversal } from '../store/universal-store'
import type { User } from '../types'

export function UserDemo() {
  const [currentUser, setCurrentUser, resetUser] = useUniversal('currentUser')
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', email: '' })

  const startEdit = () => {
    if (currentUser) {
      setEditData({ name: currentUser.name, email: currentUser.email })
      setIsEditing(true)
    }
  }

  const saveChanges = async () => {
    if (currentUser && (editData.name.trim() || editData.email.trim())) {
      const updatedUser = {
        ...currentUser,
        name: editData.name.trim() || currentUser.name,
        email: editData.email.trim() || currentUser.email
      }
      await setCurrentUser(updatedUser)
      setIsEditing(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditData({ name: '', email: '' })
  }

  const createDemoUser = async () => {
    const demoUser = {
      id: Date.now().toString(),
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=f093fb&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await setCurrentUser(demoUser)
  }

  const refreshUser = async () => {
    setLoading(true)
    try {
      // Manual refresh - in real app this would be a database/API call
      const user = {
        id: '1',
        name: 'John Doe (Refreshed)',
        email: 'john.refreshed@example.com',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=f093fb&color=fff',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      }
      await setCurrentUser(user)
    } catch (error) {
      console.error('Error refreshing user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="demo-card">
      <h3>👤 User Management Demo</h3>
      <p className="text-gray-600 mb-4">
        Demonstrates universal user operations that work identically on server and client
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Display */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner mr-3"></div>
              <span className="text-gray-600">Loading user data...</span>
            </div>
          ) : currentUser ? (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center space-x-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full border-4 border-white"
                />
                <div>
                  <h4 className="text-xl font-bold">{currentUser.name}</h4>
                  <p className="text-blue-100">{currentUser.email}</p>
                  <p className="text-blue-200 text-sm">
                    ID: {currentUser.id}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-100">
                <div>Created: {currentUser.createdAt.toLocaleDateString()}</div>
                <div>Updated: {currentUser.updatedAt.toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">👤</div>
              <p>No user data loaded</p>
              <button
                onClick={createDemoUser}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Create Demo User
              </button>
            </div>
          )}
        </div>

        {/* User Actions */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Edit User</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={saveChanges}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">User Actions</h4>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={refreshUser}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh User Data'}
                </button>
                
                {currentUser && (
                  <button
                    onClick={startEdit}
                    className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                  >
                    Edit User Profile
                  </button>
                )}
                
                <button
                  onClick={resetUser}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Reset User Data
                </button>
                
                {!currentUser && (
                  <button
                    onClick={createDemoUser}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                  >
                    Create Demo User
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Universal API Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-2">🔄 Universal Operations</h5>
            <div className="text-sm text-gray-600 space-y-1">
              <div>✅ Same code for server and client</div>
              <div>✅ Automatic environment detection</div>
              <div>✅ Optimistic updates with rollback</div>
              <div>✅ Built-in loading state management</div>
              <div>✅ Type-safe operations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-2">💻 Code Example</h4>
        <div className="code-block">
          <div className="text-green-400">// Universal user operations</div>
          <div className="text-blue-400">const</div> [user, setUser, resetUser, loading, refresh] = <div className="text-blue-400">useUniversal</div>(<div className="text-green-400">'currentUser'</div>)
          <br />
          <div className="text-green-400">// Works on both server and client!</div>
          <div className="text-blue-400">await</div> setUser(updatedUser) <div className="text-green-400">// Auto-detects environment</div>
          <div className="text-blue-400">await</div> refresh() <div className="text-green-400">// Server: DB query, Client: API call</div>
        </div>
      </div>
    </div>
  )
}