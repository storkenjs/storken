import React, { useState } from 'react'
import { useUniversal } from '../store/universal-store'

export function PostDemo() {
  const [posts, setPosts, resetPosts, loading, refresh] = useUniversal('posts')
  const [isCreating, setIsCreating] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ''
  })

  const createPost = async () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      const post = {
        id: '',
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        userId: '1',
        published: true,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await setPosts([...posts, post])
      setNewPost({ title: '', content: '', tags: '' })
      setIsCreating(false)
    }
  }

  const togglePublished = async (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, published: !post.published, updatedAt: new Date() }
        : post
    )
    await setPosts(updatedPosts)
  }

  const deletePost = async (postId: string) => {
    const filteredPosts = posts.filter(post => post.id !== postId)
    await setPosts(filteredPosts)
  }

  return (
    <div className="demo-card">
      <h3>📝 Posts Management Demo</h3>
      <p className="text-gray-600 mb-4">
        Demonstrates universal CRUD operations for blog posts with optimistic updates
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Posts ({posts.length})</h4>
            <div className="flex space-x-2">
              <button
                onClick={refresh}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={() => setIsCreating(true)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
              >
                + New Post
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner mr-3"></div>
              <span className="text-gray-600">Loading posts...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p>No posts yet</p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Create First Post
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`border rounded-lg p-4 transition-all ${
                    post.published ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{post.title}</h5>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          post.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => togglePublished(post.id)}
                        className={`px-2 py-1 text-xs rounded ${
                          post.published
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Actions Panel */}
        <div>
          {isCreating ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Create New Post</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Write your post content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="react, storken, demo"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={createPost}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Post
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewPost({ title: '', content: '', tags: '' })
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Post Operations</h4>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Create New Post
                </button>
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh Posts'}
                </button>
                <button
                  onClick={resetPosts}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Clear All Posts
                </button>
              </div>

              {/* Stats */}
              {posts.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2">📊 Statistics</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Total Posts</div>
                      <div className="font-semibold text-lg">{posts.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Published</div>
                      <div className="font-semibold text-lg text-green-600">
                        {posts.filter(p => p.published).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Drafts</div>
                      <div className="font-semibold text-lg text-yellow-600">
                        {posts.filter(p => !p.published).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total Tags</div>
                      <div className="font-semibold text-lg text-blue-600">
                        {[...new Set(posts.flatMap(p => p.tags))].length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Universal Features */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">🌐 Universal Features</h5>
            <div className="text-sm text-blue-700 space-y-1">
              <div>✅ Optimistic CRUD operations</div>
              <div>✅ Automatic cache invalidation</div>
              <div>✅ Server-side rendering support</div>
              <div>✅ Real-time state synchronization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}