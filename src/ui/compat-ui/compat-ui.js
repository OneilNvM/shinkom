/**@typedef {import('../../types/index').InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/index').ShinkomEventBus} ShinkomEventBus */
import { CompatInspector } from '../inspector/inspector'
import { CompatControlPanel } from '../control-panel/control-panel'

const internalState = new WeakMap()

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

        const compatInspector = this.compatInspector
        const controlPanel = this.controlPanel

        const stateProxy = new Proxy({
            inspectorSwitching: false,
            inspectorActive: false,
        }, {
            get(obj, prop) {
                return obj[prop]
            },
            set(obj, prop, val) {
                obj[prop] = val
                console.log(`Setting ${prop} -> ${val}`)

                compatInspector.onStateChange(prop, val)
                controlPanel.onStateChange(prop, val)

                return true
            }
        })

        internalState.set(this, stateProxy)
    }

    /**
     * Bind state proxy to UI components.
     */
    #bindState() {
        const state = internalState.get(this)

        this.compatInspector.bindState(state)
        this.controlPanel.bindState(state)
    }

    /**
     * Initializes CompatUI components.
     */
    init() {
        try {
            this.compatInspector.setup()
            this.controlPanel.setup()

            if (this.controlPanel.shadowHost)
                this.compatInspector.setIgnorePanel(this.controlPanel.shadowHost)

            this.#bindState()
        } catch (error) {
            console.error(`Compat UI initialization error: ${error}`)
        }
    }

    /**
     * Destroys CompatUI component instances.
     */
    destroy() {
        this.compatInspector.destroy()
        this.controlPanel.destroy()
    }
}