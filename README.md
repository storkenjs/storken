<div align="center">
  <img src="./logo.png" alt="Storken Logo" width="120" height="120" />
  
  # Storken v3.0
  **The LLM-Native State Management Library for React 18+**
  
  🚀 5KB LLM-native state management for React 18+ with TypeScript, universal API, and plugin system
</div>

[![npm version](https://img.shields.io/npm/v/storken.svg)](https://www.npmjs.com/package/storken)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://react.dev/)
[![Bundle Size](https://img.shields.io/badge/bundle-5KB-green)](https://bundlephobia.com/)
[![License](https://img.shields.io/badge/license-MIT-purple)](./LICENSE.md)

Storken is a **minimal, type-safe, and LLM-friendly** state management library for React 18+ with unique features like getter/setter patterns, plugin system, and **industry-first unified server-client API**.

## ✨ Features

- 🚀 **React 18 Ready** - Built with `useSyncExternalStore` for optimal performance
- 📝 **Full TypeScript** - Complete type safety and IntelliSense support
- 🤖 **LLM-Native** - Predictable patterns perfect for AI-assisted development
- 🔄 **Universal API** - Same code works in Server Components, Client Components, and API Routes
- 🎯 **Getter/Setter Patterns** - Async data fetching with built-in loading states
- 🔌 **Plugin System** - Extend functionality with minimal overhead
- 📦 **Tiny Bundle** - Only 5KB minified + gzipped
- ⚡ **Zero Dependencies** - Pure React implementation

## 📦 Installation

```bash
# npm
npm install storken

# yarn
yarn add storken

# pnpm
pnpm add storken

# bun
bun add storken
```

## 🚀 Quick Start

> 💡 **New to Storken?** Check out our [comprehensive examples](./examples/) for real-world usage patterns!

### Basic Usage

```typescript
import { create } from 'storken'

// Create your store
const [useStorken] = create({
  initialValues: {
    counter: 0,
    user: null
  }
})

// Use in your components
function Counter() {
  const [count, setCount] = useStorken<number>('counter')
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
    </div>
  )
}
```

### TypeScript Usage

```typescript
interface User {
  id: string
  name: string
  email: string
}

function UserProfile() {
  const [user, setUser, resetUser] = useStorken<User | null>('user', null)
  
  const updateName = (name: string) => {
    if (user) {
      setUser({ ...user, name })
    }
  }
  
  return (
    <div>
      {user ? (
        <>
          <h1>{user.name}</h1>
          <input 
            value={user.name} 
            onChange={(e) => updateName(e.target.value)}
          />
          <button onClick={resetUser}>Logout</button>
        </>
      ) : (
        <button onClick={() => setUser({ id: '1', name: 'John', email: 'john@example.com' })}>
          Login
        </button>
      )}
    </div>
  )
}
```

## 🎯 Advanced Features

### Getter Pattern - Async Data Fetching

```typescript
const [useStorken] = create({
  getters: {
    // Automatic data fetching with loading state
    user: async () => {
      const response = await fetch('/api/user')
      return response.json()
    },
    
    // With parameters
    posts: async (storken, userId: string) => {
      const response = await fetch(`/api/posts?userId=${userId}`)
      return response.json()
    }
  }
})

function UserDashboard() {
  const [user, setUser, resetUser, loading, update] = useStorken<User>('user')
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <button onClick={update}>Refresh</button>
    </div>
  )
}
```

### Setter Pattern - Side Effects

```typescript
const [useStorken] = create({
  setters: {
    // Automatically sync with backend
    user: async (storken, user: User) => {
      await fetch(`/api/user/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
      })
    },
    
    // Local storage persistence
    theme: (storken) => {
      localStorage.setItem('theme', storken.value)
    }
  }
})
```

### Plugin System

```typescript
// Create a custom plugin
const persistencePlugin: StorkenPlugin = (storken) => {
  // Load from localStorage on init
  const saved = localStorage.getItem(`storken_${storken.key}`)
  if (saved) {
    storken.set(JSON.parse(saved))
  }
  
  // Save on every change
  storken.on('set', (value) => {
    localStorage.setItem(`storken_${storken.key}`, JSON.stringify(value))
  })
  
  return {
    clear: () => localStorage.removeItem(`storken_${storken.key}`)
  }
}

