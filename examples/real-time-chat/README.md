# Real-Time Chat Example

Complete real-time chat application using Storken with WebSocket integration, demonstrating live updates and optimistic UI patterns.

## Features

- 💬 Real-time messaging with WebSocket
- 👥 Multiple chat rooms
- ⚡ Optimistic message updates
- 📱 Responsive chat interface
- 🔔 Typing indicators
- 📊 Online user presence
- 💾 Message persistence
- 🚀 Auto-reconnection

## Setup

```bash
# Install dependencies
npm install storken ws socket.io-client

# Copy example files
cp -r examples/real-time-chat/* your-project/
```

## File Structure

```
real-time-chat/
├── src/
│   ├── store/
│   │   ├── chat-store.ts        # Chat state management
│   │   ├── socket-store.ts      # WebSocket connection
│   │   └── types.ts             # TypeScript types
│   ├── components/
│   │   ├── ChatRoom.tsx         # Main chat interface
│   │   ├── MessageList.tsx      # Message display
│   │   ├── MessageInput.tsx     # Message input form
│   │   ├── UserList.tsx         # Online users
│   │   └── TypingIndicator.tsx  # Typing status
│   ├── hooks/
│   │   ├── useChat.ts           # Chat management
│   │   └── useSocket.ts         # WebSocket hook
│   └── services/
│       └── socket-service.ts    # WebSocket service
├── README.md
└── package.json
```

## Core Implementation

### Socket Store

```typescript
// src/store/socket-store.ts
import { create } from 'storken'
import { socketService } from '../services/socket-service'
import type { SocketState, ConnectionStatus } from './types'

export const [useSocket] = create({
  initialValues: {
    connection: {
      status: 'disconnected',
      error: null,
      reconnectAttempts: 0
    } as SocketState
  },

  getters: {
    // Auto-connect on app start
    connection: async (): Promise<SocketState> => {
      try {
        await socketService.connect()
        return {
          status: 'connected',
          error: null,
          reconnectAttempts: 0
        }
      } catch (error) {
        return {
          status: 'error',
          error: error.message,
          reconnectAttempts: 0
        }
      }
    }
  },

  setters: {
    // Handle connection state changes
    connection: async (storken, state: SocketState) => {
      if (state.status === 'disconnected' && state.reconnectAttempts < 5) {
        // Auto-reconnect with exponential backoff
        setTimeout(() => {
          socketService.reconnect()
        }, Math.pow(2, state.reconnectAttempts) * 1000)
      }
    }
  },

  plugins: {
    // Socket event handling
    socketEvents: (storken) => {
      socketService.on('connect', () => {
        storken.set('connection', {
          status: 'connected',
          error: null,
          reconnectAttempts: 0
        })
      })

      socketService.on('disconnect', () => {
        storken.set('connection', {
          status: 'disconnected',
          error: null,
          reconnectAttempts: storken.get('connection').reconnectAttempts + 1
        })
      })

      socketService.on('error', (error) => {
        storken.set('connection', {
          status: 'error',
          error: error.message,
          reconnectAttempts: storken.get('connection').reconnectAttempts
        })
      })

      return {
        disconnect: () => socketService.disconnect()
      }
    }
  }
})
```

### Chat Store

