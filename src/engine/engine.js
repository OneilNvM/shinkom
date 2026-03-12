import init, { CompatEngine } from "../../pkg/browserx_core";
import bcd from '@mdn/browser-compat-data' with {type: 'json'}

class BXEngine {
    constructor() {
        /**@type {CompatEngine | null} */
        this.engine = null
    }

    /**
     * Initializes Rust/WASM engine
     */
    async initEngine() {
        await init()

        this.engine = new CompatEngine(bcd.html.elements, bcd.html.global_attributes)

        console.dir(document.styleSheets)
    }

    /**
     * @param {string} element 
     */
    checkElement(element) {
        console.dir(this.engine?.check_element(element))
    }


    /**
     * Free WASM memory and dereference engine
     */
    destroy() {
        this.engine?.free()

        this.engine = null
    }
}

export default BXEngine