import React, { useState } from 'react'
import { useChat } from '../hooks/useChat'
import type { Message } from '../store/types'

interface MessageItemProps {
  message: Message
  isOwn: boolean
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  const { editMessage, deleteMessage } = useChat()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const handleSave = () => {
    if (editContent.trim() !== message.content && editContent.trim()) {
      editMessage(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditContent(message.content)
      setIsEditing(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending': return '⏳'
      case 'sent': return '✓'
      case 'delivered': return '✓✓'
      case 'error': return '❌'
      default: return ''
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          {!isOwn && (
            <img
              src={message.author.avatar}
              alt={message.author.name}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          )}

          {/* Message bubble */}
          <div className={`rounded-lg px-4 py-2 max-w-full ${
            isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-900'
          } ${message.status === 'error' ? 'bg-red-100 border border-red-300' : ''}`}>
            
            {/* Author and time */}
            {!isOwn && (
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {message.author.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
                {message.edited && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}
              </div>
            )}

            {/* Message content */}
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSave}
                className="w-full resize-none bg-white text-gray-900 rounded px-2 py-1 text-sm"
                rows={2}
                autoFocus
              />
            ) : (
              <div className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}

            {/* Own message metadata */}
            {isOwn && (
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-blue-100">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.edited && (
                    <span className="text-blue-200">(edited)</span>
                  )}
                </div>
                <span className="text-xs text-blue-200">
                  {getStatusIcon()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions for own messages */}
        {isOwn && !isEditing && message.status !== 'sending' && (
          <div className="flex justify-end mt-1 space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-500 hover:text-gray-700"
              title="Edit message"
            >
              ✏️
            </button>
            <button
              onClick={() => deleteMessage(message.id)}
              className="text-xs text-gray-500 hover:text-red-500"
              title="Delete message"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}