```typescript
// src/store/chat-store.ts
import { create } from 'storken'
import { socketService } from '../services/socket-service'
import type { Message, Room, User, TypingUser } from './types'

export const [useChat] = create({
  initialValues: {
    messages: [] as Message[],
    currentRoom: 'general' as string,
    rooms: ['general', 'random', 'tech'] as string[],
    onlineUsers: [] as User[],
    typingUsers: [] as TypingUser[],
    currentUser: null as User | null
  },

  getters: {
    // Load initial messages for room
    messages: async (storken, roomId: string): Promise<Message[]> => {
      return await socketService.loadMessages(roomId)
    },

    // Get online users
    onlineUsers: async (): Promise<User[]> => {
      return await socketService.getOnlineUsers()
    }
  },

  setters: {
    // Optimistic message sending
    messages: async (storken, messages: Message[]) => {
      const newMessages = messages.filter(msg => !msg.id)
      
      // Send new messages via socket
      for (const message of newMessages) {
        if (!message.id) {
          socketService.sendMessage({
            ...message,
            id: `temp-${Date.now()}`, // Temporary ID
            timestamp: new Date(),
            status: 'sending'
          })
        }
      }
    }
  },

  plugins: {
    // Real-time message handling
    messageSync: (storken) => {
      // Incoming messages
      socketService.on('message', (message: Message) => {
        storken.set('messages', prev => {
          // Replace temp message if it exists, otherwise append
          const tempIndex = prev.findIndex(m => 
            m.tempId && m.tempId === message.tempId
          )
          
          if (tempIndex >= 0) {
            const updated = [...prev]
            updated[tempIndex] = { ...message, status: 'sent' }
            return updated
          }
          
          return [...prev, message]
        })
      })

      // Message status updates
      socketService.on('messageStatus', ({ messageId, status }) => {
        storken.set('messages', prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status }
              : msg
          )
        )
      })

      // Typing indicators
      socketService.on('userTyping', ({ user, isTyping }) => {
        storken.set('typingUsers', prev => {
          if (isTyping) {
            return prev.some(u => u.id === user.id) 
              ? prev 
              : [...prev, { ...user, timestamp: new Date() }]
          } else {
            return prev.filter(u => u.id !== user.id)
          }
        })
      })

      // User presence
      socketService.on('userJoined', (user: User) => {
        storken.set('onlineUsers', prev => 
          prev.some(u => u.id === user.id) ? prev : [...prev, user]
        )
      })

      socketService.on('userLeft', (userId: string) => {
        storken.set('onlineUsers', prev => 
          prev.filter(u => u.id !== userId)
        )
      })

      return {
        cleanup: () => {
          socketService.off('message')
          socketService.off('messageStatus')
          socketService.off('userTyping')
          socketService.off('userJoined')
          socketService.off('userLeft')
        }
      }
    },

    // Auto-clean typing indicators
    typingCleanup: (storken) => {
      const interval = setInterval(() => {
        storken.set('typingUsers', prev => 
          prev.filter(user => 
            Date.now() - user.timestamp.getTime() < 3000
          )
        )
      }, 1000)

      return {
        cleanup: () => clearInterval(interval)
      }
    }
  }
})
```

### Chat Hook

```typescript
// src/hooks/useChat.ts
import { useChat as useChatStore } from '../store/chat-store'
import { useSocket } from './useSocket'
import { socketService } from '../services/socket-service'
import type { Message, User } from '../store/types'

export function useChat() {
  const [messages, setMessages] = useChatStore<Message[]>('messages', [])
  const [currentRoom, setCurrentRoom] = useChatStore<string>('currentRoom')
  const [onlineUsers] = useChatStore<User[]>('onlineUsers', [])
  const [typingUsers] = useChatStore<TypingUser[]>('typingUsers', [])
  const [currentUser] = useChatStore<User | null>('currentUser')
  
  const { isConnected } = useSocket()

  const sendMessage = (content: string) => {
    if (!currentUser || !isConnected) return

    const tempId = `temp-${Date.now()}`
    const newMessage: Message = {
      id: '',
      tempId,
      content: content.trim(),
      author: currentUser,
      room: currentRoom,
      timestamp: new Date(),
      status: 'sending'
    }

    // Optimistic update
    setMessages(prev => [...prev, newMessage])
  }

  const joinRoom = (roomId: string) => {
    if (roomId === currentRoom) return
    
    socketService.leaveRoom(currentRoom)
    socketService.joinRoom(roomId)
    setCurrentRoom(roomId)
    
    // Load room messages
    setMessages([]) // Clear current messages
  }

  const startTyping = () => {
    if (!currentUser) return
    socketService.startTyping(currentRoom, currentUser)
  }

  const stopTyping = () => {
    if (!currentUser) return
    socketService.stopTyping(currentRoom, currentUser)
  }

  const editMessage = (messageId: string, newContent: string) => {
    socketService.editMessage(messageId, newContent)
    
    // Optimistic update
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent, edited: true }
        : msg
    ))
  }

  const deleteMessage = (messageId: string) => {
    socketService.deleteMessage(messageId)
    
    // Optimistic removal
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  // Room messages filtered by current room
  const roomMessages = messages.filter(msg => msg.room === currentRoom)

  return {
    // Data
    messages: roomMessages,
    currentRoom,
    onlineUsers,
    typingUsers: typingUsers.filter(user => user.id !== currentUser?.id),
    currentUser,
    isConnected,

    // Actions
    sendMessage,
    joinRoom,
    startTyping,
    stopTyping,
    editMessage,
    deleteMessage
  }
}
```

### Message Input Component

```typescript
// src/components/MessageInput.tsx
import React, { useState, useRef, useCallback } from 'react'
import { useChat } from '../hooks/useChat'

export function MessageInput() {
  const { sendMessage, startTyping, stopTyping, isConnected } = useChat()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (message.trim()) {
      sendMessage(message)
      setMessage('')
      handleStopTyping()
    }
  }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessage(value)

    if (value && !isTyping) {
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
  }, [isTyping, startTyping])

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
    if (e.key === 'Escape') {
      handleStopTyping()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={
            isConnected 
              ? "Type a message..." 
              : "Connecting..."
          }
          className="message-input"
          disabled={!isConnected}
          maxLength={1000}
        />
        
        <button 
          type="submit" 
          disabled={!message.trim() || !isConnected}
          className="send-button"
        >
          Send
        </button>
      </div>
      
      <div className="input-footer">
        <span className="char-count">
          {message.length}/1000
        </span>
      </div>
    </form>
  )
}
```

