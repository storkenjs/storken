import { createHook } from './useStorken'

export class Storken {
  /**
   * Prepare a Storken object for a state
   * @param {object} opts - Contain configurations regarding a state.
   * @param {string} opts.key - Name of the state that can be found in the bundle.
   * @param {mixed} [opts.args] - Arguments for getter & setter callbacks of the state.
   * @param {array} [opts.plugins] - Plugins which will be implemented for the Storken.
   * @param {*} [opts.initialValue] - Default value of the state.
   * @param {string} [opts.namespace] - Prefix for the key.
   * @param {function<Promise|func>} [opts.getter] - Getter function which will be called to set value of the state.
   * @param {function<Promise|func>} [opts.setter] - Setter function which will be called when a value setted to the state.
   * @param {boolean} [opts.disableGetterOnLoading] - Getter function doesn't call when loading is true.
   * @param {boolean} [opts.disableSetterOnGetter] - Setter function doesn't call when the value setted by the getter function.
   * @param {boolean} [opts.disableAutoGetter] - Disables automatically calling of the getter function when component mounted.
   * @param {boolean} [opts.getOnce] - The getter function called only once when componented mounted and not called for every state change.
   * @param {boolean} [opts.loading] - Default loading value. Loading value is false by default. Need it to be true sometimes.
   * @param {Sky} Sky - Object where keep the Storken and other Storken objects as a bundle.
   * @constructor
   */
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

  /**
   * Adds listener for the state events. Often used by plugins.
   * @param {string} name - Listener name that will be triggered.
   * @param {function} func - Function to call when triggered.
   */
  on = (name, func) => {
    if (!this?.eventListeners) {
      this.eventListeners = {}
    }

    if (this?.eventListeners?.[name]) {
      this.eventListeners[name].push(func)
    } else {
      this.eventListeners[name] = [func]
    }
  }

  /**
   * Trigger listener's callback
   * @param {string} name - Listener name
   * @param {...*} args - [...] Arguments for listener's callback.
  */
  dispatchEvent = async (name, ...args) => {
    if (!this?.eventListeners?.[name]) { return undefined }
    for (const func of this.eventListeners[name]) {
      await func(...args)
    }
  }

  /**
   * Calls functions of the plugins which passed to the Storken
   * @param {object} returnPack - hook's default return value
   * @returns {*...} provides by plugins and pushes to hook's return value in useStorken
   */
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

