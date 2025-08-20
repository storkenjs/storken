# Best Practices Guide

A comprehensive guide to using Storken effectively in production applications.

## Table of Contents

- [State Organization](#state-organization)
- [TypeScript Best Practices](#typescript-best-practices)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [Testing Strategies](#testing-strategies)
- [Server-Side Rendering](#server-side-rendering)
- [Plugin Usage](#plugin-usage)
- [Common Patterns](#common-patterns)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## State Organization

### 1. Logical Grouping

Group related state values together and create dedicated stores for different domains:

```typescript
// ✅ Good: Domain-specific stores
const [useAuthStore] = create({
  initialValues: {
    user: null,
    token: null,
    isAuthenticated: false
  }
})

const [useUIStore] = create({
  initialValues: {
    theme: 'light',
    sidebar: false,
    notifications: []
  }
})

// ❌ Avoid: Mixed concerns in single store
const [useAppStore] = create({
  initialValues: {
    user: null,
    theme: 'light',
    shoppingCart: [],
    notifications: []
  }
})
```

### 2. Flat State Structure

Keep your state structure flat to avoid deep nesting:

```typescript
// ✅ Good: Flat structure
interface UserProfile {
  id: string
  name: string
  email: string
  preferences: UserPreferences
}

// ❌ Avoid: Deep nesting
interface AppState {
  user: {
    profile: {
      personal: {
        name: string
        email: string
      }
    }
  }
}
```

## TypeScript Best Practices

### 1. Define Clear Interfaces

Always define explicit interfaces for your state:

```typescript
interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
  loading: boolean
}

const [useTodos] = create<TodoState>({
  initialValues: {
    todos: [],
    filter: 'all',
    loading: false
  }
})
```

### 2. Generic Getters and Setters

Use proper typing for async operations:

```typescript
const [useStore] = create({
  getters: {
    // ✅ Proper typing
    fetchUser: async (store, userId: string): Promise<User> => {
      const response = await api.getUser(userId)
      return response.data
    }
  },
  
  setters: {
    // ✅ Proper typing with side effects
    updateUser: async (store, user: User): Promise<void> => {
      await api.updateUser(user)
      // Additional side effects if needed
    }
  }
})
```

## Performance Optimization

### 1. Selective Subscriptions

Only subscribe to specific parts of state you need:

```typescript
function UserProfile() {
  // ✅ Only subscribe to user data
  const [user] = useStore<User>('user')
  
  // ❌ Avoid subscribing to entire store
  const store = useStore() // Causes re-renders on any change
  
  return <div>{user?.name}</div>
}
```

### 2. Optimize Re-renders

Use React.memo and stable references:

```typescript
const TodoItem = React.memo(({ todo, onToggle }: { 
  todo: Todo
  onToggle: (id: string) => void 
}) => {
  return (
    <div onClick={() => onToggle(todo.id)}>
      {todo.title}
    </div>
  )
})

function TodoList() {
  const [todos] = useTodos<Todo[]>('todos')
  
  // ✅ Stable callback
  const toggleTodo = useCallback((id: string) => {
    setTodos(todos => 
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }, [])
  
  return (
    <div>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} />
      ))}
    </div>
  )
}
```

### 3. Async Operations

Handle loading states properly:

```typescript
const [useStore] = create({
  getters: {
    fetchUserData: async (store, userId: string) => {
      // Simulate API call
      const response = await fetch(`/api/users/${userId}`)
      return response.json()
    }
  }
})

function UserProfile({ userId }: { userId: string }) {
  const [userData, , , loading, refresh] = useStore('userData')
  
  useEffect(() => {
    if (userId) {
      refresh(userId) // Trigger getter with parameter
    }
  }, [userId, refresh])
  
  if (loading) return <div>Loading...</div>
  
  return <div>{userData?.name}</div>
}
```

## Error Handling

### 1. Getter Error Handling

Handle errors in async getters:

```typescript
const [useStore] = create({
  getters: {
    fetchData: async (store) => {
      try {
        const response = await api.getData()
        return response.data
      } catch (error) {
        console.error('Failed to fetch data:', error)
        throw error // Re-throw to trigger error boundary
      }
    }
  }
})
```

### 2. Error Boundaries

Use React Error Boundaries with Storken:

```typescript
class StorkenErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error.message.includes('Storken')) {
      // Handle Storken-specific errors
      console.error('Storken Error:', error, errorInfo)
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with state management.</div>
    }
    
    return this.props.children
  }
}
```

## Testing Strategies

### 1. Testing Components with Storken

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { create } from 'storken'

// Create test store
const createTestStore = () => create({
  initialValues: {
    counter: 0
  }
})

describe('Counter Component', () => {
  it('should increment counter', () => {
    const [useTestStore] = createTestStore()
    
    function Counter() {
      const [count, setCount] = useTestStore<number>('counter')
      return (
        <div>
          <span>Count: {count}</span>
          <button onClick={() => setCount(count + 1)}>
            Increment
          </button>
        </div>
      )
    }
    
    render(<Counter />)
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Increment'))
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
```

### 2. Testing Async Operations

```typescript
it('should handle async data loading', async () => {
  const mockData = { id: 1, name: 'Test User' }
  
  const [useTestStore] = create({
    getters: {
      fetchUser: async () => {
        return mockData
      }
    }
  })
  
  function UserComponent() {
    const [user, , , loading] = useTestStore('user')
    
    if (loading) return <div>Loading...</div>
    if (!user) return <div>No user</div>
    
    return <div>User: {user.name}</div>
  }
  
  render(<UserComponent />)
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText('User: Test User')).toBeInTheDocument()
  })
})
```

## Server-Side Rendering

### 1. Next.js App Router

```typescript
// app/layout.tsx - Server Component
import { getInitialUserData } from './lib/auth'

export default async function RootLayout() {
  const initialUser = await getInitialUserData()
  
  return (
    <html>
      <body>
        <ClientWrapper initialUser={initialUser}>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}

// components/ClientWrapper.tsx - Client Component
'use client'
import { create } from 'storken'

const [useAuthStore] = create({
  initialValues: {
    user: null
  }
})

export function ClientWrapper({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode
  initialUser: User | null 
}) {
  const [, setUser] = useAuthStore('user')
  
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser)
    }
  }, [initialUser, setUser])
  
  return <>{children}</>
}
```

### 2. Hydration Considerations

```typescript
const [useStore] = create({
  initialValues: {
    isClient: false
  }
})

function HydrationSafeComponent() {
  const [isClient, setIsClient] = useStore('isClient')
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <div>Server content</div>
  }
  
  return <div>Client content</div>
}
```

## Plugin Usage

### 1. Persistence Plugin

```typescript
const persistencePlugin = (storken) => {
  // Load from storage on init
  const key = `storken_${storken.key}`
  const saved = localStorage.getItem(key)
  
  if (saved) {
    try {
      storken.set(JSON.parse(saved))
    } catch (error) {
      console.warn('Failed to load persisted state:', error)
    }
  }
  
  // Save on changes
  storken.on('set', (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to persist state:', error)
    }
  })
  
  return {
    clear: () => localStorage.removeItem(key)
  }
}

const [useStore] = create({
  initialValues: { theme: 'light' },
  plugins: {
    persistence: persistencePlugin
  }
})
```

## Common Patterns

### 1. Optimistic Updates

```typescript
const [useStore] = create({
  setters: {
    updateTodo: async (store, todo: Todo) => {
      // Optimistic update
      const todos = store.get('todos')
      const optimisticTodos = todos.map(t => 
        t.id === todo.id ? todo : t
      )
      store.set('todos', optimisticTodos)
      
      try {
        await api.updateTodo(todo)
      } catch (error) {
        // Revert on error
        store.set('todos', todos)
        throw error
      }
    }
  }
})
```

### 2. Derived State

```typescript
const [useStore] = create({
  getters: {
    completedTodos: (store) => {
      const todos = store.get('todos') || []
      return todos.filter(todo => todo.completed)
    },
    
    todoStats: (store) => {
      const todos = store.get('todos') || []
      return {
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        remaining: todos.filter(t => !t.completed).length
      }
    }
  }
})
```

## Anti-Patterns to Avoid

### 1. Don't Mutate State Directly

```typescript
// ❌ Don't do this
const [todos, setTodos] = useStore('todos')
todos.push(newTodo) // Direct mutation

// ✅ Do this instead
setTodos(prev => [...prev, newTodo])
```

### 2. Don't Use Storken for Everything

```typescript
// ❌ Avoid: Local component state in global store
const [useStore] = create({
  initialValues: {
    inputValue: '',
    modalOpen: false,
    hoveredItem: null
  }
})

// ✅ Use local state for UI-only state
function MyComponent() {
  const [inputValue, setInputValue] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  
  return (...)
}
```

### 3. Don't Pass Default Values to Hooks (Critical)

**⚠️ CRITICAL WARNING: This is the most common cause of infinite loops in Storken applications.**

```typescript
// ❌ NEVER do this - causes infinite loops!
const [auth, setAuth] = useAuthStore('auth', {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true
})

// ❌ NEVER do this - causes infinite API calls!
const [user, setUser] = useStorken<User | null>('currentUser', initialUser)

// ✅ Do this instead - handle undefined states safely
const [auth, setAuth, , , refreshAuth] = useAuthStore('auth')
const [user, setUser] = useStorken<User | null>('currentUser')

// Handle undefined states with safe defaults
const safeAuth = auth || {
  user: null,
  token: null, 
  isAuthenticated: false,
  loading: true
}

// Or initialize properly with useEffect
useEffect(() => {
  if (initialUser && user === undefined) {
    setUser(initialUser)
  }
}, [initialUser]) // Don't include user in deps!
```

**Why this happens:**
- Default values passed to hooks are treated as new state on every render
- This triggers getters repeatedly, causing infinite loops
- Can result in hundreds of API calls per second
- Browser will show "This page is slowing down" warnings

**Correct pattern:**
1. Never pass default values as the second parameter to Storken hooks
2. Handle undefined states by providing safe defaults after getting the value
3. Use `useEffect` with proper dependencies for initialization
4. Always exclude the state value from `useEffect` dependencies to prevent loops

### 4. Don't Over-Engineer

```typescript
// ❌ Avoid: Complex nested getters
const [useStore] = create({
  getters: {
    complexData: async (store) => {
      const a = await store.update('dataA')
      const b = await store.update('dataB', a.id)
      const c = await store.update('dataC', b.id)
      return { a, b, c }
    }
  }
})

// ✅ Keep getters simple and focused
const [useStore] = create({
  getters: {
    dataA: async () => api.getDataA(),
    dataB: async (store, aId) => api.getDataB(aId),
    dataC: async (store, bId) => api.getDataC(bId)
  }
})
```

## Performance Monitoring

### 1. Development Warnings

```typescript
if (process.env.NODE_ENV === 'development') {
  const [useStore] = create({
    // Add development-only warnings
    setters: {
      todos: (store, value) => {
        if (Array.isArray(value) && value.length > 1000) {
          console.warn('Large array detected in todos state')
        }
      }
    }
  })
}
```

### 2. Bundle Size Monitoring

```typescript
// Only import what you need
import { create } from 'storken'

// ❌ Don't import entire library if using specific features
import * as Storken from 'storken'
```

---

## Summary

Following these best practices will help you:

- Write maintainable and performant React applications
- Leverage Storken's unique features effectively
- Avoid common pitfalls and anti-patterns
- Create scalable state management architectures
- Ensure proper TypeScript integration
- Handle errors gracefully
- Optimize for production environments

Remember: Storken is designed to be minimal and flexible. Use these patterns as guidelines, but adapt them to your specific use cases and requirements.