### Message List Component

```typescript
// src/components/MessageList.tsx
import React, { useEffect, useRef } from 'react'
import { useChat } from '../hooks/useChat'
import { TypingIndicator } from './TypingIndicator'

export function MessageList() {
  const { messages, currentUser } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getMessageStatus = (message: any) => {
    switch (message.status) {
      case 'sending': return '⏳'
      case 'sent': return '✓'
      case 'delivered': return '✓✓'
      case 'error': return '❌'
      default: return ''
    }
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div 
          key={message.id || message.tempId}
          className={`message ${
            message.author.id === currentUser?.id ? 'own-message' : 'other-message'
          } ${message.status === 'error' ? 'error' : ''}`}
        >
          <div className="message-header">
            <span className="author-name">
              {message.author.name}
            </span>
            <span className="message-time">
              {formatTime(message.timestamp)}
            </span>
            {message.edited && (
              <span className="edited-indicator">(edited)</span>
            )}
          </div>
          
          <div className="message-content">
            {message.content}
          </div>
          
          {message.author.id === currentUser?.id && (
            <div className="message-status">
              {getMessageStatus(message)}
            </div>
          )}
        </div>
      ))}
      
      <TypingIndicator />
      <div ref={messagesEndRef} />
    </div>
  )
}
```

### Chat Room Component

```typescript
// src/components/ChatRoom.tsx
import React from 'react'
import { useChat } from '../hooks/useChat'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { UserList } from './UserList'

export function ChatRoom() {
  const { currentRoom, joinRoom, isConnected } = useChat()
  const rooms = ['general', 'random', 'tech', 'design']

  return (
    <div className="chat-room">
      <header className="chat-header">
        <div className="room-selector">
          {rooms.map(room => (
            <button
              key={room}
              onClick={() => joinRoom(room)}
              className={`room-tab ${currentRoom === room ? 'active' : ''}`}
            >
              #{room}
            </button>
          ))}
        </div>
        
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </header>

      <div className="chat-body">
        <div className="messages-container">
          <MessageList />
        </div>
        
        <div className="users-sidebar">
          <UserList />
        </div>
      </div>

      <footer className="chat-footer">
        <MessageInput />
      </footer>
    </div>
  )
}
```

## Key Features Demonstrated

### 1. **Real-Time Communication**
- WebSocket integration with Socket.IO
- Live message updates
- Typing indicators
- User presence

### 2. **Optimistic Updates**
- Immediate message display
- Temporary IDs until server confirmation
- Status tracking (sending, sent, delivered)
- Error handling with retry

### 3. **State Synchronization**
- Server state reconciliation
- Conflict resolution
- Auto-reconnection
- Offline message queuing

### 4. **User Experience**
- Smooth scrolling to new messages
- Character count indicators
- Keyboard shortcuts
- Visual connection status

## WebSocket Service

```typescript
// src/services/socket-service.ts
import io, { Socket } from 'socket.io-client'
import type { Message, User } from '../store/types'

class SocketService {
  private socket: Socket | null = null
  private messageQueue: Message[] = []

  async connect(): Promise<void> {
    this.socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001')
    
    return new Promise((resolve, reject) => {
      this.socket!.on('connect', () => {
        this.flushMessageQueue()
        resolve()
      })
      
      this.socket!.on('connect_error', reject)
    })
  }

  sendMessage(message: Message): void {
    if (this.socket?.connected) {
      this.socket.emit('message', message)
    } else {
      this.messageQueue.push(message)
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!
      this.socket!.emit('message', message)
    }
  }

  on(event: string, handler: (...args: any[]) => void): void {
    this.socket?.on(event, handler)
  }

  off(event: string): void {
    this.socket?.off(event)
  }
}

export const socketService = new SocketService()
```

## Running the Example

```bash
# Start the chat server (separate repository)
npm run start:server

# Start the React app
npm run dev
```

Open multiple browser tabs to test real-time communication.

## Key Benefits

- ✅ **Real-Time**: Instant message delivery
- ✅ **Resilient**: Auto-reconnection and offline queuing  
- ✅ **Optimistic**: Immediate UI updates
- ✅ **Type-Safe**: Full TypeScript integration
- ✅ **Scalable**: Plugin-based architecture

---

*This example shows how Storken handles complex real-time state synchronization with ease.*