// Use the plugin
const [useStorken] = create({
  plugins: {
    persistence: persistencePlugin
  }
})

function Settings() {
  const [settings, setSettings, , , , plugins] = useStorken('settings')
  
  return (
    <button onClick={() => plugins?.persistence.clear()}>
      Clear Cache
    </button>
  )
}
```

## 🌟 Universal Server-Client API (Experimental)

Storken v3.0 introduces an **industry-first unified API** that works seamlessly across Server Components, Client Components, and API Routes:

```typescript
// storken.config.ts
import { createUniversalStorken } from 'storken/universal'

export const { useStorken, get, set } = createUniversalStorken({
  user: {
    server: {
      get: async (id) => await db.user.findUnique({ where: { id } }),
      set: async (user) => await db.user.update({ where: { id: user.id }, data: user })
    },
    client: {
      get: async (id) => await fetch(`/api/user/${id}`).then(r => r.json()),
      set: async (user) => await fetch(`/api/user/${user.id}`, { method: 'PUT', body: JSON.stringify(user) })
    }
  }
})

// Server Component - Direct DB access
export async function ServerProfile({ userId }) {
  const user = await get('user', userId)
  return <div>Server: {user.name}</div>
}

// Client Component - API calls
'use client'
export function ClientProfile({ userId }) {
  const [user, setUser] = useStorken('user')
  return <div>Client: {user?.name}</div>
}
```

## 🤖 LLM-Native Development

Storken's predictable patterns make it perfect for AI-assisted development:

```typescript
// LLMs can easily generate this pattern
const [todos, setTodos] = useStorken<Todo[]>('todos', [])

const addTodo = (title: string) => {
  setTodos(prev => [...prev, { id: Date.now(), title, completed: false }])
}

const toggleTodo = (id: number) => {
  setTodos(prev => prev.map(todo => 
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ))
}
```

## 📊 Performance

- **5KB minified + gzipped** - 39% smaller than v2
- **Zero dependencies** - Pure React implementation
- **Tree-shakeable** - Only import what you use
- **React 18 optimized** - Uses `useSyncExternalStore` for optimal performance
- **TypeScript native** - No runtime overhead

## 🔄 Migration from v2

```typescript
// v2 (JavaScript)
const [count, setCount] = useStorken('counter', 0)

// v3 (TypeScript)
const [count, setCount] = useStorken<number>('counter', 0)
// Full type safety! ✨
```

Key changes:
- Full TypeScript rewrite
- React 18 `useSyncExternalStore` instead of custom subscription
- Improved bundle size (39% smaller)
- Better tree-shaking support
- Enhanced type safety

## 📚 Documentation

- [Examples](./examples/) - Comprehensive usage examples
  - [Todo App](./examples/todo-app/) - Basic CRUD operations with local storage
  - [Authentication](./examples/authentication/) - JWT authentication with protected routes
  - [Next.js App Router](./examples/nextjs-app-router/) - Server-client integration patterns
  - [Real-Time Chat](./examples/real-time-chat/) - WebSocket with optimistic updates
  - [Universal Pattern](./examples/universal-pattern/) - Server-client unified API
- [TypeScript Examples](./TYPESCRIPT_EXAMPLES.md)
- [LLM-Native Development](./LLM_NATIVE_DEVELOPMENT.md)
- [Experimental Features](./EXPERIMENTAL_FEATURES.md)
- [Migration Guide](./MIGRATION_GUIDE.md)

## 🛠️ Roadmap

- [ ] **React Suspense integration** - Automatic loading states with Suspense boundaries (currently manual loading states)
- [ ] **DevTools browser extension** - Redux DevTools-like experience for Storken state inspection
- [ ] **Performance monitoring built-in** - Runtime metrics and optimization insights  
- [ ] **Community-driven plugin ecosystem** - Let the community guide which plugins to build next

## 🤝 Contributing

Issues and Pull Requests are welcome!

```bash
# Clone the repo
git clone https://github.com/storkenjs/storken.git

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build
```

## 📄 License

MIT License


---

<div align="center">
  <strong>Built with ❤️ for the React community</strong>
  <br>
  <sub>Code with AI, State with Storken</sub>
</div>