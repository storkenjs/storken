/**
 * Cache adapters for distributed caching
 */

export interface CacheAdapter {
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
  size(): Promise<number>
}

// In-memory cache adapter
export class MemoryCacheAdapter implements CacheAdapter {
  private cache = new Map<string, { value: any; expires: number }>()
  private timers = new Map<string, NodeJS.Timeout>()
  
  async get(key: string): Promise<any> {
    const item = this.cache.get(key)
    if (!item) return undefined
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key)
      return undefined
    }
    
    return item.value
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Clear existing timer
    const existingTimer = this.timers.get(key)
    if (existingTimer) clearTimeout(existingTimer)
    
    const expires = ttl ? Date.now() + ttl * 1000 : 0
    this.cache.set(key, { value, expires })
    
    // Set auto-cleanup timer
    if (ttl) {
      const timer = setTimeout(() => {
        this.cache.delete(key)
        this.timers.delete(key)
      }, ttl * 1000)
      this.timers.set(key, timer)
    }
  }
  
  async delete(key: string): Promise<void> {
    this.cache.delete(key)
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }
  
  async clear(): Promise<void> {
    this.cache.clear()
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }
  
  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== undefined
  }
  
  async size(): Promise<number> {
    return this.cache.size
  }
}

// Redis cache adapter
export class RedisCacheAdapter implements CacheAdapter {
  private client: any // Redis client type
  private prefix: string
  
  constructor(client: any, prefix = 'storken:') {
    this.client = client
    this.prefix = prefix
  }
  
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }
  
  async get(key: string): Promise<any> {
    const value = await this.client.get(this.getKey(key))
    if (!value) return undefined
    
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    const redisKey = this.getKey(key)
    
    if (ttl) {
      await this.client.setex(redisKey, ttl, serialized)
    } else {
      await this.client.set(redisKey, serialized)
    }
  }
  
  async delete(key: string): Promise<void> {
    await this.client.del(this.getKey(key))
  }
  
  async clear(): Promise<void> {
    const keys = await this.client.keys(`${this.prefix}*`)
    if (keys.length > 0) {
      await this.client.del(...keys)
    }
  }
  
  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(this.getKey(key))
    return exists === 1
  }
  
  async size(): Promise<number> {
    const keys = await this.client.keys(`${this.prefix}*`)
    return keys.length
  }
}

// LRU cache adapter with size limits
export class LRUCacheAdapter implements CacheAdapter {
  private cache: Map<string, { value: any; size: number; expires: number }>
  private maxSize: number
  private currentSize: number = 0
  
  constructor(maxSize = 100 * 1024 * 1024) { // 100MB default
    this.cache = new Map()
    this.maxSize = maxSize
  }
  
  private estimateSize(value: any): number {
    // Rough estimation
    return JSON.stringify(value).length
  }
  
  private evict() {
    // Remove oldest entries until we're under limit
    const entries = Array.from(this.cache.entries())
    while (this.currentSize > this.maxSize && entries.length > 0) {
      const [key, item] = entries.shift()!
      this.cache.delete(key)
      this.currentSize -= item.size
    }
  }
  
  async get(key: string): Promise<any> {
    const item = this.cache.get(key)
    if (!item) return undefined
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key)
      this.currentSize -= item.size
      return undefined
    }
    
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, item)
    
    return item.value
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Remove old value if exists
    const existing = this.cache.get(key)
    if (existing) {
      this.currentSize -= existing.size
    }
    
    const size = this.estimateSize(value)
    const expires = ttl ? Date.now() + ttl * 1000 : 0
    
    this.cache.set(key, { value, size, expires })
    this.currentSize += size
    
    // Evict if needed
    if (this.currentSize > this.maxSize) {
      this.evict()
    }
  }
  
  async delete(key: string): Promise<void> {
    const item = this.cache.get(key)
    if (item) {
      this.cache.delete(key)
      this.currentSize -= item.size
    }
  }
  
  async clear(): Promise<void> {
    this.cache.clear()
    this.currentSize = 0
  }
  
  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== undefined
  }
  
  async size(): Promise<number> {
    return this.cache.size
  }
}

// Multi-tier cache adapter (L1 + L2)
export class MultiTierCacheAdapter implements CacheAdapter {
  private l1: CacheAdapter // Fast local cache
  private l2: CacheAdapter // Slower distributed cache
  
  constructor(l1: CacheAdapter, l2: CacheAdapter) {
    this.l1 = l1
    this.l2 = l2
  }
  
  async get(key: string): Promise<any> {
    // Try L1 first
    let value = await this.l1.get(key)
    if (value !== undefined) return value
    
    // Try L2
    value = await this.l2.get(key)
    if (value !== undefined) {
      // Promote to L1
      await this.l1.set(key, value, 60) // Short TTL in L1
    }
    
    return value
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // Write to both tiers
    await Promise.all([
      this.l1.set(key, value, Math.min(ttl || 60, 60)), // L1 with shorter TTL
      this.l2.set(key, value, ttl)
    ])
  }
  
  async delete(key: string): Promise<void> {
    await Promise.all([
      this.l1.delete(key),
      this.l2.delete(key)
    ])
  }
  
  async clear(): Promise<void> {
    await Promise.all([
      this.l1.clear(),
      this.l2.clear()
    ])
  }
  
  async has(key: string): Promise<boolean> {
    const [l1Has, l2Has] = await Promise.all([
      this.l1.has(key),
      this.l2.has(key)
    ])
    return l1Has || l2Has
  }
  
  async size(): Promise<number> {
    // Return L2 size as it's the source of truth
    return this.l2.size()
  }
}

// Factory function for creating cache adapters
export function createCacheAdapter(config: {
  type: 'memory' | 'redis' | 'lru' | 'multi'
  redis?: any // Redis client
  l1?: CacheAdapter
  l2?: CacheAdapter
  maxSize?: number
  prefix?: string
}): CacheAdapter {
  switch (config.type) {
    case 'memory':
      return new MemoryCacheAdapter()
    
    case 'redis':
      if (!config.redis) {
        throw new Error('Redis client required for redis cache adapter')
      }
      return new RedisCacheAdapter(config.redis, config.prefix)
    
    case 'lru':
      return new LRUCacheAdapter(config.maxSize)
    
    case 'multi':
      if (!config.l1 || !config.l2) {
        throw new Error('L1 and L2 cache adapters required for multi-tier cache')
      }
      return new MultiTierCacheAdapter(config.l1, config.l2)
    
    default:
      throw new Error(`Unknown cache adapter type: ${config.type}`)
  }
}