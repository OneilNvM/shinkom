/**@typedef {import('../types/types').CustomEventEngineDetail} CustomEventEngineDetail */
/**@typedef {import('../types/public').CompatResult} CompatResult */
import init, { CompatEngine, CompatEngineBuilder } from '../../pkg/shinkore'
import { htmlCompatData, svgCompatData, cssCompatData, browserData, usageData } from '../../gen/index'
import { ShinkomBus } from '../core/event-bus'
import { getModulePath } from '../core/helpers'

/**@type {SKEngine | null} */
let instance = null

/**
 * SKEngine wraps the Shinkom compatibility analysis engine.
 *
 * It manages WASM loading, engine initialization, and compatibility checks
 * for single elements, element subtrees, and full pages. When a `ShinkomBus`
 * instance is provided, SKEngine also emits result events and responds to
 * engine commands from the UI.
 */
export class SKEngine {
    /**@type {Promise<void> | null} */
    #wasmLoaded = null;
    /**
     * Initializes the compatibility engine.
     * 
     * The engine optionally accepts an event bus to listen for
     * `engine:inspect` and `engine:full` events from UI
     * components.
     * 
     * @param {ShinkomBus | null} bus
     */
    constructor(bus = null) {
        if (instance) {
            return instance
        }

        this.initialized = false
        /**@type {CompatEngine | null} */
        this.compatEngine = null

        /**@type {ShinkomBus | null} */
        this.bus = bus

        /**@type {(() => void)[]} */
        this.unsubEvents = []

        instance = this
    }

    /**
     * Gets the instance of the engine.
     * @returns {SKEngine} the instance
     */
    getInstance() {
        if (!instance) {
            instance = this
        }
        return instance
    }

    /**
     * Clears the instance from memory.
     */
    static clearInstance() {
        instance = null
    }

    /**
     * Subscribes the engine to UI-driven bus commands.
     *
     * The engine listens for `engine:inspect` and `engine:full` events and
     * translates them into compatibility checks.
     */
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
     * Loads the WASM runtime and initializes the native Shinkom engine.
     *
     * In Node.js this resolves the module path and loads the WASM binary from
     * the local filesystem. In browser environments it optionally accepts a
     * WASM URL or falls back to the default packaged module loader.
     *
     * @param {string | undefined} wasmURL
     */
    async loadWasm(wasmURL = undefined) {
        if (this.#wasmLoaded) return this.#wasmLoaded
        const isNode = typeof window === "undefined"

        try {
            if (isNode) {
                const path = await import('node:path')
                const fs = await import('node:fs')

                let wasmPath = await getModulePath('shinkom/wasm')
                let wasmBuffer;

                if (wasmPath.toString().endsWith("shinkore_bg.wasm")) {
                    if (fs.existsSync(wasmPath)) {
                        wasmBuffer = fs.readFileSync(wasmPath)
                    } else {
                        wasmPath = path.resolve(__dirname, '../../pkg/shinkore_bg.wasm')

                        wasmBuffer = fs.readFileSync(wasmPath)
                    }
                    this.#wasmLoaded = (async () => {
                        await init({ module_or_path: wasmBuffer })
                    })()
                } else {
                    throw new Error("Path does not lead to WASM file.")
                }
            } else {
                if (wasmURL) {
                    this.#wasmLoaded = (async () => {
                        await init({ module_or_path: wasmURL })
                    })()
                } else {
                    this.#wasmLoaded = (async () => {
                        await init()
                    })()
                }
            }

            console.log("loaded WASM")

            return this.#wasmLoaded
        } catch (error) {
            throw error
        }
    }

    /**
     * Initializes the Rust-based compatibility engine.
     *
     * The engine is created after the WASM runtime has been loaded and is
     * configured with the bundled compatibility data.
     *
     * @param {string | undefined} wasmURL
     */
    async initEngine(wasmURL = undefined) {
        if (this.initialized) {
            console.warn("SKEngine is already initialized.")
            return
        }

        if (this.unsubEvents.length === 0) {
            this.#setupEventBusListeners()
        }
        
        try {
            if (!this.compatEngine) {
                if (!this.#wasmLoaded) {
                    if (wasmURL) {
                        await this.loadWasm(wasmURL)
                    }
                    else {
                        await this.loadWasm()
                    }
                }

                const builder = new CompatEngineBuilder()

                builder.set_html_binary_data(Uint8Array.fromBase64(htmlCompatData))
                builder.set_svg_binary_data(Uint8Array.fromBase64(svgCompatData))
                builder.set_css_binary_data(Uint8Array.fromBase64(cssCompatData))
                builder.set_browser_binary_data(Uint8Array.fromBase64(browserData))
                builder.set_browser_usage_binary_data(Uint8Array.fromBase64(usageData))

                this.compatEngine = builder.build()

                this.initialized = true

                console.log("initialized engine")
            }
        } catch (error) {
            console.error(`Engine initialization error: ${error}`)
            SKEngine.clearInstance()
        }
    }

    /**
     * Checks compatibility for a single element HTML string.
     *
     * If a bus was provided at construction, the resulting compatibility data
     * is emitted on `results:ready`.
     *
     * @param {string} element
     * @returns {CompatResult | null}
     */
    checkElement(element) {
        try {
            /**@type {CompatResult} */
            const result = this.compatEngine?.check_element(element)

            console.dir(result)

            if (this.bus) {
                this.bus.emit('results:ready', {
                    detail: result
                })
            }

            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }

    /**
     * Checks compatibility for a subtree of HTML elements.
     *
     * The `depthLevel` controls how deeply nested elements are inspected.
     *
     * @param {string} html
     * @param {number} depthLevel
     * @returns {CompatResult | null}
     */
    checkElements(html, depthLevel) {
        try {
            const result = this.compatEngine?.check_elements(html, depthLevel)

            console.dir(result)

            if (this.bus) {
                this.bus.emit('results:ready', {
                    detail: result
                })
            }

            return result
        } catch (error) {
            console.error(error)
            return null
        }
    }

    /**
     * Checks compatibility for the current full document page.
     *
     * This method is browser-only because it depends on `document` and
     * inspects the serialized page HTML.
     *
     * @returns {CompatResult | null}
     */
    fullInspect() {
        try {
            const result = this.compatEngine?.full_inspect(document.documentElement.outerHTML.replace(/<sk-[\w-]+><\/sk-[\w-]+>/g, ""))

            console.dir(result)

            if (this.bus) {
                this.bus.emit('results:ready', {
                    detail: result
                })
            }

            return result
        } catch (error) {
            if (error instanceof ReferenceError) {
                console.error("fullInspect is only available in browser environments")
            } else {
                console.error(`fullInspect error: ${error}`)
            }
            return null
        }
    }

    /**
     * Releases WASM resources and destroys the engine instance.
     *
     * After calling this method, the engine must be reinitialized before
     * further compatibility checks can be performed.
     */
    destroy() {
        if (!this.initialized) {
            console.warn("SKEngine has not been initialized.")
            return;
        }
        this.compatEngine?.free()
        this.#cleanupEventBusListeners()

        this.#wasmLoaded = null
        this.compatEngine = null

        this.initialized = false

        SKEngine.clearInstance()
    }
}