'use client'

import { create } from 'storken'
import type { User, Post } from '@/lib/types'

// Client-side Storken store with API calls
export const [useStorken, get, set] = create({
  initialValues: {
    currentUser: null as User | null,
    posts: [] as Post[],
    post: null as Post | null
  },

  getters: {
    // Mock API calls on client (no real API endpoints)
    currentUser: async (): Promise<User | null> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('🌐 Client: Fetching user (mock)')
      
      // Return mock user data
      return {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      }
    },

    posts: async (storken: any, authorId?: string): Promise<Post[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('🌐 Client: Fetching posts (mock)', authorId ? `for author ${authorId}` : '')
      
      // Return mock posts
      return [
        {
          id: '1',
          title: 'Welcome to Storken',
          content: 'This is a demo post showing Storken with Next.js App Router',
          published: true,
          authorId: '1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        {
          id: '2', 
          title: 'Client-side State Management',
          content: 'Managing state on the client with Storken',
          published: false,
          authorId: '1',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date()
        }
      ]
    },

    post: async (storken: any, postId: string): Promise<Post | null> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log('🌐 Client: Fetching post (mock)', postId)
      
      // Return mock post
      return {
        id: postId,
        title: 'Sample Post',
        content: 'This is sample post content',
        published: true,
        authorId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  },

  setters: {
    // Mock API calls with optimistic updates (no real API endpoints)
    currentUser: async (storken: any, user: User) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400))
      console.log('🌐 Client: Updating user (mock)', user.name)
      
      // Simulate success
      return user
    },

    post: async (storken: any, post: Post) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))
      const isNew = !post.id || post.id === 'new'
      console.log('🌐 Client: Saving post (mock)', isNew ? 'CREATE' : 'UPDATE')
      
      const savedPost = {
        ...post,
        id: isNew ? `post_${Date.now()}` : post.id,
        updatedAt: new Date()
      }
      
      // Update posts list optimistically
      const currentPosts = storken.get('posts') || []
      if (isNew) {
        storken.set('posts', [savedPost, ...currentPosts], { silent: true })
      } else {
        storken.set('posts', currentPosts.map((p: Post) => 
          p.id === savedPost.id ? savedPost : p
        ), { silent: true })
      }
      
      return savedPost
    },

    posts: async (storken: any, posts: Post[]) => {
      // Simulate batch update
      await new Promise(resolve => setTimeout(resolve, 800))
      console.log('🌐 Client: Batch updating posts (mock)', posts.length)
      
      // Just return the posts as updated
      return posts
    }
  },

  plugins: {
    // Optimistic updates plugin
    optimisticUpdates: (storken: any) => {
      const rollbackStack: Array<{ key: string, value: any }> = []
      
      storken.on('beforeSet', (key: string, value: any) => {
        const currentValue = storken.get(key)
        rollbackStack.push({ key, value: currentValue })
      })
      
      return {
        rollback: () => {
          const lastState = rollbackStack.pop()
          if (lastState) {
            storken.set(lastState.key, lastState.value, { silent: true })
          }
        },
        clearRollbackStack: () => {
          rollbackStack.length = 0
        }
      }
    },
    
    // Client-side logging
    clientLogger: (storken: any) => {
      console.log('🌐 Client Storken initialized')
      
      storken.on('beforeSet', (key: string, value: any) => {
        console.log(`🌐 Client setting ${key}:`, typeof value === 'object' ? Object.keys(value) : value)
      })
      
      storken.on('afterSet', (key: string, value: any) => {
        console.log(`🌐 Client set complete for ${key}`)
      })
      
      return {
        logActivity: (action: string) => {
          console.log(`🌐 Client activity: ${action}`)
        }
      }
    }
  }
})