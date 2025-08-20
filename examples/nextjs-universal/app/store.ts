import { setupStorken } from 'storken/next'

// Define your data loaders (works on server)
const loaders = {
  async posts() {
    // Server-side: Direct DB query
    // Client-side: API call
    if (typeof window === 'undefined') {
      const { db } = await import('@/lib/db')
      return db.posts.findMany()
    } else {
      const res = await fetch('/api/posts')
      return res.json()
    }
  },
  
  async user(id: string) {
    if (typeof window === 'undefined') {
      const { db } = await import('@/lib/db')
      return db.users.findById(id)
    } else {
      const res = await fetch(`/api/users/${id}`)
      return res.json()
    }
  },
  
  async cart() {
    // Client-only - from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    }
    return []
  }
}

// Setup everything with one call
export const { store, ServerData, useServerData, prepare } = setupStorken(loaders)