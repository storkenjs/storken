import { useTodoStore } from '../store/todo-store'
import type { Todo, TodoFilter, Priority } from '../store/types'

export function useTodos() {
  const [todos, setTodos] = useTodoStore('todos')
  const [filter, setFilter] = useTodoStore('filter')

  // Provide safe defaults
  const safeTodos = todos || []
  const safeFilter = filter || { status: 'all', priority: 'all', search: '' }

  const addTodo = (title: string, priority: Priority = 'medium') => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setTodos((prev: Todo[]) => [...(prev || []), newTodo])
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prev: Todo[]) => (prev || []).map((todo: Todo) => 
      todo.id === id 
        ? { ...todo, ...updates, updatedAt: new Date() }
        : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos((prev: Todo[]) => (prev || []).filter((todo: Todo) => todo.id !== id))
  }

  const toggleTodo = (id: string) => {
    updateTodo(id, { 
      completed: !safeTodos.find((t: Todo) => t.id === id)?.completed 
    })
  }

  const clearCompleted = () => {
    setTodos((prev: Todo[]) => (prev || []).filter((todo: Todo) => !todo.completed))
  }

  const toggleAll = () => {
    const allCompleted = safeTodos.every((todo: Todo) => todo.completed)
    setTodos((prev: Todo[]) => (prev || []).map((todo: Todo) => ({ 
      ...todo, 
      completed: !allCompleted,
      updatedAt: new Date()
    })))
  }

  // Filtered todos based on current filter
  const filteredTodos = safeTodos.filter((todo: Todo) => {
    // Status filter
    if (safeFilter.status === 'active' && todo.completed) return false
    if (safeFilter.status === 'completed' && !todo.completed) return false

    // Priority filter
    if (safeFilter.priority !== 'all' && todo.priority !== safeFilter.priority) return false

    // Search filter
    if (safeFilter.search && !todo.title.toLowerCase().includes(safeFilter.search.toLowerCase())) {
      return false
    }

    return true
  })

  // Statistics
  const stats = {
    total: safeTodos.length,
    completed: safeTodos.filter((t: Todo) => t.completed).length,
    active: safeTodos.filter((t: Todo) => !t.completed).length,
    byPriority: {
      high: safeTodos.filter((t: Todo) => t.priority === 'high').length,
      medium: safeTodos.filter((t: Todo) => t.priority === 'medium').length,
      low: safeTodos.filter((t: Todo) => t.priority === 'low').length
    }
  }

  return {
    // Data
    todos: filteredTodos,
    allTodos: safeTodos,
    filter: safeFilter,
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