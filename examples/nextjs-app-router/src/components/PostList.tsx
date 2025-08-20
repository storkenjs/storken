// Server Component for displaying posts
import Link from 'next/link'
import type { Post } from '@/lib/types'

interface PostListProps {
  posts: Post[]
  showAuthor?: boolean
}

export function PostList({ posts, showAuthor = false }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📝</div>
        <p>No posts available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link 
                href={`/posts/${post.id}`}
                className="block group"
              >
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 mt-2 line-clamp-2">
                {post.content.length > 200 
                  ? `${post.content.substring(0, 200)}...` 
                  : post.content
                }
              </p>
              
              <div className="flex items-center space-x-4 mt-4">
                {/* Publication status */}
                <span className={`badge ${
                  post.published ? 'badge-green' : 'badge-yellow'
                }`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
                
                {/* Author */}
                {showAuthor && post.author && (
                  <span className="text-sm text-gray-500">
                    by {post.author.name}
                  </span>
                )}
                
                {/* Created date */}
                <span className="text-sm text-gray-500">
                  {post.createdAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-blue text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="ml-6 flex flex-col space-y-2">
              <Link
                href={`/posts/${post.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Read more →
              </Link>
              
              <Link
                href={`/posts/${post.id}/edit`}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading component for use in loading.tsx files
export function PostListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="flex space-x-4">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  )
}