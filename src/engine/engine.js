/**@typedef {import('~/types/public').CustomEventEngineDetail} CustomEventEngineDetail */
import init, { CompatEngine } from '@/pkg/shinkore'
import compatData from '@/gen/compat-data.json'
import { ShinkomBus } from '~/core'

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
     */
    async loadWasm() {
        const isNode = typeof window === "undefined"

        try {
            if (isNode) {
                const path = await import('node:path')
                const fs = await import('node:fs')
                const url = await import('node:url')
                const __filename = url.fileURLToPath(import.meta.url)
                const __dirname = path.dirname(__filename)

                let wasmPath = path.resolve(__dirname, '../pkg/shinkore_bg.wasm')
                let wasmBuffer;

                if (fs.existsSync(wasmPath)) {
                    wasmBuffer = fs.readFileSync(wasmPath)
                } else {
                    wasmPath = path.resolve(__dirname, '../../pkg/shinkore_bg.wasm')

                    wasmBuffer = fs.readFileSync(wasmPath)
                }
                await init({ module_or_path: wasmBuffer })
            } else {
                await init()
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * Initializes Rust/WASM engine.
     */
    async initEngine() {
        try {
            if (!this.compatEngine) {
                await this.loadWasm()

                this.compatEngine = new CompatEngine(compatData.elements, compatData.global_attributes)
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
        } catch (_error) {
            console.error("fullInspect is only available in browser environments")
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