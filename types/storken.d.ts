export class Storken {
    /**
     *
     * @param {Object} options
     * @param {string} options.key
     * @param {any[]} options.args
     * @param {any[]} options.plugins
     * @param {string=} options.namespace
     * @param {string=} options.initialValue
     *
     * @param {*} Sky
     */
    constructor({ key, args, plugins, ...opts }: {
        key: string;
        args: any[];
        plugins: any[];
        namespace?: string | undefined;
        initialValue?: string | undefined;
    }, Sky: any);
    id: number;
    key: string;
    opts: {
        namespace?: string | undefined;
        initialValue?: string | undefined;
    };
    args: any[];
    value: string;
    Store: any;
    namespace: string;
    listeners: any[];
    loadingListeners: any[];
    plugins: {};
    /**
     *
     * @param {string} name
     * @param {Function} func
     */
    on: (name: string, func: Function) => void;
    eventListeners: {};
    /**
     *
     * @param {string} name
     * @param  {...any} args
     * @returns {PromiseLike<any>}
     */
    dispatchEvent: (name: string, ...args: any[]) => PromiseLike<any>;
    loadPlugins: (returnPack: any) => {};
    setFromGetter: (...args: any[]) => any;
    update: (...args: any[]) => any;
    listen: (state: any, loadingState: any, args: any) => () => void;
    updateListeners: (val: any, loading: any) => void;
    set: (newValue: any, opts?: {}) => Promise<void>;
    load: (loadingState: any) => Promise<any>;
    loading: any;
    reset: () => Promise<void>;
}
export class Sky {
    constructor(config: any);
    bundles: {};
    config: any;
    create: (key: any, ...args: any[]) => any;
    get: (key: any, args: any, obj: any) => any;
    getStorken: (key: any, ...args: any[]) => any;
    getPlugin: (key: any, plugin: any) => any;
    set: (key: any, value: any, ...args: any[]) => any;
    remove: (key: any, reset?: boolean) => Promise<void>;
    multiRemove: (...keys: any[]) => Promise<void>;
    destroy: (key: any, val: any) => Promise<void>;
    multiDestroy: (...keyValPairs: any[]) => Promise<void>;
    restore: (dump: any) => void;
    dump: () => any;
}
export function create(storkenConfig: any): (Sky | ((key: any, value: any, ...args: any[]) => any))[];
export default create;
