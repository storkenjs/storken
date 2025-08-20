/**
 * Simplified Storken API
 * User-friendly naming and easy-to-use functions
 */

import { createStore as createUniversalStore } from './universal'
import { dehydrate, hydrate } from './server/hydration'
import type { UniversalStoreConfig } from './universal'

/**
 * Create a store (works everywhere)
 */
export function createStore(config?: UniversalStoreConfig) {
  return createUniversalStore(config)
}

/**
 * Prepare data for client (server-side)
 */
export function prepareForClient(store: any): string {
  const state = dehydrate(store, {
    exclude: ['_internal', 'temp']
  })
  return JSON.stringify(state)
}

/**
 * Load data from server (client-side)
 */
export function loadFromServer(data: string | any): Record<string, any> {
  if (typeof data === 'string') {
    data = JSON.parse(data)
  }
  return hydrate(data)
}

/**
 * Save state to storage
 */
export function saveState(
  store: any,
  storage: 'local' | 'session' = 'local'
): void {
  const storageObj = storage === 'local' ? localStorage : sessionStorage
  const state = store.dump ? store.dump() : store
  storageObj.setItem('storken:state', JSON.stringify(state))
}

/**
 * Load state from storage
 */
export function loadState(
  storage: 'local' | 'session' = 'local'
): Record<string, any> | null {
  try {
    const storageObj = storage === 'local' ? localStorage : sessionStorage
    const data = storageObj.getItem('storken:state')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/**
 * Simple store creator with auto-everything
 */
export function store<T extends Record<string, any>>(
  initialData: T
) {
  const storeInstance = createStore({
    initialValues: initialData
  })
  
  // Create typed accessors
  type Keys = keyof T
  
  const typedStore = {} as {
    [K in Keys]: {
      get(): Promise<T[K]>
      set(value: T[K]): Promise<void>
      update(fn: (prev: T[K]) => T[K]): Promise<void>
      subscribe(fn: (value: T[K]) => void): () => void
      use(): T[K] // Client-only hook
    }
  } & {
    // Global helpers
    reset(): void
    clear(): void
    dump(): T
    load(data: Partial<T>): void
  }
  
  // Add typed accessors for each key
  Object.keys(initialData).forEach((key) => {
    typedStore[key as Keys] = {
      get: () => storeInstance[key].get(),
      set: (value: any) => storeInstance[key].set(value),
      update: (fn: any) => storeInstance[key].update(fn),
      subscribe: (fn: any) => storeInstance[key].subscribe(fn),
      use: () => storeInstance[key].use()
    }
  })
  
  // Add global helpers
  typedStore.reset = () => {
    Object.keys(initialData).forEach(key => {
      storeInstance[key].reset()
    })
  }
  
  typedStore.clear = () => {
    Object.keys(initialData).forEach(key => {
      storeInstance[key].set(null)
    })
  }
  
  typedStore.dump = () => {
    const result = {} as T
    Object.keys(initialData).forEach(key => {
      // This would need to be sync or we need async dump
      result[key as Keys] = initialData[key]
    })
    return result
  }
  
  typedStore.load = (data: Partial<T>) => {
    Object.entries(data).forEach(([key, value]) => {
      if (key in initialData) {
        storeInstance[key].set(value)
      }
    })
  }
  
  return typedStore
}

/**
 * Quick store for simple use cases
 */
export function quickStore<T = any>(initialValue: T) {
  let value = initialValue
  const listeners = new Set<(value: T) => void>()
  
  return {
    get: () => value,
    set: (newValue: T) => {
      value = newValue
      listeners.forEach(fn => fn(value))
    },
    update: (fn: (prev: T) => T) => {
      value = fn(value)
      listeners.forEach(l => l(value))
    },
    subscribe: (fn: (value: T) => void) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    use: () => {
      // This would need React integration
      if (typeof window === 'undefined') {
        throw new Error('Hooks can only be used on client')
      }
      // Simplified - would need proper React integration
      const [state, setState] = (window as any).React.useState(value)
      ;(window as any).React.useEffect(() => {
        return quickStore.subscribe(setState)
      }, [])
      return state
    }
  } as const
}

/**
 * Batch operations helper
 */
export async function batch(operations: Array<() => Promise<any>>) {
  return Promise.all(operations.map(op => op()))
}

/**
 * Transaction helper
 */
export async function transaction(
  store: any,
  operations: (store: any) => Promise<void>
) {
  // Save current state
  const backup = store.dump()
  
  try {
    await operations(store)
  } catch (error) {
    // Rollback on error
    store.load(backup)
    throw error
  }
}