import Link from 'next/link'
import { get } from '@/store'
import { PostList } from '@/components/PostList'
import type { Post, User } from '@/lib/types'

// Home page - Server Component with server-side data fetching
export default async function HomePage() {
  // Server-side data fetching using Storken
  const [posts, currentUser] = await Promise.all([
    get<Post[]>('posts'),
    get<User | null>('currentUser')
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Storken meets{' '}
          <span className="text-blue-600">Next.js App Router</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Experience unified state management across Server and Client Components with 
          the same simple API. Build faster, deploy confidently.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/posts"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Explore Posts
          </Link>
          <Link
            href="/dashboard"
            className="btn btn-secondary text-lg px-8 py-3"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="text-3xl mb-4">🔄</div>
          <h3 className="text-lg font-semibold mb-2">Universal API</h3>
          <p className="text-gray-600">
            Same Storken API works in both Server and Client Components
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold mb-2">Server Components</h3>
          <p className="text-gray-600">
            Direct database access with automatic optimization
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">TypeScript First</h3>
          <p className="text-gray-600">
            Full type safety across server-client boundaries
          </p>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recent Posts</h2>
          <Link
            href="/posts"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View all posts →
          </Link>
        </div>
        
        {posts && posts.length > 0 ? (
          <PostList posts={posts.slice(0, 3)} showAuthor />
        ) : (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first post
            </p>
            <Link href="/posts/new" className="btn btn-primary">
              Create Post
            </Link>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-blue-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
          Implementation Highlights
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {posts?.length || 0}
            </div>
            <div className="text-gray-700">Posts Loaded</div>
            <div className="text-xs text-gray-500 mt-1">Server Component</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {posts?.filter(p => p.published).length || 0}
            </div>
            <div className="text-gray-700">Published</div>
            <div className="text-xs text-gray-500 mt-1">DB Query</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {currentUser ? '1' : '0'}
            </div>
            <div className="text-gray-700">User Loaded</div>
            <div className="text-xs text-gray-500 mt-1">Universal Store</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              100%
            </div>
            <div className="text-gray-700">Type Safe</div>
            <div className="text-xs text-gray-500 mt-1">Full TypeScript</div>
          </div>
        </div>
      </div>
    </div>
  )
}