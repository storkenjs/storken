import React, { useState, useRef, useCallback } from 'react'
import { useChat } from '../hooks/useChat'

export function MessageInput() {
  const { sendMessage, startTyping, stopTyping, isConnected } = useChat()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (message.trim() && isConnected) {
      sendMessage(message)
      setMessage('')
      handleStopTyping()
    }
  }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessage(value)

    if (value && !isTyping && isConnected) {
      setIsTyping(true)
      startTyping()
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 1000)
  }, [isTyping, isConnected, startTyping])

  const handleStopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false)
      stopTyping()
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [isTyping, stopTyping])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    } else if (e.key === 'Escape') {
      handleStopTyping()
    }
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={
              isConnected 
                ? "Type a message... (Enter to send, Shift+Enter for new line)" 
                : "Connecting..."
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={!isConnected}
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500">
              {message.length}/1000 characters
            </div>
            
            <div className="flex items-center space-x-2">
              {!isConnected && (
                <span className="text-xs text-red-500 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  Disconnected
                </span>
              )}
              
              {isConnected && (
                <span className="text-xs text-green-500 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Connected
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={!message.trim() || !isConnected}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed self-start"
        >
          Send
        </button>
      </form>
    </div>
  )
}