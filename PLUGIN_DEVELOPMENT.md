# Plugin Development Guide

A comprehensive guide to developing plugins for Storken v3.0.

## Table of Contents

- [Plugin Architecture](#plugin-architecture)
- [Creating Your First Plugin](#creating-your-first-plugin)
- [Plugin API Reference](#plugin-api-reference)
- [Built-in Events](#built-in-events)
- [Advanced Plugin Patterns](#advanced-plugin-patterns)
- [Testing Plugins](#testing-plugins)
- [Publishing Plugins](#publishing-plugins)
- [Official Plugin Examples](#official-plugin-examples)

## Plugin Architecture

Storken plugins are functions that receive a Storken instance and can extend its functionality by:

- Listening to state change events
- Adding custom methods to the instance
- Modifying state values during operations
- Integrating with external systems

### Plugin Function Signature

```typescript
type StorkenPlugin<T = any> = (storken: StorkenInstance<T>) => any
```

### Plugin Lifecycle

1. **Initialization**: Plugin function is called when store is created
2. **Event Subscription**: Plugin can subscribe to various events
3. **State Access**: Plugin can read and modify state
4. **Cleanup**: Plugin can provide cleanup methods

## Creating Your First Plugin

### Basic Plugin Structure

```typescript
import { StorkenPlugin } from 'storken'

const myFirstPlugin: StorkenPlugin = (storken) => {
  console.log(`Plugin initialized for key: ${storken.key}`)
  
  // Listen to state changes
  storken.on('set', (newValue, oldValue) => {
    console.log('State changed:', { newValue, oldValue })
  })
  
  // Return public API (optional)
  return {
    getName: () => 'MyFirstPlugin',
    getVersion: () => '1.0.0'
  }
}

// Usage
const [useStore] = create({
  initialValues: { counter: 0 },
  plugins: {
    myPlugin: myFirstPlugin
  }
})

function Component() {
  const [count, setCount, , , , plugins] = useStore('counter')
  
  console.log(plugins?.myPlugin.getName()) // "MyFirstPlugin"
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

## Plugin API Reference

### StorkenInstance Methods

#### State Access
```typescript
interface StorkenInstance<T> {
  // Get current value
  get(): T
  
  // Set new value
  set(value: T | ((prev: T) => T)): void
  
  // Reset to initial value
  reset(): void
  
  // Get the unique key for this store
  key: string
  
  // Check if currently loading
  loading: boolean
}
```

#### Event System
```typescript
interface StorkenInstance<T> {
  // Subscribe to events
  on(event: string, callback: (...args: any[]) => void): () => void
  
  // Emit custom events
  emit(event: string, ...args: any[]): void
  
  // Remove event listener
  off(event: string, callback: (...args: any[]) => void): void
}
```

#### Configuration Access
```typescript
interface StorkenInstance<T> {
  // Access getters from config
  getters: Record<string, Function>
  
  // Access setters from config
  setters: Record<string, Function>
  
  // Access other plugins
  plugins: Record<string, any>
}
```

## Built-in Events

### Core State Events

```typescript
// Fired before state is updated
storken.on('beforeSet', (newValue: T, oldValue: T) => {
  // Validate or transform the new value
  console.log('About to update state')
})

// Fired after state is updated
storken.on('afterSet', (newValue: T, oldValue: T) => {
  // React to state changes
  console.log('State updated successfully')
})

// Fired when state is reset
storken.on('reset', (initialValue: T) => {
  console.log('State was reset')
})
```

### Async Operation Events

```typescript
// Fired when async operation starts
storken.on('loading:start', () => {
  console.log('Loading started')
})

// Fired when async operation completes
storken.on('loading:end', (result?: any) => {
  console.log('Loading ended', result)
})

// Fired when async operation fails
storken.on('loading:error', (error: Error) => {
  console.error('Loading failed', error)
})
```

### Getter/Setter Events

```typescript
// Fired when getter is called
storken.on('getter:call', (getterName: string, args: any[]) => {
  console.log(`Getter ${getterName} called with args:`, args)
})

// Fired when setter is called
storken.on('setter:call', (setterName: string, value: any, args: any[]) => {
  console.log(`Setter ${setterName} called`)
})
```

## Advanced Plugin Patterns

### 1. Persistence Plugin

```typescript
interface PersistenceOptions {
  storage?: 'localStorage' | 'sessionStorage' | Storage
  key?: string
  serializer?: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
  debounce?: number
}

const createPersistencePlugin = (options: PersistenceOptions = {}): StorkenPlugin => {
  return (storken) => {
    const {
      storage = localStorage,
      key = `storken_${storken.key}`,
      serializer = JSON,
      debounce = 0
    } = options
    
    const storageAPI = typeof storage === 'string' 
      ? (storage === 'localStorage' ? localStorage : sessionStorage)
      : storage
    
    // Load initial state from storage
    try {
      const saved = storageAPI.getItem(key)
      if (saved) {
        const deserialized = serializer.deserialize(saved)
        storken.set(deserialized)
      }
    } catch (error) {
      console.warn('Failed to load persisted state:', error)
    }
    
    // Save state changes with debouncing
    let timeoutId: NodeJS.Timeout
    
    const saveToStorage = (value: any) => {
      try {
        const serialized = serializer.serialize(value)
        storageAPI.setItem(key, serialized)
      } catch (error) {
        console.warn('Failed to persist state:', error)
      }
    }
    
    storken.on('afterSet', (newValue) => {
      if (debounce > 0) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => saveToStorage(newValue), debounce)
      } else {
        saveToStorage(newValue)
      }
    })
    
    return {
      clear: () => storageAPI.removeItem(key),
      getStorageKey: () => key,
      getStorage: () => storageAPI
    }
  }
}

// Usage
const [useStore] = create({
  initialValues: { user: null },
  plugins: {
    persistence: createPersistencePlugin({
      debounce: 300,
      key: 'app_user_data'
    })
  }
})
```

### 2. DevTools Plugin

```typescript
interface DevToolsOptions {
  name?: string
  maxHistory?: number
  filter?: (action: any) => boolean
}

const createDevToolsPlugin = (options: DevToolsOptions = {}): StorkenPlugin => {
  return (storken) => {
    if (typeof window === 'undefined' || !window.__REDUX_DEVTOOLS_EXTENSION__) {
      return {} // No-op in non-browser or without extension
    }
    
    const {
      name = `Storken: ${storken.key}`,
      maxHistory = 50,
      filter = () => true
    } = options
    
    const devtools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
      name,
      maxAge: maxHistory
    })
    
    // Initialize with current state
    devtools.init(storken.get())
    
    let actionId = 0
    
    // Track state changes
    storken.on('beforeSet', (newValue, oldValue) => {
      const action = {
        type: `SET_${storken.key.toUpperCase()}`,
        payload: newValue,
        id: ++actionId,
        timestamp: Date.now()
      }
      
      if (filter(action)) {
        devtools.send(action, newValue)
      }
    })
    
    // Track getter calls
    storken.on('getter:call', (getterName, args) => {
      const action = {
        type: `GETTER_${getterName.toUpperCase()}`,
        payload: args,
        id: ++actionId,
        timestamp: Date.now()
      }
      
      if (filter(action)) {
        devtools.send(action, storken.get())
      }
    })
    
    // Handle time travel
    devtools.subscribe((message: any) => {
      if (message.type === 'DISPATCH' && message.state) {
        storken.set(JSON.parse(message.state))
      }
    })
    
    return {
      disconnect: () => devtools.disconnect(),
      send: (action: any, state?: any) => devtools.send(action, state || storken.get())
    }
  }
}
```

### 3. Validation Plugin

```typescript
interface ValidationRule<T> {
  message: string
  validator: (value: T) => boolean
}

interface ValidationOptions<T> {
  rules?: ValidationRule<T>[]
  onValidationError?: (errors: string[], value: T) => void
  strict?: boolean
}

const createValidationPlugin = <T>(options: ValidationOptions<T> = {}): StorkenPlugin<T> => {
  return (storken) => {
    const { rules = [], onValidationError, strict = false } = options
    
    const validateValue = (value: T): string[] => {
      const errors: string[] = []
      
      for (const rule of rules) {
        if (!rule.validator(value)) {
          errors.push(rule.message)
        }
      }
      
      return errors
    }
    
    // Validate before setting
    storken.on('beforeSet', (newValue, oldValue) => {
      const errors = validateValue(newValue)
      
      if (errors.length > 0) {
        if (onValidationError) {
          onValidationError(errors, newValue)
        }
        
        if (strict) {
          throw new Error(`Validation failed: ${errors.join(', ')}`)
        } else {
          console.warn('Validation warnings:', errors)
        }
      }
    })
    
    return {
      validate: (value: T) => validateValue(value),
      isValid: (value: T) => validateValue(value).length === 0,
      addRule: (rule: ValidationRule<T>) => rules.push(rule),
      getRules: () => [...rules]
    }
  }
}

// Usage
interface UserData {
  email: string
  age: number
}

const [useUserStore] = create({
  initialValues: { email: '', age: 0 } as UserData,
  plugins: {
    validation: createValidationPlugin<UserData>({
      rules: [
        {
          message: 'Email is required',
          validator: (user) => user.email.length > 0
        },
        {
          message: 'Email must be valid',
          validator: (user) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
        },
        {
          message: 'Age must be positive',
          validator: (user) => user.age > 0
        }
      ],
      strict: true
    })
  }
})
```

### 4. API Sync Plugin

```typescript
interface APISyncOptions {
  endpoint: string
  method?: 'PUT' | 'POST' | 'PATCH'
  headers?: Record<string, string>
  transform?: (value: any) => any
  onSuccess?: (response: any) => void
  onError?: (error: Error) => void
  debounce?: number
}

const createAPISyncPlugin = (options: APISyncOptions): StorkenPlugin => {
  return (storken) => {
    const {
      endpoint,
      method = 'PUT',
      headers = { 'Content-Type': 'application/json' },
      transform,
      onSuccess,
      onError,
      debounce = 1000
    } = options
    
    let timeoutId: NodeJS.Timeout
    let isSyncing = false
    
    const syncToAPI = async (value: any) => {
      if (isSyncing) return
      
      isSyncing = true
      
      try {
        const payload = transform ? transform(value) : value
        
        const response = await fetch(endpoint, {
          method,
          headers,
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          throw new Error(`API sync failed: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        if (onSuccess) {
          onSuccess(result)
        }
        
        storken.emit('api:sync:success', result)
      } catch (error) {
        if (onError) {
          onError(error as Error)
        }
        
        storken.emit('api:sync:error', error)
        console.error('API sync failed:', error)
      } finally {
        isSyncing = false
      }
    }
    
    // Debounced sync on state changes
    storken.on('afterSet', (newValue) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => syncToAPI(newValue), debounce)
    })
    
    return {
      sync: () => syncToAPI(storken.get()),
      isSyncing: () => isSyncing,
      cancelSync: () => clearTimeout(timeoutId)
    }
  }
}
```

## Testing Plugins

### Unit Testing Plugin Logic

```typescript
import { describe, it, expect, vi } from 'vitest'
import { create } from 'storken'

describe('PersistencePlugin', () => {
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should load initial state from storage', () => {
    const savedData = { count: 5 }
    mockStorage.getItem.mockReturnValue(JSON.stringify(savedData))
    
    const [useStore] = create({
      initialValues: { count: 0 },
      plugins: {
        persistence: createPersistencePlugin({
          storage: mockStorage,
          key: 'test-key'
        })
      }
    })
    
    const TestComponent = () => {
      const [count] = useStore('count')
      return <div>{count}</div>
    }
    
    render(<TestComponent />)
    
    expect(mockStorage.getItem).toHaveBeenCalledWith('test-key')
    expect(screen.getByText('5')).toBeInTheDocument()
  })
  
  it('should save state changes to storage', () => {
    const [useStore] = create({
      initialValues: { count: 0 },
      plugins: {
        persistence: createPersistencePlugin({
          storage: mockStorage,
          key: 'test-key'
        })
      }
    })
    
    const TestComponent = () => {
      const [count, setCount] = useStore('count')
      return <button onClick={() => setCount(1)}>Set</button>
    }
    
    render(<TestComponent />)
    
    fireEvent.click(screen.getByText('Set'))
    
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(1)
    )
  })
})
```

### Integration Testing

```typescript
describe('Plugin Integration', () => {
  it('should work with multiple plugins', () => {
    const [useStore] = create({
      initialValues: { user: null },
      plugins: {
        persistence: createPersistencePlugin(),
        validation: createValidationPlugin({
          rules: [{ 
            message: 'User required', 
            validator: (user) => user !== null 
          }]
        }),
        devtools: createDevToolsPlugin()
      }
    })
    
    const TestComponent = () => {
      const [user, setUser, , , , plugins] = useStore('user')
      
      return (
        <div>
          <span>{user ? 'Logged in' : 'Not logged in'}</span>
          <button onClick={() => setUser({ id: 1, name: 'Test' })}>
            Login
          </button>
          <button onClick={() => plugins?.persistence.clear()}>
            Clear Storage
          </button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    // Test interactions work with all plugins
    expect(screen.getByText('Not logged in')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Login'))
    expect(screen.getByText('Logged in')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Clear Storage'))
    // Verify storage was cleared
  })
})
```

## Publishing Plugins

### Plugin Package Structure

```
storken-plugin-persistence/
├── src/
│   ├── index.ts
│   └── types.ts
├── dist/
├── package.json
├── README.md
├── tsconfig.json
└── vitest.config.ts
```

### package.json Example

```json
{
  "name": "storken-plugin-persistence",
  "version": "1.0.0",
  "description": "Persistence plugin for Storken state management",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": [
    "storken",
    "plugin",
    "persistence",
    "localStorage",
    "react",
    "state-management"
  ],
  "peerDependencies": {
    "storken": ">=3.0.0"
  },
  "devDependencies": {
    "storken": "^3.0.0",
    "typescript": "^5.0.0",
    "tsup": "^7.0.0",
    "vitest": "^0.34.0"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "test": "vitest",
    "prepublishOnly": "npm run build"
  }
}
```

### Plugin Naming Convention

- Use prefix `storken-plugin-` for official plugins
- Use descriptive names: `storken-plugin-persistence`, `storken-plugin-validation`
- Include `storken` and `plugin` in package keywords

## Official Plugin Examples

### 1. Logger Plugin

```typescript
const createLoggerPlugin = (options = {}) => (storken) => {
  const { level = 'info', prefix = `[Storken:${storken.key}]` } = options
  
  const log = (type, ...args) => {
    if (level === 'silent') return
    console[type](prefix, ...args)
  }
  
  storken.on('afterSet', (newValue, oldValue) => {
    log('info', 'State changed:', { oldValue, newValue })
  })
  
  storken.on('loading:start', () => {
    log('info', 'Loading started')
  })
  
  storken.on('loading:error', (error) => {
    log('error', 'Loading failed:', error)
  })
  
  return { setLevel: (newLevel) => { level = newLevel } }
}
```

### 2. Undo/Redo Plugin

```typescript
const createUndoRedoPlugin = (maxHistory = 10) => (storken) => {
  const history = []
  const redoStack = []
  let currentIndex = -1
  
  // Save initial state
  history.push(storken.get())
  currentIndex = 0
  
  storken.on('afterSet', (newValue, oldValue) => {
    // Clear redo stack when new change is made
    redoStack.length = 0
    
    // Add to history
    history.push(newValue)
    currentIndex = history.length - 1
    
    // Limit history size
    if (history.length > maxHistory) {
      history.shift()
      currentIndex--
    }
  })
  
  const undo = () => {
    if (currentIndex > 0) {
      const previousValue = history[currentIndex - 1]
      redoStack.push(history[currentIndex])
      currentIndex--
      storken.set(previousValue)
      return true
    }
    return false
  }
  
  const redo = () => {
    if (redoStack.length > 0) {
      const nextValue = redoStack.pop()
      history.push(nextValue)
      currentIndex++
      storken.set(nextValue)
      return true
    }
    return false
  }
  
  return {
    undo,
    redo,
    canUndo: () => currentIndex > 0,
    canRedo: () => redoStack.length > 0,
    clearHistory: () => {
      history.length = 1 // Keep current state
      redoStack.length = 0
      currentIndex = 0
    }
  }
}
```

---

## Best Practices for Plugin Development

1. **Keep plugins focused** - Each plugin should have a single responsibility
2. **Handle errors gracefully** - Don't let plugin errors break the app
3. **Provide cleanup methods** - Allow users to properly cleanup resources
4. **Use TypeScript** - Provide proper type definitions
5. **Document thoroughly** - Include examples and API documentation
6. **Test comprehensively** - Unit test plugin logic and integration
7. **Follow naming conventions** - Use consistent naming patterns
8. **Make plugins configurable** - Provide options for customization
9. **Consider performance** - Avoid blocking operations and memory leaks
10. **Be compatible** - Ensure plugins work well together

The plugin system is one of Storken's most powerful features. Use it to extend functionality while keeping the core library minimal and focused.