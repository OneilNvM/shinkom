/**@typedef {import("../types/index").InspectorConfig} InspectorConfig */
/**@typedef {import('../types/index').ShinkomEventBus} ShinkomEventBus */
import { SKEngine } from "../engine"
import { CompatUI } from "../ui"

export class Shinkom {
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

        this.bus.addEventListener('ci:toggle', this.handleCustomEvents)
        this.bus.addEventListener('ci:inspect', this.handleCustomEvents)
        this.bus.addEventListener('ci:switch', this.handleCustomEvents)
        this.bus.addEventListener('ci:create', this.handleCustomEvents)
        this.bus.addEventListener('ci:reset', this.handleCustomEvents)
        this.bus.addEventListener('ci:destroy', this.handleCustomEvents)
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
                case 'ci:switch':
                    const switchVal = this.compatUI.compatInspector.enableSwitching
                    this.compatUI.compatInspector.enableSwitching = !switchVal
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

        this.bus.removeEventListener('ci:toggle', this.handleCustomEvents)
        this.bus.removeEventListener('ci:inspect', this.handleCustomEvents)
        this.bus.removeEventListener('ci:switch', this.handleCustomEvents)
        this.bus.removeEventListener('ci:create', this.handleCustomEvents)
        this.bus.removeEventListener('ci:reset', this.handleCustomEvents)
        this.bus.removeEventListener('ci:destroy', this.handleCustomEvents)
    }
}