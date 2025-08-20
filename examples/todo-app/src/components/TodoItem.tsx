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
    <div className={`todo-item p-3 border rounded-lg flex items-center gap-3 ${
      todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
    }`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5"
      />

      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-full px-2 py-1 border rounded"
            autoFocus
          />
        ) : (
          <span
            className={`cursor-pointer ${
              todo.completed ? 'line-through text-gray-500' : ''
            }`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[todo.priority]}`}>
          {todo.priority.toUpperCase()}
        </span>

        <select
          value={todo.priority}
          onChange={(e) => onUpdate(todo.id, { priority: e.target.value as Priority })}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button
          onClick={() => setIsEditing(true)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Edit todo"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete(todo.id)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Delete todo"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}