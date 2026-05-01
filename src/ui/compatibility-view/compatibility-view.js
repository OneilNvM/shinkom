/**@typedef {import("../../types/public").UISharedState} UISharedState */
/**@typedef {import("../../types/public").UISharedStateProps} UISharedStateProps */
/**@typedef {import("../../types/public").CompatResult} CompatResult */
import { ShinkomBus, ShinkomState, UIComponent, CompatViewElement } from "../../core";

/**@extends {UIComponent} */
export class CompatView extends UIComponent {
    /**
     * @param {ShinkomBus} bus 
     * @param {ShinkomState} state 
     */
    constructor(bus, state) {
        super(bus, state)

        /**@type {CompatViewElement | null} */
        this.compatViewEl = null

        this.bus.on('results:ready', (/**@type {CompatResult}*/e) => {
            if (this.compatViewEl) {
                this.compatViewEl.results = e
            }
        })

        customElements.define('compat-view', CompatViewElement)
    }

    mount() {
        if (this.compatViewEl) return

        this.compatViewEl = /**@type {CompatViewElement}*/(document.createElement('compat-view'))

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

    }

    /**
     * @param {UISharedStateProps} prop 
     * @param {*} val 
     */
    onStateChange(prop, val) {

    }
}