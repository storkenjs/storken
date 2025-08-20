import Link from 'next/link'
import { CreatePostForm } from '@/components/CreatePostForm'

export const metadata = {
  title: 'Create Post | Storken Next.js',
  description: 'Create a new blog post',
}

export default function NewPostPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link 
          href="/posts" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Posts
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Post</h1>
        <p className="text-gray-600 mt-2">
          Write and publish your blog post using Server Actions and Storken state management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <CreatePostForm />
        </div>

        {/* Sidebar with tips */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Writing Tips</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong className="text-gray-900">Title:</strong> Keep it clear and engaging
              </div>
              <div>
                <strong className="text-gray-900">Content:</strong> Use paragraphs and formatting
              </div>
              <div>
                <strong className="text-gray-900">Tags:</strong> Use relevant keywords separated by commas
              </div>
              <div>
                <strong className="text-gray-900">Publishing:</strong> You can save as draft first
              </div>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ⚡ Server Actions
            </h3>
            <p className="text-sm text-green-800">
              This form uses Next.js Server Actions with Storken for seamless 
              server-side mutations and automatic revalidation.
            </p>
            <div className="mt-3 text-xs text-green-700">
              <div>✅ Server-side validation</div>
              <div>✅ Database operations</div>
              <div>✅ Automatic redirects</div>
              <div>✅ Type-safe actions</div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <p className="text-sm text-gray-600">
              After creating your post, you&apos;ll be redirected to view it. 
              Published posts appear on the main posts page immediately.
            </p>
            <div className="mt-4">
              <Link 
                href="/posts"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all posts →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}