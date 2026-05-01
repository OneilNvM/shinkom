/**@typedef {import("../../types/public").UISharedState} UISharedState */
/**@typedef {import("../../types/public").UISharedStateProps} UISharedStateProps */
/**@typedef {import("../../types/public").CompatResult} CompatResult */
import { ShinkomBus, ShinkomState, UIComponent, CompatViewElement } from "../../core";

/**@extends {UIComponent} */
export class CompatView extends UIComponent {
    /**@type {UISharedState | null} */
    #state = null
    /**
     * @param {ShinkomBus} bus 
     * @param {ShinkomState} state 
     */
    constructor(bus, state) {
        super(bus, state)

        CompatView.register()

        /**@type {CompatViewElement | null} */
        this.compatViewEl = null

        this.bus.on('results:ready', (/**@type {CompatResult}*/e) => {
            if (this.compatViewEl) {
                this.compatViewEl.results = e
            }
        })
    }

    static register() {
        if (!customElements.get('sk-compat-view')) {
            customElements.define('sk-compat-view', CompatViewElement)
        }
    }

    mount() {
        if (this.compatViewEl) return

        this.compatViewEl = /**@type {CompatViewElement}*/(document.createElement('sk-compat-view'))

        document.body.appendChild(this.compatViewEl)
    }

    unmount() {
        if (!this.compatViewEl) return

        this.compatViewEl.remove()
        this.compatViewEl = null
    }

    /**
     * @param {UISharedState} state 
     */
    bindState(state) {
        if (!this.#state)
            this.#state = state
    }

    /**
     * @param {UISharedStateProps} prop 
     * @param {*} val 
     */
    onStateChange(prop, val) {

    }
}