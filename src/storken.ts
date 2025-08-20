import { createHook } from './useStorken'
import type { 
  StorkenKey, 
  StorkenArgs, 
  StorkenOptions,
  StorkenConfig,
  StorkenPlugins,
  StorkenEventListeners,
  StorkenEventListener,
  StorkenGetter,
  StorkenSetter,
  ISky,
  IStorken,
  ReactState,
  CreateReturn
} from './types'
import { Dispatch, SetStateAction } from 'react'

export class Storken<T = unknown> implements IStorken<T> {
  readonly id: number
  readonly key: StorkenKey
  opts: StorkenOptions<T>
  args: StorkenArgs
  value: T
  Store: ISky
  namespace: string
  listeners: Dispatch<SetStateAction<T>>[] = []
  loadingListeners: Dispatch<SetStateAction<boolean>>[] = []
  eventListeners?: StorkenEventListeners = {}
  plugins?: Record<string, unknown> = {}
  loading?: boolean
  getted?: boolean = false

  constructor(options: StorkenOptions<T>, Sky: ISky) {
    const { key, args = [], plugins, ...opts } = options
    
    this.id = Date.now()
    this.key = key
    this.opts = options
    this.args = [...args]
    this.value = opts?.initialValue as T
    this.Store = Sky
    this.namespace = opts?.namespace || 'storken::'

    if (plugins instanceof Object) {
      this.plugins = Object.keys(plugins).reduce((obj, key) => {
        const [plugin, ...config] = Array.isArray(plugins[key])
          ? plugins[key]
          : [plugins[key]]

        obj[key] = plugin(this as any, ...config)
        return obj
      }, {} as Record<string, unknown>)
    }
  }

  on = (name: string, func: StorkenEventListener): void => {
    if (!this?.eventListeners) {
      this.eventListeners = {}
    }

    if (this?.eventListeners?.[name]) {
      this.eventListeners[name].push(func)
    } else {
      this.eventListeners[name] = [func]
    }
  }

  dispatchEvent = async (name: string, ...args: unknown[]): Promise<void> => {
    if (!this?.eventListeners?.[name]) { 
      return undefined 
    }
    for (const func of this.eventListeners[name]) {
      await func(...args)
    }
  }

  loadPlugins = (returnPack?: unknown[]): Record<string, unknown> | undefined => {
    const { plugins } = this
    if (!plugins) { 
      return undefined 
    }

    return Object.keys(plugins)?.reduce((obj, key) => {
      let cb = plugins[key]
      cb = cb instanceof Function ? cb(returnPack) : cb
      obj[key] = cb
      return obj
    }, {} as Record<string, unknown>)
  }

  setFromGetter = async (...args: unknown[]): Promise<T | undefined> => {
    if (!this.opts?.getter) { 
      return undefined 
    }
    if (this.opts?.disableGetterOnLoading && this.loading) { 
      return Promise.resolve(this.value) 
    }
    
    this.load(true)
    this.dispatchEvent('getting', ...args)

    const getterValue = await Promise.resolve(
      typeof this.opts.getter === 'function'
        ? this.opts.getter(this, ...args)
        : this.opts.getter
    )
    
    this.dispatchEvent('getted', getterValue, ...args)
    if (getterValue) {
      this.set(getterValue as T, {
        force: true,
        disableSetter: this.opts?.disableSetterOnGetter || true
      })
    }
    this.load(false)
    return getterValue
  }

  update = this.setFromGetter

  listen = (
    state: ReactState<T>,
    loadingState: ReactState<boolean>,
    args: StorkenArgs
  ): (() => void) => {
    const [value, listener] = state
    const [loading, loadingListener] = loadingState

    if (this.listeners.indexOf(listener) === -1) {
      this.listeners.push(listener)
    }

    if (this.loadingListeners.indexOf(loadingListener) === -1) {
      this.loadingListeners.push(loadingListener)
    }

    if (value !== this.value) {
      listener(this.value)
    }
    if (loading !== this.loading) {
      loadingListener(this.loading || false)
    }

    if (
      (!this.opts?.disableAutoGetter && !this.getted) ||
      !this.opts?.getOnlyOnMount
    ) {
      this.setFromGetter(...args)
    }

    this.dispatchEvent('effect', { state, loading: loadingState, args })

    const stork = this
    return () => {
      delete stork.listeners?.[stork.listeners.indexOf(listener)]
      delete stork.loadingListeners?.[
        stork.loadingListeners.indexOf(loadingListener)
      ]
      stork.listeners = stork.listeners.filter(Boolean)
      stork.loadingListeners = stork.loadingListeners.filter(Boolean)
      if (stork.opts?.getOnce && !stork.getted) {
        stork.getted = true
      }
      stork.dispatchEvent('unmounted')
    }
  }

  updateListeners = (val: T): void => {
    for (const listener of this.listeners) {
      if (listener) {
        listener(val)
      }
    }
  }

