// Shared types for the Next.js App Router example

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  author?: User
  published: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  author?: User
  createdAt: Date
}

export interface CreatePostData {
  title: string
  content: string
  tags: string[]
}

export interface UpdatePostData extends Partial<CreatePostData> {
  published?: boolean
}