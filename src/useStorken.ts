import { useRef, useState, useEffect, useSyncExternalStore } from 'react'
import type { 
  StorkenKey, 
  StorkenArgs, 
  StorkenHookReturn, 
  ISky,
  IStorken
} from './types'

/**
 * Hook creator for Storken v3.0 with React 18 useSyncExternalStore support
 * @param Sky - Wrapper object which will be used to create and orchestrate for Storkens
 * @returns useStorken - Hook function with full type safety
 */
export const createHook = (Sky: ISky) => {
  /**
   * Modern React 18 compatible useStorken hook
   * @param key - Key of the Storken state
   * @param args - Arguments which will be used in Storken getter & setter functions
   * @returns Typed array with state, actions, loading status, and plugins
   */
  function useStorken<T = unknown>(
    key: StorkenKey,
    ...args: StorkenArgs
  ): StorkenHookReturn<T> {
    // Get or create Storken instance
    const stork = useRef<IStorken<T>>(
      Sky.bundles?.[key] as IStorken<T> || Sky.create<T>(key, ...args)
    ).current

    // Modern React 18 external store subscription
    const state = useSyncExternalStore(
      // Subscribe function
      (onStoreChange) => {
        const unsubscribe = stork.listen(
          [stork.value, onStoreChange],
          [stork.loading || false, () => {}], // Loading handled separately
          args
        )
        return unsubscribe
      },
      // Get snapshot function
      () => stork.value as T,
      // Get server snapshot function (for SSR)
      () => stork.opts?.initialValue as T
    )

    // Loading state management (separate from main state)
    const [loadingState, setLoadingState] = useState<boolean>(stork.opts?.loading || false)

    // Update loading state when storken loading changes
    useEffect(() => {
      const updateLoading = () => setLoadingState(stork.loading || false)
      stork.on('loading', updateLoading)
      return () => {
        // Clean up event listener
        if (stork.eventListeners?.loading) {
          const index = stork.eventListeners.loading.findIndex(
            (listener) => listener === updateLoading
          )
          if (index > -1) {
            stork.eventListeners.loading.splice(index, 1)
          }
        }
      }
    }, [stork])

    // Create return pack with proper typing
    const returnPack = [
      state,
      stork.set.bind(stork),
      stork.reset.bind(stork),
      loadingState,
      stork.update.bind(stork)
    ] as StorkenHookReturn<T>

    // Add object-style access for better DX
    returnPack.value = state
    returnPack.set = stork.set.bind(stork)
    returnPack.reset = stork.reset.bind(stork)
    returnPack.loading = loadingState
    returnPack.update = stork.update.bind(stork)

    // Load plugins
    const plugins = stork.loadPlugins(returnPack)
    if (plugins) {
      returnPack.push(plugins)
      returnPack.plugins = plugins
    }

    return returnPack
  }

  return useStorken
}

// Legacy export for backward compatibility
export default createHook