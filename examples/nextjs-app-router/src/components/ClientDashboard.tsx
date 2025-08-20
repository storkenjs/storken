'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStorken } from '@/store/client'
import type { User, Post } from '@/lib/types'

interface ClientDashboardProps {
  initialUser: User | null
  initialPosts: Post[]
}

export function ClientDashboard({ initialUser, initialPosts }: ClientDashboardProps) {
  const [user, setUser] = useStorken<User | null>('currentUser')
  const [posts, setPosts] = useStorken<Post[]>('posts')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingUser, setEditingUser] = useState(false)
  const [userForm, setUserForm] = useState({
    name: initialUser?.name || '',
    email: initialUser?.email || ''
  })

  // Hydrate client state with server data once
  useEffect(() => {
    if (initialUser && user === undefined) {
      setUser(initialUser)
    }
    if (initialPosts.length && (posts === undefined || posts.length === 0)) {
      setPosts(initialPosts)
    }
  }, [initialUser, initialPosts]) // Remove user and posts from deps to prevent loops

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      // This would typically refresh from API endpoints
      // For demo, we'll just simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('🔄 Data refreshed from client')
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const saveUserProfile = async () => {
    if (!user) return
    
    try {
      const updatedUser = {
        ...user,
        name: userForm.name,
        email: userForm.email,
        updatedAt: new Date()
      }
      
      await setUser(updatedUser)
      setEditingUser(false)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const togglePostStatus = async (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, published: !post.published, updatedAt: new Date() }
        : post
    )
    
    try {
      await setPosts(updatedPosts)
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner mr-3"></div>
        <span>Loading dashboard...</span>
      </div>
    )
  }

  const publishedPosts = posts.filter(p => p.published)
  const draftPosts = posts.filter(p => !p.published)

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {posts.length}
          </div>
          <div className="text-gray-700">Total Posts</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {publishedPosts.length}
          </div>
          <div className="text-gray-700">Published</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {draftPosts.length}
          </div>
          <div className="text-gray-700">Drafts</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {posts.reduce((sum, post) => sum + post.content.split(' ').length, 0)}
          </div>
          <div className="text-gray-700">Total Words</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Profile */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profile</h2>
            <button
              onClick={() => {
                setEditingUser(!editingUser)
                if (!editingUser) {
                  setUserForm({ name: user.name, email: user.email })
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {editingUser ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingUser ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={saveUserProfile}
                  className="btn btn-primary flex-1"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingUser(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {user.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="btn btn-secondary w-full disabled:opacity-50"
              >
                {isRefreshing ? (
                  <span className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Refreshing...
                  </span>
                ) : (
                  'Refresh Profile'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Posts</h2>
            <Link 
              href="/posts/new"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              New Post →
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p className="mb-4">No posts yet</p>
              <Link href="/posts/new" className="btn btn-primary">
                Write your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <Link 
                      href={`/posts/${post.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`badge text-xs ${
                        post.published ? 'badge-green' : 'badge-yellow'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => togglePostStatus(post.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              ))}
              
              {posts.length > 5 && (
                <div className="text-center pt-4">
                  <Link 
                    href="/posts"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View all {posts.length} posts →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Client Component Info */}
      <div className="card bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          🌐 Client Component Features
        </h3>
        <p className="text-sm text-green-800 mb-3">
          This dashboard uses client-side Storken for interactive features while being 
          hydrated with server-fetched data for optimal performance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-green-700">
          <div>
            <div>✅ Optimistic updates</div>
            <div>✅ Real-time interactions</div>
            <div>✅ Client-side state management</div>
          </div>
          <div>
            <div>✅ Server data hydration</div>
            <div>✅ Fast initial render</div>
            <div>✅ Progressive enhancement</div>
          </div>
        </div>
      </div>
    </div>
  )
}