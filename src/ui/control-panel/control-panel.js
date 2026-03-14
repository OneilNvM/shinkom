/**@typedef {import('../../../types/browserx.types').BrowserXEventBus} BrowserXEventBus */

class CompatControlPanel {
    /**@type {AbortController | null} */
    #panelController = null;

    /**
     * @param {BrowserXEventBus} bus 
     */
    constructor(bus) {
        /**@type {BrowserXEventBus} */
        this._bus = bus;

        /**@type {HTMLDivElement | null} */
        this.shadowHost = null;

        /**@type {ShadowRoot | null} */
        this.shadowRoot = null;
    }

    /**
     * Handler sends custom event to BrowserX to toggle the inspector.
     * @param {PointerEvent} e
     */
    #handleToggleClick = e => {
        switch (/**@type {HTMLElement} */(e.target).id) {
            case 'bx-toggle-inspector':
                this._bus.dispatchEvent(new CustomEvent('ci:toggle'))
                break;
            case 'bx-toggle-switching':
                this._bus.dispatchEvent(new CustomEvent('ci:switch'))
                break;
            case 'bx-create-inspector':
                this._bus.dispatchEvent(new CustomEvent('ci:create'))
                break;
            case 'bx-reset-inspector':
                this._bus.dispatchEvent(new CustomEvent('ci:reset'))
                break;
            case 'bx-destroy-inspector':
                this._bus.dispatchEvent(new CustomEvent('ci:destroy'))
                break;
            default:
                console.error("Could not dispatch an event")
                break;
        }
    }

    #handleShowPanel = () => {
        const panel = this.shadowRoot?.getElementById('bx-control-panel')

        if (panel) {
            panel.style.display = 'flex'
        }
    }

    #handleClosePanel = () => {
        const panel = this.shadowRoot?.getElementById('bx-control-panel')

        if (panel) {
            panel.style.display = 'none'
        }
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
            .bx-control-panel {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                width: 30rem;
                height: 85lvh;
                padding: 1rem;
                background-color: #0f0c13;
                color: white;
                font-family: Arial, Helvetica, sans-serif;
                border-radius: 2rem;
                z-index: 2;
            }

            .bx-control-panel * {
                transition-property: color, background-color, border-color;
                transition-duration: 300ms;
                transition-timing-function: ease-in-out;
            }

            .bx-page-buttons {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: .75rem;
                flex: 1 1 0%;
            }

            .bx-button-style {
                font-size: 1.225rem;
                color: white;
                background-color: #201a27;
                border: 1px solid #3c00c7;
                border-radius: .5rem;
                padding-inline: .5rem;
                padding-block: .3rem;
                cursor: pointer;
            }

            .bx-hr-line {
                width: 100%;
                border: 0px solid transparent;
                border-top: 1px solid #8132ff;
            }

            .bx-full-page-inspect {
                display: flex;
                align-items: center;
                justify-content: space-evenly;
                font-size: 1.8rem;
                flex: 0.5 1 0%;
            }

            .bx-options-container {
                display: flex;
                flex-direction: column;
                gap: .5rem;
                padding-top: 1rem;
                padding-inline: 1rem;
                flex: 5 1 0%;
                font-size: 1.25rem;
            }

            .bx-options-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 1.5rem;
            }

            .bx-options-header p:last-child {
                font-size: 1rem;
            }

            .bx-options {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                height: 100%;
                padding-left: .05rem;
            }

            .bx-options-grid {
                display: grid;
                grid-template-columns: auto auto auto;
                grid-template-rows: auto;
                justify-items: flex-start;
                align-items: center;
            }

            .bx-options-grid:first-child {
                column-gap: .5rem;
            }

            .bx-options-grid .bx-button-style {
                justify-self: flex-end;
            }

            .bx-options-grid .bx-options-input {
                justify-self: flex-end;
            }

            .bx-options-grid .bx-options-input:disabled {
                opacity: .5;
            }

            .bx-options-grid:nth-last-of-type(2), .bx-options-grid:nth-last-of-type(1) {
                grid-template-columns: auto auto;
            }

            .bx-options-input {
                width: 70%;
                padding-block: .2rem;
                padding-inline: .3rem;
                border-radius: .25rem;
                border: none;
                background-color: #232333;
                font-size: 1rem;
                color: white;
            }
            .bx-close {
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex: 1 1 0%;
            }
            .bx-show-panel {
                width: 8rem;
                position: absolute; 
                top: 1rem; 
                left: 1rem;
                z-index: -1;
            }
        </style>
        <div style="position: relative">
            <button id="bx-show-panel" class="bx-button-style bx-show-panel">Show Panel</button>
            <div id="bx-control-panel" class="bx-control-panel">
                <div class="bx-page-buttons">
                    <button class="bx-button-style">Inspector</button>
                    <button class="bx-button-style">Compatibility View</button>
                </div>
                <hr class="bx-hr-line">
                <div class="bx-full-page-inspect">
                    <p>Inspect Full Page</p>
                    <button class="bx-button-style">Inspect</button>
                </div>
                <hr class="bx-hr-line">
                <div class="bx-options-container">
                    <div class="bx-options-header">
                        <p>Inspector Options</p>
                        <p>Inspector Status: Active</p>
                    </div>
                    <div class="bx-options">
                        <div class="bx-options-grid">
                            <p>Inspect multiple elements</p>
                            <input class="bx-options-checkbox" type="checkbox">
                            <input class="bx-options-input" type="text" placeholder="depth_level">
                        </div>
                        <div class="bx-options-grid">
                            <p>Toggle Switching</p>
                            <input id="bx-toggle-switching" class="bx-button-style" type="button" value="Enabled">
                        </div>
                        <div class="bx-options-grid">
                            <p>Toggle Inspector</p>
                            <input id="bx-toggle-inspector" class="bx-button-style" type="button" value="Active">
                        </div>
                        <button id="bx-create-inspector" class="bx-button-style">Create Inspector</button>
                        <button id="bx-reset-inspector" class="bx-button-style">Reset Inspector</button>
                        <button id="bx-destroy-inspector" class="bx-button-style">Destroy Inspector</button>
                    </div>
                </div>
                <hr class="bx-hr-line">
                <div class="bx-close">
                    <button id="bx-close-panel" class="bx-button-style">Close</button>
                </div>
                <hr class="bx-hr-line">
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

        const toggleInspector = this.shadowRoot?.getElementById('bx-toggle-inspector')
        const toggleSwitching = this.shadowRoot?.getElementById('bx-toggle-switching')
        const createInspector = this.shadowRoot?.getElementById('bx-create-inspector')
        const resetInspector = this.shadowRoot?.getElementById('bx-reset-inspector')
        const destroyInspector = this.shadowRoot?.getElementById('bx-destroy-inspector')
        const showButton = this.shadowRoot?.getElementById('bx-show-panel')
        const closeButton = this.shadowRoot?.getElementById('bx-close-panel')

        toggleInspector?.addEventListener('click', this.#handleToggleClick, { signal })
        toggleSwitching?.addEventListener('click', this.#handleToggleClick, { signal })
        createInspector?.addEventListener('click', this.#handleToggleClick, { signal })
        resetInspector?.addEventListener('click', this.#handleToggleClick, { signal })
        destroyInspector?.addEventListener('click', this.#handleToggleClick, { signal })
        showButton?.addEventListener('click', this.#handleShowPanel, { signal })
        closeButton?.addEventListener('click', this.#handleClosePanel, { signal })
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

export default CompatControlPanel