  /**
   * Sets the value by calling the getter function.
   * @param {...*} args - arguments for the getter function.
   * @returns {Promise*} Output of the getter function.
   */
  setFromGetter = (...args) => {
    if (!this.opts?.getter) { return }
    if (this.opts?.disableGetterOnLoading && this.loading) { return Promise.resolve(this.value) }
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

  /**
   * Alias for `setFromGetter`
   */
  update = this.setFromGetter

  /**
   * Function for state changes. Organize state's value and its loading states.
   * @param {array} state - return value of a `useState`
   * @param {boolean} loadingState - return value of a `useState`
   * @param {...*} args - arguments for getter function
   * @returns function which used on unmounted the component.
   */
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

    if (!this.opts?.disableAutoGetter && !this.getted) {
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

  /**
   * Updates all listener values.
   * @param {*} val - value of the state
   * @param {boolean} loading - loading value of the state
   */
  updateListeners = (val, loading) => {
    for (const listener of this[loading ? 'loadingListeners' : 'listeners']) {
      if (listener) {
        listener(val)
      }
    }
  }

  /**
   * Sets value of the Storken.
   * @param {*} newValue - new value of the Storken.
   * @param {object} [opts] - setting options object
   * @param {boolean} [opts.force] - If newValue is the same of the current value then does nothing by default. This opt is override it when true.
   */
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

  /**
   * Changes loading value of the Storken.
   * @param {boolean} loadingState - current loading value of the Storken
   */
  load = async (loadingState) => {
    this.loading = loadingState
    this.dispatchEvent('loading', this.loading)

    this.updateListeners(loadingState, true)

    return this.loading
  }

  /**
   Resets value to initialValue.
   */
  reset = () => {
    return this.set(this.opts?.initialValue, { force: true })
  }
}

export class Sky {
  /**
    * Sky object is like an orchestrator wrapper and a tool that can create and contain Storkens.
    @param {object} config - Configurations for Storkens created by this Sky object. Collectively define by key.
    @constructor
   */
  constructor (config) {
    this.bundles = {}
    this.config = config
  }

  /**
   * Creates a Storken in the bundle.
   * @param {string} key - name of the Storken which will be created
   * @param {*} [args] - arguments for getter & setter functions
   * @returns Storken
   */
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

  /**
   * Gets value of a Storken by key.
   * @param {string} key - Key of the Storken
   * @param {array*} args - Arguments of the Storken
   * @param {boolean} obj - Get as an Storken object instead of the value.
   * @returns value or Storken object
   */
  get = (key, args, obj) => {
    if (!this.bundles?.[key]) {
      this.create(key, args)
    } else if (args) {
      this.bundles[key].args = args
    }

    return obj ? this.bundles[key] : this.bundles[key].value
  }

  /**
    * Gets Storken object by key from the bundle.
    @param {string} key - Key of the Storken
    @param {array*} args - Arguments for the Storken's getter&setter functions.
    @returns Storken object
  */
  getStorken = (key, ...args) => this.get(key, args, true)

  /**
    * Gets a plugin's return values by their keys.
    @param {string} key - Key of the Storken
    @param {string} plugin - Key (name) of the Storken's plugin
    @returns Plugin's return values.
   */
  getPlugin = (key, plugin) => {
    const stork = this.get(key, null, true)

    if (plugin) {
      return stork.plugins[plugin]
    }

    return stork.plugins
  }

  /**
    * Sets value of a Storken object by key.
    @param {string} key - Key of the Storken
    @param {*} value - Value of the Storken
    @param {...*} args - Arguments for the Storken's getter&setter functions.
  */
  set = (key, value, ...args) => {
    if (!this.bundles?.[key]) {
      this.create(key, ...args)
    } else if (args) {
      this.bundles[key].args = args
    }

    return this.bundles[key].set(value)
  }

  /**
   * Removes Storken object from this Sky object and resets the Storken's value optionally.
   * @param {string} key - Key of the Storken
   * @param {boolean} reset - Optionality of reset. True by default.
   */
  remove = async (key, reset = true) => {
    if (!this.bundles?.[key]) { return }
    if (reset) {
      await this.bundles[key].reset()
    }
    delete this.bundles[key]
  }

  /**
   * Removes Storken objects multiple.
   * @param {...string} keys - Keys of Storkens
   */
  multiRemove = async (...keys) => {
    for (const keyIndex in keys) {
      const key = keys[keyIndex]
      await this.remove(key)
    }
  }

  /**
   * Like reset but just sets the specified value before remove.
   * @param {string} key - Key of the Storken
   * @param {*} val - Value which will be sets before remove.
   */
  destroy = async (key, val) => {
    if (!this.bundles?.[key]) { return }
    this.bundles[key].set(val)
    await this.remove(key)
  }

  /**
   * Destroys Storken objects multiple.
   * @param {...array|object} keyValPairs - Key-Value pairs as an object or array
   */
  multiDestroy = async (...keyValPairs) => {
    for (const pairIndex in keyValPairs) {
      const pair = keyValPairs[pairIndex]
      await this.destroy(pair?.key || pair?.[0], pair?.value || pair?.[1])
    }
  }

  /**
   * Creates Storkens declared in object with its value. [Often used in SSR apps.]
   * @param {object} dump - {key: value}
   */
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

  /**
   @returns a clone of this.bundles
   */
  dump = () => {
    const dump = Object.assign({}, this.bundles)
    return dump
  }
}

/**
 * Creates a Sky object and a hook to create and use Storkens
 * @param storkenConfig - Sky constructor config object
 * @returns an array contain hook, get-set and Sky object.
 */
export const create = (storkenConfig) => {
  const Heaven = new Sky(storkenConfig)

  const useStorken = createHook(Heaven)
  return [useStorken, Heaven.get, Heaven.set, Heaven]
}

export default create
