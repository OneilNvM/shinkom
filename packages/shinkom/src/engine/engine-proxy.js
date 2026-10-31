/**@typedef {import('../types/types').CustomEventEngineDetail} CustomEventEngineDetail */
/**@typedef {import('../types/public').CompatResult} CompatResult */
/**@typedef {import('../types/public').EngineConfig} EngineConfig */

import { ShinkomBus } from '../core/event-bus';

/**@type {SKEngineProxy | null} */
let instance = null

export class SKEngineProxy {
    /**@type {number} */
    #messageId = 0
    /**@type {Map<number, {resolve: Function, reject: Function}>} */
    #pendingRequests = new Map()
    /**@type {EngineConfig | undefined} */
    #config;

    /**
     * @param {ShinkomBus | null} bus 
     * @param {EngineConfig | undefined} config 
     */
    constructor(bus = null, config = undefined) {
        if (instance) {
            return instance
        }
        this.#config = config

        this.initialized = false

        this.bus = bus

        /**@type {(() => void)[]} */
        this.unsubEvents = []

        /**@type {Worker} */
        this.worker = new Worker(new URL('engine-worker.js', import.meta.url), { type: 'module' })

        this.worker.onmessage = this.#handleWorkerMessage.bind(this)

        instance = this
    }

    /**
     * Clears the instance from memory.
     */
    static clearInstance() {
        instance = null
    }

    #setupEventBusListeners() {
        if (this.bus) {
            this.unsubEvents.push(
                this.bus.on('engine:inspect', (/**@type {CustomEventEngineDetail} */e) => {
                    if (typeof e === 'object') {
                        if (e.multiElements) {
                            this.checkElements(e.elem, e.depthLevel)
                        } else {
                            this.checkElement(e.elem)
                        }
                    }
                }),
                this.bus.on('engine:full', () => {
                    this.fullInspect()
                })
            )
        }
    }

    /**
     * Unsubscribes from any registered bus listeners.
     *
     * This is called when the engine is destroyed so that no stale callbacks
     * remain attached to the shared event bus.
     */
    #cleanupEventBusListeners() {
        if (this.unsubEvents.length > 0) {
            this.unsubEvents.forEach(cleanup => cleanup())

            this.unsubEvents = []
        }
    }

    /**
     * @param {MessageEvent<any>} event
     */
    #handleWorkerMessage(event) {
        const { id, type, result, error } = event.data

        const promise = this.#pendingRequests.get(id)

        if (!promise) return

        if (type === "ERROR") {
            promise.reject(new Error(error))
        } else {
            promise.resolve(result)
        }
    }

    /**
     * @param {string} type 
     * @param {any} payload 
     * @returns 
     */
    #sendMessage(type, payload = {}) {
        return new Promise((resolve, reject) => {
            const id = ++this.#messageId
            this.#pendingRequests.set(id, { resolve, reject })
            this.worker.postMessage({ id, type, payload })
        })
    }

    async #autoDiscoverTailwindClasses() {
        const compiledCss = Array.from(document.styleSheets)
            .flatMap((sheet) => {
                try {
                    return Array.from(sheet.cssRules).map((rule) => rule.cssText);
                } catch {
                    return [];
                }
            })
            .join('\n');

        return compiledCss
    }

    /**
     * Initializes the Rust-based compatibility engine.
     *
     * The engine is created after the WASM runtime has been loaded and is
     * configured with the bundled compatibility data.
     */
    async initEngine() {
        if (this.initialized) {
            console.warn("SKEngineProxy is already initialized.")
            return
        }

        if (this.unsubEvents.length === 0) {
            this.#setupEventBusListeners()
        }

        try {
            let compiledCss = undefined
            if (this.#config?.css?.tailwindCSS) {
                compiledCss = await this.#autoDiscoverTailwindClasses()
            }

            await this.#sendMessage("INIT", { config: this.#config, compiledCss })

            this.initialized = true
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Checks compatibility for a single element HTML string.
     *
     * If a bus was provided at construction, the resulting compatibility data
     * is emitted on `results:ready`.
     *
     * @param {string} element
     * @returns {Promise<CompatResult | null>} `CompatResult` or `null`
     */
    async checkElement(element) {
        const result = await this.#sendMessage('CHECK_ELEMENT', { element })

        if (this.bus) {
            this.bus.emit('results:ready', {
                detail: result
            })
        }

        return result
    }

    /**
     * Checks compatibility for a subtree of HTML elements.
     *
     * The `depthLevel` controls how deeply nested elements are inspected.
     *
     * @param {string} html
     * @param {number} depthLevel
     * @returns {Promise<CompatResult | null>} `CompatResult` or `null`
     */
    async checkElements(html, depthLevel) {
        const result = await this.#sendMessage('CHECK_ELEMENTS', { html, depthLevel })

        if (this.bus) {
            this.bus.emit('results:ready', {
                detail: result
            })
        }

        return result
    }

    /**
     * Checks compatibility for the current full document page.
     *
     * This method is browser-only because it depends on `document` and
     * inspects the serialized page HTML.
     *
     * @returns {Promise<CompatResult | null>} `CompatResult` or `null`
     */
    async fullInspect() {
        const html = document.documentElement.outerHTML.replace(/<sk-[\w-]+><\/sk-[\w-]+>/g, "")
        const result = await this.#sendMessage('FULL_INSPECT', { html })

        if (this.bus) {
            this.bus.emit('results:ready', {
                detail: result
            })
        }

        return result
    }

    /**
     * Releases WASM resources and destroys the engine instance.
     *
     * After calling this method, the engine must be reinitialized before
     * further compatibility checks can be performed.
     */
    async destroy() {
        if (!this.initialized) {
            console.warn("SKEngine has not been initialized.")
            return;
        }
        this.#cleanupEventBusListeners()
        await this.#sendMessage('DESTROY')
        this.initialized = false

        SKEngineProxy.clearInstance()
    }
}