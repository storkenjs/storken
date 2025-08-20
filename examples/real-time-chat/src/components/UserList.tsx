import React from 'react'
import { useChat } from '../hooks/useChat'

export function UserList() {
  const { onlineUsers, currentUser } = useChat()

  const allUsers = currentUser ? [currentUser, ...onlineUsers] : onlineUsers

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'away': return 'Away'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Online Users ({allUsers.length})
      </h3>
      
      <div className="space-y-3">
        {allUsers.map((user) => (
          <div key={user.id} className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} border-2 border-white rounded-full`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                  {user.id === currentUser?.id && (
                    <span className="text-xs text-gray-500 ml-1">(You)</span>
                  )}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {getStatusText(user.status)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {allUsers.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <div className="text-2xl mb-2">👥</div>
          <p className="text-sm">No users online</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">User Stats</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Total Users:</span>
            <span>{allUsers.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Online:</span>
            <span className="text-green-600">
              {allUsers.filter(u => u.status === 'online').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Away:</span>
            <span className="text-yellow-600">
              {allUsers.filter(u => u.status === 'away').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}