/**@typedef {import('../types/public').CustomEventEngineDetail} CustomEventEngineDetail */
import init, { CompatEngine } from '../../pkg/shinkore'
import compatData from '../../gen/compat-data.json'
import { ShinkomBus } from '../core'
import { getModulePath } from '../core/helpers'

export class SKEngine {
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
        const isNode = typeof window === "undefined"

        try {
            if (isNode) {
                const path = await import('node:path')
                const fs = await import('node:fs')
                const url = await import('node:url')

                let wasmPath = url.fileURLToPath(getModulePath('shinkom/wasm'))
                let wasmBuffer;

                if (fs.existsSync(wasmPath)) {
                    wasmBuffer = fs.readFileSync(wasmPath)
                } else {
                    wasmPath = path.resolve(__dirname, '../../pkg/shinkore_bg.wasm')

                    wasmBuffer = fs.readFileSync(wasmPath)
                }
                await init({ module_or_path: wasmBuffer })
            } else {
                if (wasmURL) {
                    await init({ module_or_path: wasmURL })
                } else {
                    await init()
                }
            }
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
                if (wasmURL) {
                    await this.loadWasm(wasmURL)
                }
                else {
                    await this.loadWasm()
                }

                this.compatEngine = new CompatEngine(compatData.html, compatData.svg)
            }
        } catch (error) {
            console.error(`Engine initialization error: ${error}`)
        }
    }

    /**
     * Used for checking the compatibility of a single element.
     * @param {string} element 
     */
    checkElement(element) {
        console.dir(this.compatEngine?.check_element(element))
    }

    /**
     * Used for checking the compatibility of a multiple elements, depending on `depthLevel`.
     * @param {string} html 
     * @param {number} depthLevel 
     */
    checkElements(html, depthLevel) {
        console.dir(this.compatEngine?.check_elements(html, depthLevel))
    }

    /**
     * Used for checking the compatibility of a full page.
     * 
     * Only available in `browser` environments.
     */
    fullInspect() {
        try {
            console.dir(this.compatEngine?.full_inspect(document.documentElement.outerHTML))
        } catch (error) {
            if (error instanceof ReferenceError) {
                console.error("fullInspect is only available in browser environments")
            } else {
                console.error(`fullInspect error: ${error}`)
            }
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

        this.compatEngine = null
    }
}