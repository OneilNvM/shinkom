/**
    * Shinkom - shinkom
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { CompatUI } from "../ui/compat-ui/compat-ui.js";
import { SKEngine } from "../engine/engine.js";
import "../engine/index.js";
//#region src/shinkom/shinkom.js
/**@typedef {import("../types/index").InspectorConfig} InspectorConfig */
/**@typedef {import('../types/index').ShinkomEventBus} ShinkomEventBus */
var Shinkom = class {
	/**
	* @param {InspectorConfig | undefined} inspectorConfig 
	*/
	constructor(inspectorConfig = void 0) {
		/**@type {ShinkomEventBus} */
		this.bus = new EventTarget();
		/**@type {CompatUI} */
		this.compatUI = new CompatUI(this.bus, inspectorConfig);
		/**@type {SKEngine} */
		this.engine = new SKEngine();
		this.bus.addEventListener("ci:toggle", this.handleCustomEvents);
		this.bus.addEventListener("ci:inspect", this.handleCustomEvents);
		this.bus.addEventListener("ci:switch", this.handleCustomEvents);
		this.bus.addEventListener("ci:create", this.handleCustomEvents);
		this.bus.addEventListener("ci:reset", this.handleCustomEvents);
		this.bus.addEventListener("ci:destroy", this.handleCustomEvents);
	}
	/**
	* Handles the custom events sent from the bus.
	* @param {CustomEvent<string | void>} e
	*/
	handleCustomEvents = (e) => {
		switch (e.type) {
			case "ci:toggle":
				if (this.compatUI.compatInspector.inspectorEl) this.compatUI.compatInspector.destroy();
				else this.compatUI.compatInspector.setup();
				break;
			case "ci:inspect":
				if (typeof e.detail === "string") if (this.compatUI.controlPanel.multiElements) this.engine.checkElements(e.detail, this.compatUI.controlPanel.depthLevel);
				else this.engine.checkElement(e.detail);
				break;
			case "ci:switch":
				const switchVal = this.compatUI.compatInspector.enableSwitching;
				this.compatUI.compatInspector.enableSwitching = !switchVal;
				break;
			case "ci:create":
				this.compatUI.compatInspector.setup();
				break;
			case "ci:reset":
				this.compatUI.compatInspector.reset();
				break;
			case "ci:destroy":
				this.compatUI.compatInspector.destroy();
				break;
			default:
				console.error("Event type was invalid");
				break;
		}
	};
	/**
	* Initialize Shinkom
	*/
	init() {
		this.engine.initEngine();
		this.compatUI.init();
	}
	/**
	* Destroy UI components and engine instance
	*/
	destroy() {
		this.engine.destroy();
		this.compatUI.destroy();
		this.bus.removeEventListener("ci:toggle", this.handleCustomEvents);
		this.bus.removeEventListener("ci:inspect", this.handleCustomEvents);
		this.bus.removeEventListener("ci:switch", this.handleCustomEvents);
		this.bus.removeEventListener("ci:create", this.handleCustomEvents);
		this.bus.removeEventListener("ci:reset", this.handleCustomEvents);
		this.bus.removeEventListener("ci:destroy", this.handleCustomEvents);
	}
};
//#endregion
export { Shinkom };
