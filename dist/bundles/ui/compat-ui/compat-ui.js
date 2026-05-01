/**
    * Shinkom - compat-ui
    * @version 1.0.2
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

//#region src/ui/compat-ui/compat-ui.js
const internalState = /* @__PURE__ */ new WeakMap();
var CompatUI = class {
	/**
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
		this.components.forEach((comp) => comp.bindState(state));
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
export { CompatUI };
