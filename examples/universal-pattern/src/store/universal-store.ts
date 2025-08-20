import { create } from 'storken'
import type { User, Post, Todo, Settings } from '../types'

// Mock database operations for demonstration
const mockDatabase = {
  users: new Map<string, User>(),
  posts: new Map<string, Post>(),
  todos: new Map<string, Todo>(),
  settings: new Map<string, Settings>()
}

// Initialize with some mock data
mockDatabase.users.set('1', {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=667eea&color=fff',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
})

mockDatabase.posts.set('1', {
  id: '1',
  title: 'Universal API with Storken',
  content: 'This post demonstrates how the same code works on both server and client...',
  userId: '1',
  published: true,
  tags: ['storken', 'react', 'universal'],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date()
})

mockDatabase.todos.set('1', {
  id: '1',
  userId: '1',
  title: 'Test Universal API',
  completed: false,
  priority: 'high',
  dueDate: new Date(Date.now() + 86400000), // Tomorrow
  createdAt: new Date(),
  updatedAt: new Date()
})

// Environment detection
const isServer = typeof window === 'undefined'
const isClient = typeof window !== 'undefined'

// Mock API service
const apiService = {
  async get<T>(endpoint: string): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
    
    if (endpoint.startsWith('/users/')) {
      const userId = endpoint.split('/')[2]
      return mockDatabase.users.get(userId) as T
    }
    
    if (endpoint.startsWith('/posts/')) {
      const postId = endpoint.split('/')[2]
      return mockDatabase.posts.get(postId) as T
    }
    
    if (endpoint.startsWith('/todos/')) {
      const todoId = endpoint.split('/')[2]
      return mockDatabase.todos.get(todoId) as T
    }
    
    throw new Error(`API endpoint not found: ${endpoint}`)
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    if (endpoint === '/users') {
      const user = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }
      mockDatabase.users.set(user.id, user)
      return user as T
    }
    
    if (endpoint === '/posts') {
      const post = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }
      mockDatabase.posts.set(post.id, post)
      return post as T
    }
    
    if (endpoint === '/todos') {
      const todo = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }
      mockDatabase.todos.set(todo.id, todo)
      return todo as T
    }
    
    throw new Error(`API endpoint not found: ${endpoint}`)
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, 350))
    
    if (endpoint.startsWith('/users/')) {
      const userId = endpoint.split('/')[2]
      const existingUser = mockDatabase.users.get(userId)
      if (existingUser) {
        const updatedUser = { ...existingUser, ...data, updatedAt: new Date() }
        mockDatabase.users.set(userId, updatedUser)
        return updatedUser as T
      }
    }
    
    if (endpoint.startsWith('/posts/')) {
      const postId = endpoint.split('/')[2]
      const existingPost = mockDatabase.posts.get(postId)
      if (existingPost) {
        const updatedPost = { ...existingPost, ...data, updatedAt: new Date() }
        mockDatabase.posts.set(postId, updatedPost)
        return updatedPost as T
      }
    }
    
    if (endpoint.startsWith('/todos/')) {
      const todoId = endpoint.split('/')[2]
      const existingTodo = mockDatabase.todos.get(todoId)
      if (existingTodo) {
        const updatedTodo = { ...existingTodo, ...data, updatedAt: new Date() }
        mockDatabase.todos.set(todoId, updatedTodo)
        return updatedTodo as T
      }
    }
    
    throw new Error(`Resource not found: ${endpoint}`)
  }
}

// Universal Storken store with environment-aware operations
export const [useUniversal] = create({
  initialValues: {
    currentUser: null as User | null,
    posts: [] as Post[],
    todos: [] as Todo[],
    settings: null as Settings | null
  },

  // Remove automatic getters to prevent infinite loops
  // Manual loading will be done via refresh functions

  setters: {
    // Universal user setter
    currentUser: async (storken: any, user: User) => {
      try {
        if (isServer) {
          console.log('🖥️ Server: Direct database update')
          mockDatabase.users.set(user.id, { ...user, updatedAt: new Date() })
        } else {
          console.log('🌐 Client: API call to update user')
          await apiService.put(`/users/${user.id}`, user)
        }
      } catch (error) {
        console.error('Error updating user:', error)
      }
    },

    // Universal posts setter
    posts: async (storken: any, posts: Post[]) => {
      try {
        for (const post of posts) {
          if (post.id) {
            if (isServer) {
              console.log(`🖥️ Server: Direct database update for post ${post.id}`)
              mockDatabase.posts.set(post.id, { ...post, updatedAt: new Date() })
            } else {
              console.log(`🌐 Client: API call to update post ${post.id}`)
              await apiService.put(`/posts/${post.id}`, post)
            }
          } else {
            // New post
            if (isServer) {
              console.log('🖥️ Server: Direct database insert')
              const newPost = { ...post, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }
              mockDatabase.posts.set(newPost.id, newPost)
            } else {
              console.log('🌐 Client: API call to create post')
              await apiService.post('/posts', post)
            }
          }
        }
      } catch (error) {
        console.error('Error updating posts:', error)
      }
    },

    // Universal todos setter
    todos: async (storken: any, todos: Todo[]) => {
      try {
        for (const todo of todos) {
          if (todo.id) {
            if (isServer) {
              console.log(`🖥️ Server: Direct database update for todo ${todo.id}`)
              mockDatabase.todos.set(todo.id, { ...todo, updatedAt: new Date() })
            } else {
              console.log(`🌐 Client: API call to update todo ${todo.id}`)
              await apiService.put(`/todos/${todo.id}`, todo)
            }
          } else {
            // New todo
            if (isServer) {
              console.log('🖥️ Server: Direct database insert')
              const newTodo = { ...todo, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() }
              mockDatabase.todos.set(newTodo.id, newTodo)
            } else {
              console.log('🌐 Client: API call to create todo')
              await apiService.post('/todos', todo)
            }
          }
        }
      } catch (error) {
        console.error('Error updating todos:', error)
      }
    }
  },

  plugins: {
    // Environment detection plugin
    environmentDetection: (storken: any) => {
      const environment = isServer ? 'server' : 'client'
      console.log(`🔧 Storken Universal Plugin initialized in ${environment} environment`)
      
      return {
        getEnvironment: () => environment,
        isServer: () => isServer,
        isClient: () => isClient,
        getDatabase: () => isServer ? mockDatabase : null,
        getApiService: () => isClient ? apiService : null
      }
    },

    // Cache synchronization plugin
    cacheSync: (storken: any) => {
      let syncInterval: NodeJS.Timeout | null = null

      if (isClient) {
        // Auto-sync every 30 seconds in client environment
        syncInterval = setInterval(() => {
          console.log('🔄 Auto-syncing cache with server...')
          // In a real app, this would sync with the server
        }, 30000)
      }

      return {
        syncNow: () => {
          console.log('🔄 Manual cache sync triggered')
          // Implement manual sync logic
        },
        cleanup: () => {
          if (syncInterval) {
            clearInterval(syncInterval)
          }
        }
      }
    }
  }
})