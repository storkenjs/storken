export interface User {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
}

export interface Message {
  id: string
  tempId?: string
  content: string
  author: User
  room: string
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'error'
  edited?: boolean
}

export interface Room {
  id: string
  name: string
  description?: string
  memberCount: number
  lastMessage?: Message
}

export interface TypingUser {
  id: string
  name: string
  timestamp: Date
}

export interface ConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  error?: string
  reconnectAttempts: number
  lastConnected?: Date
}

export interface ChatState {
  messages: Message[]
  currentRoom: string
  rooms: Room[]
  onlineUsers: User[]
  typingUsers: TypingUser[]
  currentUser: User | null
  connection: ConnectionStatus
}