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

        /**@type {HTMLInputElement | null} */
        this.maxResultsHistoryInput = null

        /**@type {number} */
        this.maxResultsHistory = 10

        /**@type {number} */
        this.depthLevel = 0;

        /**@type {boolean} */
        this.multiElements = false;

        /**@type {"inspector" | "compatView"} */
        this.currentTab = "inspector"

        /**@type {() => void} */
        this.unsubState = stateService.subscribe((prop, val) => {
            this.onStateChange(prop, val)
        })
    }

    /**
     * Registers custom elements to the `CustomElementRegistry` on the `window` object.
     */
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
                if (this.controlPanelEl) {
                    const toggleSwitchingButton = this.controlPanelEl.shadowRootRef.getElementById('sk-toggle-switching')

                    if (toggleSwitchingButton)
                        toggleSwitchingButton.textContent = val ? "Enabled" : "Disabled"
                }
                break;
            case "inspectorActive":
                if (this.controlPanelEl) {
                    const toggleInspectorButton = this.controlPanelEl.shadowRootRef.getElementById('sk-toggle-inspector')

                    if (toggleInspectorButton)
                        toggleInspectorButton.textContent = val ? "Enabled" : "Disabled"
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
     * Sets up event listeners within the `ShadowDOM`.
     */
    #setupShadowListeners() {
        if (!this.controlPanelEl) return

        this.#panelController = new AbortController()

        const { signal } = this.#panelController

        const depthLevelInput = this.controlPanelEl.shadowRootRef.getElementById('sk-depth-level')

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
            this.unsubState()

            this.#resetInternalState()
        } catch (error) {
            console.error(`Control panel destroy error: ${error}`)
        }
    }

    /**
     * Resets any internal state and event listeners.
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
                    this.controlPanelEl.renderDisplayTransition("show")
                } else {
                    this.#handleDisplayTransition("show")
                }
                break;
            }
            case 'sk-close-panel': {
                if (!this.controlPanelEl) return;

                if (!document.startViewTransition) {
                    this.controlPanelEl.renderDisplayTransition("hide")
                } else {
                    this.#handleDisplayTransition("hide")
                }
                break;
            }
            case 'sk-inspector-tab': {
                if (!this.controlPanelEl || this.currentTab === "inspector") return;

                if (!document.startViewTransition) {
                    this.controlPanelEl.renderTabContent("inspector")
                } else {
                    this.#handleTabChange("inspector")
                }

                break;
            }
            case 'sk-compat-view-tab': {
                if (!this.controlPanelEl || this.currentTab === "compatView") return;

                if (!document.startViewTransition) {
                    this.controlPanelEl.renderTabContent("compatView")
                } else {
                    this.#handleTabChange("compatView")
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
            case 'sk-clear-history':
                this.bus.emit('clear:history')
                break;
            default:
                break;
        }
    }

    /**
     * Handles the transition between tab changes.
     * @param {"inspector" | "compatView"} tab 
     */
    async #handleTabChange(tab) {
        if (!this.controlPanelEl) return

        const mainSection = this.controlPanelEl.shadowRootRef.getElementById('sk-control-panel-main')

        if (mainSection) {
            const transition = document.startViewTransition(() => {
                this.controlPanelEl?.renderTabContent(tab)
            })

            this.currentTab = tab

            await transition.finished

            if (this.currentTab === "inspector") {
                const depthLevel = this.controlPanelEl.shadowRootRef.getElementById('sk-depth-level')
                if (depthLevel) {
                    this.depthLevelInput = /**@type {HTMLInputElement} */ (depthLevel)
                    this.depthLevelInput.addEventListener('change', this.#handleDepthLevelValue, { signal: this.#panelController?.signal })

                    if (this.#stateBind) {
                        if (this.#stateBind.multiElements) {
                            const checkbox = /**@type {HTMLInputElement} */ (this.controlPanelEl.shadowRootRef.getElementById('sk-toggle-elements'))
                            checkbox.checked = true
                        } else {
                            this.depthLevelInput.disabled = true
                        }
                        if (this.#stateBind.depthLevel > 0)
                            this.depthLevelInput.value = `${this.#stateBind.depthLevel}`
                    }
                }

                if (this.#stateBind) {
                    const switchingToggle = /**@type {HTMLButtonElement | null} */ (this.controlPanelEl.shadowRootRef.getElementById('sk-toggle-switching'))
                    const inspectorToggle = /**@type {HTMLButtonElement | null} */ (this.controlPanelEl.shadowRootRef.getElementById('sk-toggle-inspector'))

                    if (inspectorToggle) {
                        if (this.#stateBind.inspectorActive) {
                            inspectorToggle.textContent = "Enabled"
                        } else {
                            inspectorToggle.textContent = "Disabled"
                        }
                    }
                    if (switchingToggle) {
                        if (this.#stateBind.inspectorSwitching) {
                            switchingToggle.textContent = "Enabled"
                        } else {
                            switchingToggle.textContent = "Disabled"
                        }
                    }
                }
            } else if (this.currentTab === "compatView") {
                const maxHistory = this.controlPanelEl.shadowRootRef.getElementById('sk-max-history')

                if (maxHistory && maxHistory instanceof HTMLInputElement) {
                    this.maxResultsHistoryInput = maxHistory
                    this.maxResultsHistoryInput.addEventListener('change', this.#handleMaxHistoryValue, { signal: this.#panelController?.signal })

                    if (this.#stateBind) {
                        if (this.#stateBind.maxResultsHistory >= 0 && this.#stateBind.maxResultsHistory != 10)
                            this.maxResultsHistoryInput.value = `${this.#stateBind.maxResultsHistory}`
                    }
                }
            }
        }
    }

    /**
     * Handles the transition when toggling the display.
     * @param {"show" | "hide"} display 
     */
    async #handleDisplayTransition(display) {
        if (!this.controlPanelEl) return
        
        const controlPanel = this.controlPanelEl.shadowRootRef.getElementById('sk-control-panel')

        if (controlPanel) {
            controlPanel.part.value = "control-panel"

            const transition = document.startViewTransition(() => {
                this.controlPanelEl?.renderDisplayTransition(display)
            })

            try {
                await transition.finished
            } finally {
                controlPanel.removeAttribute("part")
            }
        }
    }

    /**
     * Handles the change event for the `maxResultsHistory` input.
     * @param {Event} e 
     */
    #handleMaxHistoryValue = e => {
        const value = parseInt(/**@type {HTMLInputElement} */(e.target).value, 10)
        this.maxResultsHistory = value

        if (this.#stateBind)
            this.#stateBind.maxResultsHistory = value
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