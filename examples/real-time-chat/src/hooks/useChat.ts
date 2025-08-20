import { useChat as useChatStore } from '../store/chat-store'
import { socketService } from '../services/mock-socket-service'
import type { Message, User, Room, ConnectionStatus } from '../store/types'

export function useChat() {
  const [messages, setMessages] = useChatStore('messages')
  const [currentRoom, setCurrentRoom] = useChatStore('currentRoom')
  const [rooms] = useChatStore('rooms')
  const [onlineUsers] = useChatStore('onlineUsers')
  const [typingUsers] = useChatStore('typingUsers')
  const [currentUser] = useChatStore('currentUser')
  const [connection] = useChatStore('connection')

  // Provide default values when state is undefined
  const safeMessages = messages || []
  const safeCurrentRoom = currentRoom || 'general'
  const safeRooms = rooms || []
  const safeOnlineUsers = onlineUsers || []
  const safeTypingUsers = typingUsers || []
  const safeCurrentUser = currentUser || null
  const safeConnection = connection || { status: 'disconnected', reconnectAttempts: 0 }

  const sendMessage = (content: string) => {
    if (!safeCurrentUser || safeConnection.status !== 'connected') return

    const tempId = `temp-${Date.now()}`
    const newMessage: Message = {
      id: '',
      tempId,
      content: content.trim(),
      author: safeCurrentUser,
      room: safeCurrentRoom,
      timestamp: new Date(),
      status: 'sending'
    }

    // Optimistic update
    setMessages((prev: Message[]) => {
      const safePrev = prev || []
      return [...safePrev, newMessage]
    })
  }

  const joinRoom = (roomId: string) => {
    if (roomId === safeCurrentRoom) return
    
    socketService.leaveRoom(safeCurrentRoom)
    socketService.joinRoom(roomId)
    setCurrentRoom(roomId)
    
    // Clear current messages and load new room messages
    setMessages([])
  }

  const startTyping = () => {
    if (!safeCurrentUser || safeConnection.status !== 'connected') return
    socketService.startTyping(safeCurrentRoom, safeCurrentUser)
  }

  const stopTyping = () => {
    if (!safeCurrentUser || safeConnection.status !== 'connected') return
    socketService.stopTyping(safeCurrentRoom, safeCurrentUser)
  }

  const editMessage = (messageId: string, newContent: string) => {
    socketService.editMessage(messageId, newContent)
    
    // Optimistic update
    setMessages((prev: Message[]) => {
      const safePrev = prev || []
      return safePrev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, edited: true }
          : msg
      )
    })
  }

  const deleteMessage = (messageId: string) => {
    socketService.deleteMessage(messageId)
    
    // Optimistic removal
    setMessages((prev: Message[]) => {
      const safePrev = prev || []
      return safePrev.filter(msg => msg.id !== messageId)
    })
  }

  const reconnect = () => {
    socketService.reconnect()
  }

  // Filter messages by current room
  const roomMessages = safeMessages.filter(msg => msg.room === safeCurrentRoom)

  // Filter typing users (exclude current user)
  const otherTypingUsers = safeTypingUsers.filter(user => user.id !== safeCurrentUser?.id)

  // Get current room info
  const currentRoomInfo = safeRooms.find(room => room.id === safeCurrentRoom)

  // Connection status helpers
  const isConnected = safeConnection.status === 'connected'
  const isConnecting = safeConnection.status === 'connecting'
  const isDisconnected = safeConnection.status === 'disconnected'
  const hasError = safeConnection.status === 'error'

  return {
    // Data
    messages: roomMessages,
    allMessages: safeMessages,
    currentRoom: safeCurrentRoom,
    currentRoomInfo,
    rooms: safeRooms,
    onlineUsers: safeOnlineUsers,
    typingUsers: otherTypingUsers,
    currentUser: safeCurrentUser,
    connection: safeConnection,
    
    // Status helpers
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,

    // Actions
    sendMessage,
    joinRoom,
    startTyping,
    stopTyping,
    editMessage,
    deleteMessage,
    reconnect
  }
}