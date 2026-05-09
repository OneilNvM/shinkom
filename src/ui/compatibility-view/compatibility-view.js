/**@typedef {import("../../types/public").UISharedState} UISharedState */
/**@typedef {import("../../types/public").UISharedStateProps} UISharedStateProps */
/**@typedef {import("../../types/public").CompatResult} CompatResult */
import { ShinkomBus, ShinkomState, UIComponent, CompatViewElement } from "../../core";
import { RecentResultItem, ResultsHistoryItem } from "../../core/elements";

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
        if (!customElements.get("sk-history-item")) {
            customElements.define("sk-history-item", ResultsHistoryItem)
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
    #handleClickEvents = async e => {
        switch (/**@type {HTMLElement} */(e.target).id) {
            case 'sk-toggle-compat-view':
                if (!this.compatViewEl) break;

                if (!document.startViewTransition) {
                    this.compatViewEl.renderDisplayTransition(this.active ? "hide" : "show")

                    this.active = !this.active
                } else {
                    const container = this.compatViewEl.shadowRoot?.getElementById('sk-compat-view-container')
                    if (container) {
                        container.part.value = "compat-view"

                        const transition = document.startViewTransition(() => {
                            this.compatViewEl?.renderDisplayTransition(this.active ? "hide" : "show")
                        })

                        try {
                            await transition.finished
                        } finally {
                            this.active = !this.active
                            container.removeAttribute("part")
                        }
                    }
                }
                break;
            case 'sk-overview-tab':
                if (this.currentTab === "overview") break;

                this.#handleTabChange("overview")
                break;
            case 'sk-results-tab':
                if (this.currentTab === "results") break;

                this.#handleTabChange("results")
                break;
            case 'sk-history-tab':
                if (this.currentTab === "history") break;

                this.#handleTabChange("history")
                break;
            case 'sk-full-inspect':
                this.bus.emit('engine:full')
                break;
            default:
                break;
        }
    }

    /**
     * @param {"overview" | "results" | "history"} tab 
    */
    async #handleTabChange(tab) {
        if (this.compatViewEl?._resultsHistory.length === 0) return

        if (!document.startViewTransition) {
            this.compatViewEl?.renderTabContent(tab)
        } else {
            const mainSection = this.compatViewEl?.shadowRoot?.getElementById('sk-compat-view-main')

            if (mainSection) {
                const tabs = ["overview", "results", "history"]
                const direction = tabs.indexOf(tab) > tabs.indexOf(this.currentTab) ? "forward" : "backward"

                mainSection.part.value = "compat-view"
                document.documentElement.dataset.transition = direction

                const transition = document.startViewTransition(() => {
                    this.compatViewEl?.renderTabContent(tab)
                })

                if (this.#stateBind)
                    this.#stateBind.currentTab = tab

                try {
                    await transition.finished
                } finally {
                    mainSection.removeAttribute('part')
                    delete document.documentElement.dataset.transition
                }
            }
        }
    }
}