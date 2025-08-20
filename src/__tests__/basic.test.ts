import { describe, it, expect } from 'vitest'
import { create } from '../index'

describe('Storken v3.0 Basic Functionality', () => {
  it('should create store with basic functionality', () => {
    const [useStorken, getStorken, setStorken, GlobalStorken] = create({})
    
    // Test store creation
    expect(useStorken).toBeDefined()
    expect(getStorken).toBeDefined()
    expect(setStorken).toBeDefined()
    expect(GlobalStorken).toBeDefined()
    
    // Test store instance
    expect(GlobalStorken.bundles).toBeDefined()
    expect(GlobalStorken.config).toBeDefined()
    expect(typeof GlobalStorken.create).toBe('function')
    expect(typeof GlobalStorken.get).toBe('function')
    expect(typeof GlobalStorken.set).toBe('function')
  })

  it('should handle initial values', () => {
    const [useStorken, getStorken, setStorken, GlobalStorken] = create({
      initialValues: {
        counter: 0,
        user: { name: 'test' }
      }
    })
    
    // Test initial values
    expect(getStorken('counter')).toBe(0)
    expect(getStorken('user')).toEqual({ name: 'test' })
  })

  it('should handle getters', async () => {
    const [useStorken, getStorken, setStorken, GlobalStorken] = create({
      getters: {
        asyncData: () => Promise.resolve({ data: 'test' })
      }
    })
    
    // Create storken instance
    const stork = GlobalStorken.create('asyncData')
    
    // Test getter functionality
    expect(typeof stork.setFromGetter).toBe('function')
    expect(typeof stork.update).toBe('function')
    
    // Test async getter
    const result = await stork.setFromGetter()
    expect(result).toEqual({ data: 'test' })
  })

  it('should handle setters', () => {
    let setterCalled = false
    let setterValue = null
    
    const [useStorken, getStorken, setStorken, GlobalStorken] = create({
      setters: {
        tracked: (stork, value) => {
          setterCalled = true
          setterValue = value
        }
      }
    })
    
    // Test setter functionality
    setStorken('tracked', 'test-value')
    
    expect(setterCalled).toBe(true)
    expect(setterValue).toBe('test-value')
  })

  it('should handle plugins', () => {
    const testPlugin = (stork) => ({
      customMethod: () => 'plugin-result'
    })
    
    const [useStorken, getStorken, setStorken, GlobalStorken] = create({
      plugins: {
        test: testPlugin
      }
    })
    
    // Create storken with plugin
    const stork = GlobalStorken.create('test-state')
    
    // Test plugin loading
    expect(stork.plugins).toBeDefined()
    expect(stork.plugins.test).toBeDefined()
    expect(stork.plugins.test.customMethod()).toBe('plugin-result')
  })

  it('should handle state operations', () => {
    const [useStorken, getStorken, setStorken, GlobalStorken] = create({
      initialValues: {
        counter: 0
      }
    })
    
    // Test get/set operations
    expect(getStorken('counter')).toBe(0)
    
    setStorken('counter', 5)
    expect(getStorken('counter')).toBe(5)
    
    // Test storken instance operations
    const stork = GlobalStorken.getStorken('counter')
    expect(stork.value).toBe(5)
    expect(stork.key).toBe('counter')
    expect(typeof stork.set).toBe('function')
    expect(typeof stork.reset).toBe('function')
  })
})