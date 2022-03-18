import { Dispatch, SetStateAction } from 'react'
import { createHooks } from './useStorken'

export type TPlugin = <TReturn, ConfigType>(storken: typeof Storken, ...config: ConfigType[]) => TReturn
export type TKey = symbol | string
type StorkenParameters<T extends (...args: any) => any> = T extends (stork: typeof Storken, ...args: infer P) => any ? P : never
export type TReactState<S> = [S, Dispatch<SetStateAction<S>>]
export type TLoadingSet = (boolean | ((prevState: boolean | null | undefined) => boolean | null | undefined) | null)
export type TSet<TValue> = ((TValue | ((prevState: TValue) => TValue)) & TLoadingSet) | undefined
export type TLoading = boolean | null | undefined
export type TUseStorken = <TStorkenValue = undefined>(key: string, ...args: TStorkArgs[]) => [
  value: TStorkenValue,
  set: Dispatch<SetStateAction<TStorkenValue>>,
  reset: () => void,
  loading: TLoading,
  update: (...args: TStorkArgs[]) => ReturnType<TGetter> | PromiseLike<ReturnType<TGetter>>,
  plugins?: { [key: TKey]: ReturnType<TPlugin> }
]

export interface IPlugins {
  [name: TKey]: [TPlugin, Exclude<Parameters<TPlugin>, typeof Storken>]
}

export interface IOptions {
  args?: StorkenParameters<TGetter> | StorkenParameters<TSetter>,
  getter?: TGetter,
  setter?: TSetter,
  plugins?: IPlugins,
  initialValue?: unknown,
  namespace?: string,
  disableGetterOnLoading?: boolean,
  disableSetterOnGetter?: boolean,
  disableAutoGetter?: boolean,
  getOnce?: boolean,
  setWithSetter?: boolean,
  loading?: boolean,
  getOnlyOnMount?: boolean
  [extraPluginOption: TKey]: any
}

export type TStorkArgs = StorkenParameters<TGetter> | StorkenParameters<TSetter> | Array<[]> | undefined

export type TEventFunction = (<TReturn, TArgs>(...args: TArgs[]) => TReturn)

export type TSetOptions = {
  disableSetter?: boolean,
  force?: boolean
}

export class Storken<TValue> {
  readonly id: number
  readonly key: TKey
  args: TStorkArgs
  opts: IOptions
  value: TValue
  Store: Sky
  plugins: IPlugins
  namespace: string = 'storken::'
  listeners: Dispatch<SetStateAction<TValue>>[] = []
  loadingListeners: Dispatch<SetStateAction<boolean | null | undefined>>[] = []
  eventListeners: {
    [event: string]: TEventFunction[]
  } = {}

  loading?: boolean | null
  getted: boolean

  constructor(options: IOptions, Sky: Sky) {
    const { key, args, plugins, ...opts } = options
    this.id = Date.now()
    this.key = key
    this.args = args
    this.opts = options
    this.value = opts?.initialValue as TValue
    this.Store = Sky
    if (opts?.namespace) {
      this.namespace = opts.namespace
    }

    if (plugins) {
      this.plugins = (Object.keys(plugins) as Array<keyof typeof plugins>).reduce((obj, key) => {
        const plugin = plugins[key]
        const [entrypoint, ...config] = Array.isArray(plugin)
          ? plugin
          : [plugin]

        obj[key] = entrypoint(this as unknown as typeof Storken, ...config)
        return obj
      }, <IPlugins>{})
    }
  }

  on = (name: string, func: TEventFunction): void => {
    if (this?.eventListeners?.[name]) {
      this.eventListeners[name].push(<TEventFunction>func)
    } else {
      this.eventListeners[name] = [<TEventFunction>func]
    }
  }

  dispatchEvent = async <T>(name: string, ...args: T[]): Promise<void> => {
    if (!this.eventListeners?.[name]) { return undefined }
    for (const func of this.eventListeners[name]) {
      await func(...args)
    }
  }

