/**@typedef {import("../ui/inspector/inspector").InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/browserx.types').BrowserXEventBus} BrowserXEventBus */
import { BXEngine } from "../engine"
import { CompatUI } from "../ui"

class BrowserX {
    /**
     * @param {InspectorConfig | undefined} inspectorConfig 
     */
    constructor(inspectorConfig = undefined) {
        /**@type {BrowserXEventBus} */
        this.bus = new EventTarget()

        /**@type {CompatUI} */
        this.compatUI = new CompatUI(this.bus, inspectorConfig)

        this.engine = new BXEngine()

        this.bus.addEventListener('ci:toggle', this.handleInspectorToggle)
        this.bus.addEventListener('ci:inspect', this.handleElementCheck)
    }

    /**
     * Handler toggles the inspector.
     */
    handleInspectorToggle = () => {
        if (this.compatUI.compatInspector.inspectorEl) {
            this.compatUI.compatInspector.destroy()
        } else {
            this.compatUI.compatInspector.setup()
        }
    }

    /**
     * 
     * @param {CustomEvent<string>} e
     */
    handleElementCheck = e => {
        this.engine.checkElement(e.detail)
    } 

    /**
     * Initialize BrowserX
     */
    init() {
        this.engine.initEngine()
        this.compatUI.init()
    }

    /**
     * Destroy UI components and engine instance
     */
    destroy() {
        this.engine.destroy()
        this.compatUI.destroy()

        this.bus.removeEventListener('ci:toggle', this.handleInspectorToggle)
        this.bus.removeEventListener('ci:inspect', this.handleElementCheck)
    }
}

export default BrowserX 