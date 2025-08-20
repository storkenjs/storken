import React, { useState } from 'react'
import { useUniversal } from '../store/universal-store'

export function TodoDemo() {
  const [todos, setTodos, resetTodos, loading, refresh] = useUniversal('todos')
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const addTodo = async () => {
    if (newTodoTitle.trim()) {
      const newTodo = {
        id: '',
        userId: '1',
        title: newTodoTitle.trim(),
        completed: false,
        priority: 'medium' as const,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setTodos([...todos, newTodo])
      setNewTodoTitle('')
    }
  }

  const toggleTodo = async (todoId: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    )
    await setTodos(updatedTodos)
  }

  const deleteTodo = async (todoId: string) => {
    const filteredTodos = todos.filter(todo => todo.id !== todoId)
    await setTodos(filteredTodos)
  }

  const updatePriority = async (todoId: string, priority: 'low' | 'medium' | 'high') => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId
        ? { ...todo, priority, updatedAt: new Date() }
        : todo
    )
    await setTodos(updatedTodos)
  }

  const clearCompleted = async () => {
    const activeTodos = todos.filter(todo => !todo.completed)
    await setTodos(activeTodos)
  }

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active': return !todo.completed
      case 'completed': return todo.completed
      default: return true
    }
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const activeCount = todos.filter(todo => !todo.completed).length

  return (
    <div className="demo-card">
      <h3>✅ Todo Management Demo</h3>
      <p className="text-gray-600 mb-4">
        Demonstrates universal todo operations with filtering and priority management
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Todo List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">
              Todos ({filteredTodos.length}/{todos.length})
            </h4>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Add Todo */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTodo}
              disabled={!newTodoTitle.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2 mb-4">
            {(['all', 'active', 'completed'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 text-sm rounded-md capitalize ${
                  filter === filterType
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>

          {/* Todo Items */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner mr-3"></div>
              <span className="text-gray-600">Loading todos...</span>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">✅</div>
              <p>
                {filter === 'all' 
                  ? 'No todos yet' 
                  : filter === 'active'
                  ? 'No active todos'
                  : 'No completed todos'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-all ${
                    todo.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  
                  <div className="flex-1">
                    <div className={`font-medium ${
                      todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      {todo.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due: {todo.dueDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <select
                      value={todo.priority}
                      onChange={(e) => updatePriority(todo.id, e.target.value as any)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Delete todo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics and Actions */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-3">📊 Statistics</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{activeCount}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
            
            {todos.length > 0 && (
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / todos.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Priority Breakdown */}
          {todos.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-3">🎯 Priority Breakdown</h5>
              <div className="space-y-2">
                {(['high', 'medium', 'low'] as const).map((priority) => {
                  const count = todos.filter(todo => todo.priority === priority).length
                  const percentage = todos.length > 0 ? (count / todos.length) * 100 : 0
                  
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getPriorityColor(priority)}`}>
                        {priority}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              priority === 'high' ? 'bg-red-500' :
                              priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-800">🔧 Actions</h5>
            
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
              >
                Clear Completed ({completedCount})
              </button>
            )}
            
            <button
              onClick={resetTodos}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Clear All Todos
            </button>
          </div>

          {/* Universal Features */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">🌐 Universal Todo Features</h5>
            <div className="text-sm text-green-700 space-y-1">
              <div>✅ Optimistic todo updates</div>
              <div>✅ Priority management</div>
              <div>✅ Real-time filtering</div>
              <div>✅ Progress tracking</div>
              <div>✅ Server-client synchronization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}