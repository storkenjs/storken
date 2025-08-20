/**
 * Storken Universal Types
 * Shared type definitions for server and client implementations
 */

// Core data types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  content: string
  userId: string
  published: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  type: 'info' | 'warning' | 'error' | 'success'
  createdAt: Date
}

export interface Todo {
  id: string
  userId: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  timestamp: Date
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

// Filter types
export interface FilterOptions {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

// Storken API Interface
export interface StorkenAPI {
  useStorken: <T>(key: string, initial?: T) => [
    T | undefined,
    (value: T | ((prev: T) => T)) => Promise<void>,
    () => void,
    boolean,
    () => void,
    any
  ]
  get: <T>(key: string, ...args: any[]) => Promise<T>
  set: <T>(key: string, value: T, ...args: any[]) => Promise<void>
  Sky: any
}

// Storken Keys - for type safety
export type StorkenKey = 
  | 'user'
  | 'users'
  | 'posts'
  | 'post'
  | 'notifications'
  | 'todos'
  | 'settings'
  | 'dashboard'

// Settings type
export interface Settings {
  userId: string
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'tr' | 'es' | 'fr'
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
  }
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    showActivity: boolean
  }
}

// Dashboard data
export interface DashboardData {
  stats: {
    totalUsers: number
    totalPosts: number
    totalViews: number
    activeUsers: number
  }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: Date
  }>
  charts: {
    userGrowth: Array<{ date: string; count: number }>
    postActivity: Array<{ date: string; count: number }>
  }
}