import Link from 'next/link'
import { notFound } from 'next/navigation'
import { get } from '@/store'
import { TogglePublishedButton } from '@/components/TogglePublishedButton'
import type { Post } from '@/lib/types'

interface PostPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await get<Post | null>('post', params.id)
  
  if (!post) {
    return {
      title: 'Post Not Found | Storken Next.js',
    }
  }

  return {
    title: `${post.title} | Storken Next.js`,
    description: post.content.substring(0, 160),
  }
}

// Post detail page - Server Component
export default async function PostPage({ params }: PostPageProps) {
  // Server-side data fetching with Storken
  const post = await get<Post | null>('post', params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Navigation */}
      <div className="mb-8">
        <Link 
          href="/posts" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Posts
        </Link>
      </div>

      {/* Post Header */}
      <header className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <span className={`badge ${
            post.published ? 'badge-green' : 'badge-yellow'
          }`}>
            {post.published ? 'Published' : 'Draft'}
          </span>
          
          <span className="text-sm text-gray-500">
            {post.createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          
          {post.updatedAt > post.createdAt && (
            <span className="text-sm text-gray-400">
              (Updated {post.updatedAt.toLocaleDateString()})
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {post.author && (
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {post.author.name.charAt(0)}
            </div>
            <span>by {post.author.name}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-2">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="badge badge-blue">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/posts/${post.id}/edit`}
                className="btn btn-primary w-full text-center"
              >
                Edit Post
              </Link>
              
              <TogglePublishedButton 
                postId={post.id} 
                currentStatus={post.published} 
              />
              
              <Link
                href="/posts/new"
                className="btn btn-secondary w-full text-center"
              >
                Write New Post
              </Link>
            </div>
          </div>

          {/* Post Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Post Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  post.published ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">
                  {post.createdAt.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Updated</span>
                <span className="font-medium">
                  {post.updatedAt.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Word Count</span>
                <span className="font-medium">
                  {post.content.split(' ').length}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Reading Time</span>
                <span className="font-medium">
                  {Math.ceil(post.content.split(' ').length / 200)} min
                </span>
              </div>
            </div>
          </div>

          {/* Server Component Info */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🖥️ Server Rendered
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              This post is rendered on the server with direct database access 
              for optimal SEO and performance.
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <div>✅ Direct DB query</div>
              <div>✅ SEO optimized</div>
              <div>✅ Fast page load</div>
              <div>✅ Generated metadata</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}