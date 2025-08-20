import { Dispatch, SetStateAction } from 'react'

// Core types
export type StorkenKey = string | symbol
export type StorkenArgs = unknown[]

// Plugin system types
export type StorkenPlugin<T = any> = (
  storken: IStorken<T>,
  ...config: unknown[]
) => unknown

export type StorkenPlugins = {
  [key: string]: StorkenPlugin | [StorkenPlugin, ...unknown[]]
}

// Getter and Setter types
export type StorkenGetter<T = any> = (
  storken: IStorken<T>,
  ...args: unknown[]
) => T | Promise<T>

export type StorkenSetter<T = any> = (
  storken: IStorken<T>,
  value: T,
  ...args: unknown[]
) => void | Promise<void> | T | Promise<T>

export type StorkenGetters = {
  [key: StorkenKey]: StorkenGetter
}

export type StorkenSetters = {
  [key: StorkenKey]: StorkenSetter
}

// Configuration types
export interface StorkenOptions<T = any> {
  key: StorkenKey
  args?: StorkenArgs
  plugins?: StorkenPlugins
  initialValue?: T
  namespace?: string
  getter?: StorkenGetter<T>
  setter?: StorkenSetter<T>
  disableGetterOnLoading?: boolean
  disableSetterOnGetter?: boolean
  disableAutoGetter?: boolean
  getOnce?: boolean
  setWithSetter?: boolean
  loading?: boolean
  getOnlyOnMount?: boolean
}

export interface StorkenConfig<T = unknown> {
  plugins?: StorkenPlugins
  getters?: StorkenGetters
  setters?: StorkenSetters
  options?: Partial<StorkenOptions<T>>
  storkenOptions?: {
    [key: StorkenKey]: Partial<StorkenOptions<T>>
  }
  initialValues?: {
    [key: StorkenKey]: T
  }
}

// Hook return types
export type StorkenHookReturn<T = unknown> = [
  value: T,
  setValue: (value: T | ((prev: T) => T), options?: { disableSetter?: boolean; force?: boolean }) => Promise<void>,
  reset: () => Promise<void>,
  loading: boolean,
  update: (...args: unknown[]) => Promise<T | undefined>,
  plugins?: Record<string, unknown>
] & {
  value: T
  set: (value: T | ((prev: T) => T), options?: { disableSetter?: boolean; force?: boolean }) => Promise<void>
  reset: () => Promise<void>
  loading: boolean
  update: (...args: unknown[]) => Promise<T | undefined>
  plugins?: Record<string, unknown>
}

// React state types
export type ReactState<T> = [T, Dispatch<SetStateAction<T>>]

// Event system types
export type StorkenEventListener = (...args: unknown[]) => void | Promise<void>
export type StorkenEventListeners = {
  [eventName: string]: StorkenEventListener[]
}

// Class interfaces
export interface IStorken<T = unknown> {
  id: number
  key: StorkenKey
  opts: StorkenOptions<T>
  args: StorkenArgs
  value: T
  Store: ISky
  namespace: string
  listeners: Dispatch<SetStateAction<T>>[]
  loadingListeners: Dispatch<SetStateAction<boolean>>[]
  eventListeners?: StorkenEventListeners
  plugins?: Record<string, unknown>
  loading?: boolean
  getted?: boolean

  on(name: string, func: StorkenEventListener): void
  dispatchEvent(name: string, ...args: unknown[]): Promise<void>
  loadPlugins(returnPack: unknown[]): Record<string, unknown> | undefined
  setFromGetter(...args: unknown[]): Promise<T | undefined>
  update(...args: unknown[]): Promise<T | undefined>
  set(value: T | ((prev: T) => T), options?: { disableSetter?: boolean; force?: boolean }): Promise<void>
  reset(): Promise<void>
  listen(
    state: ReactState<T>,
    loadingState: ReactState<boolean>,
    args: StorkenArgs
  ): () => void
  updateListeners(value: T): void
  updateLoadingListeners(loading: boolean): void
  load(loading: boolean): Promise<boolean>
}

export interface ISky {
  bundles: Record<StorkenKey, IStorken<any>>
  config: StorkenConfig

  create<T = any>(key: StorkenKey, ...args: StorkenArgs): IStorken<T>
  get<T = any>(key: StorkenKey, args?: StorkenArgs, obj?: boolean): T | IStorken<T>
  getStorken<T = any>(key: StorkenKey, ...args: StorkenArgs): IStorken<T>
  getPlugin<T = any>(key: StorkenKey, plugin: StorkenKey): unknown
  set<T = any>(key: StorkenKey, value: T, ...args: StorkenArgs): void
  remove(key: StorkenKey, reset?: boolean): Promise<void>
  multiRemove(...keys: StorkenKey[]): Promise<void>
  destroy(key: StorkenKey, value: unknown): Promise<void>
  multiDestroy(...keyValPairs: Array<{ key: StorkenKey; value: unknown }>): Promise<void>
  restore(dump: Record<StorkenKey, unknown>): void
  dump(): Record<StorkenKey, unknown>
}

// Create function return type
export type CreateReturn = readonly [
  useStorken: <T = unknown>(key: StorkenKey, ...args: StorkenArgs) => StorkenHookReturn<T>,
  get: <T = any>(key: StorkenKey, args?: StorkenArgs, obj?: boolean) => T | IStorken<T>,
  set: <T = any>(key: StorkenKey, value: T, ...args: StorkenArgs) => void,
  Sky: ISky
]

// Re-export for backward compatibility
export type TPlugin = StorkenPlugin
export type TKey = StorkenKey
export type TUseStorken = (key: StorkenKey, ...args: StorkenArgs) => StorkenHookReturn