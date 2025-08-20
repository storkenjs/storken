import { create } from 'storken'
import { socketService } from '../services/mock-socket-service'
import type { Message, Room, User, TypingUser, ConnectionStatus } from './types'

export const [useChat] = create({
  initialValues: {
    messages: [] as Message[],
    currentRoom: 'general' as string,
    rooms: [
      { id: 'general', name: 'General', description: 'General discussion', memberCount: 12 },
      { id: 'tech', name: 'Tech Talk', description: 'Technology discussions', memberCount: 8 },
      { id: 'random', name: 'Random', description: 'Random conversations', memberCount: 15 },
      { id: 'design', name: 'Design', description: 'Design and UI/UX', memberCount: 6 }
    ] as Room[],
    onlineUsers: [] as User[],
    typingUsers: [] as TypingUser[],
    currentUser: {
      id: 'current-user',
      name: 'You',
      status: 'online',
      avatar: 'https://ui-avatars.com/api/?name=You&background=667eea&color=fff'
    } as User,
    connection: {
      status: 'disconnected',
      reconnectAttempts: 0
    } as ConnectionStatus
  },

  getters: {
    // Auto-connect on app start
    connection: async (): Promise<ConnectionStatus> => {
      try {
        await socketService.connect()
        return {
          status: 'connected',
          error: undefined,
          reconnectAttempts: 0,
          lastConnected: new Date()
        }
      } catch (error: any) {
        return {
          status: 'error',
          error: error.message,
          reconnectAttempts: 0
        }
      }
    },

    // Load initial messages for room
    messages: async (storken: any, roomId: string): Promise<Message[]> => {
      return await socketService.loadMessages(roomId || 'general')
    },

    // Get online users
    onlineUsers: async (): Promise<User[]> => {
      return await socketService.getOnlineUsers()
    }
  },

  setters: {
    // Handle new messages - optimistic updates
    messages: async (storken: any, messages: Message[]) => {
      // Ensure messages is an array
      if (!Array.isArray(messages)) {
        console.warn('Messages setter received non-array:', messages)
        return
      }
      
      const newMessages = messages.filter(msg => !msg.id && msg.tempId)
      
      // Send new messages via socket
      for (const message of newMessages) {
        socketService.sendMessage({
          ...message,
          status: 'sending'
        })
      }
    },

    // Handle connection state changes
    connection: async (storken: any, connectionState: ConnectionStatus) => {
      if (connectionState.status === 'disconnected' && connectionState.reconnectAttempts < 5) {
        // Auto-reconnect with exponential backoff
        setTimeout(() => {
          socketService.reconnect()
        }, Math.pow(2, connectionState.reconnectAttempts) * 1000)
      }
    }
  },

  plugins: {
    // Real-time message handling
    messageSync: (storken: any) => {
      // Incoming messages
      const handleMessage = (message: Message) => {
        storken.set('messages', (prev: Message[]) => {
          // Ensure prev is an array
          if (!Array.isArray(prev)) {
            console.warn('Previous messages state is not an array:', prev)
            return [message]
          }
          
          // Replace temp message if it exists, otherwise append
          const tempIndex = prev.findIndex(m => 
            m.tempId && m.tempId === message.tempId
          )
          
          if (tempIndex >= 0) {
            const updated = [...prev]
            updated[tempIndex] = { ...message, status: 'sent' }
            return updated
          }
          
          // Check if message already exists to prevent duplicates
          if (prev.some(m => m.id === message.id)) {
            return prev
          }
          
          return [...prev, message]
        })
      }

      // Message status updates
      const handleMessageStatus = ({ messageId, status }: { messageId: string; status: string }) => {
        storken.set('messages', (prev: Message[]) => {
          if (!Array.isArray(prev)) {
            console.warn('Previous messages state is not an array for status update:', prev)
            return []
          }
          return prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status }
              : msg
          )
        })
      }

      // Typing indicators
      const handleUserTyping = ({ user, isTyping }: { user: User; isTyping: boolean }) => {
        storken.set('typingUsers', (prev: TypingUser[]) => {
          if (!Array.isArray(prev)) {
            console.warn('Previous typing users state is not an array:', prev)
            return isTyping ? [{ ...user, timestamp: new Date() }] : []
          }
          
          if (isTyping) {
            return prev.some(u => u.id === user.id) 
              ? prev 
              : [...prev, { ...user, timestamp: new Date() }]
          } else {
            return prev.filter(u => u.id !== user.id)
          }
        })
      }

      // User presence
      const handleUserJoined = (user: User) => {
        storken.set('onlineUsers', (prev: User[]) => {
          if (!Array.isArray(prev)) {
            console.warn('Previous online users state is not an array:', prev)
            return [user]
          }
          return prev.some(u => u.id === user.id) ? prev : [...prev, user]
        })
      }

      const handleUserLeft = (userId: string) => {
        storken.set('onlineUsers', (prev: User[]) => {
          if (!Array.isArray(prev)) {
            console.warn('Previous online users state is not an array:', prev)
            return []
          }
          return prev.filter(u => u.id !== userId)
        })
      }

      // Connection events
      const handleConnect = () => {
        storken.set('connection', {
          status: 'connected',
          error: undefined,
          reconnectAttempts: 0,
          lastConnected: new Date()
        })
      }

      const handleDisconnect = () => {
        storken.set('connection', (prev: ConnectionStatus) => ({
          status: 'disconnected',
          error: undefined,
          reconnectAttempts: prev.reconnectAttempts + 1
        }))
      }

      const handleError = (error: Error) => {
        storken.set('connection', (prev: ConnectionStatus) => ({
          status: 'error',
          error: error.message,
          reconnectAttempts: prev.reconnectAttempts
        }))
      }

      // Register event handlers
      socketService.on('message', handleMessage)
      socketService.on('messageStatus', handleMessageStatus)
      socketService.on('userTyping', handleUserTyping)
      socketService.on('userJoined', handleUserJoined)
      socketService.on('userLeft', handleUserLeft)
      socketService.on('connect', handleConnect)
      socketService.on('disconnect', handleDisconnect)
      socketService.on('error', handleError)

      return {
        cleanup: () => {
          socketService.off('message', handleMessage)
          socketService.off('messageStatus', handleMessageStatus)
          socketService.off('userTyping', handleUserTyping)
          socketService.off('userJoined', handleUserJoined)
          socketService.off('userLeft', handleUserLeft)
          socketService.off('connect', handleConnect)
          socketService.off('disconnect', handleDisconnect)
          socketService.off('error', handleError)
        }
      }
    },

    // Auto-clean typing indicators
    typingCleanup: (storken: any) => {
      const interval = setInterval(() => {
        storken.set('typingUsers', (prev: TypingUser[]) => {
          if (!Array.isArray(prev)) {
            console.warn('Previous typing users state is not an array for cleanup:', prev)
            return []
          }
          return prev.filter(user => 
            Date.now() - user.timestamp.getTime() < 3000 // Remove if older than 3 seconds
          )
        })
      }, 1000)

      return {
        cleanup: () => clearInterval(interval)
      }
    }
  }
})