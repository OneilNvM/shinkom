//@ts-check

/**@typedef {import('../../types/browserx.types').BrowserXBus} BrowserXBus */
/**@typedef {import('../../types/inspector.types').InspectorConfig} InspectorConfig */
import CompatInspector from '../inspector/inspector'
import ControlPanel from '../control-panel/control-panel'

class BrowserX {
    /**
     * @param {InspectorConfig} inspectorConfig 
     */
    constructor(inspectorConfig) {
        /**@type {BrowserXBus} */
        this.bus = new EventTarget()

        /**@type {CompatInspector} */
        this.compatInspector = new CompatInspector(inspectorConfig, this.bus)

        /**@type {ControlPanel} */
        this.controlPanel = new ControlPanel(this.bus)

        this.bus.addEventListener('ci:toggle', this.handleInspectorToggle)
    }

    /**
     * Handler toggles the inspector.
     */
    handleInspectorToggle = () => {
        if (this.compatInspector.inspectorEl) {
            this.compatInspector.destroy()
        } else {
            this.compatInspector.setup()
        }
    }

    /**
     * Initializes `BrowserX`.
     */
    init() {
        this.compatInspector.setup()
        this.controlPanel.setup()
        if (this.controlPanel.shadowHost)
            this.compatInspector.setIgnorePanel(this.controlPanel.shadowHost)
    }

    /**
     * Destroys BrowserX component instances.
     */
    destroy() {
        this.compatInspector.destroy()
        this.controlPanel.destroy()

        this.bus.removeEventListener('ci:toggle', this.handleInspectorToggle)
    }
}

export default BrowserX 