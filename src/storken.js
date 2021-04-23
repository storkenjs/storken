import { createHook } from './useStorken'

export class Storken {
  constructor ({ key, args, plugins, ...opts }, Sky) {
    this.id = Date.now()
    this.key = key
    this.opts = opts
    this.args = [...args]
    this.value = opts?.initialValue
    this.Store = Sky
    this.namespace = opts?.namespace || 'storken::'

    this.listeners = []
    this.loadingListeners = []

    if (plugins instanceof Object) {
      this.plugins = Object.keys(plugins).reduce((obj, key) => {
        const [plugin, ...config] = Array.isArray(plugins[key])
          ? plugins[key]
          : [plugins[key]]

        obj[key] = plugin(this, ...config)
        return obj
      }, {})
    }
  }

  addEventListener = (name, func) => {
    if (!this?.eventListeners) {
      this.eventListeners = {}
    }

    if (this?.eventListeners?.[name]) {
      this.eventListeners[name].push(func)
    } else {
      this.eventListeners[name] = [func]
    }
  }

  dispatchEvent = async (name, ...args) => {
    if (!this?.eventListeners?.[name]) { return undefined }
    for (const func of this.eventListeners[name]) {
      await func(...args)
    }
  }

  loadPlugins = (returnPack) => {
    const { plugins } = this
    if (!plugins) { return }

    return Object.keys(plugins)?.reduce((obj, key) => {
      let cb = plugins[key]
      if (cb instanceof Function) {
        cb = cb(returnPack)
      }

      obj[key] = cb
      return obj
    }, {})
  }

  setFromGetter = (...args) => {
    if (!this.opts?.getter) { return }
    this.load(true)
    this.dispatchEvent('getting', ...args)

    return Promise.resolve(
      typeof this.opts.getter === 'function'
        ? this.opts.getter(this, ...args)
        : this.opts.getter
    )
      .then(getterValue => {
        this.dispatchEvent('getted', getterValue, ...args)
        if (getterValue) {
          this.set(getterValue, { force: true, disableSetter: this.opts?.disableSetterOnGetter || true })
        }
        this.load(false)
        return getterValue
      })
  }

  update = this.setFromGetter

  listen = (state, loadingState, args) => {
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

    if (!this.getted || !this.opts?.disableAutoGetter) {
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

  updateListeners = (val, loading) => {
    for (const listener of this[loading ? 'loadingListeners' : 'listeners']) {
      if (listener) {
        listener(val)
      }
    }
  }

  set = async (newValue, opts = {}) => {
    this.dispatchEvent('willSet', newValue, opts)
    const val = newValue instanceof Function
      ? await Promise.resolve(newValue(this.value))
      : newValue

    if (this.value === val && !opts?.force) { return }

    this.value = val

    this.updateListeners(val)
    this.dispatchEvent('set', this.value, this?.args, opts)

    if (typeof this.opts?.setter === 'function' && !opts?.disableSetter) {
      this.load(null)
      Promise.resolve(
        typeof this.opts.setter === 'function'
          ? typeof this.opts.setter?.then === 'function'
            ? await this.opts.setter(this, ...this?.args)
            : this.opts.setter(this, ...this?.args)
          : this.opts.setter
      )
        .then(() => { this.load(false) })
    }
  }

  load = async (loadingState) => {
    this.loading = loadingState
    this.dispatchEvent('loading', this.loading)

    this.updateListeners(loadingState, true)

    return this.loading
  }

  reset = () => {
    return this.set(this.opts?.initialValue, { force: true })
  }
}

export class Sky {
  constructor (config) {
    this.bundles = {}
    this.config = config
  }

  create = (key, ...args) => {
    this.bundles[key] = new Storken({
      key: key,
      args,
      plugins: this.config?.plugins,
      getter: this.config?.getters?.[key],
      setter: this.config?.setters?.[key],
      ...(this.config?.options || {}),
      ...(this.config?.storkenOptions?.[key] || {}),
      initialValue: this.config?.initialValues && Object.keys(this.config?.initialValues).includes(key)
        ? this.config?.initialValues?.[key]
        : this.config?.options?.initialValue
    }, this)

    return this.bundles[key]
  }

  get = (key, args, obj) => {
    if (!this.bundles?.[key]) {
      this.create(key, args)
    } else if (args) {
      this.bundles[key].args = args
    }

    return obj ? this.bundles[key] : this.bundles[key].value
  }

  getStorken = (key, ...args) => this.get(key, args, true)

  getPlugin = (key, plugin) => {
    const stork = this.get(key, null, true)

    if (plugin) {
      return stork.plugins[plugin]
    }

    return stork.plugins
  }

  set = (key, value, ...args) => {
    if (!this.bundles?.[key]) {
      this.create(key, ...args)
    } else if (args) {
      this.bundles[key].args = args
    }

    return this.bundles[key].set(value)
  }

  remove = async (key, reset = true) => {
    if (!this.bundles?.[key]) { return }
    if (reset) {
      await this.bundles[key].reset()
    }
    delete this.bundles[key]
  }

  multiRemove = async (...keys) => {
    for (const keyIndex in keys) {
      const key = keys[keyIndex]
      await this.remove(key)
    }
  }

  destroy = async (key, val) => {
    if (!this.bundles?.[key]) { return }
    this.bundles[key].set(val)
    await this.remove(key)
  }

  multiDestroy = async (...keyValPairs) => {
    for (const pairIndex in keyValPairs) {
      const pair = keyValPairs[pairIndex]
      await this.destroy(pair?.key || pair?.[0], pair?.value || pair?.[1])
    }
  }

  restore = (dump) => {
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

export const create = (storkenConfig) => {
  const Heaven = new Sky(storkenConfig)

  const useStorken = createHook(Heaven)
  return [useStorken, Heaven.get, Heaven.set, Heaven]
}

export default create
