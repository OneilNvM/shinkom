/**
    * Shinkom - compatibility-view
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { UIComponent } from "../../core/ui-component.js";
import { RecentResultItem } from "../../core/elements/recent-result-item.js";
import { ResultsHistoryItem } from "../../core/elements/results-history-item.js";
import { CompatViewElement } from "../../core/elements/compat-view-element.js";
import "../../core/elements/index.js";
import "../../core/index.js";
//#region src/ui/compatibility-view/compatibility-view.js
/**@typedef {import("../../types/public").UISharedState} UISharedState */
/**@typedef {import("../../types/public").UISharedStateProps} UISharedStateProps */
/**@typedef {import("../../types/public").CompatResult} CompatResult */
/**
* CompatView manages the compatibility results panel that displays
* inspection overview, result details, and history.
*
* It mounts the `<sk-compat-view>` custom element, binds the view to
* shared state, listens for result updates from the Shinkom bus, and
* handles UI interactions such as tab switching and show/hide transitions.
*
* @extends {UIComponent}
*/
var CompatView = class CompatView extends UIComponent {
	/**@type {AbortController | null} */
	#compatViewController = null;
	/**@type {UISharedState | null} */
	#stateBind = null;
	/**@type {ShinkomState | null} */
	#stateService = null;
	/**
	* Initializes the compatibility view.
	* 
	* It requires an instance of the `ShinkomBus` and `ShinkomState` to listen
	* for event bus emits and state service notifications.
	* 
	* It also registers the `<sk-compat-view>` custom element.
	* 
	* @param {ShinkomBus} bus 
	* @param {ShinkomState} state 
	*/
	constructor(bus, state) {
		super(bus, state);
		this.#stateService = state;
		CompatView.register();
		/**@type {CompatViewElement | null} */
		this.compatViewEl = null;
		/**@type {"overview" | "results" | "history"} */
		this.currentTab = "overview";
		/**@type {boolean} */
		this.active = false;
		/**@type {() => void} */
		this.unsubEvent = () => {};
	}
	/**
	* Register custom elements to the CustomElementRegistry.
	*/
	static register() {
		if (typeof window !== "undefined" && "customElements" in globalThis) {
			if (!globalThis.customElements.get("sk-compat-view")) globalThis.customElements.define("sk-compat-view", CompatViewElement);
			if (!globalThis.customElements.get("sk-recent-result-item")) globalThis.customElements.define("sk-recent-result-item", RecentResultItem);
			if (!globalThis.customElements.get("sk-history-item")) globalThis.customElements.define("sk-history-item", ResultsHistoryItem);
		}
	}
	/**
	* Subscribes to compatibility result events from the Shinkom bus.
	*
	* When a new result payload is available, the view element is updated
	* with the latest compatibility data.
	*/
	#setupEventBusListeners() {
		this.unsubEvent = this.bus.on("results:ready", (e) => {
			if (this.compatViewEl) this.compatViewEl.results = e;
		});
	}
	/**
	* Unsubscribes from compatibility result events.
	*/
	#cleanupEventBusListeners() {
		this.unsubEvent();
	}
	mount() {
		if (this.compatViewEl || document.querySelector("sk-compat-view")) return;
		this.compatViewEl = document.createElement("sk-compat-view");
		this.compatViewEl.state = this.#stateService;
		this.compatViewEl.bus = this.bus;
		document.body.appendChild(this.compatViewEl);
		this.#setupShadowListeners();
	}
	/**
	* Sets up shadow DOM listeners for the compatibility view.
	*
	* The controller allows all panel click listeners to be removed cleanly
	* when the view is unmounted.
	*/
	#setupShadowListeners() {
		if (!this.compatViewEl) return;
		this.#compatViewController = new AbortController();
		const { signal } = this.#compatViewController;
		this.compatViewEl.shadowHost.addEventListener("click", this.#handleClickEvents, { signal });
		this.#setupEventBusListeners();
	}
	unmount() {
		if (!this.compatViewEl) return;
		this.compatViewEl.remove();
		this.compatViewEl = null;
		this.#cleanupEventBusListeners();
		this.#resetInternalState();
	}
	/**
	* Resets internal state and aborts all shadow DOM event listeners.
	*
	* This clears the active view state, resets the current tab, and removes
	* the compatibility view element from the shared ignore state.
	*/
	#resetInternalState() {
		if (this.#compatViewController) this.#compatViewController.abort();
		this.#compatViewController = null;
		this.currentTab = "overview";
		this.active = false;
		if (this.#stateBind) this.#stateBind.ignoreCompatViewEl = null;
	}
	/**
	* @param {UISharedState} state 
	*/
	bindState(state) {
		if (!this.#stateBind) this.#stateBind = state;
		this.#stateBind.ignoreCompatViewEl = this.compatViewEl;
	}
	/**
	* @param {UISharedStateProps} prop 
	* @param {*} val 
	*/
	onStateChange(prop, val) {
		if (prop === "compatViewTab") this.currentTab = val;
	}
	/**
	* Handles click events inside the compatibility view shadow DOM.
	*
	* Supported actions include toggling the panel display, switching tabs,
	* and requesting a full inspection from the engine.
	*
	* @param {PointerEvent} e
	*/
	#handleClickEvents = async (e) => {
		switch (e.target.id) {
			case "sk-toggle-compat-view":
				if (!this.compatViewEl) break;
				if (!document.startViewTransition) {
					this.compatViewEl.renderDisplayTransition(this.active ? "hide" : "show");
					this.active = !this.active;
				} else {
					const container = this.compatViewEl.shadowRootRef.getElementById("sk-compat-view-container");
					if (container) {
						container.part.value = "compat-view";
						const transition = document.startViewTransition(() => {
							this.compatViewEl?.renderDisplayTransition(this.active ? "hide" : "show");
						});
						try {
							await transition.finished;
						} finally {
							this.active = !this.active;
							container.removeAttribute("part");
						}
					}
				}
				break;
			case "sk-overview-tab":
				if (this.currentTab === "overview") break;
				this.#handleTabChange("overview");
				break;
			case "sk-results-tab":
				if (this.currentTab === "results") break;
				this.#handleTabChange("results");
				break;
			case "sk-history-tab":
				if (this.currentTab === "history") break;
				this.#handleTabChange("history");
				break;
			case "sk-full-inspect":
				this.bus.emit("engine:full");
				break;
			default: break;
		}
	};
	/**
	* Handles navigation between compatibility view tabs.
	*
	* This method renders the selected tab content and updates shared state.
	* When view transitions are available, it performs an animated tab change.
	*
	* @param {"overview" | "results" | "history"} tab
	*/
	async #handleTabChange(tab) {
		if (!this.compatViewEl) return;
		if (!document.startViewTransition) {
			this.compatViewEl.renderTabContent(tab);
			if (this.#stateBind) this.#stateBind.compatViewTab = tab;
		} else {
			const mainSection = this.compatViewEl.shadowRootRef.getElementById("sk-compat-view-main");
			if (mainSection) {
				const tabs = [
					"overview",
					"results",
					"history"
				];
				const direction = tabs.indexOf(tab) > tabs.indexOf(this.currentTab) ? "forward" : "backward";
				mainSection.part.value = "compat-view";
				document.documentElement.dataset.transition = direction;
				const transition = document.startViewTransition(() => {
					this.compatViewEl?.renderTabContent(tab);
				});
				if (this.#stateBind) this.#stateBind.compatViewTab = tab;
				try {
					await transition.finished;
				} finally {
					mainSection.removeAttribute("part");
					delete document.documentElement.dataset.transition;
				}
			}
		}
	}
};
//#endregion
export { CompatView };
