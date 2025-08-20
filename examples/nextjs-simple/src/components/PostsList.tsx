'use client'

import { usePosts } from '../store/store'

export default function PostsList() {
  const [posts, setPosts, , loading, refresh] = usePosts('posts', [])

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        <div className="animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Posts</h2>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-4">
        {posts.map((post: any) => (
          <div key={post.id} className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-gray-600">{post.content}</p>
          </div>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-gray-500 text-center py-4">No posts available.</p>
      )}
    </div>
  )
}