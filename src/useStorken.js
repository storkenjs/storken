import { useRef, useState, useEffect } from 'react'

/**
 * Hook creator.
 * @param {Sky} Sky - Wrapper object which will be used to create and orchestrate for Storkens
 * @returns {function} useStorken - Hook function
 */
export const createHook = (Sky) =>
  /**
    @param {string} key - Key of the Storken
    @param {...*} args - Arguments which will be used in Storken getter & setter functions.
    @returns an array to get, set, reset and update the value and loading status, and contain plugins returns.
   */
  function useStorken (key, ...args) {
    const stork = useRef(Sky.bundles?.[key] || Sky.create(key, ...args)).current

    const [state, listener] = useState(stork.value)
    const [loadingState, loadingListener] = useState(stork.opts?.loading)

    useEffect(() => stork.listen([state, listener], [loadingState, loadingListener], args), [key, ...args])

    const returnPack = [state, stork.set, stork.reset, loadingState, stork.update]
    returnPack.value = state
    returnPack.set = stork.set
    returnPack.reset = stork.reset
    returnPack.loading = loadingState
    returnPack.update = stork.update

    const plugins = stork.loadPlugins(returnPack)
    returnPack.push(plugins)
    returnPack.plugins = plugins

    return returnPack
  }
