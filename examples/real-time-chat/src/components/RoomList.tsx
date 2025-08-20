import React from 'react'
import { useChat } from '../hooks/useChat'

export function RoomList() {
  const { rooms, currentRoom, joinRoom, isConnected } = useChat()

  const getRoomIcon = (roomId: string) => {
    switch (roomId) {
      case 'general': return '💬'
      case 'tech': return '💻'
      case 'random': return '🎲'
      case 'design': return '🎨'
      default: return '📺'
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Channels</h2>
      
      <div className="space-y-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => joinRoom(room.id)}
            disabled={!isConnected}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              currentRoom === room.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'hover:bg-gray-100 text-gray-700'
            } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getRoomIcon(room.id)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    #{room.name}
                  </p>
                  <span className="text-xs text-gray-500">
                    {room.memberCount}
                  </span>
                </div>
                {room.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {room.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            + Create Channel
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            📋 Browse All
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="mb-2">💡 Pro Tips:</div>
          <ul className="space-y-1 text-xs">
            <li>• Double-click messages to edit</li>
            <li>• Use Shift+Enter for new lines</li>
            <li>• Messages show delivery status</li>
          </ul>
        </div>
      </div>
    </div>
  )
}