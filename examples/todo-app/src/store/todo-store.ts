import { create } from 'storken'
import { loadTodos, saveTodos } from '../utils/storage'
import type { Todo, TodoFilter } from './types'

const todoStore = create({
  initialValues: {
    todos: loadTodos() as Todo[], // Load initial data synchronously
    filter: {
      status: 'all',
      priority: 'all',
      search: ''
    } as TodoFilter
  },

  setters: {
    // Save todos to localStorage on every change
    todos: async (_storken: any, todos: Todo[]) => {
      saveTodos(todos)
    }
  }
})

export const useTodoStore: any = todoStore[0]