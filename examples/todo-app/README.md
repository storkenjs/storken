# Todo App Example

Complete CRUD todo application with Storken showing basic state management patterns.

## Features

- ✅ Add, edit, delete todos
- 📝 Mark todos as complete/incomplete
- 🏷️ Priority levels (low, medium, high)
- 💾 Local storage persistence
- 🔍 Filter by status and priority
- 📊 Todo statistics
- 🎨 Clean, responsive UI

## Setup

```bash
# Install dependencies
npm install storken

# Copy example files
cp -r examples/todo-app/* your-project/
```

## File Structure

```
todo-app/
├── src/
│   ├── store/
│   │   ├── todo-store.ts      # Todo state management
│   │   └── types.ts           # TypeScript types
│   ├── components/
│   │   ├── TodoList.tsx       # Todo list display
│   │   ├── TodoItem.tsx       # Individual todo item
│   │   ├── AddTodo.tsx        # Add new todo form
│   │   ├── TodoFilters.tsx    # Filter controls
│   │   └── TodoStats.tsx      # Statistics display
│   ├── hooks/
│   │   └── useTodos.ts        # Todo management hook
│   └── utils/
│       └── storage.ts         # Local storage utilities
├── README.md
└── package.json
```

## Core Implementation

### Todo Store

```typescript
// src/store/todo-store.ts
import { create } from 'storken'
import { loadTodos, saveTodos } from '../utils/storage'
import type { Todo, TodoFilter } from './types'

export const [useTodoStore] = create({
  initialValues: {
    todos: [] as Todo[],
    filter: {
      status: 'all',
      priority: 'all',
      search: ''
    } as TodoFilter
  },

  getters: {
    // Load todos from localStorage on app start
    todos: async (): Promise<Todo[]> => {
      return loadTodos()
    }
  },

  setters: {
    // Save todos to localStorage on every change
    todos: async (storken, todos: Todo[]) => {
      saveTodos(todos)
    }
  },

  plugins: {
    // Auto-save plugin
    persistence: (storken) => {
      storken.on('set', (value) => {
        if (storken.key === 'todos') {
          saveTodos(value)
        }
      })

      return {
        clear: () => localStorage.removeItem('todos'),
        export: () => loadTodos()
      }
    }
  }
})
```

### Todo Hook

```typescript
// src/hooks/useTodos.ts
import { useTodoStore } from '../store/todo-store'
import type { Todo, TodoFilter, Priority } from '../store/types'

export function useTodos() {
  const [todos, setTodos] = useTodoStore<Todo[]>('todos')
  const [filter, setFilter] = useTodoStore<TodoFilter>('filter')

  const addTodo = (title: string, priority: Priority = 'medium') => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setTodos(prev => [...prev, newTodo])
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, ...updates, updatedAt: new Date() }
        : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const toggleTodo = (id: string) => {
    updateTodo(id, { 
      completed: !todos.find(t => t.id === id)?.completed 
    })
  }

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed))
  }

  const toggleAll = () => {
    const allCompleted = todos.every(todo => todo.completed)
    setTodos(prev => prev.map(todo => ({ 
      ...todo, 
      completed: !allCompleted,
      updatedAt: new Date()
    })))
  }

  // Filtered todos based on current filter
  const filteredTodos = todos.filter(todo => {
    // Status filter
    if (filter.status === 'active' && todo.completed) return false
    if (filter.status === 'completed' && !todo.completed) return false

    // Priority filter
    if (filter.priority !== 'all' && todo.priority !== filter.priority) return false

    // Search filter
    if (filter.search && !todo.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false
    }

    return true
  })

  // Statistics
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    byPriority: {
      high: todos.filter(t => t.priority === 'high').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      low: todos.filter(t => t.priority === 'low').length
    }
  }

  return {
    // Data
    todos: filteredTodos,
    allTodos: todos,
    filter,
    stats,

    // Actions
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    toggleAll,
    setFilter
  }
}
```

