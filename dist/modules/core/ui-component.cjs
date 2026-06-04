Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region src/core/ui-component.js
/**
* Base UI component class for Shinkom UI modules.
*
* UIComponent is abstract and provides shared integration with the Shinkom
* event bus and shared state service. Subclasses must implement lifecycle
* methods for mounting, unmounting, binding state, and responding to state
* changes.
*/
var UIComponent = class UIComponent {
	/**
	* @param {ShinkomBus} bus
	* @param {ShinkomState} stateService
	*/
	constructor(bus, stateService) {
		if (this.constructor === UIComponent) throw new Error("UIComponent is an abstract class and cannot be instantiated.");
		this.bus = bus;
		this.stateService = stateService;
		stateService.subscribe((prop, val) => {
			this.onStateChange(prop, val);
		});
	}
	/**
	* Mounts the component into the DOM.
	*
	* Subclasses must implement this method to create and attach their UI.
	*/
	mount() {
		throw new Error("mount() method must be implemented.");
	}
	/**
	* Unmounts the component from the DOM.
	*
	* Subclasses must implement this method to remove their UI and cleanup.
	*/
	unmount() {
		throw new Error("unmount() method must be implemented.");
	}
	/**
	* Binds shared UI state to the component instance.
	*
	* Implementations should store the bound state reference and apply any
	* initial state values needed by the component.
	*
	* @param {UISharedState} _state
	*/
	bindState(_state) {
		throw new Error("bindState() method must be implemented.");
	}
	/**
	* Called when a shared state property changes.
	*
	* Components should override this to react to updates from the shared state
	* service.
	*
	* @param {UISharedStateProps} _prop
	* @param {any} _val
	*/
	onStateChange(_prop, _val) {
		throw new Error("onStateChange() method must be implemented.");
	}
};
//#endregion
exports.UIComponent = UIComponent;
