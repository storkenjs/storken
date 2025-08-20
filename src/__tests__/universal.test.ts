/**
 * Tests for Universal Store API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createStore, prepareData, useServerData } from '../universal'
import { store, quickStore, saveState, loadState } from '../simple'

describe('Universal Store', () => {
  beforeEach(() => {
    // Clear any mocks
    vi.clearAllMocks()
    
    // Mock window for client tests
    if (typeof window === 'undefined') {
      global.window = {} as any
    }
  })

  describe('createStore', () => {
    it('should create a store with universal API', async () => {
      const testStore = createStore({
        initialValues: {
          count: 0,
          user: null
        }
      })

      expect(testStore.count).toBeDefined()
      expect(testStore.count.get).toBeDefined()
      expect(testStore.count.set).toBeDefined()
      expect(testStore.count.update).toBeDefined()
    })

    it('should get and set values', async () => {
      const testStore = createStore({
        initialValues: {
          count: 0
        }
      })

      await testStore.count.set(5)
      const value = await testStore.count.get()
      expect(value).toBe(5)
    })

    it('should update values with function', async () => {
      const testStore = createStore({
        initialValues: {
          count: 10
        }
      })

      await testStore.count.update(prev => prev + 5)
      const value = await testStore.count.get()
      expect(value).toBe(15)
    })

    it('should reset to initial value', async () => {
      const testStore = createStore({
        initialValues: {
          count: 10
        }
      })

      await testStore.count.set(20)
      await testStore.count.reset()
      const value = await testStore.count.get()
      expect(value).toBe(10)
    })
  })

  describe('prepareData', () => {
    it('should load data in parallel', async () => {
      const data = await prepareData({
        users: async () => [{ id: 1, name: 'John' }],
        posts: async () => [{ id: 1, title: 'Test' }],
        settings: async () => ({ theme: 'dark' })
      })

      expect(data.users).toHaveLength(1)
      expect(data.posts).toHaveLength(1)
      expect(data.settings.theme).toBe('dark')
    })

    it('should handle errors gracefully', async () => {
      const data = await prepareData({
        success: async () => 'ok',
        failure: async () => {
          throw new Error('Failed')
        }
      })

      expect(data.success).toBe('ok')
      expect(data.failure).toBeNull()
    })
  })

  describe('Simple API', () => {
    it('should create typed store with store()', () => {
      const myStore = store({
        count: 0,
        user: { name: 'John' },
        items: [] as string[]
      })

      expect(myStore.count.get).toBeDefined()
      expect(myStore.user.set).toBeDefined()
      expect(myStore.items.update).toBeDefined()
    })

    it('should work with quickStore', () => {
      const counter = quickStore(0)
      
      expect(counter.get()).toBe(0)
      counter.set(10)
      expect(counter.get()).toBe(10)
      
      counter.update(n => n + 5)
      expect(counter.get()).toBe(15)
    })

    it('should subscribe to changes', () => {
      const counter = quickStore(0)
      const spy = vi.fn()
      
      const unsubscribe = counter.subscribe(spy)
      
      counter.set(5)
      expect(spy).toHaveBeenCalledWith(5)
      
      counter.update(n => n + 3)
      expect(spy).toHaveBeenCalledWith(8)
      
      unsubscribe()
      counter.set(10)
      expect(spy).toHaveBeenCalledTimes(2) // Not called after unsubscribe
    })
  })

  describe('State Persistence', () => {
    beforeEach(() => {
      // Mock localStorage
      const storage: Record<string, string> = {}
      global.localStorage = {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value },
        removeItem: (key: string) => { delete storage[key] },
        clear: () => { Object.keys(storage).forEach(k => delete storage[k]) },
        length: 0,
        key: () => null
      } as Storage
    })

    it('should save state to localStorage', () => {
      const state = { count: 5, user: 'John' }
      saveState(state, 'local')
      
      const saved = localStorage.getItem('storken:state')
      expect(saved).toBe(JSON.stringify(state))
    })

    it('should load state from localStorage', () => {
      const state = { count: 10, user: 'Jane' }
      localStorage.setItem('storken:state', JSON.stringify(state))
      
      const loaded = loadState('local')
      expect(loaded).toEqual(state)
    })

    it('should handle invalid stored data', () => {
      localStorage.setItem('storken:state', 'invalid-json')
      
      const loaded = loadState('local')
      expect(loaded).toBeNull()
    })
  })

  describe('Environment Detection', () => {
    it('should detect server environment', () => {
      const originalWindow = global.window
      delete (global as any).window
      
      const testStore = createStore()
      // Should not throw on server
      expect(() => testStore.test?.get()).not.toThrow()
      
      global.window = originalWindow
    })

    it('should detect client environment', () => {
      global.window = { localStorage: {} } as any
      
      const testStore = createStore()
      // Should have client features
      expect(testStore).toBeDefined()
    })
  })
})