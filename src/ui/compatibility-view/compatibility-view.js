/**@typedef {import("../../types/public").UISharedState} UISharedState */
/**@typedef {import("../../types/public").UISharedStateProps} UISharedStateProps */
/**@typedef {import("../../types/public").CompatResult} CompatResult */
import { ShinkomBus, ShinkomState, UIComponent, CompatViewElement } from "../../core";
import { RecentResultItem } from "../../core/elements";

/**@extends {UIComponent} */
export class CompatView extends UIComponent {
    /**@type {AbortController | null} */
    #compatViewController = null

    /**@type {UISharedState | null} */
    #stateBind = null

    /**@type {ShinkomState | null} */
    #stateService = null
    /**
     * @param {ShinkomBus} bus 
     * @param {ShinkomState} state 
     */
    constructor(bus, state) {
        super(bus, state)

        this.#stateService = state

        CompatView.register()

        /**@type {CompatViewElement | null} */
        this.compatViewEl = null

        /**@type {"overview" | "results" | "history"} */
        this.currentTab = "overview"

        /**@type {boolean} */
        this.active = false

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
        if (!customElements.get("sk-recent-result-item")) {
            customElements.define("sk-recent-result-item", RecentResultItem)
        }
    }

    mount() {
        if (this.compatViewEl) return

        this.compatViewEl = /**@type {CompatViewElement}*/(document.createElement('sk-compat-view'))

        this.compatViewEl.state = this.#stateService

        document.body.appendChild(this.compatViewEl)

        this.#setupShadowListeners()
    }

    #setupShadowListeners() {
        if (!this.compatViewEl) return;

        this.#compatViewController = new AbortController()

        const { signal } = this.#compatViewController

        this.compatViewEl.shadowHost.addEventListener('click', this.#handleClickEvents, { signal })
    }

    unmount() {
        if (!this.compatViewEl) return

        this.compatViewEl.remove()
        this.compatViewEl = null

        this.#resetInternalState()
    }

    #resetInternalState() {
        if (this.#compatViewController)
            this.#compatViewController.abort()

        this.#compatViewController = null
        this.currentTab = "overview"
        this.active = false

        if (this.#stateBind) {
            this.#stateBind.ignoreCompatViewEl = null
        }
    }

    /**
     * @param {UISharedState} state 
     */
    bindState(state) {
        if (!this.#stateBind)
            this.#stateBind = state

        this.#stateBind.ignoreCompatViewEl = this.compatViewEl
    }

    /**
     * @param {UISharedStateProps} prop 
     * @param {*} val 
     */
    onStateChange(prop, val) {
        if (prop === "currentTab") {
            this.currentTab = val
        }
    }

    /**
     * Handles click events within the control panel.
     * @param {PointerEvent} e
    */
    #handleClickEvents = e => {
        switch (/**@type {HTMLElement} */(e.target).id) {
            case 'sk-toggle-compat-view':
                if (!this.compatViewEl) break;

                if (!document.startViewTransition) {
                    this.compatViewEl.renderDisplayTransition(this.active ? "hide" : "show")

                    this.active = !this.active
                } else {
                    const transition = document.startViewTransition(() => {
                        this.compatViewEl?.renderDisplayTransition(this.active ? "hide" : "show")
                    })

                    transition.finished.then(() => this.active = !this.active)
                }
                break;
            case 'sk-overview-tab':
                if (this.currentTab === "overview") break;

                if (!document.startViewTransition) {
                    this.compatViewEl?.renderTabContent('overview')
                } else {
                    document.startViewTransition(() => {
                        this.compatViewEl?.renderTabContent('overview')
                    })
                }

                if (this.#stateBind)
                        this.#stateBind.currentTab = "overview"
                break;
            case 'sk-results-tab':
                if (this.currentTab === "results") break;

                if (this.compatViewEl && this.compatViewEl._resultsHistory.length > 0) {
                    if (!document.startViewTransition) {
                        this.compatViewEl.renderTabContent('results')
                    } else {
                        document.startViewTransition(() => {
                            this.compatViewEl?.renderTabContent('results')
                        })
                    }

                    if (this.#stateBind)
                        this.#stateBind.currentTab = "results"
                }
                break;
            case 'sk-history-tab':
                break;
            case 'sk-full-inspect':
                this.bus.emit('engine:full')
                break;
            default:
                break;
        }
    }
}