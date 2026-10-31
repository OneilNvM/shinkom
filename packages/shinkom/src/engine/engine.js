/**@typedef {import('../types/types').CustomEventEngineDetail} CustomEventEngineDetail */
/**@typedef {import('../types/public').CompatResult} CompatResult */
/**@typedef {import('../types/public').EngineConfig} EngineConfig */
/**@typedef {import('../types/public').CSSConfig} CSSConfig */
import init, { WASMEngine, WASMEngineBuilder } from '../../pkg/shinkore'
import { htmlCompatData, svgCompatData, cssCompatData, browserData, usageData } from '../../gen/index'
import { getModulePath } from '../core/helpers'
import { readCSSFiles } from '../core/utils'

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
    /**@type {EngineConfig | undefined} */
    #config;
    /**
     * Initializes the compatibility engine.
     * 
     * The engine optionally accepts an event bus to listen for
     * `engine:inspect` and `engine:full` events from UI
     * components.
     * 
     * @param {EngineConfig | undefined} config
     */
    constructor(config = undefined) {
        if (instance) {
            return instance
        }

        this.initialized = false

        /**@type {WASMEngine | null} */
        this.wasmEngine = null

        this.#config = config

        instance = this
    }

    /**
     * @param {string} compiledCss 
     */
    #addTailwindClasses = async (compiledCss) => this.wasmEngine?.add_external_css_styles([compiledCss])

    /**
     * 
     * @param {CSSConfig['externalCSS']} cssConfig
     */
    async #loadExternalStylesheets(cssConfig) {
        const isNode = typeof window === "undefined" && typeof self === "undefined"
        const rawCSSContents = []

        if (cssConfig) {
            if (cssConfig.files) {
                for (const file of cssConfig.files) {
                    rawCSSContents.push(...(await readCSSFiles(file, isNode)).flat())
                }
            } else if (cssConfig.directories) {
                for (const dir of cssConfig.directories) {
                    rawCSSContents.push(...(await readCSSFiles(dir, isNode)).flat())
                }
            } else if (cssConfig.imports) {
                for (const content of cssConfig.imports) {
                    rawCSSContents.push(content)
                }
            }
        }

        this.wasmEngine?.add_external_css_styles(rawCSSContents)
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
        const isNode = typeof window === "undefined" && typeof self === "undefined"

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
     * @param {string | undefined} compiledCss
     */
    async initEngine(compiledCss = undefined) {
        if (this.initialized) {
            console.warn("SKEngine is already initialized.")
            return
        }

        try {
            if (!this.wasmEngine) {
                if (!this.#wasmLoaded) {
                    if (this.#config && this.#config.wasmURL) {
                        await this.loadWasm(this.#config.wasmURL)
                    }
                    else {
                        await this.loadWasm()
                    }
                }

                const builder = new WASMEngineBuilder()

                builder.set_html_binary_data(Uint8Array.fromBase64(htmlCompatData))
                builder.set_svg_binary_data(Uint8Array.fromBase64(svgCompatData))
                builder.set_css_binary_data(Uint8Array.fromBase64(cssCompatData))
                builder.set_browser_binary_data(Uint8Array.fromBase64(browserData))
                builder.set_browser_usage_binary_data(Uint8Array.fromBase64(usageData))

                this.wasmEngine = builder.build()

                this.initialized = true

                if (this.#config && this.#config.css) {
                    if (this.#config.css.externalCSS) {
                        this.#loadExternalStylesheets(this.#config.css.externalCSS)
                    }
                    if (this.#config.css.tailwindCSS && compiledCss) {
                        this.#addTailwindClasses(compiledCss)
                    }
                }

                console.log("initialized engine")
            }
        } catch (error) {
            SKEngine.clearInstance()
            throw new Error(`Engine initialization error: ${error}`)
        }
    }

    /**
     * Checks compatibility for a single element HTML string.
     *
     * If a bus was provided at construction, the resulting compatibility data
     * is emitted on `results:ready`.
     *
     * @param {string} element
     * @returns {CompatResult | null} `CompatResult` or `null`
     */
    checkElement(element) {
        try {
            /**@type {CompatResult} */
            const result = this.wasmEngine?.check_element(element)

            console.dir(result)

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
     * @returns {CompatResult | null} `CompatResult` or `null`
     */
    checkElements(html, depthLevel) {
        try {
            const result = this.wasmEngine?.check_elements(html, depthLevel)

            console.dir(result)

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
     * @param {string} html 
     * @returns {CompatResult | null} `CompatResult` or `null`
     */
    fullInspect(html) {
        try {
            const result = this.wasmEngine?.full_inspect(html)

            console.dir(result)

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
        this.wasmEngine?.free()

        this.#wasmLoaded = null
        this.wasmEngine = null

        this.initialized = false

        SKEngine.clearInstance()
    }
}