/**
 * React components for auto-hydration
 */

import React, { createContext, useContext, useEffect, useState } from 'react'

// Server Data Component - Injects data into DOM
export function ServerData({ data }: { data: Record<string, any> }) {
  // Server-side: inject script tag
  if (typeof window === 'undefined') {
    const scriptContent = `window.__STORKEN_DATA__ = ${JSON.stringify(data)};`
    
    return (
      <script
        id="__STORKEN_DATA__"
        dangerouslySetInnerHTML={{ __html: scriptContent }}
      />
    )
  }
  
  // Client-side: no-op
  return null
}

// Storken Provider for client-side state management
interface StorkenProviderProps {
  children: React.ReactNode
  store?: any
  initialData?: Record<string, any>
}

const StorkenContext = createContext<any>(null)

export function StorkenProvider({ 
  children, 
  store,
  initialData 
}: StorkenProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  
  useEffect(() => {
    // Hydrate from server data
    if (typeof window !== 'undefined') {
      const serverData = (window as any).__STORKEN_DATA__ || initialData
      
      if (serverData && store) {
        // Hydrate store with server data
        Object.entries(serverData).forEach(([key, value]) => {
          if (store[key]) {
            store[key].set(value)
          }
        })
      }
      
      setIsHydrated(true)
    }
  }, [store, initialData])
  
  // Show loading state during hydration to prevent mismatch
  if (!isHydrated && typeof window !== 'undefined') {
    return <div style={{ opacity: 0 }}>{children}</div>
  }
  
  return (
    <StorkenContext.Provider value={store}>
      {children}
    </StorkenContext.Provider>
  )
}

// Hook to access store from context
export function useStorken() {
  const store = useContext(StorkenContext)
  
  if (!store) {
    throw new Error('useStorken must be used within StorkenProvider')
  }
  
  return store
}

// Auto-hydrating wrapper component
interface HydratedProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Hydrated({ children, fallback = null }: HydratedProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Utility hook for safe client-only operations
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return isClient
}