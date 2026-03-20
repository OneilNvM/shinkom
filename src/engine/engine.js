import init, { CompatEngine } from '../../pkg/shinkore'
import compatData from '../../gen/compat-data.json'

export class SKEngine {
    constructor() {
        /**@type {CompatEngine | null} */
        this.engine = null
    }

    /**
     * Initializes Rust/WASM engine
     */
    async initEngine() {
        try {
            if (!this.engine) {
                const isNode = typeof window === "undefined"

                if (isNode) {
                    const path = await import('node:path')
                    const fs = await import('node:fs')
                    const url = await import('node:url')
                    const __filename = url.fileURLToPath(import.meta.url)
                    const __dirname = path.dirname(__filename)

                    const wasmPath = path.resolve(__dirname, '../pkg/shinkore_bg.wasm')
                    const wasmBuffer = await fs.readFileSync(wasmPath)

                    await init({ module_or_path: wasmBuffer })
                } else {
                    await init()
                }

                this.engine = new CompatEngine(compatData.elements, compatData.global_attributes)
            }
        } catch (error) {
            console.error(`Engine initialization error: ${error}`)
        }
    }

    /**
     * @param {string} element 
     */
    checkElement(element) {
        console.dir(this.engine?.check_element(element))
    }

    /**
     * 
     * @param {string} html 
     * @param {number} depthLevel 
     */
    checkElements(html, depthLevel) {
        console.log("depth level: " + depthLevel)
        console.dir(this.engine?.check_elements(html, depthLevel))
    }

    /**
     * Free WASM memory and dereference engine
     */
    destroy() {
        this.engine?.free()

        this.engine = null
    }
}