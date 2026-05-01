/**@typedef {import('../../types/public').UISharedState} UISharedState */
/**@typedef {import('../../types/public').InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/public').UISharedStateProps} UISharedStateProps */
import { ShinkomBus, ShinkomState, UIComponent } from '../../core';
import { CompatControlPanelElement, CompatInspectorElement } from '../../core/elements';

/**@extends {UIComponent} */
export class CompatInspector extends UIComponent {
    /**@type {UISharedState | null}  */
    #stateBind = null;

    #freezeInspector = false;

    /**@type {AbortController | null} */
    #inspectorController = null;

    /**@type {CompatControlPanelElement | null} */
    #ignorePanelEl = null;

    /**
     * @param {ShinkomBus} bus
     * @param {ShinkomState} stateService
     * @param {InspectorConfig | undefined} config 
     */
    constructor(bus, stateService, config = undefined) {
        super(bus, stateService)

        CompatInspector.register()

        /**@type {InspectorConfig | undefined} */
        this.config = config

        /**@type {boolean} */
        this.enableSwitching = false;

        /**@type {CompatInspectorElement | null} */
        this.inspectorEl = null;

        /**@type {HTMLElement | null} */
        this.frozenTarget = null;

        this.bus.on('ci:toggle', () => {
            if (this.#stateBind?.inspectorActive) {
                this.#removeGlobalListeners()
            } else {
                this.#setupGlobalListeners()
            }
        })
        this.bus.on('ci:create', () => {
            this.mount()
        })
        this.bus.on('ci:reset', () => {
            this.reset()
        })
        this.bus.on('ci:destroy', () => {
            this.unmount()
        })
    }

    static register() {
        if (!customElements.get('sk-compat-inspector')) {
            customElements.define('sk-compat-inspector', CompatInspectorElement)
        }
    }

    /**
     * Handler responds to keyboard shortcuts.
     * @param {KeyboardEvent} e
     */
    #handleKeyboard = e => {
        const ctrlDown = e.ctrlKey
        const shiftDown = e.shiftKey
        const altDown = e.altKey

        if (!this.inspectorEl && ctrlDown && altDown && e.key === 'c') {
            this.mount()
            return;
        }
        if (this.inspectorEl && ctrlDown && shiftDown && e.key === '|') {
            this.reset()
            return;
        }
        if (this.inspectorEl && ctrlDown && altDown && e.key === '\\') {
            this.unmount()
            return;
        }
        if (ctrlDown && e.key === '\\') {
            this.enableSwitching = !this.enableSwitching
            console.log(`Switching is ${this.enableSwitching ? 'enabled' : 'disabled'}`)

            if (this.#stateBind)
                this.#stateBind.inspectorSwitching = this.enableSwitching
        }
    }

    /**
     * Handler toggles inspector freezing on elements.
     * @param {PointerEvent} e
     */
    #handleToggleFreeze = e => {
        if (e.composedPath().includes(/**@type {EventTarget} */(this.#ignorePanelEl))) return;

        e.preventDefault()
        e.stopPropagation()

        if (!this.#freezeInspector) {
            this.#freeze(/**@type {HTMLElement} */(e.target))
            return;
        }
        if (this.#freezeInspector && e.target === this.frozenTarget) {
            this.#unfreeze()
            return;
        } else {
            this.#switch(/**@type {HTMLElement} */(e.target))
        }
    }

    /**
     * Freezes inspector on selected target.
     * @param {HTMLElement} target
     */
    #freeze(target) {
        if (!this.inspectorEl) return;

        this.#freezeInspector = true
        this.frozenTarget = target

        this.#inspect(this.frozenTarget.outerHTML)

        Object.assign(this.inspectorEl.shadowHost.style, {
            backgroundColor: 'rgba(255,0,0,.3)',
            outlineColor: 'rgb(255,0,0)'
        })
    }

    /**@param {string} frozenTarget  */
    #inspect(frozenTarget) {
        if (this.#stateBind) {
            this.bus.emit('engine:inspect', {
                detail: {
                    elem: frozenTarget,
                    multiElements: this.#stateBind.multiElements,
                    depthLevel: this.#stateBind.depthLevel
                }
            })
        }

    }

    /**
     * Unfreezes inspector from selected element.
     */
    #unfreeze() {
        if (!this.inspectorEl) return;

        this.#freezeInspector = false
        this.frozenTarget = null

