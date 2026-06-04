/**@typedef {import("./types/public").ShinkomConfig} ShinkomConfig */
import { ShinkomBus, ShinkomState } from "./core"
import { SKEngine } from "./engine"
import { CompatControlPanel, CompatInspector, CompatUI, CompatView } from "./ui"

/**@type {Shinkom | null} */
let instance = null

export class Shinkom {
    #config;

    /**
     * Initializes UI and engine components
     * 
     * It creates instances for the event bus and state service and shares them
     * between the components. It also has an optional configuration object
     * used for configuring the inspector and initializing the engine with a 
     * URL to the WASM file.
     * 
     * @param {ShinkomConfig | undefined} config 
     */
    constructor(config = undefined) {
        if (instance) {
            return instance
        }

        this.initialized = false

        this.#config = config

        const bus = new ShinkomBus()
        const state = new ShinkomState()

        /**@type {SKEngine} */
        this.skEngine = new SKEngine(bus)

        /**@type {CompatUI} */
        this.compatUI = new CompatUI(bus, state, [
            new CompatInspector(bus, state, this.#config?.inspector),
            new CompatControlPanel(bus, state),
            new CompatView(bus, state)
        ])

        instance = this
    }

    /**
     * Initialize Shinkom.
     */
    async init() {
        try {
            if (this.initialized) {
                console.warn("Shinkom is already initialized.")
                return
            }
            await this.skEngine.initEngine(this.#config?.engine?.wasmURL)
            this.compatUI.init()

            this.initialized = true
        } catch (error) {
            console.error(`Shinkom initialization error: ${error}`)
        }
    }

    /**
     * Destroy UI components and engine instance.
     */
    destroy() {
        if (!this.initialized) {
            console.warn("Shinkom has not been initialized.")
            return;
        }
        this.skEngine.destroy()
        this.compatUI.destroy()
        
        this.initialized = false
    }
}