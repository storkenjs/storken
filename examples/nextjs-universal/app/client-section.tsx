'use client'

import { store, useServerData } from './store'
import { useState } from 'react'

export default function ClientSection() {
  // Get hydrated data
  const { posts } = useServerData()
  
  // Client-side state
  const [cart, setCart] = useState<any[]>([])
  
  // Use store methods
  const addToCart = async (item: any) => {
    const newCart = [...cart, item]
    setCart(newCart)
    
    // Persist to store (and localStorage)
    await store.cart.set(newCart)
  }
  
  const refreshPosts = async () => {
    // This will fetch from API on client
    const freshPosts = await store.posts.get()
    console.log('Fresh posts:', freshPosts)
  }
  
  return (
    <section>
      <h2>Interactive Section (Client)</h2>
      
      <div>
        <h3>Add to Cart</h3>
        {posts?.map((post: any) => (
          <button 
            key={post.id}
            onClick={() => addToCart(post)}
          >
            Add "{post.title}" to cart
          </button>
        ))}
      </div>
      
      <div>
        <h3>Cart ({cart.length} items)</h3>
        <ul>
          {cart.map((item, i) => (
            <li key={i}>{item.title}</li>
          ))}
        </ul>
      </div>
      
      <button onClick={refreshPosts}>
        Refresh Posts (Client Fetch)
      </button>
    </section>
  )
}