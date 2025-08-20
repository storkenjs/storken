/**
 * Hydration utilities for SSR/SSG
 * Ensures safe state transfer from server to client
 */

import type { ISky } from '../types'

// Serialization format for safe transport
export interface SerializedState {
  __storken: true
  version: string
  timestamp: number
  data: Record<string, any>
  metadata?: Record<string, any>
}

// Custom type serializers
const typeSerializers = new Map<string, {
  check: (value: any) => boolean
  serialize: (value: any) => any
  deserialize: (value: any) => any
}>()

// Register default serializers
typeSerializers.set('Date', {
  check: (v) => v instanceof Date,
  serialize: (v) => ({ __type: 'Date', value: v.toISOString() }),
  deserialize: (v) => new Date(v.value)
})

typeSerializers.set('Map', {
  check: (v) => v instanceof Map,
  serialize: (v) => ({ __type: 'Map', value: Array.from(v.entries()) }),
  deserialize: (v) => new Map(v.value)
})

typeSerializers.set('Set', {
  check: (v) => v instanceof Set,
  serialize: (v) => ({ __type: 'Set', value: Array.from(v) }),
  deserialize: (v) => new Set(v.value)
})

typeSerializers.set('BigInt', {
  check: (v) => typeof v === 'bigint',
  serialize: (v) => ({ __type: 'BigInt', value: v.toString() }),
  deserialize: (v) => BigInt(v.value)
})

typeSerializers.set('URL', {
  check: (v) => v instanceof URL,
  serialize: (v) => ({ __type: 'URL', value: v.href }),
  deserialize: (v) => new URL(v.value)
})

typeSerializers.set('RegExp', {
  check: (v) => v instanceof RegExp,
  serialize: (v) => ({ __type: 'RegExp', value: v.source, flags: v.flags }),
  deserialize: (v) => new RegExp(v.value, v.flags)
})

// Dehydration: Server -> Client
export function dehydrate(store: ISky, options: {
  exclude?: string[]
  include?: string[]
  transform?: Record<string, (value: any) => any>
} = {}): SerializedState {
  const data = store.dump()
  const processed: Record<string, any> = {}
  
  // Filter keys
  const keys = Object.keys(data).filter(key => {
    if (options.include && !options.include.includes(key)) return false
    if (options.exclude && options.exclude.includes(key)) return false
    return true
  })
  
  // Process values
  keys.forEach(key => {
    let value = data[key]
    
    // Apply custom transform
    if (options.transform?.[key]) {
      value = options.transform[key](value)
    }
    
    // Serialize special types
    processed[key] = serialize(value)
  })
  
  return {
    __storken: true,
    version: '3.0.0',
    timestamp: Date.now(),
    data: processed
  }
}

// Hydration: Client <- Server
export function hydrate(serialized: SerializedState | string): Record<string, any> {
  // Parse if string
  const state = typeof serialized === 'string' 
    ? JSON.parse(serialized) 
    : serialized
  
  // Validate
  if (!state.__storken) {
    throw new Error('Invalid Storken serialized state')
  }
  
  // Deserialize data
  const data: Record<string, any> = {}
  Object.keys(state.data).forEach(key => {
    data[key] = deserialize(state.data[key])
  })
  
  return data
}

// Recursive serialization
function serialize(value: any): any {
  // Check for null/undefined
  if (value == null) return value
  
  // Check custom serializers
  for (const [name, serializer] of typeSerializers) {
    if (serializer.check(value)) {
      return serializer.serialize(value)
    }
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(serialize)
  }
  
  // Handle plain objects
  if (typeof value === 'object' && value.constructor === Object) {
    const result: Record<string, any> = {}
    Object.keys(value).forEach(key => {
      result[key] = serialize(value[key])
    })
    return result
  }
  
  // Primitives and unsupported types
  if (typeof value === 'function') return undefined
  if (typeof value === 'symbol') return undefined
  
  return value
}

// Recursive deserialization
function deserialize(value: any): any {
  // Check for null/undefined
  if (value == null) return value
  
  // Check for serialized types
  if (value && typeof value === 'object' && value.__type) {
    const serializer = typeSerializers.get(value.__type)
    if (serializer) {
      return serializer.deserialize(value)
    }
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(deserialize)
  }
  
  // Handle plain objects
  if (typeof value === 'object' && value.constructor === Object) {
    const result: Record<string, any> = {}
    Object.keys(value).forEach(key => {
      result[key] = deserialize(value[key])
    })
    return result
  }
  
  return value
}

// Register custom type serializer
export function registerSerializer<T>(
  name: string,
  check: (value: any) => boolean,
  serialize: (value: T) => any,
  deserialize: (value: any) => T
) {
  typeSerializers.set(name, { check, serialize, deserialize })
}

// NextJS specific helpers
export function createHydrationScript(state: SerializedState): string {
  return `
    <script id="__STORKEN_STATE__" type="application/json">
      ${JSON.stringify(state)}
    </script>
  `
}

export function getHydratedState(): Record<string, any> | null {
  if (typeof window === 'undefined') return null
  
  const script = document.getElementById('__STORKEN_STATE__')
  if (!script) return null
  
  try {
    const state = JSON.parse(script.textContent || '{}')
    return hydrate(state)
  } catch (error) {
    console.error('Failed to hydrate Storken state:', error)
    return null
  }
}

// React hook for hydration
export function useHydratedStore(createFn: (initial?: any) => any) {
  if (typeof window === 'undefined') {
    // Server-side: use provided initial state
    return createFn()
  }
  
  // Client-side: hydrate from DOM
  const hydrated = getHydratedState()
  return createFn(hydrated)
}