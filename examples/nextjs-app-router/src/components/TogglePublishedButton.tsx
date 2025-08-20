'use client'

import { useTransition } from 'react'
import { togglePublishedAction } from '@/lib/actions'

interface TogglePublishedButtonProps {
  postId: string
  currentStatus: boolean
}

export function TogglePublishedButton({ postId, currentStatus }: TogglePublishedButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await togglePublishedAction(postId)
      } catch (error) {
        console.error('Failed to toggle post status:', error)
        // In a real app, you'd show an error toast or message
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`btn w-full disabled:opacity-50 disabled:cursor-not-allowed ${
        currentStatus 
          ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {isPending ? (
        <span className="flex items-center justify-center">
          <div className="loading-spinner mr-2"></div>
          Updating...
        </span>
      ) : currentStatus ? (
        'Unpublish Post'
      ) : (
        'Publish Post'
      )}
    </button>
  )
}