import React from 'react'
import { useChat } from '../hooks/useChat'

export function ChatHeader() {
  const { 
    currentRoomInfo, 
    onlineUsers, 
    connection, 
    isConnected, 
    isConnecting, 
    hasError,
    reconnect 
  } = useChat()

  const getConnectionStatus = () => {
    if (isConnecting) return { text: 'Connecting...', color: 'text-yellow-600', icon: '🟡' }
    if (isConnected) return { text: 'Connected', color: 'text-green-600', icon: '🟢' }
    if (hasError) return { text: 'Connection Error', color: 'text-red-600', icon: '🔴' }
    return { text: 'Disconnected', color: 'text-gray-600', icon: '⚫' }
  }

  const status = getConnectionStatus()

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              #{currentRoomInfo?.name || 'Unknown Room'}
            </h1>
            <p className="text-sm text-gray-500">
              {currentRoomInfo?.description || 'No description available'}
            </p>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span>👥</span>
              <span>{currentRoomInfo?.memberCount || 0} members</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🟢</span>
              <span>{onlineUsers.length + 1} online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${status.color} flex items-center space-x-1`}>
              <span>{status.icon}</span>
              <span>{status.text}</span>
            </span>
            
            {connection.reconnectAttempts > 0 && (
              <span className="text-xs text-gray-500">
                (Attempt {connection.reconnectAttempts})
              </span>
            )}
            
            {(hasError || connection.status === 'disconnected') && (
              <button
                onClick={reconnect}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Reconnect
              </button>
            )}
          </div>

          {/* Room Actions */}
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Room settings"
            >
              ⚙️
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Room information"
            >
              ℹ️
            </button>
          </div>
        </div>
      </div>

      {/* Connection Error Banner */}
      {hasError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-sm text-red-700">
                Connection failed: {connection.error}
              </span>
            </div>
            <button
              onClick={reconnect}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Reconnecting Banner */}
      {isConnecting && connection.reconnectAttempts > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
            <span className="text-sm text-yellow-700">
              Reconnecting... (Attempt {connection.reconnectAttempts})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}