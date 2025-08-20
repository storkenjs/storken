/**
 * NextJS Adapter for Storken
 * Seamless integration with App Router and Pages Router
 */

import React from 'react'
import { createStore as createUniversalStore, prepareData } from '../universal'
import { ServerData, StorkenProvider } from '../universal/components'
import type { UniversalStoreConfig } from '../universal'

// NextJS specific config
export interface NextStoreConfig extends UniversalStoreConfig {
  revalidate?: number | false
  tags?: string[]
}

/**
 * Create a NextJS-optimized store
 */
export function createNextStore(config: NextStoreConfig = {}) {
  // Create base store with NextJS optimizations
  const store = createUniversalStore({
    ...config,
    server: {
      cache: 'memory',
      ttl: config.revalidate || 3600,
      ...config.server
    },
    client: {
      persist: true,
      devTools: process.env.NODE_ENV === 'development',
      ...config.client
    }
  })

  // Enhanced store with NextJS-specific helpers
  const nextStore = {
    ...store,
    
    /**
     * Prepare data for a page (App Router)
     */
    async prepare(keys: string[] | Record<string, any[]>) {
      const data: Record<string, any> = {}
      
      if (Array.isArray(keys)) {
        // Load without args
        await Promise.all(
          keys.map(async (key) => {
            data[key] = await store[key].get()
          })
        )
      } else {
        // Load with args
        await Promise.all(
          Object.entries(keys).map(async ([key, args]) => {
            data[key] = await store[key].get(...args)
          })
        )
      }
      
      return data
    },
    
    /**
     * Create server component helper
     */
    ServerComponent: ServerData,
    
    /**
     * Create client provider
     */
    Provider: ({ children, initialData }: any) => (
      <StorkenProvider store={store} initialData={initialData}>
        {children}
      </StorkenProvider>
    ),
    
    /**
     * Hook for client components
     */
    useStore: () => store
  }
  
  return nextStore
}

/**
 * Setup helper - creates everything needed in one call
 */
export function setupStorken<T extends Record<string, (...args: any[]) => Promise<any>>>(
  loaders: T
) {
  // Create store with loaders as getters
  const store = createNextStore({
    getters: Object.entries(loaders).reduce((acc, [key, loader]) => {
      acc[key] = async (storken: any, ...args: any[]) => {
        return loader(...args)
      }
      return acc
    }, {} as any)
  })
  
  // Type-safe store access
  type StoreKeys = keyof T
  type StoreData = {
    [K in StoreKeys]: Awaited<ReturnType<T[K]>>
  }
  
  return {
    // The store instance
    store,
    
    // Server data component
    ServerData: ({ data }: { data: StoreData }) => <ServerData data={data} />,
    
    // Client hook with types
    useServerData: (): StoreData => {
      if (typeof window === 'undefined') {
        throw new Error('useServerData can only be used on client')
      }
      return (window as any).__STORKEN_DATA__ || {}
    },
    
    // Provider component
    Provider: ({ children }: { children: React.ReactNode }) => (
      <StorkenProvider store={store}>
        {children}
      </StorkenProvider>
    ),
    
    // Prepare helper with types
    prepare: async (keys: StoreKeys[]): Promise<StoreData> => {
      const data = {} as StoreData
      
      await Promise.all(
        keys.map(async (key) => {
          data[key] = await store[key as string].get()
        })
      )
      
      return data
    }
  }
}

/**
 * App Router Helpers
 */

// Layout wrapper for App Router
export function StorkenLayout({
  children,
  store
}: {
  children: React.ReactNode
  store: any
}) {
  return (
    <StorkenProvider store={store}>
      {children}
    </StorkenProvider>
  )
}

// Page wrapper for automatic data loading
export function createPageWrapper(store: any) {
  return function PageWrapper<P extends Record<string, any>>({
    Component,
    loader
  }: {
    Component: React.ComponentType<P>
    loader?: (params: any) => Promise<Partial<P>>
  }) {
    return async function Page(props: any) {
      let data = {}
      
      if (loader) {
        data = await loader(props.params)
      }
      
      return (
        <>
          <ServerData data={data} />
          <Component {...props} {...data} />
        </>
      )
    }
  }
}

/**
 * Pages Router Helpers (Legacy)
 */

// HOC for pages router
export function withStorkenPage(Component: React.ComponentType<any>, store: any) {
  return function StorkenPage(props: any) {
    return (
      <StorkenProvider store={store} initialData={props.storkenData}>
        <Component {...props} />
      </StorkenProvider>
    )
  }
}

// getServerSideProps helper
export function createServerSideProps(store: any) {
  return function getServerSideProps(
    loader: (context: any) => Promise<Record<string, any>>
  ) {
    return async (context: any) => {
      const data = await loader(context)
      
      return {
        props: {
          ...data,
          storkenData: data
        }
      }
    }
  }
}

// getStaticProps helper  
export function createStaticProps(store: any) {
  return function getStaticProps(
    loader: (context: any) => Promise<Record<string, any>>
  ) {
    return async (context: any) => {
      const data = await loader(context)
      
      return {
        props: {
          ...data,
          storkenData: data
        }
      }
    }
  }
}

/**
 * NextJS Config Plugin
 */
export function withStorkenConfig(nextConfig: any = {}) {
  return {
    ...nextConfig,
    
    // Add webpack config for better optimization
    webpack: (config: any, options: any) => {
      // Add alias for universal imports
      config.resolve.alias = {
        ...config.resolve.alias,
        'storken/server': options.isServer 
          ? require.resolve('../server')
          : false,
        'storken/client': !options.isServer
          ? require.resolve('../storken')
          : false
      }
      
      // Run user's webpack config
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }
      
      return config
    }
  }
}