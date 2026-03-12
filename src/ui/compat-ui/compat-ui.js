/**@typedef {import('../../../types/inspector.types').InspectorConfig} InspectorConfig */
/**@typedef {import('../../../types/browserx.types').BrowserXEventBus} BrowserXEventBus */
import CompatInspector from '../inspector/inspector'
import ControlPanel from '../control-panel/control-panel'

class CompatUI {
    /**
     * @param {BrowserXEventBus} bus
     * @param {InspectorConfig | undefined} inspectorConfig
     */
    constructor(bus, inspectorConfig = undefined) {
        /**@type {CompatInspector} */
        this.compatInspector = new CompatInspector(inspectorConfig, bus)

        /**@type {ControlPanel} */
        this.controlPanel = new ControlPanel(bus)
    }

    /**
     * Initializes CompatUI components.
     */
    init() {
        this.compatInspector.setup()
        this.controlPanel.setup()
        if (this.controlPanel.shadowHost)
            this.compatInspector.setIgnorePanel(this.controlPanel.shadowHost)
    }

    /**
     * Destroys CompatUI component instances.
     */
    destroy() {
        this.compatInspector.destroy()
        this.controlPanel.destroy()
    }
}

export default CompatUI