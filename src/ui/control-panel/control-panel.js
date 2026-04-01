/**@typedef {import('~/types/public').UISharedState} UISharedState */
/**@typedef {import('~/types/public').UISharedStateProps} UISharedStateProps */
import { ShinkomBus, ShinkomState, UIComponent } from '~/core'; 

/**@extends {UIComponent} */
export class CompatControlPanel extends UIComponent {
    /**@type {UISharedState | null} */
    #stateBind = null
    /**@type {AbortController | null} */
    #panelController = null;

    /**
     * @param {ShinkomBus} bus 
     * @param {ShinkomState} stateService 
     */
    constructor(bus, stateService) {
        super(bus, stateService)

        /**@type {HTMLDivElement | null} */
        this.shadowHost = null;

        /**@type {ShadowRoot | null} */
        this.shadowRoot = null;

        /**@type {HTMLInputElement | null} */
        this.depthLevelInput = null
        /**@type {HTMLParagraphElement | null} */
        this.ciStatusEl = null
        /**@type {HTMLButtonElement | null} */
        this.toggleSwitchingEl = null
        /**@type {HTMLButtonElement | null} */
        this.toggleInspectorEl = null

        /**@type {number} */
        this.depthLevel = 0;

        /**@type {boolean} */
        this.multiElements = false;

        stateService.subscribe((prop, val) => {
            this.onStateChange(prop, val)
        })
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
                zIndex: '9999'
            })
        else
            throw new Error("Shadow host is undefined or null.")
    }

    /**
     * Creates the control panel in a shadow root.
     */
    createPanel() {
        if (this.shadowHost) {
            console.warn("Shadow host already exists.")
            return;
        }

        this.shadowHost = document.createElement('div')
        this.shadowHost.id = 'sk-shadow-host'

        try {
            this.#applyHostStyles()
        } catch (error) {
            this.shadowHost = null
            throw error
        }

        document.body.appendChild(this.shadowHost)

        this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' })

        this.shadowRoot.innerHTML = `
        <style>
            .sk-control-panel {
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

            .sk-control-panel * {
                transition-property: color, background-color, border-color;
                transition-duration: 300ms;
                transition-timing-function: ease-in-out;
            }

            .sk-page-buttons {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: .75rem;
                flex: 1 1 0%;
            }

            .sk-button-style {
                font-size: 1.225rem;
                color: white;
                background-color: #201a27;
                border: 1px solid #3c00c7;
                border-radius: .5rem;
                padding-inline: .5rem;
                padding-block: .3rem;
                cursor: pointer;
            }

            .sk-hr-line {
                width: 100%;
                border: 0px solid transparent;
                border-top: 1px solid #8132ff;
            }

            .sk-full-page-inspect {
                display: flex;
                align-items: center;
                justify-content: space-evenly;
                font-size: 1.8rem;
                flex: 0.5 1 0%;
            }

            .sk-options-container {
                display: flex;
                flex-direction: column;
                gap: .5rem;
                padding-top: 1rem;
                padding-inline: 1rem;
                flex: 5 1 0%;
                font-size: 1.25rem;
            }

            .sk-options-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 1.5rem;
            }

            .sk-options-header p:last-child {
                font-size: 1rem;
            }

            .sk-options {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                height: 100%;
                padding-left: .05rem;
            }

            .sk-options-grid {
                display: grid;
                grid-template-columns: auto auto auto;
                grid-template-rows: auto;
                justify-items: flex-start;
                align-items: center;
            }

            .sk-options-grid:first-child {
                column-gap: .5rem;
            }

            .sk-options-grid .sk-button-style {
                justify-self: flex-end;
            }

            .sk-options-grid .sk-options-input {
                justify-self: flex-end;
            }

            .sk-options-grid .sk-options-input:disabled {
                opacity: .5;
            }

            .sk-options-grid:nth-last-of-type(2), .sk-options-grid:nth-last-of-type(1) {
                grid-template-columns: auto auto;
            }

            .sk-options-input {
                width: 70%;
                padding-block: .2rem;
                padding-inline: .3rem;
                border-radius: .25rem;
                border: none;
                background-color: #232333;
                font-size: 1rem;
                color: white;
            }
            .sk-close {
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex: 1 1 0%;
            }
            .sk-show-panel {
                width: 8rem;
                position: absolute; 
                top: 1rem; 
                left: 1rem;
                z-index: -1;
            }
        </style>
        <div style="position: relative">
            <button id="sk-show-panel" class="sk-button-style sk-show-panel">Show Panel</button>
            <div id="sk-control-panel" class="sk-control-panel" style="display: none;">
                <div class="sk-page-buttons">
                    <button class="sk-button-style">Inspector</button>
                    <button class="sk-button-style">Compatibility View</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-full-page-inspect">
                    <p>Inspect Full Page</p>
                    <button id="sk-full-inspect" class="sk-button-style">Inspect</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-options-container">
                    <div class="sk-options-header">
                        <p>Inspector Options</p>
                        <p id="sk-inspector-status">Inspector Status: Active</p>
                    </div>
                    <div class="sk-options">
                        <div class="sk-options-grid">
                            <p>Inspect multiple elements</p>
                            <input id="sk-toggle-elements" class="sk-options-checkbox" type="checkbox">
                            <input id="sk-depth-level" class="sk-options-input" type="text" placeholder="depth_level" disabled>
                        </div>
                        <div class="sk-options-grid">
                            <p>Toggle Switching</p>
                            <button id="sk-toggle-switching" class="sk-button-style">Disabled</button>
                        </div>
                        <div class="sk-options-grid">
                            <p>Toggle Inspector</p>
                            <button id="sk-toggle-inspector" class="sk-button-style">Active</button>
                        </div>
                        <button id="sk-create-inspector" class="sk-button-style">Create Inspector</button>
                        <button id="sk-reset-inspector" class="sk-button-style">Reset Inspector</button>
                        <button id="sk-destroy-inspector" class="sk-button-style">Destroy Inspector</button>
                    </div>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-close">
                    <button id="sk-close-panel" class="sk-button-style">Close</button>
                </div>
                <hr class="sk-hr-line">
            </div>
        </div>
        `
    }

    /**
     * @param {UISharedState} state 
     */
    bindState(state) {
        if (!this.#stateBind)
            this.#stateBind = state

        this.#stateBind.ignorePanelEl = this.shadowHost
    }

    /**
     * @param {UISharedStateProps} prop 
     * @param {any} val 
     */
    onStateChange(prop, val) {
        switch (prop) {
            case "inspectorSwitching":
                if (this.toggleSwitchingEl)
                    this.toggleSwitchingEl.innerHTML = val ? "Enabled" : "Disabled"
                break;
            case "inspectorActive":
                if (this.toggleInspectorEl)
                    this.toggleInspectorEl.innerHTML = val ? "Active" : "Deactive"

                if (this.ciStatusEl)
                    this.ciStatusEl.innerHTML = val ? "Inspector Status: Active" : "Inspector Status: Deactive"
                break;
            default:
                break;
        }
    }

    mount() {
        try {
            this.createPanel()
        } catch (error) {
            throw error
        }

        this.#setupShadowListeners()
    }

    /**
     * Setup event listeners on `shadowRoot` element.
     */
    #setupShadowListeners() {
        this.#panelController = new AbortController()

        const { signal } = this.#panelController

        const toggleInspector = this.shadowRoot?.getElementById('sk-toggle-inspector')
        const toggleSwitching = this.shadowRoot?.getElementById('sk-toggle-switching')
        const createInspector = this.shadowRoot?.getElementById('sk-create-inspector')
        const resetInspector = this.shadowRoot?.getElementById('sk-reset-inspector')
        const destroyInspector = this.shadowRoot?.getElementById('sk-destroy-inspector')
        const showButton = this.shadowRoot?.getElementById('sk-show-panel')
        const closeButton = this.shadowRoot?.getElementById('sk-close-panel')
        const toggleElements = this.shadowRoot?.getElementById('sk-toggle-elements')
        const depthLevelInput = this.shadowRoot?.getElementById('sk-depth-level')
        const fullInspectButton = this.shadowRoot?.getElementById('sk-full-inspect')
        const ciStatusEl = this.shadowRoot?.getElementById('sk-inspector-status')

        toggleInspector?.addEventListener('click', this.#handleToggleClick, { signal })
        toggleSwitching?.addEventListener('click', this.#handleToggleClick, { signal })
        createInspector?.addEventListener('click', this.#handleToggleClick, { signal })
        resetInspector?.addEventListener('click', this.#handleToggleClick, { signal })
        destroyInspector?.addEventListener('click', this.#handleToggleClick, { signal })
        showButton?.addEventListener('click', this.#handleToggleClick, { signal })
        closeButton?.addEventListener('click', this.#handleToggleClick, { signal })
        toggleElements?.addEventListener('click', this.#handleToggleClick, { signal })
        depthLevelInput?.addEventListener('change', this.#handleDepthLevelValue, { signal })
        fullInspectButton?.addEventListener('click', this.#handleToggleClick, { signal })

        if (depthLevelInput) {
            this.depthLevelInput = /**@type {HTMLInputElement} */ (depthLevelInput)
        }
        if (toggleInspector) {
            this.toggleInspectorEl = /**@type {HTMLButtonElement} */ (toggleInspector)
        }
        if (toggleSwitching) {
            this.toggleSwitchingEl = /**@type {HTMLButtonElement} */ (toggleSwitching)
        }
        if (ciStatusEl) {
            this.ciStatusEl = /**@type {HTMLParagraphElement} */ (ciStatusEl)
        }
    }

    unmount() {
        try {
            if (!this.shadowHost) return;

            this.shadowHost.remove()
            this.shadowHost = null;

            this.#resetInternalState()
        } catch (error) {
            console.error(`Control panel destroy error: ${error}`)
        }
    }

    /**
     * Reset internal state of the instance and any related state
     * in the `stateBind`.
     */
    #resetInternalState() {
        if (this.#panelController)
            this.#panelController.abort()

        this.#panelController = null
        this.shadowRoot = null;
        this.depthLevelInput = null;
        this.depthLevel = 0;
        this.multiElements = false;

        if (this.#stateBind) {
            this.#stateBind.depthLevel = 0
            this.#stateBind.multiElements = false
            this.#stateBind.ignorePanelEl = null
        }

    }

    /**
    * Handles click events within the control panel.
    * @param {PointerEvent} e
    */
    #handleToggleClick = e => {
        switch (/**@type {HTMLElement} */(e.target).id) {
            case 'sk-show-panel': {
                if (!this.shadowRoot) return;
                const panel = this.shadowRoot.getElementById('sk-control-panel')

                if (panel) {
                    panel.style.display = 'flex'
                }
                break;
            }
            case 'sk-close-panel': {
                if (!this.shadowRoot) return;
                const panel = this.shadowRoot.getElementById('sk-control-panel')

                if (panel) {
                    panel.style.display = 'none'
                }
                break;
            }
            case 'sk-toggle-inspector':
                this.bus.emit('ci:toggle')
                break;
            case 'sk-toggle-elements':
                this.multiElements = !this.multiElements
                if (this.depthLevelInput) {
                    if (this.multiElements) {
                        this.depthLevelInput.disabled = false
                    } else {
                        this.depthLevelInput.disabled = true
                    }
                }
                if (this.#stateBind)
                    this.#stateBind.multiElements = this.multiElements
                break;
            case 'sk-toggle-switching':
                if (this.#stateBind)
                    this.#stateBind.inspectorSwitching = !this.#stateBind.inspectorSwitching
                break;
            case 'sk-create-inspector':
                this.bus.emit('ci:create')
                break;
            case 'sk-reset-inspector':
                this.bus.emit('ci:reset')
                break;
            case 'sk-destroy-inspector':
                this.bus.emit('ci:destroy')
                break;
            case 'sk-full-inspect':
                this.bus.emit('engine:full')
                break;
            default:
                console.error(`Could not dispatch an event for element of unknown id: ${/**@type {HTMLElement} */(e.target).id}`)
                break;
        }
    }

    /**
     * Handles the change event for the `depth_level` input.
     * @param {Event} e 
     */
    #handleDepthLevelValue = e => {
        const level = parseInt(/**@type {HTMLInputElement}*/(e.target).value, 10)
        this.depthLevel = level

        if (this.#stateBind)
            this.#stateBind.depthLevel = level
    }
}