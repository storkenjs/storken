/**
 * Storken Universal API Usage Examples
 * Demonstrates unified API usage in both server and client components
 */

import React from 'react'
import { 
  useStorken, 
  useUser, 
  usePosts, 
  useNotifications,
  useTodos,
  useSettings,
  useDashboard,
  get,
  set,
  prefetchServerData,
  type User,
  type Post
} from './index'

// ============================================
// SERVER COMPONENT EXAMPLES
// ============================================

/**
 * Server Component - Profile Page
 * Direct database access via server implementation
 */
export async function ServerProfilePage({ params }: { params: { userId: string } }) {
  // Server-side data fetching - direct DB access
  const user = await get<User>('user', params.userId)
  const posts = await get<Post[]>('posts', params.userId)
  
  return (
    <div>
      <h1>Server Rendered: {user?.name}</h1>
      <p>Email: {user?.email}</p>
      
      <h2>Posts ({posts.length})</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Server Component - Dashboard
 * Prefetch multiple data sources
 */
export async function ServerDashboard() {
  // Prefetch multiple data sources in parallel
  const data = await prefetchServerData(['dashboard', 'users', 'posts'])
  
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats">
        <div>Total Users: {data.dashboard?.stats.totalUsers}</div>
        <div>Total Posts: {data.dashboard?.stats.totalPosts}</div>
        <div>Active Users: {data.dashboard?.stats.activeUsers}</div>
      </div>
      
      <h2>Recent Activity</h2>
      <ul>
        {data.dashboard?.recentActivity.map((activity: any) => (
          <li key={activity.id}>
            {activity.description} - {activity.timestamp}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================
// CLIENT COMPONENT EXAMPLES
// ============================================

/**
 * Client Component - User Profile Editor
 * Client-side state management with API calls
 */
'use client'
export function ClientUserProfile({ userId }: { userId: string }) {
  const { user, setUser, loading } = useUser(userId)
  const [isEditing, setIsEditing] = React.useState(false)
  const [formData, setFormData] = React.useState({ name: '', email: '' })
  
  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email })
    }
  }, [user])
  
  const handleSave = async () => {
    if (user) {
      await setUser({ ...user, ...formData })
      setIsEditing(false)
    }
  }
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>
  
  return (
    <div>
      {isEditing ? (
        <div>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name"
          />
          <input
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  )
}

/**
 * Client Component - Todo List
 * Interactive todo management
 */
'use client'
export function ClientTodoList({ userId }: { userId: string }) {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos(userId)
  const [newTodoTitle, setNewTodoTitle] = React.useState('')
  
  const handleAddTodo = async () => {
    if (newTodoTitle.trim()) {
      await addTodo(newTodoTitle)
      setNewTodoTitle('')
    }
  }
  
  if (loading) return <div>Loading todos...</div>
  
  return (
    <div>
      <h2>My Todos</h2>
      
      <div>
        <input
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Add new todo..."
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <button onClick={handleAddTodo}>Add</button>
      </div>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            <span> [{todo.priority}]</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Client Component - Notification Center
 * Real-time notification management
 */
'use client'
export function ClientNotificationCenter({ userId }: { userId: string }) {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(userId)
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  if (loading) return <div>Loading notifications...</div>
  
  return (
    <div>
      <h2>
        Notifications 
        {unreadCount > 0 && <span> ({unreadCount} unread)</span>}
      </h2>
      
      {unreadCount > 0 && (
        <button onClick={markAllAsRead}>Mark all as read</button>
      )}
      
      <ul>
        {notifications.map(notification => (
          <li 
            key={notification.id}
            style={{ fontWeight: notification.read ? 'normal' : 'bold' }}
          >
            <span className={`type-${notification.type}`}>
              {notification.title}
            </span>
            <p>{notification.message}</p>
            {!notification.read && (
              <button onClick={() => markAsRead([notification.id])}>
                Mark as read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Client Component - Settings Panel
 * User preferences management
 */
'use client'
export function ClientSettingsPanel({ userId }: { userId: string }) {
  const { 
    settings, 
    loading,
    updateTheme, 
    updateLanguage, 
    updateNotificationSettings 
  } = useSettings(userId)
  
  if (loading) return <div>Loading settings...</div>
  if (!settings) return <div>Settings not found</div>
  
  return (
    <div>
      <h2>Settings</h2>
      
      <div>
        <h3>Theme</h3>
        <select 
          value={settings.theme} 
          onChange={(e) => updateTheme(e.target.value as any)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
      
      <div>
        <h3>Language</h3>
        <select 
          value={settings.language} 
          onChange={(e) => updateLanguage(e.target.value as any)}
        >
          <option value="en">English</option>
          <option value="tr">Turkish</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
      
      <div>
        <h3>Notifications</h3>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.email}
            onChange={(e) => updateNotificationSettings({ email: e.target.checked })}
          />
          Email Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.push}
            onChange={(e) => updateNotificationSettings({ push: e.target.checked })}
          />
          Push Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.inApp}
            onChange={(e) => updateNotificationSettings({ inApp: e.target.checked })}
          />
          In-App Notifications
        </label>
      </div>
    </div>
  )
}

/**
 * Client Component - Live Dashboard
 * Real-time dashboard with refresh capability
 */
'use client'
export function ClientLiveDashboard() {
  const { dashboard, loading, refresh } = useDashboard()
  const [autoRefresh, setAutoRefresh] = React.useState(false)
  
  React.useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refresh, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refresh])
  
  if (loading) return <div>Loading dashboard...</div>
  if (!dashboard) return <div>Dashboard data not available</div>
  
  return (
    <div>
      <h1>Live Dashboard</h1>
      
      <div>
        <button onClick={refresh}>Refresh Now</button>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (30s)
        </label>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{dashboard.stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Posts</h3>
          <p>{dashboard.stats.totalPosts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Views</h3>
          <p>{dashboard.stats.totalViews}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{dashboard.stats.activeUsers}</p>
        </div>
      </div>
      
      <h2>User Growth</h2>
      <div>
        {dashboard.charts.userGrowth.map(point => (
          <div key={point.date}>
            {point.date}: {point.count} users
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// MIXED PATTERN EXAMPLES
// ============================================

/**
 * Hybrid Component - SSR with Client Interactivity
 * Server renders initial state, client takes over for interactions
 */
export async function HybridPostEditor({ postId }: { postId: string }) {
  // Server-side initial data fetch
  const initialPost = await get<Post>('post', postId)
  
  return (
    <div>
      <h1>Edit Post (Hybrid)</h1>
      <ClientPostEditor initialPost={initialPost} />
    </div>
  )
}

'use client'
function ClientPostEditor({ initialPost }: { initialPost: Post | null }) {
  const [post, setPost] = useStorken<Post>('post', initialPost)
  const [title, setTitle] = React.useState(initialPost?.title || '')
  const [content, setContent] = React.useState(initialPost?.content || '')
  
  const handleSave = async () => {
    if (post) {
      await setPost({ ...post, title, content })
      alert('Post saved!')
    }
  }
  
  if (!post) return <div>Post not found</div>
  
  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Post Content"
      />
      <button onClick={handleSave}>Save Post</button>
    </div>
  )
}

// ============================================
// API ROUTE EXAMPLES
// ============================================

/**
 * API Route Handler
 * Uses the same Storken API on the server
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (userId) {
    const user = await get<User>('user', userId)
    return Response.json(user)
  }
  
  const users = await get<User[]>('users')
  return Response.json(users)
}

export async function PUT(request: Request) {
  const userData = await request.json()
  await set<User>('user', userData)
  return Response.json({ success: true })
}