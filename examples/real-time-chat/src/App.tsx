import React from 'react'
import { useChat } from './hooks/useChat'
import { ChatHeader } from './components/ChatHeader'
import { RoomList } from './components/RoomList'
import { MessageList } from './components/MessageList'
import { MessageInput } from './components/MessageInput'
import { UserList } from './components/UserList'

export default function App() {
  const { isConnecting } = useChat()

  if (isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Chat</h2>
          <p className="text-gray-600">Please wait while we establish the connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <ChatHeader />

      {/* Main chat area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Room list sidebar */}
        <RoomList />

        {/* Chat messages area */}
        <div className="flex-1 flex flex-col">
          <MessageList />
          <MessageInput />
        </div>

        {/* Users sidebar */}
        <UserList />
      </div>

      {/* Footer info */}
      <div className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>🚀 Powered by Storken v3.0</span>
            <span>💬 Real-time chat with WebSocket simulation</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Features: Optimistic updates, Auto-reconnect, Typing indicators</span>
          </div>
        </div>
      </div>
    </div>
  )
}