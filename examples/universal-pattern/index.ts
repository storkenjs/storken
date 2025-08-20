/**
 * Storken Universal API
 * Proxy pattern for unified server-client state management
 */

import * as serverStorken from './server'
import * as clientStorken from './client'
import type { StorkenAPI } from './types'

// Environment detection
const isServer = typeof window === 'undefined'

// Proxy to correct implementation based on environment
const storken: StorkenAPI = isServer ? serverStorken : clientStorken

// Clean, unified exports - single API for both server and client
export const useStorken = storken.useStorken
export const get = storken.get
export const set = storken.set
export const Sky = storken.Sky

// Re-export types for convenience
export type {
  User,
  Post,
  Notification,
  Todo,
  Settings,
  DashboardData,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
  StorkenKey,
  StorkenAPI
} from './types'

// Helper functions for common patterns
export const createStorkenHook = <T>(key: StorkenKey, initialValue?: T) => {
  return () => useStorken<T>(key, initialValue)
}

// Pre-configured hooks for common entities
export const useUser = (userId?: string) => {
  const [user, setUser, resetUser, loading] = useStorken<User>('user')
  
  // Auto-fetch on mount if userId provided
  if (userId && !user && !loading) {
    get<User>('user', userId).then(setUser)
  }
  
  return { user, setUser, resetUser, loading }
}

export const usePosts = (userId?: string) => {
  const [posts, setPosts, resetPosts, loading] = useStorken<Post[]>('posts', [])
  
  // Auto-fetch on mount
  if (!posts.length && !loading) {
    get<Post[]>('posts', userId).then(setPosts)
  }
  
  return { posts, setPosts, resetPosts, loading }
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications, resetNotifications, loading] = useStorken<Notification[]>('notifications', [])
  
  // Auto-fetch on mount
  if (!notifications.length && !loading && userId) {
    get<Notification[]>('notifications', userId).then(setNotifications)
  }
  
  const markAsRead = async (notificationIds: string[]) => {
    const updated = notifications.map(n => 
      notificationIds.includes(n.id) ? { ...n, read: true } : n
    )
    await setNotifications(updated)
  }
  
  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    await setNotifications(updated)
  }
  
  return { 
    notifications, 
    setNotifications, 
    resetNotifications, 
    loading,
    markAsRead,
    markAllAsRead
  }
}

export const useTodos = (userId: string) => {
  const [todos, setTodos, resetTodos, loading] = useStorken<Todo[]>('todos', [])
  
  // Auto-fetch on mount
  if (!todos.length && !loading && userId) {
    get<Todo[]>('todos', userId).then(setTodos)
  }
  
  const addTodo = async (title: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      userId,
      title,
      completed: false,
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await setTodos([...todos, newTodo])
  }
  
  const toggleTodo = async (todoId: string) => {
    const updated = todos.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    )
    await setTodos(updated)
  }
  
  const deleteTodo = async (todoId: string) => {
    const updated = todos.filter(todo => todo.id !== todoId)
    await setTodos(updated)
  }
  
  return { 
    todos, 
    setTodos, 
    resetTodos, 
    loading,
    addTodo,
    toggleTodo,
    deleteTodo
  }
}

export const useSettings = (userId: string) => {
  const [settings, setSettings, resetSettings, loading] = useStorken<Settings>('settings')
  
  // Auto-fetch on mount
  if (!settings && !loading && userId) {
    get<Settings>('settings', userId).then(setSettings)
  }
  
  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    if (settings) {
      await setSettings({ ...settings, theme })
    }
  }
  
  const updateLanguage = async (language: 'en' | 'tr' | 'es' | 'fr') => {
    if (settings) {
      await setSettings({ ...settings, language })
    }
  }
  
  const updateNotificationSettings = async (notifications: Partial<Settings['notifications']>) => {
    if (settings) {
      await setSettings({
        ...settings,
        notifications: { ...settings.notifications, ...notifications }
      })
    }
  }
  
  return {
    settings,
    setSettings,
    resetSettings,
    loading,
    updateTheme,
    updateLanguage,
    updateNotificationSettings
  }
}

export const useDashboard = () => {
  const [dashboard, setDashboard, resetDashboard, loading] = useStorken<DashboardData>('dashboard')
  
  // Auto-fetch on mount
  if (!dashboard && !loading) {
    get<DashboardData>('dashboard').then(setDashboard)
  }
  
  const refresh = async () => {
    const fresh = await get<DashboardData>('dashboard')
    await setDashboard(fresh)
  }
  
  return {
    dashboard,
    setDashboard,
    resetDashboard,
    loading,
    refresh
  }
}

// Utility function for SSR/SSG
export const prefetchServerData = async (keys: StorkenKey[], args?: Record<string, any>) => {
  if (!isServer) {
    console.warn('prefetchServerData should only be called on the server')
    return {}
  }
  
  const data: Record<string, any> = {}
  
  for (const key of keys) {
    try {
      data[key] = await get(key, args?.[key])
    } catch (error) {
      console.error(`Failed to prefetch ${key}:`, error)
      data[key] = null
    }
  }
  
  return data
}

// Debug helper
export const debugStorken = () => {
  console.log('Storken Environment:', isServer ? 'Server' : 'Client')
  console.log('Available methods:', {
    useStorken: typeof useStorken,
    get: typeof get,
    set: typeof set,
    Sky: typeof Sky
  })
}