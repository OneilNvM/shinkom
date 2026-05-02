/**@typedef {import('../types/types').CustomEventEngineDetail} CustomEventEngineDetail */
/**@typedef {import('../types/public').CompatResult} CompatResult */
import init, { CompatEngine } from '../../pkg/shinkore'
import compatData, { browserData, usageData } from '../../gen/index'
import { ShinkomBus } from '../core'
import { getModulePath } from '../core/helpers'

export class SKEngine {
    /**@type {Promise<void> | null} */
    #wasmLoaded = null;
    /**
     * @param {ShinkomBus | null} bus
     */
    constructor(bus = null) {
        /**@type {CompatEngine | null} */
        this.compatEngine = null

        /**@type {ShinkomBus | null} */
        this.bus = bus

        if (this.bus) {
            this.bus.on('engine:inspect', (/**@type {CustomEventEngineDetail} */e) => {
                if (typeof e === 'object') {
                    if (e.multiElements) {
                        this.checkElements(e.elem, e.depthLevel)
                    } else {
                        this.checkElement(e.elem)
                    }
                }
            })
            this.bus.on('engine:full', () => {
                this.fullInspect()
            })
        }
    }

    /**
     * Loads WASM for the Browser or Node.
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
     * Initializes Rust/WASM engine.
     * @param {string | undefined} wasmURL
     */
    async initEngine(wasmURL = undefined) {
        try {
            if (!this.compatEngine) {
                if (!this.#wasmLoaded) {
                    console.log("loading WASM through initializer")
                    if (wasmURL) {
                        await this.loadWasm(wasmURL)
                    }
                    else {
                        await this.loadWasm()
                    }
                }

                this.compatEngine = new CompatEngine(compatData.html, compatData.svg, browserData, usageData)

                console.log("initialized engine")
            }
        } catch (error) {
            console.error(`Engine initialization error: ${error}`)
        }
    }

    /**
     * Used for checking the compatibility of a single element.
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
     * Used for checking the compatibility of a multiple elements, depending on `depthLevel`.
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
     * Used for checking the compatibility of a full page.
     * 
     * Only available in `browser` environments.
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
     * Free WASM memory and dereference engine.
     */
    destroy() {
        if (!this.compatEngine) {
            console.warn("Shinkom Engine cannot be destroyed as it is not initialized.")
            return;
        }
        this.compatEngine?.free()

        this.#wasmLoaded = null
        this.compatEngine = null
    }
}