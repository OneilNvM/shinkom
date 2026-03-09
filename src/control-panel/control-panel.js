// @ts-check

/**@typedef {import('../../types/browserx.types').BrowserXBus} BrowserXBus */

class ControlPanel {
    /**@type {AbortController | null} */
    #panelController = null;

    /**
     * @param {BrowserXBus} bus 
     */
    constructor(bus) {
        /**@type {BrowserXBus} */
        this._bus = bus;

        /**@type {HTMLDivElement | null} */
        this.shadowHost = null;

        /**@type {ShadowRoot | null} */
        this.shadowRoot = null;
    }

    /**
     * Handler sends custom event to BrowserX to toggle the inspector.
     */
    #handleToggleClick = () => {
        this._bus.dispatchEvent(new CustomEvent('ci:toggle'))
    }

    /**
     * Applies inline styles to `shadowHost` element.
     */
    #applyHostStyles() {
        if (this.shadowHost)
            Object.assign(this.shadowHost.style, {
                position: 'fixed',
                top: '2rem',
                left: '2rem',
                width: '20%'
            })
    }

    /**
     * Creates the control panel in a shadow root.
     */
    createPanel() {
        if (this.shadowHost) return;

        this.shadowHost = document.createElement('div')
        this.shadowHost.id = 'bx-shadow-host'
        this.#applyHostStyles()
        document.body.appendChild(this.shadowHost)

        this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' })

        this.shadowRoot.innerHTML = `
        <style>
            #bx-control-panel {
                color: white;
                background-color: blue;
            }
        </style>
        <div id="bx-control-panel">
            <h1>Welcome to the control panel</h1>
            <div>
                <button id="bx-toggle-inspector">Toggle inspector</button>
                <button>Do not click me</button>
            </div>
        </div>
        `
    }

    /** 
     * Initializes event listeners and appends control panel.
     */
    setup() {
        this.createPanel()

        this.#panelController = new AbortController()

        const { signal } = this.#panelController

        const toggleButton = this.shadowRoot?.getElementById('bx-toggle-inspector')
        toggleButton?.addEventListener('click', this.#handleToggleClick, { signal })
    }

    /**
     * Destroys the control panel instance
     */
    destroy() {
        if (!this.shadowHost) return;

        if (this.#panelController)
            this.#panelController.abort()
        this.#panelController = null
        document.removeChild(this.shadowHost)
        this.shadowRoot = null;
        this.shadowHost = null;
    }
}

export default ControlPanel