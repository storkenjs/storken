import React from 'react'
import { TodoItem } from './TodoItem'
import type { Todo } from '../store/types'

interface TodoListProps {
  todos: Todo[]
  onUpdate: (id: string, updates: Partial<Todo>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function TodoList({ todos, onUpdate, onDelete, onToggle }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📝</div>
        <p>No todos yet. Add one above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}