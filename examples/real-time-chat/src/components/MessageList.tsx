import React, { useEffect, useRef } from 'react'
import { useChat } from '../hooks/useChat'
import { MessageItem } from './MessageItem'
import { TypingIndicator } from './TypingIndicator'

export function MessageList() {
  const { messages, currentUser } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">💬</div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id || message.tempId}
          message={message}
          isOwn={message.author.id === currentUser?.id}
        />
      ))}
      
      <TypingIndicator />
      <div ref={messagesEndRef} />
    </div>
  )
}