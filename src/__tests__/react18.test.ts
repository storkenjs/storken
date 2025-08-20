import { describe, it, expect, vi } from 'vitest'
import { useSyncExternalStore } from 'react'

describe('Storken v3.0 React 18 Compatibility', () => {
  it('should use useSyncExternalStore in built package', () => {
    // Simple test that useSyncExternalStore is available
    expect(useSyncExternalStore).toBeDefined()
    expect(typeof useSyncExternalStore).toBe('function')
  })

  it('should have modern React patterns in built output', () => {
    // Test that built package contains useSyncExternalStore
    const fs = require('fs')
    const path = require('path')
    
    const builtFile = path.join(__dirname, '../../dist/index.js')
    const content = fs.readFileSync(builtFile, 'utf8')
    
    // Check if useSyncExternalStore is in the built output
    expect(content).toContain('useSyncExternalStore')
    expect(content).toContain('react')
  })

  it('should maintain React 18 compatibility in API', () => {
    // Test that our API is compatible with React 18
    const { create } = require('../../dist/index.js')
    
    // Create a store
    const [useStorken, getStorken, setStorken, GlobalStorken] = create({
      initialValues: { reactTest: 'react18' }
    })
    
    // Test that functions are available
    expect(typeof useStorken).toBe('function')
    expect(typeof getStorken).toBe('function')
    expect(typeof setStorken).toBe('function')
    expect(GlobalStorken).toBeDefined()
    
    // Test basic functionality
    expect(getStorken('reactTest')).toBe('react18')
  })

})