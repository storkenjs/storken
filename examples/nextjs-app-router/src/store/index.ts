// Universal store exports - server-only for NextJS App Router

// Re-export server store functions for server components
export { get, set } from './server-store'

// Type exports for convenience
export type { User, Post, Comment, CreatePostData, UpdatePostData } from '@/lib/types'

// Environment helpers
export const getEnvironment = () => typeof window === 'undefined' ? 'server' : 'client'

export const logEnvironment = () => {
  console.log(`🌐 Storken running in ${getEnvironment()} environment`)
}

// Note: For client components, import from './client' directly