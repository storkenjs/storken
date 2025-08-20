/**
 * Storken Server Implementation
 * Server-side state management with direct database access
 */

'use server'

import { create } from '../index'
import type { 
  User, 
  Post, 
  Notification, 
  Todo, 
  Settings, 
  DashboardData,
  PaginatedResponse,
  FilterOptions 
} from './types'

// Mock database functions (replace with actual database implementation)
const db = {
  user: {
    findUnique: async (params: any): Promise<User | null> => {
      // Mock implementation - replace with actual database query
      return {
        id: params.where.id,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    
    findMany: async (params?: any): Promise<User[]> => {
      // Mock implementation
      return [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    
    update: async (params: any): Promise<User> => {
      // Mock implementation
      return params.data
    },
    
    create: async (params: any): Promise<User> => {
      // Mock implementation
      return {
        id: Date.now().toString(),
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  },
  
  post: {
    findUnique: async (params: any): Promise<Post | null> => {
      // Mock implementation
      return {
        id: params.where.id,
        title: 'Sample Post',
        content: 'Post content',
        userId: '1',
        published: true,
        tags: ['sample'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    
    findMany: async (params?: any): Promise<Post[]> => {
      // Mock implementation
      return []
    },
    
    update: async (params: any): Promise<Post> => {
      // Mock implementation
      return params.data
    },
    
    create: async (params: any): Promise<Post> => {
      // Mock implementation
      return {
        id: Date.now().toString(),
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    
    updateMany: async (params: any): Promise<{ count: number }> => {
      // Mock implementation
      return { count: 1 }
    }
  },
  
  notification: {
    findMany: async (params?: any): Promise<Notification[]> => {
      // Mock implementation
      return []
    },
    
    create: async (params: any): Promise<Notification> => {
      // Mock implementation
      return {
        id: Date.now().toString(),
        ...params.data,
        createdAt: new Date()
      }
    },
    
    updateMany: async (params: any): Promise<{ count: number }> => {
      // Mock implementation
      return { count: 1 }
    }
  },
  
  todo: {
    findMany: async (params?: any): Promise<Todo[]> => {
      // Mock implementation
      return []
    },
    
    create: async (params: any): Promise<Todo> => {
      // Mock implementation
      return {
        id: Date.now().toString(),
        ...params.data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    
    update: async (params: any): Promise<Todo> => {
      // Mock implementation
      return params.data
    },
    
    delete: async (params: any): Promise<Todo> => {
      // Mock implementation
      return {
        id: params.where.id,
        userId: '1',
        title: 'Deleted Todo',
        completed: false,
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }
}

// Mock revalidatePath function (Next.js specific)
const revalidatePath = (path: string) => {
  console.log(`Revalidating path: ${path}`)
}

// Server-side Storken configuration
export const [useStorken, get, set, Sky] = create({
  getters: {
    // User getters
    user: async (storken, userId: string): Promise<User | null> => {
      return await db.user.findUnique({ where: { id: userId } })
    },
    
    users: async (storken, filters?: FilterOptions): Promise<PaginatedResponse<User>> => {
      const users = await db.user.findMany({
        skip: ((filters?.page || 1) - 1) * (filters?.pageSize || 10),
        take: filters?.pageSize || 10,
        orderBy: { [filters?.sortBy || 'createdAt']: filters?.sortOrder || 'desc' }
      })
      
      return {
        data: users,
        page: filters?.page || 1,
        pageSize: filters?.pageSize || 10,
        totalPages: Math.ceil(100 / (filters?.pageSize || 10)), // Mock total
        totalItems: 100 // Mock total
      }
    },
    
    // Post getters
    post: async (storken, postId: string): Promise<Post | null> => {
      return await db.post.findUnique({ where: { id: postId } })
    },
    
    posts: async (storken, userId?: string): Promise<Post[]> => {
      if (userId) {
        return await db.post.findMany({ where: { userId } })
      }
      return await db.post.findMany()
    },
    
    // Notification getters
    notifications: async (storken, userId: string): Promise<Notification[]> => {
      return await db.notification.findMany({ 
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    },
    
    // Todo getters
    todos: async (storken, userId: string): Promise<Todo[]> => {
      return await db.todo.findMany({ 
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    },
    
    // Settings getter
    settings: async (storken, userId: string): Promise<Settings> => {
      // Mock implementation - would normally fetch from database
      return {
        userId,
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          inApp: true
        },
        privacy: {
          profileVisible: true,
          showEmail: false,
          showActivity: true
        }
      }
    },
    
    // Dashboard data getter
    dashboard: async (storken): Promise<DashboardData> => {
      // Mock implementation - would normally aggregate from database
      return {
        stats: {
          totalUsers: 1000,
          totalPosts: 5000,
          totalViews: 50000,
          activeUsers: 250
        },
        recentActivity: [
          {
            id: '1',
            type: 'user_signup',
            description: 'New user registered',
            timestamp: new Date()
          }
        ],
        charts: {
          userGrowth: [
            { date: '2024-01', count: 100 },
            { date: '2024-02', count: 150 }
          ],
          postActivity: [
            { date: '2024-01', count: 500 },
            { date: '2024-02', count: 750 }
          ]
        }
      }
    }
  },
  
  setters: {
    // User setters
    user: async (storken, user: User): Promise<void> => {
      await db.user.update({ 
        where: { id: user.id }, 
        data: user 
      })
      revalidatePath('/profile')
      revalidatePath('/dashboard')
    },
    
    // Post setters
    post: async (storken, post: Post): Promise<void> => {
      if (post.id) {
        await db.post.update({
          where: { id: post.id },
          data: post
        })
      } else {
        await db.post.create({ data: post })
      }
      revalidatePath('/posts')
      revalidatePath(`/post/${post.id}`)
    },
    
    posts: async (storken, posts: Post[]): Promise<void> => {
      await db.post.updateMany({ data: posts })
      revalidatePath('/posts')
      revalidatePath('/feed')
    },
    
    // Notification setters
    notifications: async (storken, notifications: Notification[]): Promise<void> => {
      await db.notification.updateMany({ data: notifications })
      revalidatePath('/notifications')
    },
    
    // Todo setters
    todos: async (storken, todos: Todo[]): Promise<void> => {
      for (const todo of todos) {
        if (todo.id) {
          await db.todo.update({
            where: { id: todo.id },
            data: todo
          })
        } else {
          await db.todo.create({ data: todo })
        }
      }
      revalidatePath('/todos')
    },
    
    // Settings setter
    settings: async (storken, settings: Settings): Promise<void> => {
      // Mock implementation - would normally save to database
      console.log('Saving settings:', settings)
      revalidatePath('/settings')
      revalidatePath('/profile')
    }
  }
})