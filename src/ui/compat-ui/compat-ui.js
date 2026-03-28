// @ts-check

/**@typedef {import('../../types/index').InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/index').UISharedStateProps} UISharedStateProps */
/**@typedef {import('../../types/index').UISharedState} UISharedState */
import { ShinkomBus, ShinkomState } from '../../core' 

const internalState = new WeakMap()

export class CompatUI {
    /**
     * @param {ShinkomBus} _bus
     * @param {ShinkomState} stateService
     * @param {any[]} components
     */
    constructor(_bus, stateService, components = []) {
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
            this.components.splice(this.components.indexOf(comp), 1)
        })
    }
}