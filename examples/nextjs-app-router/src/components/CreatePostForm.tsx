'use client'

import React, { useState, useTransition } from 'react'
import { createPostAction } from '@/lib/actions'

export function CreatePostForm() {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    published: false
  })
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }

    const form = new FormData()
    form.append('title', formData.title)
    form.append('content', formData.content)
    form.append('tags', formData.tags)
    if (formData.published) {
      form.append('published', 'on')
    }

    startTransition(async () => {
      try {
        await createPostAction(form)
        // Reset form on success (will redirect, so this may not be needed)
        setFormData({
          title: '',
          content: '',
          tags: '',
          published: false
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create post')
      }
    })
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="form-input"
            placeholder="Enter post title"
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="form-textarea"
            placeholder="Write your post content..."
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="form-input"
            placeholder="react, nextjs, storken"
            disabled={isPending}
          />
        </div>

        <div className="flex items-center">
          <input
            id="published"
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            disabled={isPending}
          />
          <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
            Publish immediately
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isPending || !formData.title.trim() || !formData.content.trim()}
            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Creating...
              </span>
            ) : (
              'Create Post'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                content: '',
                tags: '',
                published: false
              })
              setError('')
            }}
            disabled={isPending}
            className="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          🌐 Client Component with Server Actions
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>✅ Interactive form handling</div>
          <div>✅ Server Action integration</div>
          <div>✅ Optimistic UI updates</div>
          <div>✅ Automatic revalidation</div>
        </div>
      </div>
    </div>
  )
}