export type Priority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  createdAt: Date
  updatedAt: Date
}

export interface TodoFilter {
  status: 'all' | 'active' | 'completed'
  priority: 'all' | Priority
  search: string
}

export interface TodoStats {
  total: number
  completed: number
  active: number
  byPriority: {
    high: number
    medium: number
    low: number
  }
}