  loadPlugins = (returnPack: [
    value: typeof this.value,
    set: typeof this.set,
    reset: typeof this.reset,
    loading: typeof this.loading,
    update: typeof this.update,
    plugins?: { [key: string]: ReturnType<TPlugin> }
  ]) => {
    const { plugins } = this
    if (!plugins) { return }

    return (Object.keys(plugins) as Array<keyof typeof plugins>)?.reduce((obj, key) => {
      let entrypoint = plugins[key]
      entrypoint = entrypoint instanceof Function ? entrypoint(returnPack) : entrypoint

      obj[key as string] = entrypoint
      return obj
    }, <{ [key: string]: ReturnType<TPlugin> }>{})
  }

  listen = (state: TReactState<TValue>, loadingState: TReactState<boolean | null | undefined>, args: TStorkArgs[]) => {
    const [value, listener] = state
    const [loading, loadingListener] = loadingState

    if (this.listeners.indexOf(listener) === -1) {
      this.listeners.push(listener)
    }

    if (this.loadingListeners.indexOf(loadingListener) === -1) {
      this.loadingListeners.push(loadingListener)
    }

    if (value !== this.value) { listener(this.value) }
    if (loading !== this.loading) { loadingListener(this.loading) }

    if ((!this.opts?.disableAutoGetter && !this.getted) || !this.opts?.getOnlyOnMount) {
      this.setFromGetter(...args)
    }

    this.dispatchEvent('effect', { state, loading: loadingState, args })

    const stork = this
    return () => {
      delete stork.listeners?.[stork.listeners.indexOf(listener)]
      delete stork.loadingListeners?.[stork.loadingListeners.indexOf(loadingListener)]
      stork.listeners = stork.listeners.filter(Boolean)
      stork.loadingListeners = stork.loadingListeners.filter(Boolean)
      if (stork.opts?.getOnce && !stork.getted) {
        stork.getted = true
      }
      stork.dispatchEvent('unmounted')
    }
  }

  updateListeners = (val: TValue): void => {
    for (const listener of this.listeners) {
      if (listener) {
        listener(val)
      }
    }
  }

  updateLoadingListeners = (val: TLoading): void => {
    for (const listener of this.loadingListeners) {
      if (listener) {
        listener(val)
      }
    }
  }

  load = async (loadingState: boolean | null) => {
    this.loading = loadingState
    this.dispatchEvent('loading', this.loading)

    this.updateLoadingListeners(loadingState)

    return this.loading
  }

  setFromGetter = async (...args: TStorkArgs[]) => {
    if (!this.opts?.getter) { return }
    if (this.opts?.disableGetterOnLoading && this.loading) { return Promise.resolve(this.value) }
    this.load(true)
    this.dispatchEvent('getting', ...args)

    const getterValue: ReturnType<TGetter> = await Promise.resolve(
      typeof this.opts.getter === 'function'
        ? this.opts.getter(this, ...args)
        : this.opts.getter
    )
    this.dispatchEvent('getted', getterValue, ...args)
    if (getterValue) {
      this.set(getterValue as TValue, {
        force: true,
        disableSetter: this.opts?.disableSetterOnGetter || true
      })
    }
    this.load(false)
    return getterValue
  }

  update = this.setFromGetter

  set = async (newValue: TValue | unknown, opts: TSetOptions = {}) => {
    this.dispatchEvent<typeof newValue | typeof opts>('willSet', newValue, opts)
    const val = newValue instanceof Function
      ? await Promise.resolve(newValue(this.value))
      : newValue

    if (this.value === val && !opts?.force) { return }

    const setRoot = (value: TValue) => {
      this.value = value
      this.updateListeners(value)
      this.dispatchEvent<TValue | TStorkArgs | typeof opts>('set', value, this?.args, opts)
    }

    if (typeof this.opts?.setter === 'function' && !opts?.disableSetter) {
      this.load(null)
      Promise.resolve(
        this.opts.setter<TValue, ReturnType<TSetter>, TStorkArgs>(
          this,
          val,
          ...this?.args as TStorkArgs[]
        )
      )
        .then((result) => {
          setRoot(this.opts?.setWithSetter ? result : val)
          this.load(false)
        })
    } else {
      setRoot(val)
    }
  }

  reset = () => {
    return this.set(this.opts?.initialValue, { force: true })
  }
}

export type TGetter = <TValue, TGetterReturn, TGetterArg = undefined>(stork: Storken<TValue>, ...args: TGetterArg[]) => TGetterReturn | PromiseLike<TGetterArg>

export interface IGetters {
  [key: TKey]: TGetter
}

