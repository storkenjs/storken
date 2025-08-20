import React from 'react'
import type { TodoFilter, Priority } from '../store/types'

interface TodoFiltersProps {
  filter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  onClearCompleted: () => void
  onToggleAll: () => void
  hasCompleted: boolean
}

export function TodoFilters({ 
  filter, 
  onFilterChange, 
  onClearCompleted, 
  onToggleAll,
  hasCompleted 
}: TodoFiltersProps) {
  const updateFilter = (updates: Partial<TodoFilter>) => {
    onFilterChange({ ...filter, ...updates })
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <input
            type="text"
            value={filter.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            placeholder="Search todos..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => updateFilter({ status: 'all' })}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter.status === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => updateFilter({ status: 'active' })}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter.status === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => updateFilter({ status: 'completed' })}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter.status === 'completed'
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Priority Filter */}
        <select
          value={filter.priority}
          onChange={(e) => updateFilter({ priority: e.target.value as Priority | 'all' })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onToggleAll}
            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Toggle All
          </button>

          {hasCompleted && (
            <button
              onClick={onClearCompleted}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear Completed
            </button>
          )}
        </div>
      </div>
    </div>
  )
}