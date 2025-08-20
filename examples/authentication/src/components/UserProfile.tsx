import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function UserProfile() {
  const { user, logout, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!user) return null

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    
    const result = await updateProfile(editData)
    
    if (result.success) {
      setMessage('Profile updated successfully!')
      setIsEditing(false)
    } else {
      setMessage(`Error: ${result.error}`)
    }
    
    setLoading(false)
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email
    })
    setIsEditing(false)
    setMessage('')
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="flex items-center">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full border-4 border-white mr-4"
            />
          )}
          <div className="text-white">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-blue-100">Welcome back!</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.startsWith('Error') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md">{user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md">{user.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <p className="px-3 py-2 bg-gray-50 rounded-md font-mono text-sm">{user.id}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          )}

          <button
            onClick={logout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}