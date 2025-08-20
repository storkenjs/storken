import React from 'react'
import { UniversalDemo } from './components/UniversalDemo'
import { UserDemo } from './components/UserDemo'
import { PostDemo } from './components/PostDemo'
import { TodoDemo } from './components/TodoDemo'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🌐 Storken Universal Pattern Demo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Server-Client Unified API Demonstration
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Universal API Pattern
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Same code works in Server Components, Client Components, and API Routes
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">🖥️</div>
                <h3 className="font-semibold text-blue-800">Server Components</h3>
                <p className="text-sm text-blue-600">Direct database access</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">🌐</div>
                <h3 className="font-semibold text-green-800">Client Components</h3>
                <p className="text-sm text-green-600">API calls via HTTP</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">🔄</div>
                <h3 className="font-semibold text-purple-800">API Routes</h3>
                <p className="text-sm text-purple-600">Unified data layer</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <UniversalDemo />
            <UserDemo />
            <PostDemo />
            <TodoDemo />
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Key Features Demonstrated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🚀 Universal API</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Same interface for server and client</li>
                  <li>• Automatic environment detection</li>
                  <li>• Seamless data synchronization</li>
                  <li>• Type-safe operations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">💾 Smart Caching</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Automatic cache invalidation</li>
                  <li>• Optimistic updates</li>
                  <li>• Background synchronization</li>
                  <li>• Conflict resolution</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🔄 State Management</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Reactive state updates</li>
                  <li>• Cross-component synchronization</li>
                  <li>• Persistent state</li>
                  <li>• Loading state management</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🛡️ Developer Experience</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full TypeScript support</li>
                  <li>• Predictable error handling</li>
                  <li>• Built-in validation</li>
                  <li>• Easy debugging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}