        Object.assign(this.inspectorEl.shadowHost.style, {
            backgroundColor: 'rgba(0,255,0,.3)',
            outlineColor: 'rgb(0,255,0)'
        })
    }

    /**
     * Handler updates inspector to wrap target element.
     * @param {PointerEvent} e
     */
    #handlePointerOver = e => {
        if (this.#freezeInspector) return;

        try {
            this.#update(/**@type {HTMLElement} */(e.target))
        } catch (error) {
            console.error(`Inspector pointerOver error: ${error}`)
        }
    }

    /**
     * Switches inspector to target a different element.
     * @param {HTMLElement} target 
     */
    #switch(target) {
        if (this.enableSwitching) {
            this.#freezeInspector = true
            this.frozenTarget = target

            this.#inspect(this.frozenTarget.outerHTML)

            try {
                this.#update(target)
            } catch (error) {
                console.error(`Inspector switch error: ${error}`)
            }
        }
    }

    /**
     * Updates the position of the inspector when moving to a different element.
     * @param {HTMLElement} target 
     */
    #update(target) {
        if (!this.inspectorEl) throw new Error("Failed to update inspector position and size as it does not exist.");

        const { width, height, top, left } = target.getBoundingClientRect()
        const scrollTop = window.scrollY
        const scrollLeft = window.scrollX

        Object.assign(this.inspectorEl.shadowHost.style, {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translateX(${left + scrollLeft}px) translateY(${top + scrollTop}px)`
        })
    }

    /**
     * Set inspector to ignore control panel div.
     * @param {CompatControlPanelElement | null} el 
     */
    #setIgnorePanel(el) {
        if (!(el instanceof CompatControlPanelElement) && el !== null)
            throw new Error("el must be of type HTMLDivElement or null")

        this.#ignorePanelEl = el
    }

    /**
     * @param {UISharedState} state 
     */
    bindState(state) {
        if (!this.#stateBind)
            this.#stateBind = state

        this.#stateBind.inspectorActive = this.inspectorEl !== null
        this.#stateBind.inspectorExists = this.inspectorEl !== null
    }

    /**
     * @param {UISharedStateProps} prop 
     * @param {any} val 
     */
    onStateChange(prop, val) {
        switch (prop) {
            case "inspectorSwitching":
                this.enableSwitching = val
                break;
            case "ignorePanelEl":
                this.#setIgnorePanel(val)
                break;
            default:
                break;
        }
    }

    mount() {
        if (this.inspectorEl || this.config?.disabled) {
            console.warn("Inspector is either disabled or already exists")
            return;
        }

        this.inspectorEl = /**@type {CompatInspectorElement}*/(document.createElement('sk-compat-inspector'))

        document.body.appendChild(this.inspectorEl)

        this.#setupGlobalListeners()

        if (this.#stateBind) {
            this.#stateBind.inspectorActive = this.inspectorEl !== null
            this.#stateBind.inspectorExists = this.inspectorEl !== null
        }
    }

    /**
     * Setup event listeners on `window` object.
     */
    #setupGlobalListeners() {
        if (!this.inspectorEl) {
            console.warn("Cannot activate inspector as it does not exist.")
            return;
        }

        this.#inspectorController = new AbortController()
        const { signal } = this.#inspectorController

        window.addEventListener('pointerover', this.#handlePointerOver, { signal })
        window.addEventListener('click', this.#handleToggleFreeze, { signal, capture: true })
        if (this.config?.keyboardShortcuts) {
            window.addEventListener('keydown', this.#handleKeyboard)
        }

        if (this.#stateBind)
            this.#stateBind.inspectorActive = true
    }

    /**
     * Remove event listeners on `window` object.
     */
    #removeGlobalListeners() {
        if (!this.inspectorEl) {
            console.warn("Cannot deactivate inspector as it does not exist.")
            return;
        }

        if (this.#inspectorController)
            this.#inspectorController.abort()

        this.#inspectorController = null

        if (this.#stateBind)
            this.#stateBind.inspectorActive = false
    }

    /**
     * Resets the inspector.
     */
    reset() {
        if (!this.inspectorEl) {
            console.warn("Cannot reset inspector as it does not exist.")
            return;
        };

        console.log("Resetting inspector")

        this.unmount()
        this.mount()
    }

    unmount() {
        try {
            if (!this.inspectorEl) {
                console.warn("Cannot destroy inspector as it does not exist.")
                return;
            }

            console.log("Destroying inspector")

            this.#resetInternalState()
            this.inspectorEl.remove()
            this.inspectorEl = null
        } catch (error) {
            console.error(`Inspector destroy error: ${error}`)
        }
    }

    /**
     * Reset internal state of the instance and any related state
     * in the `stateBind`.
     */
    #resetInternalState() {
        this.#removeGlobalListeners()

        this.#freezeInspector = false;
        this.enableSwitching = false;
        this.frozenTarget = null;

        if (this.#stateBind) {
            this.#stateBind.inspectorActive = false
            this.#stateBind.inspectorExists = false
            this.#stateBind.inspectorSwitching = false
        }
    }
}