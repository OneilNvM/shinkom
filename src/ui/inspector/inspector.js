/**@typedef {import('../../types/public').UISharedState} UISharedState */
/**@typedef {import('../../types/public').InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/public').UISharedStateProps} UISharedStateProps */
import { ShinkomBus, ShinkomState, UIComponent } from '../../core';
import { CompatInspectorElement } from '../../core/elements';

/**
 * CompatInspector manages the interactive compatibility inspector overlay.
 *
 * It mounts the custom element `<sk-compat-inspector>`, synchronizes
 * the overlay state with the shared UI state, and emits inspection
 * requests through the Shinkom event bus.
 *
 * The inspector supports pointer tracking, element freezing, optional
 * keyboard shortcuts, and soft mount/unmount flows that preserve or
 * skip event bus bindings.
 *
 * @extends {UIComponent}
 */
export class CompatInspector extends UIComponent {
    /**@type {UISharedState | null}  */
    #stateBind = null;

    #freezeInspector = false;

    /**@type {AbortController | null} */
    #inspectorController = null;

    /**
     * Initializes the compatibility inspector.
     * 
     * It requires an instance of the `ShinkomBus` and `ShinkomState` to listen
     * for event bus emits and state service notifications.
     * 
     * It also registers the `<sk-compat-inspector>` custom element.
     * 
     * It has an optional configuration object for disabling the inspector
     * and toggling keyboard shortcuts.
     * 
     * ### Keyboard Shortcuts
     * 
     * - Create inspector: Ctrl + Alt + c
     * - Reset inspector: Ctrl + Shift + |
     * - Destroy inspector: Ctrl + Alt + \
     * - Toggle element switching: Ctrl + \
     * 
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

        /**@type {(() => void)[]} */
        this.unsubEvents = []
    }

    /**
     * Register custom elements to the CustomElementRegistry.
     */
    static register() {
        if (!customElements.get('sk-compat-inspector')) {
            customElements.define('sk-compat-inspector', CompatInspectorElement)
        }
    }

    /**
     * Registers event bus listeners for the inspector.
     */
    #setupEventBusListeners() {
        this.unsubEvents = [
            this.bus.on('ci:toggle', () => {
                if (this.#stateBind?.inspectorActive) {
                    this.#removeGlobalListeners()
                } else {
                    this.#setupGlobalListeners()
                }
            }),
            this.bus.on('ci:create', () => {
                this.mountSoft()
            }),
            this.bus.on('ci:reset', () => {
                this.resetSoft()
            }),
            this.bus.on('ci:destroy', () => {
                this.unmountSoft()
            })
        ]
    }

    /**
     * Removes event bus listeners for the inspector.
     */
    #cleanupEventBusListeners() {
        this.unsubEvents.forEach(cleanup => cleanup())
        this.unsubEvents = []
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
            this.mountSoft()
            return;
        }
        if (this.inspectorEl && ctrlDown && shiftDown && e.key === '|') {
            this.resetSoft()
            return;
        }
        if (this.inspectorEl && ctrlDown && altDown && e.key === '\\') {
            this.unmountSoft()
            return;
        }
        if (ctrlDown && e.key === '\\') {
            this.enableSwitching = !this.enableSwitching

            if (this.#stateBind)
                this.#stateBind.inspectorSwitching = this.enableSwitching
        }
    }

    /**
     * Handler toggles inspector freezing on elements.
     * @param {PointerEvent} e
     */
    #handleToggleFreeze = e => {
        if (
            e.composedPath().includes(/**@type {EventTarget} */(this.#stateBind?.ignorePanelEl))
            || e.composedPath().includes(/**@type {EventTarget} */(this.#stateBind?.ignoreCompatViewEl))
        ) return;

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

        const { width, height, top, left } = target.getBoundingClientRect()
        const scrollTop = window.scrollY
        const scrollLeft = window.scrollX

        this.#freezeInspector = true
        this.frozenTarget = target

        this.#inspect(this.frozenTarget.outerHTML)

        Object.assign(this.inspectorEl.shadowHost.style, {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translateX(${left + scrollLeft}px) translateY(${top + scrollTop}px)`,
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
            default:
                break;
        }
    }

    mount() {
        if (this.inspectorEl || this.config?.disabled) {
            console.warn("Inspector is either disabled or already exists")
            return;
        }

        console.log("Creating inspector")

        this.inspectorEl = /**@type {CompatInspectorElement}*/(document.createElement('sk-compat-inspector'))

        document.body.appendChild(this.inspectorEl)

        this.#setupGlobalListeners()

        this.#setupEventBusListeners()

        if (this.#stateBind) {
            this.#stateBind.inspectorActive = this.inspectorEl !== null
            this.#stateBind.inspectorExists = this.inspectorEl !== null
        }
    }

    /**
     * Mounts the inspector without setting up event bus listeners or state listeners.
     *
     * This is useful when the inspector should be rendered and tracked visually,
     * but the surrounding application already manages bus events separately.
     *
     * **Only use this if you do not need to setup listeners.**
     */
    mountSoft() {
        if (this.inspectorEl || this.config?.disabled) {
            console.warn("Inspector is either disabled or already exists")
            return;
        }

        console.log("Soft creating inspector")

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

    /**
     * Resets the inspector using soft operations.
     */
    resetSoft() {
        if (!this.inspectorEl) {
            console.warn("Cannot reset inspector as it does not exist.")
            return;
        };

        console.log("Soft resetting inspector")

        this.unmountSoft()
        this.mountSoft()
    }

    unmount() {
        try {
            if (!this.inspectorEl && this.unsubEvents.length === 0) {
                console.warn("Cannot destroy inspector as it does not exist.")
                return;
            }

            console.log("Destroying inspector")

            this.#resetInternalState()
            this.inspectorEl?.remove()
            this.inspectorEl = null

            this.#cleanupEventBusListeners()
        } catch (error) {
            console.error(`Inspector destroy error: ${error}`)
        }
    }

    /**
     * Unmounts the inspector without cleaning up event bus listeners or state listeners.
     *
     * This preserves any active bus subscriptions when the visual overlay is
     * temporarily removed.
     *
     * **Only use this if you still need the listeners after unmounting.**
     */
    unmountSoft() {
        try {
            if (!this.inspectorEl) {
                console.warn("Cannot destroy inspector as it does not exist.")
                return;
            }

            console.log("Soft destroying inspector")

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