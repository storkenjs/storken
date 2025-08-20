import type { Message, User, Room } from '../store/types'

// Mock WebSocket service for demonstration
class MockSocketService {
  private connected = false
  private eventHandlers: { [key: string]: Function[] } = {}
  private messageQueue: Message[] = []
  private connectionTimeout: NodeJS.Timeout | null = null

  // Mock users
  private mockUsers: User[] = [
    { id: '1', name: 'Alice Johnson', status: 'online', avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=0D8ABC&color=fff' },
    { id: '2', name: 'Bob Smith', status: 'online', avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=764ba2&color=fff' },
    { id: '3', name: 'Carol Williams', status: 'away', avatar: 'https://ui-avatars.com/api/?name=Carol+Williams&background=f093fb&color=fff' },
    { id: '4', name: 'David Brown', status: 'online', avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=4facfe&color=fff' }
  ]

  // Mock messages
  private mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hey everyone! 👋',
      author: this.mockUsers[0],
      room: 'general',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'delivered'
    },
    {
      id: '2',
      content: 'How is everyone doing today?',
      author: this.mockUsers[1],
      room: 'general',
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      status: 'delivered'
    },
    {
      id: '3',
      content: 'Working on some cool React stuff! 🚀',
      author: this.mockUsers[2],
      room: 'tech',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      status: 'delivered'
    }
  ]

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connectionTimeout = setTimeout(() => {
        this.connected = true
        this.emit('connect')
        
        // Simulate initial data loading
        setTimeout(() => {
          this.emit('userJoined', this.mockUsers[0])
          this.emit('userJoined', this.mockUsers[1])
          this.emit('userJoined', this.mockUsers[3])
        }, 500)
        
        resolve()
      }, 800) // Simulate connection delay
    })
  }

  disconnect(): void {
    this.connected = false
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
    }
    this.emit('disconnect')
  }

  sendMessage(message: Message): void {
    if (!this.connected) {
      this.messageQueue.push(message)
      return
    }

    // Simulate network delay
    setTimeout(() => {
      const sentMessage: Message = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'sent'
      }

      // Add to mock messages
      this.mockMessages.push(sentMessage)
      
      // Emit message received
      this.emit('message', sentMessage)
      
      // Simulate delivery confirmation
      setTimeout(() => {
        this.emit('messageStatus', { messageId: sentMessage.id, status: 'delivered' })
      }, 500)

      // Simulate bot responses occasionally
      if (Math.random() > 0.7) {
        this.simulateBotResponse(message.room)
      }
    }, 200 + Math.random() * 800) // Random delay between 200-1000ms
  }

  private simulateBotResponse(room: string): void {
    const botResponses = [
      "That's interesting! 🤔",
      "I agree! 👍",
      "Thanks for sharing that",
      "Great point!",
      "Absolutely! 💯",
      "That makes sense",
      "Nice! 🎉"
    ]

    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
        author: {
          id: 'bot',
          name: 'ChatBot',
          status: 'online',
          avatar: 'https://ui-avatars.com/api/?name=ChatBot&background=6c5ce7&color=fff'
        },
        room,
        timestamp: new Date(),
        status: 'delivered'
      }

      this.emit('message', botMessage)
    }, 1000 + Math.random() * 3000) // Random delay 1-4 seconds
  }

  joinRoom(roomId: string): void {
    // Load room messages
    const roomMessages = this.mockMessages.filter(msg => msg.room === roomId)
    roomMessages.forEach(msg => {
      setTimeout(() => this.emit('message', msg), 100)
    })
  }

  leaveRoom(roomId: string): void {
    // Simulate leaving room
    console.log(`Left room: ${roomId}`)
  }

  startTyping(room: string, user: User): void {
    this.emit('userTyping', { user, isTyping: true })
  }

  stopTyping(room: string, user: User): void {
    this.emit('userTyping', { user, isTyping: false })
  }

  loadMessages(roomId: string): Promise<Message[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = this.mockMessages.filter(msg => msg.room === roomId)
        resolve(messages)
      }, 300)
    })
  }

  getOnlineUsers(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockUsers.filter(user => user.status === 'online'))
      }, 200)
    })
  }

  editMessage(messageId: string, newContent: string): void {
    const messageIndex = this.mockMessages.findIndex(msg => msg.id === messageId)
    if (messageIndex >= 0) {
      this.mockMessages[messageIndex] = {
        ...this.mockMessages[messageIndex],
        content: newContent,
        edited: true
      }
      this.emit('messageUpdated', this.mockMessages[messageIndex])
    }
  }

  deleteMessage(messageId: string): void {
    this.mockMessages = this.mockMessages.filter(msg => msg.id !== messageId)
    this.emit('messageDeleted', { messageId })
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []
    }
    this.eventHandlers[event].push(handler)
  }

  off(event: string, handler?: Function): void {
    if (!this.eventHandlers[event]) return
    
    if (handler) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler)
    } else {
      this.eventHandlers[event] = []
    }
  }

  private emit(event: string, ...args: any[]): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(...args))
    }
  }

  reconnect(): void {
    this.disconnect()
    setTimeout(() => {
      this.connect()
    }, 1000)
  }
}

export const socketService = new MockSocketService()