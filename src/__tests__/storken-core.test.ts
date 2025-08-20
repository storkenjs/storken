import { describe, it, expect, vi } from 'vitest'
import { create } from '../index'

describe('Storken Core Tests', () => {
  describe('Basic State Management', () => {
    it('should create a store with initial values', () => {
      const [useStorken, get, set] = create({
        initialValues: {
          counter: 0,
          user: null
        }
      })
      
      expect(get('counter')).toBe(0)
      expect(get('user')).toBe(null)
    })

    it('should update state when setter is called', () => {
      const [useStorken, get, set] = create({
        initialValues: {
          counter: 0
        }
      })
      
      set('counter', 5)
      expect(get('counter')).toBe(5)
    })

    it('should support function updates', async () => {
      const [useStorken, get, set, Sky] = create({
        initialValues: {
          counter: 10
        }
      })
      
      // Function updates work through the storken instance
      const storken = Sky.getStorken('counter')
      await storken.set((prev: number) => prev + 5)
      expect(get('counter')).toBe(15)
    })

    it('should reset to initial value', () => {
      const [useStorken, get, set, Sky] = create({
        initialValues: {
          counter: 0
        }
      })
      
      set('counter', 10)
      expect(get('counter')).toBe(10)
      
      const storken = Sky.getStorken('counter')
      storken.reset()
      expect(get('counter')).toBe(0)
    })
  })

  describe('TypeScript Support', () => {
    it('should maintain type safety', () => {
      interface User {
        id: string
        name: string
        email: string
      }

      const [useStorken, get, set] = create({
        initialValues: {
          user: null as User | null
        }
      })
      
      const testUser: User = {
        id: '1',
        name: 'John',
        email: 'john@example.com'
      }
      
      set('user', testUser)
      expect(get('user')).toEqual(testUser)
    })
  })

  describe('Getter Pattern', () => {
    it('should support getters', async () => {
      const mockGetter = vi.fn().mockResolvedValue({ name: 'John' })
      
      const [useStorken, get, set, Sky] = create({
        getters: {
          user: mockGetter
        }
      })

      const storken = Sky.create('user')
      const result = await storken.setFromGetter()
      
      expect(result).toEqual({ name: 'John' })
      expect(mockGetter).toHaveBeenCalled()
    })

    it('should pass parameters to getter', async () => {
      const mockGetter = vi.fn().mockImplementation((storken, userId: string) => {
        return Promise.resolve({ id: userId, name: 'User' })
      })
      
      const [useStorken, get, set, Sky] = create({
        getters: {
          user: mockGetter
        }
      })

      // Parameters need to be passed to setFromGetter, not just create
      const storken = Sky.create('user')
      const result = await storken.setFromGetter('123')
      
      // The getter receives the storken instance and the args
      expect(result).toEqual({ id: '123', name: 'User' })
      expect(mockGetter).toHaveBeenCalledWith(
        expect.any(Object),
        '123'
      )
    })
  })

  describe('Setter Pattern', () => {
    it('should execute setter when value changes', () => {
      const mockSetter = vi.fn()
      
      const [useStorken, get, set] = create({
        setters: {
          user: mockSetter
        }
      })
      
      set('user', { name: 'John' })
      
      // The setter receives the storken instance and the value
      expect(mockSetter).toHaveBeenCalledWith(
        expect.any(Object), // storken instance
        { name: 'John' }
      )
    })

    it('should not execute setter on initial value', () => {
      const mockSetter = vi.fn()
      
      const [useStorken, get, set] = create({
        initialValues: {
          user: { name: 'Initial' }
        },
        setters: {
          user: mockSetter
        }
      })
      
      expect(mockSetter).not.toHaveBeenCalled()
    })
  })

  describe('Plugin System', () => {
    it('should initialize plugins', () => {
      const mockPlugin = vi.fn().mockReturnValue({
        customMethod: vi.fn()
      })
      
      const [useStorken, get, set, Sky] = create({
        plugins: {
          testPlugin: mockPlugin
        }
      })

      const storken = Sky.create('test')
      
      expect(storken.plugins?.testPlugin).toBeDefined()
      expect(storken.plugins?.testPlugin.customMethod).toBeDefined()
    })

    it('should pass configuration to plugins', () => {
      const mockPlugin = vi.fn()
      const pluginConfig = { option: 'value' }
      
      const [useStorken, get, set, Sky] = create({
        plugins: {
          testPlugin: [mockPlugin, pluginConfig]
        }
      })

      Sky.create('test')
      
      expect(mockPlugin).toHaveBeenCalledWith(
        expect.any(Object),
        pluginConfig
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle getter errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockGetter = vi.fn().mockRejectedValue(new Error('Fetch failed'))
      
      const [useStorken, get, set, Sky] = create({
        getters: {
          data: mockGetter
        }
      })

      const storken = Sky.create('data')
      
      await expect(storken.setFromGetter()).rejects.toThrow('Fetch failed')
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle setter errors gracefully', () => {
      const mockSetter = vi.fn().mockImplementation(() => {
        throw new Error('Save failed')
      })
      
      const [useStorken, get, set] = create({
        setters: {
          data: mockSetter
        }
      })
      
      // Should not throw when setter fails, error is caught internally
      expect(() => set('data', 'test')).not.toThrow()
      
      // The setter was still called
      expect(mockSetter).toHaveBeenCalled()
    })
  })
})