export type TSetter = <TValue, TSetterReturn, TSetterArg = undefined>(stork: Storken<TValue>, ...args: TSetterArg[]) => TSetterReturn | PromiseLike<TSetterReturn>

export interface ISetters {
  [key: TKey]: TSetter
}

export interface IConfiguration {
  plugins?: IPlugins,
  getters?: IGetters,
  setters?: ISetters,
  options?: IOptions,
  storkenOptions?: {
    [key: TKey]: IOptions
  },
  initialValues?: {
    [key: TKey]: unknown
  }
}

class Sky {
  readonly bundles: {}
  readonly config: IConfiguration

  constructor(config: IConfiguration) {
    this.bundles = {}
    this.config = config
  }

  create = <TStorkenValue, TStorkenArgs = undefined>(key: string, ...args: TStorkenArgs[]): Storken<TStorkenValue> => {
    const config = Object.assign({
      key,
      args,
      plugins: this.config?.plugins,
      getter: this.config?.getters?.[key],
      setter: this.config?.setters?.[key],
      initialValue: this.config?.initialValues && Object.keys(this.config?.initialValues).includes(key)
        ? this.config?.initialValues?.[key]
        : this.config?.options?.initialValue
    },
      this.config?.options || {},
      this.config.storkenOptions?.[key] || {}
    )
    this.bundles[key] = new Storken<TStorkenValue>(config as IOptions, this) as Storken<TStorkenValue>

    return this.bundles[key] as Storken<TStorkenValue>
  }

  get = <TStorkenValue>(key: string, args: TStorkArgs[] | undefined, obj: boolean) => {
    if (!this.bundles?.[key]) {
      this.create<TStorkenValue, TStorkArgs[] | undefined>(key, args)
    } else if (args) {
      this.bundles[key].args = args as TStorkArgs
    }

    return obj ? this.bundles[key] : this.bundles[key].value
  }

  getStorken = <TStorkenValue>(key: string, ...args: []): Storken<TStorkenValue | unknown> => this.get(key, args, true) as Storken<unknown>

  getPlugin = <TStorkenValue>(key: string, plugin: TKey) => {
    const stork = this.get(key, undefined, true) as Storken<TStorkenValue | unknown>

    if (plugin) {
      return stork?.plugins[plugin]
    }

    return stork?.plugins
  }

  set = <TStorkenValue>(key: string, value: TStorkenValue, ...args: TStorkArgs[]): void => {
    let bundle = this.bundles?.[key]
    if (!bundle) {
      this.create<TStorkenValue, TStorkArgs[] | undefined>(key, ...args)
      bundle = this.bundles[key]
    } else if (args) {
      this.bundles[key].args = args as TStorkArgs
    }

    return this.bundles[key].set(value as typeof bundle.value)
  }

  remove = async (key: string, reset: boolean = true) => {
    if (!this.bundles?.[key]) { return }
    if (reset) {
      await this.bundles[key].reset()
    }
    delete this.bundles[key]
  }

  multiRemove = async (...keys: []) => {
    for (const keyIndex in keys) {
      const key = keys[keyIndex]
      await this.remove(key)
    }
  }

  destroy = async (key: string, val: any) => {
    if (!this.bundles?.[key]) { return }
    this.bundles[key].set(val)
    await this.remove(key)
  }

  multiDestroy = async (...keyValPairs: [{
    [key: string]: any
  }]) => {
    for (const pairIndex in keyValPairs) {
      const pair = keyValPairs[pairIndex]
      await this.destroy(pair?.key || pair?.[0], pair?.value || pair?.[1])
    }
  }

  restore = (dump: any) => {
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

  dump = () => {
    const dump = Object.assign({}, this.bundles)
    return dump
  }
}

export type THooks = {
  useStorken: TUseStorken,
  useLoading: (key: string) => TLoading,
  useUpdate: (key: string) => ReturnType<TGetter>,
  usePlugin: (key: string, plugin?: string) => ReturnType<TPlugin>
}

export type TCreatedStorken = THooks & {
  Storken: Sky
}

export const createStorken = (storkenConfig: IConfiguration): TCreatedStorken => {
  const Heaven: Sky = new Sky(storkenConfig)

  const hooks: THooks = createHooks(Heaven)
  return {
    ...hooks as THooks,
    Storken: Heaven as Sky
  }
}

export default Sky
