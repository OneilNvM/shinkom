Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
require("../../core/index.cjs");
//#region src/ui/compat-ui/compat-ui.js
/**@type {WeakMap<WeakKey, UISharedState>} */
const internalState = /* @__PURE__ */ new WeakMap();
var CompatUI = class {
	/**
	* Initializes the provided UI components.
	* 
	* It requires an instance of the `ShinkomBus` and `ShinkomState` and the UI
	* components to be mounted.
	* 
	* It sets a `WeakMap` with the Proxy state from the state service for binding
	* state to the components after being mounted.
	* 
	* @param {ShinkomBus} _bus
	* @param {ShinkomState} stateService
	* @param {UIComponent[]} components
	*/
	constructor(_bus, stateService, components = []) {
		/**@type {UIComponent[]} */
		this.components = components;
		internalState.set(this, stateService.getState());
	}
	/**
	* Bind state proxy to UI components.
	*/
	#bindState() {
		const state = internalState.get(this);
		if (state) this.components.forEach((comp) => comp.bindState(state));
	}
	/**
	* Initializes CompatUI components.
	*/
	init() {
		try {
			this.components.forEach((comp) => comp.mount());
			this.#bindState();
		} catch (error) {
			console.error(`Compat UI initialization error: ${error}`);
		}
	}
	/**
	* Destroys CompatUI component instances.
	*/
	destroy() {
		this.components.forEach((comp) => {
			comp.unmount();
		});
	}
};
//#endregion
exports.CompatUI = CompatUI;
