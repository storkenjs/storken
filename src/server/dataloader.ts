/**
 * DataLoader pattern for Storken
 * Solves N+1 query problem with automatic batching
 */

type BatchLoadFn<K, V> = (keys: K[]) => Promise<V[]>

interface DataLoaderOptions<K, V> {
  batch?: boolean
  maxBatchSize?: number
  batchScheduleFn?: (fn: () => void) => void
  cache?: boolean
  cacheKeyFn?: (key: K) => string
}

export class StorkenDataLoader<K = any, V = any> {
  private batchLoadFn: BatchLoadFn<K, V>
  private options: DataLoaderOptions<K, V>
  private batch: Array<{
    key: K
    resolve: (value: V) => void
    reject: (error: Error) => void
  }> = []
  private cache: Map<string, Promise<V>> = new Map()
  
  constructor(batchLoadFn: BatchLoadFn<K, V>, options: DataLoaderOptions<K, V> = {}) {
    this.batchLoadFn = batchLoadFn
    this.options = {
      batch: true,
      maxBatchSize: 100,
      batchScheduleFn: (fn) => process.nextTick(fn),
      cache: true,
      cacheKeyFn: (key) => JSON.stringify(key),
      ...options
    }
  }
  
  async load(key: K): Promise<V> {
    if (!this.options.batch) {
      const [result] = await this.batchLoadFn([key])
      return result
    }
    
    // Check cache
    if (this.options.cache) {
      const cacheKey = this.options.cacheKeyFn!(key)
      const cached = this.cache.get(cacheKey)
      if (cached) return cached
    }
    
    // Add to batch
    const promise = new Promise<V>((resolve, reject) => {
      this.batch.push({ key, resolve, reject })
      
      // Schedule batch execution
      if (this.batch.length === 1) {
        this.options.batchScheduleFn!(() => this.dispatchBatch())
      } else if (this.batch.length >= this.options.maxBatchSize!) {
        this.dispatchBatch()
      }
    })
    
    // Cache promise
    if (this.options.cache) {
      const cacheKey = this.options.cacheKeyFn!(key)
      this.cache.set(cacheKey, promise)
    }
    
    return promise
  }
  
  async loadMany(keys: K[]): Promise<V[]> {
    return Promise.all(keys.map(key => this.load(key)))
  }
  
  private async dispatchBatch() {
    const batch = this.batch.splice(0)
    if (batch.length === 0) return
    
    try {
      const keys = batch.map(item => item.key)
      const values = await this.batchLoadFn(keys)
      
      // Match results to requests
      batch.forEach((item, index) => {
        item.resolve(values[index])
      })
    } catch (error: any) {
      batch.forEach(item => item.reject(error))
    }
  }
  
  clear(key?: K) {
    if (key) {
      const cacheKey = this.options.cacheKeyFn!(key)
      this.cache.delete(cacheKey)
    } else {
      this.cache.clear()
    }
  }
  
  prime(key: K, value: V) {
    if (this.options.cache) {
      const cacheKey = this.options.cacheKeyFn!(key)
      this.cache.set(cacheKey, Promise.resolve(value))
    }
  }
}

// Integration with Storken
export function createBatchedGetter<K, V>(
  batchFn: BatchLoadFn<K, V>,
  options?: DataLoaderOptions<K, V>
) {
  const loader = new StorkenDataLoader(batchFn, options)
  
  return async (storken: any, key: K) => {
    return loader.load(key)
  }
}

// Usage example:
/*
const getUserBatched = createBatchedGetter(
  async (userIds: string[]) => {
    // Single query for multiple users
    return db.users.findMany({
      where: { id: { in: userIds } }
    })
  }
)

create({
  getters: {
    user: getUserBatched
  }
})
*/