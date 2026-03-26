/**@typedef {import("../types/index").InspectorConfig} InspectorConfig */
/**@typedef {import('../types/index').ShinkomEventBus} ShinkomEventBus */
import { SKEngine } from "../engine"
import { CompatUI } from "../ui"

export class Shinkom {
    /**@type {AbortController | null} */
    #shinkomController = null
    /**
     * @param {InspectorConfig | undefined} inspectorConfig 
     */
    constructor(inspectorConfig = undefined) {
        /**@type {ShinkomEventBus} */
        this.bus = new EventTarget()

        /**@type {CompatUI} */
        this.compatUI = new CompatUI(this.bus, inspectorConfig)

        /**@type {SKEngine} */
        this.skEngine = new SKEngine()
    }

    /**
     * Handles the custom events sent from the bus.
     * @param {CustomEvent<string | void>} e
     */
    handleCustomEvents = e => {
        try {
            switch (e.type) {
                case 'ci:toggle': {
                    if (this.compatUI.compatInspector.inspectorEl) {
                        this.compatUI.compatInspector.destroy()
                    } else {
                        this.compatUI.compatInspector.setup()
                    }
                    break;
                }
                case 'ci:inspect':
                    if (typeof e.detail === 'string')
                        if (this.compatUI.controlPanel.multiElements) {
                            this.skEngine.checkElements(e.detail, this.compatUI.controlPanel.depthLevel)
                        } else {
                            this.skEngine.checkElement(e.detail)
                        }
                    break;
                case 'full:inspect':
                    this.skEngine.fullInspect()
                    break;
                case 'ci:create':
                    this.compatUI.compatInspector.setup()
                    break;
                case 'ci:reset':
                    this.compatUI.compatInspector.reset()
                    break;
                case 'ci:destroy':
                    this.compatUI.compatInspector.destroy()
                    break;
                default:
                    throw new Error("Event type was invalid")
            }
        } catch (error) {
            console.error(`Shinkom customEvents error: ${error}`)
        }
    }

    /**
     * Initialize Shinkom
     */
    async init() {
        try {
            await this.skEngine.initEngine()
            this.compatUI.init()

            this.#shinkomController = new AbortController()

            const { signal } = this.#shinkomController

            this.bus.addEventListener('ci:toggle', this.handleCustomEvents, { signal })
            this.bus.addEventListener('ci:inspect', this.handleCustomEvents, { signal })
            this.bus.addEventListener('ci:switch', this.handleCustomEvents, { signal })
            this.bus.addEventListener('ci:create', this.handleCustomEvents, { signal })
            this.bus.addEventListener('ci:reset', this.handleCustomEvents, { signal })
            this.bus.addEventListener('ci:destroy', this.handleCustomEvents, { signal })
            this.bus.addEventListener('full:inspect', this.handleCustomEvents, { signal })
        } catch (error) {
            console.error(`Shinkom initialization error: ${error}`)
        }
    }

    /**
     * Destroy UI components and engine instance
     */
    destroy() {
        this.skEngine.destroy()
        this.compatUI.destroy()

        if (this.#shinkomController)
            this.#shinkomController.abort()

        this.#shinkomController = null
    }
}