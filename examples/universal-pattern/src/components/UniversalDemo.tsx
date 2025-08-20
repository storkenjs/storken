import React, { useState } from 'react'
import { useUniversal } from '../store/universal-store'

export function UniversalDemo() {
  const [environment, setEnvironment] = useState<'server' | 'client'>('client')
  const [operationType, setOperationType] = useState<'get' | 'set'>('get')
  const [demoKey, setDemoKey] = useState<'currentUser' | 'posts' | 'todos'>('currentUser')
  const [log, setLog] = useState<string[]>([])

  const [currentUser, setCurrentUser, , userLoading, refreshUser, userPlugins] = useUniversal('currentUser')
  const [posts, setPosts, , postsLoading, refreshPosts] = useUniversal('posts')
  const [todos, setTodos, , todosLoading, refreshTodos] = useUniversal('todos')

  const addToLog = (message: string) => {
    setLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  const demonstrateGet = async () => {
    addToLog(`🔄 Demonstrating GET operation for ${demoKey}`)
    
    try {
      switch (demoKey) {
        case 'currentUser':
          // Manual fetch for user
          const user = { 
            id: '1', 
            name: 'Demo User', 
            email: 'demo@example.com',
            avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=667eea&color=fff',
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setCurrentUser(user)
          addToLog(`✅ User data fetched: ${user.name}`)
          break
        case 'posts':
          // Manual fetch for posts
          const post = {
            id: '1',
            title: 'Demo Post',
            content: 'This is a demo post to test the universal API',
            userId: '1',
            published: true,
            tags: ['demo', 'universal'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setPosts([post])
          addToLog(`✅ Posts fetched: 1 post`)
          break
        case 'todos':
          // Manual fetch for todos
          const todo = {
            id: '1',
            userId: '1',
            title: 'Test Universal Pattern',
            completed: false,
            priority: 'high' as const,
            dueDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setTodos([todo])
          addToLog(`✅ Todos fetched: 1 todo`)
          break
      }
    } catch (error) {
      addToLog(`❌ Error in GET operation: ${error}`)
    }
  }

  const demonstrateSet = async () => {
    addToLog(`🔄 Demonstrating SET operation for ${demoKey}`)
    
    switch (demoKey) {
      case 'currentUser':
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: `${currentUser.name} (Updated at ${new Date().toLocaleTimeString()})`
          }
          await setCurrentUser(updatedUser)
          addToLog(`✅ User updated: ${updatedUser.name}`)
        }
        break
      case 'posts':
        const newPost = {
          id: '',
          title: `Demo Post ${Date.now()}`,
          content: 'This is a demo post created by the universal API',
          userId: '1',
          published: true,
          tags: ['demo', 'universal'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await setPosts([...posts, newPost])
        addToLog(`✅ New post created: ${newPost.title}`)
        break
      case 'todos':
        const newTodo = {
          id: '',
          userId: '1',
          title: `Demo Todo ${Date.now()}`,
          completed: false,
          priority: 'medium' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        await setTodos([...todos, newTodo])
        addToLog(`✅ New todo created: ${newTodo.title}`)
        break
    }
  }

  const clearLog = () => setLog([])

  const getEnvironmentInfo = () => {
    if (userPlugins?.environmentDetection) {
      const env = userPlugins.environmentDetection.getEnvironment()
      return {
        current: env,
        isServer: userPlugins.environmentDetection.isServer(),
        isClient: userPlugins.environmentDetection.isClient()
      }
    }
    return { current: 'unknown', isServer: false, isClient: true }
  }

  const envInfo = getEnvironmentInfo()

  return (
    <div className="demo-card">
      <h3>🌐 Universal API Demonstration</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment Detection
            </label>
            <div className="flex space-x-4 text-sm">
              <span className={`env-badge ${envInfo.current === 'server' ? 'server' : 'client'}`}>
                Current: {envInfo.current}
              </span>
              <span className="text-gray-600">
                Server: {envInfo.isServer ? '✅' : '❌'}
              </span>
              <span className="text-gray-600">
                Client: {envInfo.isClient ? '✅' : '❌'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setOperationType('get')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  operationType === 'get'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                GET (Read)
              </button>
              <button
                onClick={() => setOperationType('set')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  operationType === 'set'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                SET (Write)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <select
              value={demoKey}
              onChange={(e) => setDemoKey(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="currentUser">User Data</option>
              <option value="posts">Posts</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={operationType === 'get' ? demonstrateGet : demonstrateSet}
              disabled={
                (demoKey === 'currentUser' && userLoading) ||
                (demoKey === 'posts' && postsLoading) ||
                (demoKey === 'todos' && todosLoading)
              }
              className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {((demoKey === 'currentUser' && userLoading) ||
                (demoKey === 'posts' && postsLoading) ||
                (demoKey === 'todos' && todosLoading)) ? (
                <span className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Loading...
                </span>
              ) : (
                `${operationType.toUpperCase()} ${demoKey}`
              )}
            </button>
            
            <button
              onClick={clearLog}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Log
            </button>
          </div>
        </div>

        {/* Output Log */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Operation Log
            </label>
            <span className="text-xs text-gray-500">
              {log.length} entries
            </span>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {log.length === 0 ? (
              <div className="text-gray-500">No operations logged yet...</div>
            ) : (
              log.map((entry, index) => (
                <div key={index} className="mb-1">
                  {entry}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Current State Display */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">👤 Current User</h4>
          {userLoading ? (
            <div className="loading-spinner"></div>
          ) : currentUser ? (
            <div className="text-sm text-blue-700">
              <div>Name: {currentUser.name}</div>
              <div>Email: {currentUser.email}</div>
            </div>
          ) : (
            <div className="text-sm text-blue-600">No user loaded</div>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">📝 Posts</h4>
          {postsLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <div className="text-sm text-green-700">
              <div>{posts.length} posts loaded</div>
              {posts.slice(0, 2).map(post => (
                <div key={post.id} className="truncate">{post.title}</div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">✅ Todos</h4>
          {todosLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <div className="text-sm text-purple-700">
              <div>{todos.length} todos loaded</div>
              {todos.slice(0, 2).map(todo => (
                <div key={todo.id} className="truncate">{todo.title}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}