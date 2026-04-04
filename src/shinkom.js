import { ShinkomBus, ShinkomState } from "./core"
import { SKEngine } from "./engine"
import { CompatControlPanel, CompatInspector, CompatUI } from "./ui"

export class Shinkom {
    /**@type {AbortController | null} */
    #shinkomController = null

    constructor() {
        const bus = new ShinkomBus()
        const state = new ShinkomState()

        /**@type {SKEngine} */
        this.skEngine = new SKEngine(bus)

        /**@type {CompatUI} */
        this.compatUI = new CompatUI(bus, state, [
            new CompatInspector(bus, state),
            new CompatControlPanel(bus, state)
        ])
    }

    /**
     * Initialize Shinkom.
     */
    async init() {
        try {
            await this.skEngine.initEngine()
            this.compatUI.init()

        } catch (error) {
            console.error(`Shinkom initialization error: ${error}`)
        }
    }

    /**
     * Destroy UI components and engine instance.
     */
    destroy() {
        this.skEngine.destroy()
        this.compatUI.destroy()

        if (this.#shinkomController)
            this.#shinkomController.abort()

        this.#shinkomController = null
    }
}