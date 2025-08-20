'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createPost, updatePost as updatePostDb, getPost, deletePost as deletePostDb } from '@/lib/db-actions'
import { getCurrentUserId } from '@/lib/db'
import type { Post } from '@/lib/types'

// Server Action to create a new post
export async function createPostAction(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string  
  const tags = (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean)
  const published = formData.get('published') === 'on'

  if (!title || !content) {
    throw new Error('Title and content are required')
  }

  try {
    // Direct database operation
    const savedPost = await createPost({
      title,
      content,
      authorId: getCurrentUserId(),
      published,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Revalidate paths
    revalidatePath('/posts')
    revalidatePath('/dashboard')
    
    // Redirect to the new post
    redirect(`/posts/${savedPost.id}`)
  } catch (error: any) {
    // NextJS redirect throws a special error that should be re-thrown
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Failed to create post:', error)
    throw new Error('Failed to create post')
  }
}

// Server Action to update an existing post
export async function updatePostAction(postId: string, formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const tags = (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean)
  const published = formData.get('published') === 'on'

  if (!title || !content) {
    throw new Error('Title and content are required')
  }

  try {
    // Get current post
    const currentPost = await getPost(postId)
    if (!currentPost) {
      throw new Error('Post not found')
    }

    // Direct database operation
    await updatePostDb({
      ...currentPost,
      title,
      content,
      tags,
      published,
      updatedAt: new Date()
    })
    
    revalidatePath(`/posts/${postId}`)
    revalidatePath('/posts')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Failed to update post:', error)
    throw new Error('Failed to update post')
  }
}

// Server Action to delete a post
export async function deletePostAction(postId: string) {
  try {
    // Direct database operation
    await deletePostDb(postId)
    
    revalidatePath('/posts')
    revalidatePath('/dashboard')
    redirect('/posts')
  } catch (error) {
    console.error('Failed to delete post:', error)
    throw new Error('Failed to delete post')
  }
}

// Server Action to toggle post published status
export async function togglePublishedAction(postId: string) {
  try {
    const currentPost = await getPost(postId)
    if (!currentPost) {
      throw new Error('Post not found')
    }

    // Direct database operation
    await updatePostDb({
      ...currentPost,
      published: !currentPost.published,
      updatedAt: new Date()
    })
    
    revalidatePath(`/posts/${postId}`)
    revalidatePath('/posts')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Failed to toggle post status:', error)
    throw new Error('Failed to toggle post status')
  }
}