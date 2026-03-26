import init, { CompatEngine } from '../../pkg/shinkore'
import compatData from '../../gen/compat-data.json'

export class SKEngine {
    constructor() {
        /**@type {CompatEngine | null} */
        this.compatEngine = null
    }

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
                    wasmBuffer = await fs.readFileSync(wasmPath)
                } else {
                    wasmPath = path.resolve(__dirname, '../../pkg/shinkore_bg.wasm')

                    wasmBuffer = await fs.readFileSync(wasmPath)
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
     * Initializes Rust/WASM engine
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
     * @param {string} element 
     */
    checkElement(element) {
        console.dir(this.compatEngine?.check_element(element))
    }

    /**
     * 
     * @param {string} html 
     * @param {number} depthLevel 
     */
    checkElements(html, depthLevel) {
        console.dir(this.compatEngine?.check_elements(html, depthLevel))
    }

    fullInspect() {
        console.dir(this.compatEngine.full_inspect(document.documentElement.outerHTML))
    }

    /**
     * Free WASM memory and dereference engine
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