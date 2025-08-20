import { describe, it, expect } from 'vitest'

describe('Storken v3.0 Import Tests', () => {
  it('should import from built package', async () => {
    // Test ESM import
    const { create, Storken, Sky, createHook } = await import('../../dist/index.mjs')
    
    expect(create).toBeDefined()
    expect(Storken).toBeDefined()
    expect(Sky).toBeDefined()
    expect(createHook).toBeDefined()
    
    // Test functionality
    const [useStorken, getStorken, setStorken, GlobalStorken] = create({
      initialValues: { test: 'value' }
    })
    
    expect(getStorken('test')).toBe('value')
  })

  it('should import default export', async () => {
    // Test default import
    const defaultExport = await import('../../dist/index.mjs')
    
    expect(defaultExport.default).toBeDefined()
    expect(typeof defaultExport.default).toBe('function')
    
    // Test default functionality
    const [useStorken] = defaultExport.default({})
    expect(useStorken).toBeDefined()
  })

  it('should work with CommonJS', async () => {
    // Test CJS import
    const { create } = await import('../../dist/index.js')
    
    expect(create).toBeDefined()
    
    // Test functionality
    const [useStorken, getStorken] = create({
      initialValues: { cjs: 'test' }
    })
    
    expect(getStorken('cjs')).toBe('test')
  })
})