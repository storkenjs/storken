# Storken Universal API

The new Universal API makes Storken incredibly simple to use across server and client environments.

## 🚀 Quick Start

```typescript
import { createStore } from 'storken'

// Works everywhere - server & client!
const store = createStore({
  posts: async () => fetch('/api/posts'),
  user: async (id) => fetch(`/api/users/${id}`)
})

// Server Component
async function Page() {
  const posts = await store.posts.get()
  return <PostList posts={posts} />
}

// Client Component
function ClientComponent() {
  const posts = store.posts.use() // Hook for client
  return <div>{posts.length} posts</div>
}
```

## 📦 Installation

```bash
npm install storken
# or
pnpm add storken
# or
bun add storken
```

## 🎯 Core Concepts

### 1. **One API, Everywhere**

The same store API works in:
- ✅ Server Components
- ✅ Client Components
- ✅ API Routes
- ✅ Edge Functions
- ✅ Node.js Scripts
- ✅ Browser

### 2. **Automatic Environment Detection**

```typescript
const store = createStore({
  data: async () => {
    // Automatically optimized for environment
    // Server: Direct DB queries, in-memory cache
    // Client: API calls, localStorage persistence
  }
})
```

### 3. **Zero Configuration**

```typescript
// Just works - no setup needed!
const store = createStore({
  count: 0,
  user: null,
  items: []
})
```

## 🔥 NextJS Integration

### App Router (Recommended)

```typescript
// app/store.ts
import { setupStorken } from 'storken/next'

export const { store, ServerData, useServerData } = setupStorken({
  posts: () => db.posts.findMany(),
  user: (id) => db.users.findById(id)
})

// app/page.tsx
export default async function Page() {
  const data = await store.prepare(['posts', 'user'])
  
  return (
    <>
      <ServerData data={data} /> {/* Auto hydration */}
      <ClientSection />
    </>
  )
}

// app/client.tsx
'use client'
function ClientSection() {
  const { posts, user } = useServerData() // Hydrated data
  const cart = store.cart.use() // Client state
}
```

### Pages Router (Legacy)

```typescript
// pages/_app.tsx
import { withStorken } from 'storken/next'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default withStorken(MyApp, store)

// pages/index.tsx
export const getServerSideProps = createServerSideProps(store)(
  async (context) => ({
    posts: await db.posts.findMany()
  })
)
```

## 💡 Simple API

### Basic Store

```typescript
import { store } from 'storken/simple'

const myStore = store({
  count: 0,
  user: { name: 'John' },
  items: [] as string[]
})

// Typed & auto-complete!
await myStore.count.set(5)
await myStore.user.update(u => ({ ...u, name: 'Jane' }))
myStore.items.subscribe(items => console.log(items))
```

### Quick Store

```typescript
import { quickStore } from 'storken/simple'

const counter = quickStore(0)

counter.get() // 0
counter.set(5)
counter.update(n => n + 1)
counter.subscribe(console.log)
```

## 🎨 Client Features

### Persistence

```typescript
const store = createStore({
  client: {
    persist: true // Auto localStorage
  }
})

// Or manual control
import { saveState, loadState } from 'storken/simple'

saveState(store, 'local') // or 'session'
const saved = loadState('local')
```

### DevTools

```typescript
const store = createStore({
  debug: true // Auto DevTools in development
})

store.debug() // Log state tree
store.explain('key') // Why did it re-render?
```

## 🖥️ Server Features

### Caching

```typescript
const store = createStore({
  server: {
    cache: 'lru', // or 'memory', 'redis'
    ttl: 3600,    // 1 hour
    maxMemory: '100mb'
  }
})
```

### Request Isolation

```typescript
// Each request gets isolated store
export default async function handler(req, res) {
  const store = createRequestStore()
  // Automatically cleaned up after request
}
```

### Data Loading

```typescript
import { prepareData } from 'storken'

const data = await prepareData({
  posts: () => db.posts.findMany(),
  stats: () => calculateStats(),
  user: () => getUser()
})
// All loaded in parallel!
```

## 🔄 Hydration

### Automatic (Recommended)

```typescript
// Server
const data = await store.prepare(['posts'])
return <ServerData data={data} />

// Client - automatically hydrated!
const { posts } = useServerData()
```

### Manual

```typescript
// Server
import { prepareForClient } from 'storken/simple'
const serialized = prepareForClient(store)

// Client
import { loadFromServer } from 'storken/simple'
const hydrated = loadFromServer(serialized)
```

## 📊 Advanced Patterns

### Optimistic Updates

```typescript
async function likePost(postId) {
  // Update immediately
  store.posts.update(posts => 
    posts.map(p => p.id === postId 
      ? { ...p, likes: p.likes + 1 }
      : p
    )
  )
  
  try {
    await api.likePost(postId)
  } catch {
    // Revert on error
    store.posts.update(posts =>
      posts.map(p => p.id === postId
        ? { ...p, likes: p.likes - 1 }  
        : p
      )
    )
  }
}
```

### Transactions

```typescript
import { transaction } from 'storken/simple'

await transaction(store, async (s) => {
  await s.user.set(newUser)
  await s.posts.set(newPosts)
  // Rollback if any fails
})
```

### Batch Operations

```typescript
import { batch } from 'storken/simple'

await batch([
  () => store.posts.get(),
  () => store.user.get(),
  () => store.settings.get()
])
```

## 🛠️ TypeScript

Full type safety and auto-complete:

```typescript
interface AppState {
  user: User | null
  posts: Post[]
  settings: Settings
}

const store = store<AppState>({
  user: null,
  posts: [],
  settings: defaultSettings
})

// Fully typed!
store.user.set({ id: 1, name: 'John' }) // ✅
store.user.set('invalid') // ❌ Type error
```

## 🚨 Migration from v2

```typescript
// Old (v2)
const [useStore, get, set] = create({
  getters: { /* ... */ },
  setters: { /* ... */ }
})

// New (v3)
const store = createStore({
  user: async () => fetchUser(),
  posts: async () => fetchPosts()
})

// Use it
await store.user.get()  // Server
store.user.use()        // Client hook
```

## 🎯 Best Practices

1. **Use server-side for initial data**
   ```typescript
   // ✅ Good - fetch on server
   export default async function Page() {
     const posts = await store.posts.get()
   }
   
   // ❌ Bad - fetch on client mount
   useEffect(() => { fetchPosts() }, [])
   ```

2. **Keep client state minimal**
   ```typescript
   // ✅ UI state, forms, carts
   // ❌ Data that should come from server
   ```

3. **Use proper caching**
   ```typescript
   // Server: TTL-based cache
   // Client: SWR or React Query for API cache
   ```

## 📚 API Reference

### `createStore(config)`
Creates a universal store.

### `store.key.get(...args)`
Get value (async).

### `store.key.set(value)`
Set value (async).

### `store.key.use(...args)`
React hook (client only).

### `store.key.update(fn)`
Update with function.

### `store.key.subscribe(fn)`
Subscribe to changes.

### `prepareData(loaders)`
Load data in parallel.

### `ServerData`
Component for hydration.

### `useServerData()`
Hook to access hydrated data.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

MIT © Storken Team