import init, { greet } from '../pkg/browserx_core'

class CompatInspector {
    #freezeInspector = false;
    #inspectorController = null;

    constructor(config = {}) {
        this.config = {
            disabled: false,
            keyboardShortcuts: false,
            ...config
        }
        this.enableSwitching = false;
        this.inspectorEl = null;
        this.frozenTarget = null;
    }

    #handleToggleFreeze = e => {
        e.preventDefault()
        e.stopPropagation()

        if (!this.#freezeInspector) {
            this.#freeze(e.target)
            return;
        }
        if (this.#freezeInspector && e.target === this.frozenTarget) {
            this.#unfreeze()
            return;
        } else {
            this.#switch(e.target)
        }
    }

    #handlePointerOver = e => {
        if (this.#freezeInspector) return;

        this.#update(e.target)
    }

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
        }
    }

    #freeze(target) {
        this.#freezeInspector = true
        this.frozenTarget = target

        Object.assign(this.inspectorEl.style, {
            backgroundColor: 'rgba(255,0,0,.3)',
            outlineColor: 'rgb(255,0,0)'
        })
    }
    #unfreeze() {
        this.#freezeInspector = false
        this.frozenTarget = null

        Object.assign(this.inspectorEl.style, {
            backgroundColor: 'rgba(0,255,0,.3)',
            outlineColor: 'rgb(0,255,0)'
        })
    }
    #switch(target) {
        if (this.enableSwitching) {
            this.#freezeInspector = true
            this.frozenTarget = target

            this.#update(target)
        }
    }

    #createInspector() {
        if (this.inspectorEl) return;

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
            zIndex: '9999',
            transitionProperty:'width, height, transform',
            transitionDuration: '300ms',
            transitionTimingFunction:'ease-out',
            willChange: 'width, height, transform',
            pointerEvents: 'none'
        })

        document.body.appendChild(this.inspectorEl)
    }

    async setup() {
        if (this.inspectorEl || this.config.disabled) return;

        await init()

        greet('BrowserX')

        this.#inspectorController = this.#inspectorController === null && new AbortController()
        const { signal } = this.#inspectorController

        window.addEventListener('pointerover', this.#handlePointerOver, { signal })
        window.addEventListener('click', this.#handleToggleFreeze, { signal, capture: true })
        window.addEventListener('keydown', this.#handleKeyboard)

        this.#createInspector()
        console.log(this.#inspectorController)
    }

    #update(target) {
        const { width, height, top, left } = target.getBoundingClientRect()

        Object.assign(this.inspectorEl.style, {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translateX(${left}px) translateY(${top}px)`
        })
    }

    reset() {
        if (!this.inspectorEl) return;
        console.log("resetting inspector")
        this.destroy()

        this.setup()
    }

    destroy() {
        if (!this.inspectorEl) return;
        console.log("destroying inspector")

        this.#inspectorController.abort()
        document.body.removeChild(this.inspectorEl)
        this.inspectorEl = null
        this.#inspectorController = null

        this.#freezeInspector = false;
        this.enableSwitching = true;
        this.frozenTarget = null;
    }
}

export { CompatInspector }