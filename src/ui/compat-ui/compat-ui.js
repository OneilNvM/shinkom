import { ShinkomBus, ShinkomState, UIComponent } from '~/core' 

const internalState = new WeakMap()

export class CompatUI {
    /**
     * @param {ShinkomBus} _bus
     * @param {ShinkomState} stateService
     * @param {UIComponent[]} components
     */
    constructor(_bus, stateService, components = []) {
        /**@type {UIComponent[]} */
        this.components = components

        internalState.set(this, stateService.getState())
    }

    /**
     * Bind state proxy to UI components.
     */
    #bindState() {
        const state = internalState.get(this)

        this.components.forEach(comp => comp.bindState(state))
    }

    /**
     * Initializes CompatUI components.
     */
    init() {
        try {
            this.components.forEach(comp => comp.mount())

            this.#bindState()
        } catch (error) {
            console.error(`Compat UI initialization error: ${error}`)
        }
    }

    /**
     * Destroys CompatUI component instances.
     */
    destroy() {
        this.components.forEach(comp => {
            comp.unmount()
        })
    }
}