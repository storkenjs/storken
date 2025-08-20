// Direct database operations for server components
import { db, getCurrentUserId } from '@/lib/db'
import type { User, Post } from '@/lib/types'

// User operations
export async function getCurrentUser(): Promise<User | null> {
  const userId = getCurrentUserId()
  return await db.user.findUnique({
    where: { id: userId }
  })
}

export async function updateUser(user: User): Promise<User> {
  return await db.user.update({
    where: { id: user.id },
    data: user
  })
}

// Post operations
export async function getPosts(authorId?: string): Promise<Post[]> {
  if (authorId) {
    return await db.post.findMany({
      where: { authorId },
      include: { author: true },
      orderBy: { createdAt: 'desc' }
    })
  }
  
  return await db.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getPost(postId: string): Promise<Post | null> {
  return await db.post.findUnique({
    where: { id: postId },
    include: { author: true }
  })
}

export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  return await db.post.create({
    data: {
      ...post,
      authorId: getCurrentUserId()
    }
  })
}

export async function updatePost(post: Post): Promise<Post> {
  return await db.post.update({
    where: { id: post.id },
    data: post
  })
}

export async function deletePost(postId: string): Promise<void> {
  await db.post.delete({
    where: { id: postId }
  })
}