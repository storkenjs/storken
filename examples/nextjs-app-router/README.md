# NextJS App Router + Storken Example

This example demonstrates how to use Storken with NextJS App Router for **client-side state management**.

## ⚠️ Important: This Example Needs Refactoring

This example currently shows an **anti-pattern** where we attempted to use Storken on the server-side. This is **NOT recommended**.

### Why Server-Side Storken is Wrong:

1. **Server Components are stateless** - They don't need state management
2. **Server Actions should use direct database calls** - No abstraction needed
3. **NextJS has built-in caching** - Use `revalidatePath` and `revalidateTag`
4. **Unnecessary complexity** - Adds development overhead without benefits

## ✅ Correct Usage: Client-Side Only

Storken should be used for **client-side state management** only:

### Good Use Cases:
- 🛒 Shopping cart state
- 📝 Form state management  
- 🎨 UI state (modals, tabs, themes)
- ⚡ Real-time features
- 🔄 Optimistic updates
- 🔗 Cross-component state sharing

### Example: Client-Side Cart Store

```typescript
// src/stores/cart-store.ts
'use client'

import { create } from 'storken'

export const [useCart] = create({
  initialValues: {
    cart: {
      items: [],
      total: 0
    }
  },
  
  getters: {
    cart: async (storken) => {
      // Load from localStorage or API
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : storken.value
    }
  },
  
  setters: {
    cart: (storken, cart) => {
      // Persist to localStorage
      localStorage.setItem('cart', JSON.stringify(cart))
      // Optional: sync with API
      fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify(cart)
      })
    }
  }
})
```

### Example: Optimistic Updates with Server Actions

```typescript
// src/components/post-like.tsx
'use client'

import { useLikes } from '@/stores/likes-store'
import { likePostAction } from '@/lib/actions'

export function PostLike({ postId }) {
  const [likes, setLikes] = useLikes(postId)
  
  const handleLike = async () => {
    // Optimistic update
    setLikes(prev => prev + 1)
    
    try {
      // Server action
      await likePostAction(postId)
    } catch (error) {
      // Revert on error
      setLikes(prev => prev - 1)
      toast.error('Failed to like post')
    }
  }
  
  return (
    <button onClick={handleLike}>
      ❤️ {likes}
    </button>
  )
}
```

## 📁 Recommended Structure

```
nextjs-app-router/
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Server Component
│   │   └── posts/
│   │       └── [id]/
│   │           └── page.tsx    # Server Component
│   ├── components/
│   │   ├── server/            # Server Components
│   │   │   └── post-list.tsx
│   │   └── client/            # Client Components
│   │       ├── post-form.tsx  # Uses Storken
│   │       └── cart.tsx       # Uses Storken
│   ├── lib/
│   │   ├── actions.ts         # Server Actions (direct DB)
│   │   └── db.ts              # Database functions
│   └── stores/                # Client-side stores only!
│       ├── cart-store.ts      # Shopping cart
│       ├── ui-store.ts        # UI state
│       └── form-store.ts      # Form state
```

## 🔄 Correct Patterns

### Server Components: Direct Database

```typescript
// app/posts/page.tsx
import { db } from '@/lib/db'

export default async function PostsPage() {
  // Direct database query - NO STORKEN
  const posts = await db.post.findMany()
  
  return <PostList posts={posts} />
}
```

### Server Actions: Direct Database

```typescript
// lib/actions.ts
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createPost(data) {
  // Direct database mutation - NO STORKEN
  const post = await db.post.create({ data })
  revalidatePath('/posts')
  return post
}
```

### Client Components: Use Storken

```typescript
// components/client/theme-toggle.tsx
'use client'

import { useTheme } from '@/stores/ui-store'

export function ThemeToggle() {
  const [theme, setTheme] = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}
```

## 📚 Learn More

- [NextJS App Router Best Practices](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns)
- [When to use Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [Storken Documentation](https://github.com/keremistan/storken)

## ⚡ Quick Start

```bash
npm install
npm run dev
```

---

**Note**: This example will be refactored to demonstrate proper client-side Storken usage with NextJS App Router.