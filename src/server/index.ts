import { AsyncLocalStorage } from 'async_hooks'
import { create as createBase } from '../storken'
import type { StorkenConfig, ISky } from '../types'

// Server-specific types
export interface ServerStoreOptions extends StorkenConfig {
  server?: boolean
  ttl?: number // seconds
  maxMemory?: number // bytes
  autoCleanup?: boolean
  serializer?: 'json' | 'superjson' | CustomSerializer
  cache?: CacheStrategy
}

export interface CacheStrategy {
  type: 'memory' | 'redis' | 'memcached'
  ttl?: number
  maxSize?: number
  connection?: any
}

export interface CustomSerializer {
  stringify: (value: any) => string
  parse: (value: string) => any
}

// Request isolation using AsyncLocalStorage
const storeContext = new AsyncLocalStorage<ISky>()

// Memory tracking
class MemoryManager {
  private stores = new WeakMap<ISky, number>()
  private totalMemory = 0
  private maxMemory: number
  
  constructor(maxMemory: number = 100 * 1024 * 1024) { // 100MB default
    this.maxMemory = maxMemory
  }
  
  track(store: ISky, size: number) {
    const oldSize = this.stores.get(store) || 0
    this.totalMemory = this.totalMemory - oldSize + size
    this.stores.set(store, size)
    
    if (this.totalMemory > this.maxMemory) {
      this.cleanup()
    }
  }
  
  cleanup() {
    // Implement LRU cleanup
    console.warn('Memory limit reached, cleaning up old stores')
  }
  
  untrack(store: ISky) {
    const size = this.stores.get(store) || 0
    this.totalMemory -= size
    this.stores.delete(store)
  }
}

const memoryManager = new MemoryManager()

// Server Store Factory
export function createServerStore(options: ServerStoreOptions = {}) {
  const store = createBase({
    ...options,
    plugins: {
      ...options.plugins,
      
      // Auto cleanup plugin
      serverCleanup: (storken) => {
        if (options.autoCleanup !== false) {
          // Set TTL for auto cleanup
          const ttl = options.ttl || 3600 // 1 hour default
          const timer = setTimeout(() => {
            storken.Store.destroy()
            memoryManager.untrack(storken.Store)
          }, ttl * 1000)
          
          return {
            cleanup: () => {
              clearTimeout(timer)
              memoryManager.untrack(storken.Store)
            }
          }
        }
      },
      
      // Memory tracking plugin
      memoryTracking: (storken) => {
        storken.on('set', (key, value) => {
          // Rough size estimation
          const size = JSON.stringify(value).length
          memoryManager.track(storken.Store, size)
        })
      },
      
      // Cache plugin
      caching: options.cache ? createCachePlugin(options.cache) : undefined
    }
  })
  
  // Add server-specific methods
  const serverStore = store[3] as ISky & {
    toJSON: () => any
    dispose: () => void
    withRequest: <T>(fn: () => T) => T
  }
  
  // Safe serialization
  serverStore.toJSON = function() {
    const data = this.dump()
    return JSON.stringify(data, (key, value) => {
      // Skip functions, symbols, etc
      if (typeof value === 'function') return undefined
      if (typeof value === 'symbol') return undefined
      if (value instanceof Date) return { __type: 'Date', value: value.toISOString() }
      if (value instanceof Map) return { __type: 'Map', value: Array.from(value.entries()) }
      if (value instanceof Set) return { __type: 'Set', value: Array.from(value) }
      return value
    })
  }
  
  // Cleanup method
  serverStore.dispose = function() {
    memoryManager.untrack(this)
    // Clean up all plugins
    Object.values(this.bundles).forEach(bundle => {
      bundle.plugins?.serverCleanup?.cleanup?.()
    })
  }
  
  // Request isolation
  serverStore.withRequest = function<T>(fn: () => T): T {
    return storeContext.run(this, fn)
  }
  
  return [store[0], store[1], store[2], serverStore] as const
}

// Get current request's store
export function getCurrentStore(): ISky | undefined {
  return storeContext.getStore()
}

// Cache plugin factory
function createCachePlugin(strategy: CacheStrategy) {
  return (storken: any) => {
    const cache = new Map() // Simple in-memory cache for now
    
    storken.on('beforeGet', async (key: string) => {
      const cached = cache.get(key)
      if (cached && cached.expires > Date.now()) {
        return cached.value
      }
    })
    
    storken.on('afterSet', (key: string, value: any) => {
      cache.set(key, {
        value,
        expires: Date.now() + (strategy.ttl || 3600) * 1000
      })
    })
    
    return {
      clear: () => cache.clear(),
      size: () => cache.size
    }
  }
}

// Middleware helper for Express/Koa
export function withStorken(options?: ServerStoreOptions) {
  return (req: any, res: any, next: any) => {
    const store = createServerStore(options)
    
    // Attach to request
    req.storken = store[3]
    
    // Auto cleanup on response end
    res.on('finish', () => {
      store[3].dispose()
    })
    
    // Run in context
    store[3].withRequest(() => {
      next()
    })
  }
}

// NextJS helper
export function createRequestStore(options?: ServerStoreOptions) {
  // Each invocation creates isolated store
  return createServerStore({
    ...options,
    autoCleanup: true,
    ttl: 60 // 1 minute for request stores
  })
}