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
                if (this.controlPanelEl && this.controlPanelEl.shadowRoot) {
                    const toggleSwitchingButton = this.controlPanelEl.shadowRoot.getElementById('sk-toggle-switching')

                    if (toggleSwitchingButton)
                        toggleSwitchingButton.innerHTML = val ? "Enabled" : "Disabled"
                }
                break;
            case "inspectorActive":
                if (this.controlPanelEl && this.controlPanelEl.shadowRoot) {
                    const toggleInspectorButton = this.controlPanelEl.shadowRoot.getElementById('sk-toggle-inspector')

                    if (toggleInspectorButton)
                        toggleInspectorButton.innerHTML = val ? "Enabled" : "Disabled"
                }
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

        const depthLevelInput = this.controlPanelEl.shadowRoot?.getElementById('sk-depth-level')

        this.controlPanelEl.shadowHost.addEventListener('click', this.#handleToggleClick, { signal })
        depthLevelInput?.addEventListener('change', this.#handleDepthLevelValue, { signal })

        if (depthLevelInput) {
            this.depthLevelInput = /**@type {HTMLInputElement} */ (depthLevelInput)
            this.depthLevelInput.disabled = !this.#stateBind?.multiElements
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
                if (!document.startViewTransition) {
                    this.controlPanelEl?.renderDisplayTransition("show")
                } else {
                    document.startViewTransition(() => {
                        this.controlPanelEl?.renderDisplayTransition("show")
                    })
                }
                break;
            }
            case 'sk-close-panel': {
                if (!this.controlPanelEl) return;
                if (!document.startViewTransition) {
                    this.controlPanelEl.renderDisplayTransition("hide")
                } else {
                    document.startViewTransition(() => {
                        this.controlPanelEl?.renderDisplayTransition("hide")
                    })
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