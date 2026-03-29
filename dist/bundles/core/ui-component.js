/**
    * Shinkom - core\ui-component
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

//#region src/core/ui-component.js
var UIComponent = class UIComponent {
	/**
	* @param {ShinkomBus} bus 
	* @param {ShinkomState} stateService 
	*/
	constructor(bus, stateService) {
		if (this.constructor === UIComponent) throw new Error("UIComponent is an abstract class and cannot be instantiated.");
		this.bus = bus;
		stateService.subscribe((prop, val) => {
			this.onStateChange(prop, val);
		});
	}
	/**
	* Mount UIComponent to the DOM.
	*/
	mount() {
		throw new Error("mount() method must be implemented.");
	}
	/**
	* Unmount UIComponent from the DOM.
	*/
	unmount() {
		throw new Error("unmount() method must be implemented.");
	}
	/**
	* Used to bind state from a proxy to a UIComponent instance.
	* 
	* Sets any initial state defined by the component.
	* @param {UISharedState} state 
	*/
	bindState(state) {
		throw new Error("bindState() method must be implemented.");
	}
	/**
	* Notify UIComponent of a state change in the `stateBind`.
	* @param {UISharedStateProps} prop 
	* @param {any} val 
	*/
	onStateChange(prop, val) {
		throw new Error("onStateChange() method must be implemented.");
	}
};
//#endregion
export { UIComponent };
