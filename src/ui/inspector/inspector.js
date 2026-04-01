/**@typedef {import('~/types/public').UISharedState} UISharedState */
/**@typedef {import('~/types/public').InspectorConfig} InspectorConfig */
/**@typedef {import('~/types/public').UISharedStateProps} UISharedStateProps */
import { ShinkomBus, ShinkomState, UIComponent } from '~/core';

/**@extends {UIComponent} */
export class CompatInspector extends UIComponent {
    /**@type {UISharedState | null}  */
    #stateBind = null;

    #freezeInspector = false;

    /**@type {AbortController | null} */
    #inspectorController = null;

    /**@type {HTMLDivElement | null} */
    #ignorePanelEl = null;

    /**
     * @param {ShinkomBus} bus
     * @param {ShinkomState} stateService
     * @param {InspectorConfig} config 
     */
    constructor(bus, stateService, config = { disabled: false, keyboardShorcuts: false }) {
        super(bus, stateService)

        /**@type {InspectorConfig} */
        this.config = config

        /**@type {boolean} */
        this.enableSwitching = false;

        /**@type {HTMLDivElement | null} */
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

        // stateService.subscribe((prop, val) => {
        //     this.#onStateChange(prop, val)
        // })
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

        Object.assign(this.inspectorEl.style, {
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

        Object.assign(this.inspectorEl.style, {
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

        Object.assign(this.inspectorEl.style, {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translateX(${left + scrollLeft}px) translateY(${top + scrollTop}px)`
        })
    }

    /**
     * Creates the inspector element.
     */
    createInspector() {
        if (this.inspectorEl) {
            console.warn("Inspector element already exists.")
            return;
        }

        this.inspectorEl = document.createElement('div')

        this.inspectorEl.id = 'compat-inspector'
        Object.assign(this.inspectorEl.style, {
            position: 'absolute',
            top: '0',
            backgroundColor: 'rgba(0, 255, 0, .3)',
            outlineWidth: '1px',
            outlineStyle: 'dashed',
            outlineColor: 'rgb(0, 255, 0)',
            outlineOffset: '4px',
            zIndex: '9998',
            transitionProperty: 'width, height, transform',
            transitionDuration: '300ms',
            transitionTimingFunction: 'ease-out',
            willChange: 'width, height, transform',
            pointerEvents: 'none'
        })

        document.body.appendChild(this.inspectorEl)
    }

    /**
     * Set inspector to ignore control panel div.
     * @param {HTMLDivElement | null} el 
     */
    #setIgnorePanel(el) {
        if (!(el instanceof HTMLDivElement) && el !== null)
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
        if (this.inspectorEl || this.config.disabled) {
            console.warn("Inspector is either disabled or already exists")
            return;
        }

        this.createInspector()
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
        window.addEventListener('keydown', this.#handleKeyboard)

        if (this.#stateBind)
            this.#stateBind.inspectorActive = true
    }

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