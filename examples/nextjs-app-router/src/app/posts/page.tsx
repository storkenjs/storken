import Link from 'next/link'
import { get } from '@/store'
import { PostList } from '@/components/PostList'
import { CreatePostForm } from '@/components/CreatePostForm'
import type { Post } from '@/lib/types'

// Posts page - Server Component
export const metadata = {
  title: 'Posts | Storken Next.js',
  description: 'Browse all blog posts created with Storken state management',
}

export default async function PostsPage() {
  // Server-side data fetching with Storken
  const posts = await get<Post[]>('posts')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
        <Link
          href="/posts/new"
          className="btn btn-primary"
        >
          Create New Post
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts List */}
        <div className="lg:col-span-2">
          <PostList posts={posts || []} showAuthor />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Blog Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-semibold">{posts?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Published</span>
                <span className="font-semibold text-green-600">
                  {posts?.filter(p => p.published).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Drafts</span>
                <span className="font-semibold text-yellow-600">
                  {posts?.filter(p => !p.published).length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Popular Tags */}
          {posts && posts.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(posts.flatMap(post => post.tags)))
                  .slice(0, 10)
                  .map((tag, index) => (
                    <span key={index} className="badge badge-blue">
                      #{tag}
                    </span>
                  ))
                }
              </div>
            </div>
          )}

          {/* Quick Create */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/posts/new"
                className="btn btn-primary w-full text-center"
              >
                Write New Post
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-secondary w-full text-center"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* Server Component Info */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🖥️ Server Component
            </h3>
            <p className="text-sm text-blue-800">
              This page is rendered on the server using Storken&apos;s universal API. 
              Data is fetched directly from the database with zero client-side JavaScript.
            </p>
            <div className="mt-3 text-xs text-blue-700">
              <div>✅ Direct database access</div>
              <div>✅ SEO optimized</div>
              <div>✅ Fast initial load</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}