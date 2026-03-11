//@ts-check

/**@typedef {import('../../types/browserx.types').BrowserXBus} BrowserXBus */
/**@typedef {import('../../types/inspector.types').InspectorConfig} InspectorConfig */
import CompatInspector from '../inspector/inspector'
import ControlPanel from '../control-panel/control-panel'
import init, { CompatEngine } from '../../pkg/browserx_core'
import bcd from '@mdn/browser-compat-data' with {type: 'json'}

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

        /**@type {CompatEngine | null} */
        this.engine = null

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
     * Initializes Rust/WASM engine
     */
    async initEngine() {
        await init()

        this.engine = new CompatEngine(bcd.html.elements, bcd.html.global_attributes)

        console.dir(this.engine.check_element("<div id='div-elem' class='newStyle' radio='bare' align='center'></div>"))
        console.dir(this.engine.check_element("<audio id='audio-elem' class='newStyle' controls='false' align='center'></span>"))
    }

    /**
     * Initializes `BrowserX`.
     */
    init() {
        this.initEngine()
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
        this.engine?.free()

        this.bus.removeEventListener('ci:toggle', this.handleInspectorToggle)
    }
}

export default BrowserX 