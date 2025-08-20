/**
 * Storken Universal API
 * Single API for both server and client environments
 */

import { create as createBase } from '../storken'
import { createServerStore } from '../server'
import type { StorkenConfig, ISky, StorkenHookReturn } from '../types'

// Extended config for universal stores
export interface UniversalStoreConfig extends StorkenConfig {
  // Server-specific options
  server?: {
    cache?: 'memory' | 'redis' | 'lru'
    ttl?: number
    maxMemory?: number
  }
  // Client-specific options  
  client?: {
    persist?: boolean | 'localStorage' | 'sessionStorage'
    devTools?: boolean
  }
  // Shared options
  debug?: boolean
}

// Universal store return type
export interface UniversalStore {
  // Method chaining API
  [key: string]: {
    get: (...args: any[]) => Promise<any>
    set: (value: any, ...args: any[]) => Promise<void>
    use: (...args: any[]) => any // Hook for client-side
    fetch: (...args: any[]) => Promise<any> // Alias for get
    update: (updater: (prev: any) => any) => Promise<void>
    reset: () => Promise<void>
    subscribe: (listener: (value: any) => void) => () => void
  }
}

// Environment detection
const isServer = typeof window === 'undefined'
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Create a universal store that works in both server and client
 * Automatically detects environment and optimizes accordingly
 */
export function createStore(config: UniversalStoreConfig = {}): UniversalStore {
  // Apply smart defaults based on environment
  const enhancedConfig = {
    ...config,
    ...(isServer ? {
      // Server defaults
      server: {
        cache: 'memory' as const,
        ttl: 3600,
        maxMemory: 100 * 1024 * 1024, // 100MB
        ...config.server
      }
    } : {
      // Client defaults
      client: {
        persist: true,
        devTools: isDevelopment,
        ...config.client
      }
    })
  }

  // Create appropriate store
  let baseStore: any
  
  if (isServer) {
    // Server-side store with optimizations
    baseStore = createServerStore({
      ...enhancedConfig,
      ttl: enhancedConfig.server?.ttl,
      maxMemory: enhancedConfig.server?.maxMemory,
      cache: enhancedConfig.server?.cache ? {
        type: enhancedConfig.server.cache
      } : undefined
    })
  } else {
    // Client-side store with persistence
    baseStore = createBase(enhancedConfig)
    
    // Add persistence if enabled
    if (enhancedConfig.client?.persist) {
      const storage = enhancedConfig.client.persist === 'sessionStorage' 
        ? sessionStorage 
        : localStorage
        
      // Load persisted state
      try {
        const persisted = storage.getItem('storken:state')
        if (persisted) {
          const state = JSON.parse(persisted)
          Object.entries(state).forEach(([key, value]) => {
            baseStore[2](key, value) // set function
          })
        }
      } catch (e) {
        console.warn('Failed to load persisted state:', e)
      }
      
      // Auto-persist on changes
      const originalSet = baseStore[2]
      baseStore[2] = (key: string, value: any, ...args: any[]) => {
        const result = originalSet(key, value, ...args)
        
        // Persist to storage
        try {
          const currentState = JSON.parse(storage.getItem('storken:state') || '{}')
          currentState[key] = value
          storage.setItem('storken:state', JSON.stringify(currentState))
        } catch (e) {
          console.warn('Failed to persist state:', e)
        }
        
        return result
      }
    }
  }

  // Create universal API wrapper
  const universalStore: UniversalStore = new Proxy({} as UniversalStore, {
    get(target, prop: string) {
      if (typeof prop !== 'string') return undefined
      
      // Return method chain object for each key
      return {
        // Get value (works on both server and client)
        async get(...args: any[]) {
          if (isServer) {
            return baseStore[1](prop, ...args) // server get
          } else {
            return baseStore[1](prop, ...args) // client get
          }
        },
        
        // Alias for get
        async fetch(...args: any[]) {
          return this.get(...args)
        },
        
        // Set value
        async set(value: any, ...args: any[]) {
          if (isServer) {
            return baseStore[2](prop, value, ...args) // server set
          } else {
            return baseStore[2](prop, value, ...args) // client set
          }
        },
        
        // Update with function
        async update(updater: (prev: any) => any) {
          const current = await this.get()
          const updated = updater(current)
          return this.set(updated)
        },
        
        // Reset to initial value
        async reset() {
          const initial = enhancedConfig.initialValues?.[prop]
          if (initial !== undefined) {
            return this.set(initial)
          }
        },
        
        // Client-side hook (throws on server)
        use(...args: any[]) {
          if (isServer) {
            throw new Error('Cannot use hooks on server side. Use .get() instead.')
          }
          return baseStore[0](prop, ...args) // useStorken hook
        },
        
        // Subscribe to changes
        subscribe(listener: (value: any) => void) {
          if (isServer) {
            // No-op on server
            return () => {}
          }
          
          // Simple subscription for client
          const storken = baseStore[3].getStorken(prop)
          storken.on('set', listener)
          
          return () => {
            // Unsubscribe
            // Note: Storken doesn't have off method, so we'd need to implement it
          }
        }
      }
    }
  })

  // Add debug helpers in development
  if (isDevelopment && enhancedConfig.debug) {
    ;(universalStore as any).debug = () => {
      console.log('🔍 Storken State:', baseStore[3].dump())
    }
    
    ;(universalStore as any).explain = (key: string) => {
      console.log(`📊 Storken Explain [${key}]:`, {
        value: baseStore[3].get(key),
        listeners: baseStore[3].bundles[key]?.listeners?.length || 0,
        loading: baseStore[3].bundles[key]?.loading || false
      })
    }
  }

  return universalStore
}

/**
 * Prepare data on server for client hydration
 * Returns serialized state ready for transport
 */
export async function prepareData(
  loaders: Record<string, () => Promise<any>>
): Promise<Record<string, any>> {
  const results: Record<string, any> = {}
  
  // Parallel data loading
  await Promise.all(
    Object.entries(loaders).map(async ([key, loader]) => {
      try {
        results[key] = await loader()
      } catch (error) {
        console.error(`Failed to load data for ${key}:`, error)
        results[key] = null
      }
    })
  )
  
  return results
}

/**
 * Simple hook for using server data on client
 */
export function useServerData<T = any>(): T {
  if (isServer) {
    throw new Error('useServerData can only be used on client side')
  }
  
  // Get data from window object (injected by ServerData component)
  const data = (window as any).__STORKEN_DATA__
  
  if (!data) {
    console.warn('No server data found. Make sure to use <ServerData /> component')
    return {} as T
  }
  
  return data as T
}