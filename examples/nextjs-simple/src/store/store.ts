'use client'

import { create } from 'storken'

// Simple counter store
export const [useCounter] = create({
  initialValues: {
    count: 0
  }
})

// User store with localStorage persistence
export const [useUser] = create({
  initialValues: {
    user: null as { name: string; email: string } | null
  },
  
  getters: {
    user: async () => {
      if (typeof window === 'undefined') return null
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    }
  },

  setters: {
    user: async (storken: any, user: any) => {
      if (typeof window !== 'undefined') {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
        } else {
          localStorage.removeItem('user')
        }
      }
    }
  }
})

// Posts store with mock API
export const [usePosts] = create({
  initialValues: {
    posts: [] as Array<{ id: number; title: string; content: string }>
  },

  getters: {
    posts: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return [
        { id: 1, title: 'First Post', content: 'This is the first post content.' },
        { id: 2, title: 'Second Post', content: 'This is the second post content.' },
        { id: 3, title: 'Third Post', content: 'This is the third post content.' }
      ]
    }
  }
})