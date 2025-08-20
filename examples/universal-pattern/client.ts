/**
 * Storken Client Implementation
 * Client-side state management with API calls
 */

import { create } from '../index'
import type { 
  User, 
  Post, 
  Notification, 
  Todo, 
  Settings, 
  DashboardData,
  PaginatedResponse,
  FilterOptions,
  ApiResponse 
} from './types'

// API base URL (configure based on environment)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

// Helper function for API calls
async function apiCall<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  })
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }
  
  return await response.json()
}

// Client-side Storken configuration
export const [useStorken, get, set, Sky] = create({
  getters: {
    // User getters
    user: async (storken, userId: string): Promise<User | null> => {
      try {
        return await apiCall<User>(`/user/${userId}`)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        return null
      }
    },
    
    users: async (storken, filters?: FilterOptions): Promise<PaginatedResponse<User>> => {
      const params = new URLSearchParams()
      
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
      if (filters?.search) params.append('search', filters.search)
      
      return await apiCall<PaginatedResponse<User>>(`/users?${params.toString()}`)
    },
    
    // Post getters
    post: async (storken, postId: string): Promise<Post | null> => {
      try {
        return await apiCall<Post>(`/post/${postId}`)
      } catch (error) {
        console.error('Failed to fetch post:', error)
        return null
      }
    },
    
    posts: async (storken, userId?: string): Promise<Post[]> => {
      const endpoint = userId ? `/posts?userId=${userId}` : '/posts'
      return await apiCall<Post[]>(endpoint)
    },
    
    // Notification getters
    notifications: async (storken, userId: string): Promise<Notification[]> => {
      return await apiCall<Notification[]>(`/notifications?userId=${userId}`)
    },
    
    // Todo getters
    todos: async (storken, userId: string): Promise<Todo[]> => {
      return await apiCall<Todo[]>(`/todos?userId=${userId}`)
    },
    
    // Settings getter
    settings: async (storken, userId: string): Promise<Settings> => {
      return await apiCall<Settings>(`/settings/${userId}`)
    },
    
    // Dashboard data getter
    dashboard: async (storken): Promise<DashboardData> => {
      return await apiCall<DashboardData>('/dashboard')
    }
  },
  
  setters: {
    // User setters
    user: async (storken, user: User): Promise<void> => {
      await apiCall<ApiResponse<User>>(`/user/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
      })
    },
    
    // Post setters
    post: async (storken, post: Post): Promise<void> => {
      const method = post.id ? 'PUT' : 'POST'
      const endpoint = post.id ? `/post/${post.id}` : '/post'
      
      await apiCall<ApiResponse<Post>>(endpoint, {
        method,
        body: JSON.stringify(post)
      })
    },
    
    posts: async (storken, posts: Post[]): Promise<void> => {
      await apiCall<ApiResponse<Post[]>>('/posts', {
        method: 'PUT',
        body: JSON.stringify(posts)
      })
    },
    
    // Notification setters
    notifications: async (storken, notifications: Notification[]): Promise<void> => {
      await apiCall<ApiResponse<Notification[]>>('/notifications', {
        method: 'PUT',
        body: JSON.stringify(notifications)
      })
    },
    
    // Todo setters
    todos: async (storken, todos: Todo[]): Promise<void> => {
      await apiCall<ApiResponse<Todo[]>>('/todos', {
        method: 'PUT',
        body: JSON.stringify(todos)
      })
    },
    
    // Settings setter
    settings: async (storken, settings: Settings): Promise<void> => {
      await apiCall<ApiResponse<Settings>>(`/settings/${settings.userId}`, {
        method: 'PUT',
        body: JSON.stringify(settings)
      })
    }
  },
  
  // Client-specific plugins
  plugins: {
    // Local storage persistence
    persistence: (storken) => {
      const STORAGE_PREFIX = 'storken_'
      
      // Load from localStorage on init
      const loadFromStorage = () => {
        try {
          const stored = localStorage.getItem(`${STORAGE_PREFIX}${storken.key}`)
          if (stored) {
            storken.set(JSON.parse(stored))
          }
        } catch (error) {
          console.error('Failed to load from localStorage:', error)
        }
      }
      
      // Save to localStorage on change
      storken.on('set', (value) => {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${storken.key}`, JSON.stringify(value))
        } catch (error) {
          console.error('Failed to save to localStorage:', error)
        }
      })
      
      // Initialize with stored data
      loadFromStorage()
      
      return {
        clear: () => localStorage.removeItem(`${STORAGE_PREFIX}${storken.key}`),
        load: loadFromStorage
      }
    },
    
    // Optimistic updates
    optimistic: (storken) => {
      let previousValue: any = null
      
      storken.on('beforeSet', (value) => {
        // Store previous value for rollback
        previousValue = storken.value
      })
      
      return {
        rollback: () => {
          if (previousValue !== null) {
            storken.set(previousValue)
            previousValue = null
          }
        }
      }
    },
    
    // Real-time updates via WebSocket
    realtime: (storken) => {
      let ws: WebSocket | null = null
      
      const connect = () => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
        ws = new WebSocket(`${wsUrl}/${storken.key}`)
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            storken.set(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }
        
        ws.onclose = () => {
          // Attempt to reconnect after 3 seconds
          setTimeout(connect, 3000)
        }
      }
      
      // Initialize connection
      connect()
      
      // Cleanup on unmount
      storken.on('unmounted', () => {
        if (ws) {
          ws.close()
          ws = null
        }
      })
      
      return {
        send: (data: any) => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data))
          }
        },
        disconnect: () => {
          if (ws) {
            ws.close()
            ws = null
          }
        }
      }
    }
  }
})