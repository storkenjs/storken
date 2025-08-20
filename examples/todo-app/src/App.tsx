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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Storken Todo App</h1>
          <p className="text-gray-600">Powered by Storken state management</p>
        </header>

        <main>
          <TodoStats stats={stats} />
          
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
    </div>
  )
}