import React from 'react'
import type { TodoStats } from '../store/types'

interface TodoStatsProps {
  stats: TodoStats
}

export function TodoStats({ stats }: TodoStatsProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <h2 className="text-lg font-semibold mb-4">Statistics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Todos</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Completion</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-2">By Priority</h3>
        <div className="flex justify-between text-sm">
          <span className="text-red-600">High: {stats.byPriority.high}</span>
          <span className="text-yellow-600">Medium: {stats.byPriority.medium}</span>
          <span className="text-green-600">Low: {stats.byPriority.low}</span>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}