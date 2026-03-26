/**@typedef {import('../../types/index').InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/index').ShinkomEventBus} ShinkomEventBus */
/**@typedef {import('../../types/index').UISharedState} UISharedState */

export class CompatInspector {
    /**@type {UISharedState | null}  */
    #stateBind = null;

    #freezeInspector = false;

    /**@type {AbortController | null} */
    #inspectorController = null;

    /**@type {HTMLDivElement | null} */
    #ignorePanelEl = null;

    /**
     * @param {InspectorConfig} config 
     * @param {ShinkomEventBus | null} bus
     */
    constructor(config = { disabled: false, keyboardShorcuts: false }, bus = null) {
        /**@type {InspectorConfig} */
        this.config = config

        /**@type {ShinkomEventBus | null} */
        this.bus = bus;

        /**@type {boolean} */
        this.enableSwitching = false;

        /**@type {HTMLDivElement | null} */
        this.inspectorEl = null;

        /**@type {HTMLElement | null} */
        this.frozenTarget = null;
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
            this.setup()
            return;
        }
        if (this.inspectorEl && ctrlDown && shiftDown && e.key === '|') {
            this.reset()
            return;
        }
        if (this.inspectorEl && ctrlDown && altDown && e.key === '\\') {
            this.destroy()
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

        this.bus?.dispatchEvent(new CustomEvent('ci:inspect', { detail: this.frozenTarget.outerHTML }))

        Object.assign(this.inspectorEl.style, {
            backgroundColor: 'rgba(255,0,0,.3)',
            outlineColor: 'rgb(255,0,0)'
        })
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

            this.bus?.dispatchEvent(new CustomEvent('ci:inspect', { detail: this.frozenTarget.outerHTML }))

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
     * @param {HTMLDivElement} el 
     */
    setIgnorePanel(el) {
        if (this.#ignorePanelEl)
            throw new Error("Control panel is already ignored.")

        this.#ignorePanelEl = el
    }

    /**
     * Sets the `stateBind` to the parameter state.
     * 
     * `state` must be a Proxy to listen for changes.
     * @param {UISharedState} state 
     */
    bindState(state) {
        if (!this.#stateBind)
            this.#stateBind = state
    }

    /**
     * Notify Inspector of a state change in the `stateBind`.
     * @param {string} prop 
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

    /**
     * Initializes event listeners on `window` and creates the inspector.
     */
    setup() {
        if (this.inspectorEl || this.config.disabled) {
            console.warn("Inspector is either disabled or already exists")
            return;
        }

        this.#inspectorController = new AbortController()
        const { signal } = this.#inspectorController

        window.addEventListener('pointerover', this.#handlePointerOver, { signal })
        window.addEventListener('click', this.#handleToggleFreeze, { signal, capture: true })
        window.addEventListener('keydown', this.#handleKeyboard)

        this.createInspector()

        if (this.#stateBind)
            this.#stateBind.inspectorActive = this.inspectorEl !== null
    }

    /**
     * Resets the inspector.
     */
    reset() {
        if (!this.inspectorEl) {
            console.warn("Cannot reset inspector as it does not exist.")
            return;
        };

        console.log("resetting inspector")
        this.destroy()

        this.setup()
    }

    /**
     * Destroys the inspector.
     */
    destroy() {
        try {
            if (!this.inspectorEl) {
                console.warn("Cannot destroy inspector as it does not exist.")
                return;
            }

            console.log("destroying inspector")

            if (this.#inspectorController)
                this.#inspectorController.abort()

            this.inspectorEl.remove()
            this.inspectorEl = null
            this.#inspectorController = null

            this.#freezeInspector = false;
            this.enableSwitching = false;
            this.frozenTarget = null;

            if (this.#stateBind)
                this.#stateBind.inspectorActive = false
        } catch (error) {
            console.error(`Inspector destroy error: ${error}`)
        }
    }
}