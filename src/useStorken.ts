import { useRef, useState, useEffect, SetStateAction, Dispatch } from 'react'
import Sky, { TGetter, THooks, TKey, TLoading, TPlugin, TStorkArgs } from './storken'

/**
 * Hook creator.
 * @param {Sky} Sky - Wrapper object which will be used to create and orchestrate for Storkens
 * @returns {function} useStorken - Hook function
 */
export const createHooks = (Sky: Sky): THooks => {
  /**
    @param {string} key - Key of the Storken
    @param {...*} args - Arguments which will be used in Storken getter & setter functions.
    @returns an array to get, set, reset and update the value and loading status, and contain plugins returns.
   */
  function useStorken <TStorkenValue = undefined> (key: string, ...args: TStorkArgs[]): [
    value: TStorkenValue,
    set: Dispatch<SetStateAction<TStorkenValue>>,
    reset: () => void,
    loading: TLoading,
    update: (...args: TStorkArgs[]) => ReturnType<TGetter> | PromiseLike<ReturnType<TGetter>>,
    plugins?: { [key: TKey]: ReturnType<TPlugin> }
  ] {
    const stork = useRef(Sky.bundles?.[key] || Sky.create<TStorkenValue, TStorkArgs>(key as string, ...args)).current

    const [state, listener] = useState<TStorkenValue>(stork.value as TStorkenValue)
    const [loadingState, loadingListener] = useState<TLoading>(stork.opts?.loading)

    useEffect(() => stork.listen([state, listener], [loadingState, loadingListener], args), [key, ...args])

    type UsageObjectArrNotation = [
      value: typeof state,
      set: typeof stork.set,
      reset: typeof stork.reset,
      loading: typeof stork.loading,
      update: typeof stork.update,
      plugins?: { [key: TKey]: ReturnType<TPlugin> }
    ]

    const usageObject: UsageObjectArrNotation = [state, stork.set, stork.reset, loadingState, stork.update]

    const plugins = stork.loadPlugins(usageObject)
    usageObject.push(plugins)

    Object.assign(usageObject, {
      value: state,
      set: stork.set,
      reset: stork.reset,
      loading: loadingState,
      update: stork.update,
      plugins
    })

    return usageObject
  }

  const useLoading = (key: string) => useStorken(key)[3]
  const useUpdate = (key: string) => useStorken(key)[4]
  const usePlugin = (key: string, plugin?: string) => plugin
    ? useStorken(key)?.[5]?.[plugin]
    : useStorken(key)[5]

  return {
    useStorken,
    useLoading,
    useUpdate,
    usePlugin
  }
}
