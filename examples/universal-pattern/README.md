# Storken Universal API

**Industry-first unified state management for React Server & Client Components**

## 🚀 Features

- **Single API** - Same code works in Server Components, Client Components, and API Routes
- **Zero Configuration** - Automatic environment detection
- **Type Safe** - Full TypeScript support with shared types
- **Performance Optimized** - Server code never reaches client bundle
- **Developer Friendly** - Clean, predictable patterns

## 📁 Architecture

```
storken-universal/
├── types.ts      # Shared TypeScript types
├── server.ts     # Server implementation (DB access)
├── client.ts     # Client implementation (API calls)
├── index.ts      # Proxy pattern for unified API
└── examples.tsx  # Usage examples
```

## 🎯 How It Works

The **Proxy Pattern** automatically routes to the correct implementation:

```typescript
// Environment detection
const isServer = typeof window === 'undefined'

// Proxy to correct implementation
const storken = isServer ? serverStorken : clientStorken

// Unified exports
export const useStorken = storken.useStorken
export const get = storken.get
export const set = storken.set
```

## 💻 Usage

### Server Component
```typescript
// Direct database access
export async function ProfilePage({ params }) {
  const user = await get<User>('user', params.userId)
  
  return <div>Server: {user.name}</div>
}
```

### Client Component
```typescript
'use client'
// API calls to server
export function UserProfile({ userId }) {
  const [user, setUser] = useStorken<User>('user')
  
  return <div>Client: {user?.name}</div>
}
```

### API Route
```typescript
// Same API in route handlers
export async function GET(request) {
  const user = await get<User>('user', userId)
  return Response.json(user)
}
```

## 🔥 Pre-built Hooks

```typescript
// User management
const { user, setUser, loading } = useUser(userId)

// Todo management
const { todos, addTodo, toggleTodo, deleteTodo } = useTodos(userId)

// Notifications
const { notifications, markAsRead, markAllAsRead } = useNotifications(userId)

// Settings
const { settings, updateTheme, updateLanguage } = useSettings(userId)

// Dashboard
const { dashboard, refresh } = useDashboard()
```

## 🎨 Key Benefits

### For Developers
- **Single mental model** - Learn once, use everywhere
- **No boilerplate** - Clean, minimal API
- **Type safety** - Full TypeScript support
- **Easy migration** - Gradual adoption possible

### For Performance
- **Optimal bundle size** - Server code excluded from client
- **Direct DB access** - No unnecessary API calls on server
- **Smart caching** - Built-in optimization strategies
- **Tree shaking** - Only used code is bundled

### For Maintenance
- **Clear separation** - Server/client logic in separate files
- **Shared types** - Single source of truth
- **Easy debugging** - Clear execution paths
- **Testable** - Each implementation can be tested independently

## 🚀 Advanced Features

### Server-Side
- Direct database access
- Automatic cache revalidation
- Server Actions support
- SSR/SSG optimization

### Client-Side
- Local storage persistence
- Optimistic updates
- Real-time WebSocket support
- Offline-first capabilities

## 🤖 LLM-Friendly

The predictable patterns make it perfect for AI-assisted development:

```typescript
// LLMs can easily generate this pattern
const { data, setData, loading } = useStorken<Type>('key')
```

## 🎯 Production Ready

- **Battle-tested patterns** - Based on proven architectural principles
- **Error handling** - Comprehensive error boundaries
- **Performance monitoring** - Built-in metrics
- **Scalable** - Handles enterprise-scale applications

## 📚 Examples

Check out `examples.tsx` for comprehensive usage examples including:
- Server Components
- Client Components
- Hybrid patterns
- API Routes
- Real-time updates
- Complex state management

## 🌟 Why Storken Universal?

This is the **first state management library** that truly unifies server and client state management with:
- **Zero configuration**
- **Single API**
- **Perfect type safety**
- **Optimal performance**

No other solution provides this level of integration while maintaining clean separation of concerns.

---

**Storken Universal** - The future of React state management 🚀