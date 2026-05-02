/**@typedef {import('../../types/public').UISharedState} UISharedState */
/**@typedef {import('../../types/public').UISharedStateProps} UISharedStateProps */
import { ShinkomBus, ShinkomState, UIComponent } from '../../core';
import { CompatControlPanelElement } from '../../core/elements';

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

        CompatControlPanel.register()

        /**@type {CompatControlPanelElement | null} */
        this.controlPanelEl = null;

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

    static register() {
        if (!customElements.get('sk-control-panel')) {
            customElements.define('sk-control-panel', CompatControlPanelElement)
        }
    }

    /**
     * @param {UISharedState} state 
     */
    bindState(state) {
        if (!this.#stateBind)
            this.#stateBind = state

        this.#stateBind.ignorePanelEl = this.controlPanelEl
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
                    this.toggleInspectorEl.innerHTML = val ? "Enabled" : "Disabled"
                break;
            default:
                break;
        }
    }

    mount() {
        if (this.controlPanelEl) return

        this.controlPanelEl = /**@type {CompatControlPanelElement}*/(document.createElement('sk-control-panel'))

        document.body.appendChild(this.controlPanelEl)

        this.#setupShadowListeners()
    }

    /**
     * Setup event listeners on `shadowRoot` element.
     */
    #setupShadowListeners() {
        if (!this.controlPanelEl) return

        this.#panelController = new AbortController()

        const { signal } = this.#panelController

        const toggleInspector = this.controlPanelEl.shadowRoot?.getElementById('sk-toggle-inspector')
        const toggleSwitching = this.controlPanelEl.shadowRoot?.getElementById('sk-toggle-switching')
        const createInspector = this.controlPanelEl.shadowRoot?.getElementById('sk-create-inspector')
        const resetInspector = this.controlPanelEl.shadowRoot?.getElementById('sk-reset-inspector')
        const destroyInspector = this.controlPanelEl.shadowRoot?.getElementById('sk-destroy-inspector')
        const showButton = this.controlPanelEl.shadowRoot?.getElementById('sk-show-panel')
        const closeButton = this.controlPanelEl.shadowRoot?.getElementById('sk-close-panel')
        const toggleElements = this.controlPanelEl.shadowRoot?.getElementById('sk-toggle-elements')
        const depthLevelInput = this.controlPanelEl.shadowRoot?.getElementById('sk-depth-level')
        const fullInspectButton = this.controlPanelEl.shadowRoot?.getElementById('sk-full-inspect')
        const ciStatusEl = this.controlPanelEl.shadowRoot?.getElementById('sk-inspector-status')

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
            this.depthLevelInput.disabled = !this.#stateBind?.multiElements

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
            if (!this.controlPanelEl) return;

            this.controlPanelEl.remove()
            this.controlPanelEl = null;

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
                if (!this.controlPanelEl) return;
                const panel = this.controlPanelEl.shadowRoot?.getElementById('sk-control-panel')

                if (panel) {
                    panel.style.display = 'flex'
                }
                break;
            }
            case 'sk-close-panel': {
                if (!this.controlPanelEl) return;
                const panel = this.controlPanelEl.shadowRoot?.getElementById('sk-control-panel')

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