  updateLoadingListeners = (val: boolean): void => {
    for (const listener of this.loadingListeners) {
      if (listener) {
        listener(val)
      }
    }
  }

  set = async (
    newValue: T | ((prev: T) => T),
    opts: { disableSetter?: boolean; force?: boolean } = {}
  ): Promise<void> => {
    this.dispatchEvent('willSet', newValue, opts)
    
    const val = newValue instanceof Function
      ? await Promise.resolve(newValue(this.value))
      : newValue

    if (this.value === val && !opts?.force) {
      return
    }

    const setRoot = (value: T) => {
      this.value = value
      this.updateListeners(value)
      this.dispatchEvent('set', value, this?.args, opts)
    }

    if (typeof this.opts?.setter === 'function' && !opts?.disableSetter) {
      this.load(true)
      Promise.resolve(
        this.opts.setter(this, val, ...(this?.args || []))
      ).then((result: any) => {
        setRoot(this.opts?.setWithSetter ? (result as T) : val)
        this.load(false)
      })
    } else {
      setRoot(val)
    }
  }

  load = async (loadingState: boolean | null): Promise<boolean> => {
    this.loading = loadingState || false
    this.dispatchEvent('loading', this.loading)
    this.updateLoadingListeners(this.loading)
    return this.loading
  }

  reset = (): Promise<void> => {
    return this.set(this.opts?.initialValue as T, { force: true })
  }
}

export class Sky implements ISky {
  readonly bundles: Record<StorkenKey, IStorken<any>> = {}
  readonly config: StorkenConfig

  constructor(config: StorkenConfig = {}) {
    this.config = config
  }

  create = <T = any>(key: StorkenKey, ...args: StorkenArgs): IStorken<T> => {
    this.bundles[key] = new Storken<T>({
      key: key,
      args,
      plugins: this.config?.plugins,
      getter: this.config?.getters?.[key] as any,
      setter: this.config?.setters?.[key] as any,
      ...(this.config?.options || {}),
      ...(this.config?.storkenOptions?.[key] || {}),
      initialValue: this.config?.initialValues && Object.keys(this.config?.initialValues).includes(key as string)
        ? (this.config?.initialValues?.[key] as T)
        : (this.config?.options?.initialValue as T)
    }, this)

    return this.bundles[key] as IStorken<T>
  }

  get = <T = any>(key: StorkenKey, args?: StorkenArgs, obj?: boolean): T | IStorken<T> => {
    if (!this.bundles?.[key]) {
      this.create<T>(key, args)
    } else if (args) {
      this.bundles[key].args = args
    }

    return obj ? (this.bundles[key] as IStorken<T>) : (this.bundles[key].value as T)
  }

  getStorken = <T = any>(key: StorkenKey, ...args: StorkenArgs): IStorken<T> => {
    return this.get<T>(key, args, true) as IStorken<T>
  }

  getPlugin = <T = any>(key: StorkenKey, plugin: StorkenKey): unknown => {
    const stork = this.get<T>(key, undefined, true) as IStorken<T>
    return plugin ? stork.plugins?.[plugin as string] : stork.plugins
  }

  set = <T = any>(key: StorkenKey, value: T, ...args: StorkenArgs): void => {
    if (!this.bundles?.[key]) {
      this.create<T>(key, ...args)
    } else if (args) {
      this.bundles[key].args = args
    }

    this.bundles[key].set(value)
  }

  remove = async (key: StorkenKey, reset: boolean = true): Promise<void> => {
    if (!this.bundles?.[key]) {
      return
    }
    if (reset) {
      await this.bundles[key].reset()
    }
    delete this.bundles[key]
  }

  multiRemove = async (...keys: StorkenKey[]): Promise<void> => {
    for (const key of keys) {
      await this.remove(key)
    }
  }

  destroy = async (key: StorkenKey, value: unknown): Promise<void> => {
    if (!this.bundles?.[key]) {
      return
    }
    this.bundles[key].set(value)
    await this.remove(key)
  }

  multiDestroy = async (...keyValPairs: Array<{ key: StorkenKey; value: unknown }>): Promise<void> => {
    for (const pair of keyValPairs) {
      await this.destroy(pair?.key, pair?.value)
    }
  }

  restore = (dump: Record<StorkenKey, unknown>): void => {
    if (!dump) return
    for (const key in dump) {
      Object.assign(this.config, {
        ...this.config,
        initialValues: {
          ...(this.config?.initialValues || {}),
          [key]: dump[key]
        }
      })
      this.bundles[key] = this.create(key)
    }
  }

  dump = (): Record<StorkenKey, unknown> => {
    return Object.assign({}, this.bundles)
  }
}

export const create = (storkenConfig: StorkenConfig = {}): CreateReturn => {
  const Heaven = new Sky(storkenConfig)
  const useStorken = createHook(Heaven)
  return [useStorken, Heaven.get, Heaven.set, Heaven] as const
}

export default create