### Todo Item Component

```typescript
// src/components/TodoItem.tsx
import React, { useState } from 'react'
import type { Todo, Priority } from '../store/types'

interface TodoItemProps {
  todo: Todo
  onUpdate: (id: string, updates: Partial<Todo>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function TodoItem({ todo, onUpdate, onDelete, onToggle }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)

  const handleSave = () => {
    if (editTitle.trim() !== todo.title) {
      onUpdate(todo.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditTitle(todo.title)
      setIsEditing(false)
    }
  }

  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600', 
    high: 'text-red-600'
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />

        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="todo-edit-input"
            autoFocus
          />
        ) : (
          <span
            className={`todo-title ${todo.completed ? 'line-through' : ''}`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.title}
          </span>
        )}

        <span className={`priority-badge ${priorityColors[todo.priority]}`}>
          {todo.priority}
        </span>
      </div>

      <div className="todo-actions">
        <select
          value={todo.priority}
          onChange={(e) => onUpdate(todo.id, { priority: e.target.value as Priority })}
          className="priority-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button
          onClick={() => setIsEditing(true)}
          className="edit-btn"
          title="Edit todo"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete(todo.id)}
          className="delete-btn"
          title="Delete todo"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
```

### Add Todo Component

```typescript
// src/components/AddTodo.tsx
import React, { useState } from 'react'
import type { Priority } from '../store/types'

interface AddTodoProps {
  onAdd: (title: string, priority: Priority) => void
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (title.trim()) {
      onAdd(title.trim(), priority)
      setTitle('')
      setPriority('medium')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <div className="input-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-input"
          autoFocus
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="priority-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button type="submit" className="add-btn">
          Add Todo
        </button>
      </div>
    </form>
  )
}
```

### Complete App

```typescript
// src/App.tsx
import React from 'react'
import { useTodos } from './hooks/useTodos'
import { AddTodo } from './components/AddTodo'
import { TodoList } from './components/TodoList'
import { TodoFilters } from './components/TodoFilters'
import { TodoStats } from './components/TodoStats'

export default function App() {
  const {
    todos,
    filter,
    stats,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    toggleAll,
    setFilter
  } = useTodos()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Storken Todo App</h1>
        <TodoStats stats={stats} />
      </header>

      <main className="app-main">
        <AddTodo onAdd={addTodo} />
        
        <TodoFilters 
          filter={filter}
          onFilterChange={setFilter}
          onClearCompleted={clearCompleted}
          onToggleAll={toggleAll}
          hasCompleted={stats.completed > 0}
        />

        <TodoList
          todos={todos}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          onToggle={toggleTodo}
        />
      </main>
    </div>
  )
}
```

## Key Features Demonstrated

### 1. **CRUD Operations**
- Create: Add new todos
- Read: Display filtered todos
- Update: Edit titles, toggle completion, change priority
- Delete: Remove individual todos or clear completed

### 2. **Local Storage Persistence**
- Automatic save on every change
- Data survives page refresh
- Export/import functionality

### 3. **Advanced Filtering**
- Filter by completion status
- Filter by priority level
- Search by title
- Real-time filtering

### 4. **State Management Patterns**
- Centralized state with Storken
- Computed values (filtered todos, stats)
- Optimistic updates
- Plugin-based persistence

### 5. **User Experience**
- Keyboard shortcuts (Enter, Escape)
- Inline editing
- Bulk operations
- Visual feedback

## Storken Features Used

- ✅ **Basic State Management**: `create()`, `useStorken()`
- ✅ **Getters**: Auto-load from localStorage
- ✅ **Setters**: Auto-save on changes
- ✅ **Plugins**: Custom persistence plugin
- ✅ **TypeScript**: Full type safety

## Running the Example

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to see the todo app in action.

---

*This example shows how Storken makes complex state management simple and type-safe.*