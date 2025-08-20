// Mock database for demonstration
// In a real app, this would use Prisma, Drizzle, or another ORM

import type { User, Post, Comment } from './types'

// In-memory database simulation
const database = {
  users: new Map<string, User>(),
  posts: new Map<string, Post>(),
  comments: new Map<string, Comment>()
}

// Initialize with some mock data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0ea5e9&color=fff',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js App Router',
    content: 'The App Router in Next.js 13+ introduces a new paradigm for building React applications with better performance and developer experience...',
    authorId: '1',
    published: true,
    tags: ['nextjs', 'react', 'app-router'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Storken State Management',
    content: 'Storken provides a simple yet powerful state management solution that works seamlessly with modern React patterns...',
    authorId: '1',
    published: true,
    tags: ['storken', 'state-management', 'react'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Draft: Future of Web Development',
    content: 'This is a draft post about the future of web development and emerging trends...',
    authorId: '1',
    published: false,
    tags: ['web-development', 'future', 'trends'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
]

database.users.set(mockUser.id, mockUser)
mockPosts.forEach(post => database.posts.set(post.id, post))

// Database operations
export const db = {
  // User operations
  user: {
    findUnique: async (params: { where: { id: string } }): Promise<User | null> => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Simulate DB delay
      return database.users.get(params.where.id) || null
    },
    
    update: async (params: { where: { id: string }, data: Partial<User> }): Promise<User> => {
      await new Promise(resolve => setTimeout(resolve, 150))
      const user = database.users.get(params.where.id)
      if (!user) throw new Error('User not found')
      
      const updatedUser = { ...user, ...params.data, updatedAt: new Date() }
      database.users.set(updatedUser.id, updatedUser)
      return updatedUser
    }
  },

  // Post operations
  post: {
    findMany: async (params?: { 
      where?: { authorId?: string }, 
      include?: { author?: boolean, comments?: boolean },
      orderBy?: { createdAt: 'asc' | 'desc' }
    }): Promise<Post[]> => {
      await new Promise(resolve => setTimeout(resolve, 200))
      let posts = Array.from(database.posts.values())
      
      // Filter by author if specified
      if (params?.where?.authorId) {
        posts = posts.filter(post => post.authorId === params.where!.authorId)
      }
      
      // Include author if requested
      if (params?.include?.author) {
        posts = posts.map(post => ({
          ...post,
          author: database.users.get(post.authorId)
        }))
      }
      
      // Sort by createdAt
      if (params?.orderBy?.createdAt) {
        posts.sort((a, b) => {
          const modifier = params.orderBy!.createdAt === 'desc' ? -1 : 1
          return (a.createdAt.getTime() - b.createdAt.getTime()) * modifier
        })
      }
      
      return posts
    },
    
    findUnique: async (params: { 
      where: { id: string },
      include?: { author?: boolean, comments?: boolean }
    }): Promise<Post | null> => {
      await new Promise(resolve => setTimeout(resolve, 150))
      const post = database.posts.get(params.where.id)
      if (!post) return null
      
      let result = { ...post }
      
      if (params.include?.author) {
        result.author = database.users.get(post.authorId)
      }
      
      return result
    },
    
    create: async (params: { data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'> }): Promise<Post> => {
      await new Promise(resolve => setTimeout(resolve, 200))
      const newPost: Post = {
        ...params.data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      database.posts.set(newPost.id, newPost)
      return newPost
    },
    
    update: async (params: { where: { id: string }, data: Partial<Post> }): Promise<Post> => {
      await new Promise(resolve => setTimeout(resolve, 180))
      const post = database.posts.get(params.where.id)
      if (!post) throw new Error('Post not found')
      
      const updatedPost = { ...post, ...params.data, updatedAt: new Date() }
      database.posts.set(updatedPost.id, updatedPost)
      return updatedPost
    },
    
    delete: async (params: { where: { id: string } }): Promise<Post> => {
      await new Promise(resolve => setTimeout(resolve, 100))
      const post = database.posts.get(params.where.id)
      if (!post) throw new Error('Post not found')
      
      database.posts.delete(params.where.id)
      return post
    }
  }
}

// Helper to get current user (in a real app, this would come from auth)
export const getCurrentUserId = () => '1'