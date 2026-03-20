/**@typedef {import('../../types/index').InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/index').ShinkomEventBus} ShinkomEventBus */
import { CompatInspector } from '../inspector/inspector'
import { CompatControlPanel } from '../control-panel/control-panel'

export class CompatUI {
    /**
     * @param {ShinkomEventBus} bus
     * @param {InspectorConfig | undefined} inspectorConfig
     */
    constructor(bus, inspectorConfig = undefined) {
        /**@type {CompatInspector} */
        this.compatInspector = new CompatInspector(inspectorConfig, bus)

        /**@type {CompatControlPanel} */
        this.controlPanel = new CompatControlPanel(bus)
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