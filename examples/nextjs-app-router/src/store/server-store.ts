// Server-side store implementation (no React dependencies)
import { revalidatePath } from 'next/cache'
import { db, getCurrentUserId } from '@/lib/db'
import type { User, Post } from '@/lib/types'

// Simple server-side store implementation without React hooks
class ServerStore {
  private cache: Record<string, any> = {}
  private config: any

  constructor(config: any) {
    this.config = config
    // Initialize with default values
    if (config.initialValues) {
      this.cache = { ...config.initialValues }
    }
  }

  async get<T>(key: string, ...args: any[]): Promise<T> {
    // Check if we have a getter for this key
    const getter = this.config?.getters?.[key]
    if (getter) {
      const result = await getter(this, ...args)
      this.cache[key] = result
      return result
    }
    
    // Return cached value or initial value
    return this.cache[key] || this.config?.initialValues?.[key]
  }

  async set<T>(key: string, value: T, ...args: any[]): Promise<T> {
    // Check if we have a setter for this key
    const setter = this.config?.setters?.[key]
    if (setter) {
      const result = await setter(this, value, ...args)
      if (result !== undefined) {
        this.cache[key] = result
        return result
      }
    }
    
    // Update cache
    this.cache[key] = value
    return value
  }
}

// Server-side store configuration
const serverStore = new ServerStore({
  initialValues: {
    currentUser: null as User | null,
    posts: [] as Post[],
    post: null as Post | null
  },

  getters: {
    // Direct database access on server
    currentUser: async (): Promise<User | null> => {
      const userId = getCurrentUserId()
      return await db.user.findUnique({
        where: { id: userId }
      })
    },

    posts: async (storken: any, authorId?: string): Promise<Post[]> => {
      if (authorId) {
        return await db.post.findMany({
          where: { authorId },
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        })
      }
      
      return await db.post.findMany({
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      })
    },

    post: async (storken: any, postId: string): Promise<Post | null> => {
      return await db.post.findUnique({
        where: { id: postId },
        include: { author: true }
      })
    }
  },

  setters: {
    // Server-side mutations with revalidation
    currentUser: async (storken: any, user: User) => {
      await db.user.update({
        where: { id: user.id },
        data: user
      })
      
      // Revalidate pages that use this data
      revalidatePath('/profile')
      revalidatePath('/dashboard')
    },

    posts: async (storken: any, posts: Post[]) => {
      // Batch update posts
      for (const post of posts) {
        if (post.id) {
          await db.post.update({
            where: { id: post.id },
            data: post
          })
        }
      }
      
      revalidatePath('/posts')
      revalidatePath('/dashboard')
      revalidatePath('/')
    },

    post: async (storken: any, post: Post) => {
      let savedPost: Post
      
      if (post.id && post.id !== 'new') {
        // Update existing post
        savedPost = await db.post.update({
          where: { id: post.id },
          data: post
        })
      } else {
        // Create new post
        savedPost = await db.post.create({
          data: {
            ...post,
            authorId: getCurrentUserId()
          }
        })
      }
      
      // Revalidate relevant paths
      revalidatePath('/posts')
      revalidatePath(`/posts/${savedPost.id}`)
      revalidatePath('/dashboard')
      
      return savedPost
    }
  },

  plugins: {
    // Server-side logging plugin
    serverLogger: (storken: any) => {
      console.log('🖥️ Server Storken initialized')
      
      storken.on('beforeSet', (key: string, value: any) => {
        console.log(`🖥️ Server setting ${key}:`, typeof value === 'object' ? Object.keys(value) : value)
      })
      
      return {
        logActivity: (action: string) => {
          console.log(`🖥️ Server activity: ${action}`)
        }
      }
    }
  }
})

// Export server store functions
export const get = async <T = any>(key: string, ...args: any[]): Promise<T> => {
  return serverStore.get<T>(key, ...args)
}

export const set = async <T = any>(key: string, value: T, ...args: any[]): Promise<T> => {
  return serverStore.set<T>(key, value, ...args)
}