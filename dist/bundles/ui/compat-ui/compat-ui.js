/**
    * Shinkom - compat-ui
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { CompatInspector } from "../inspector/inspector.js";
import { CompatControlPanel } from "../control-panel/control-panel.js";
//#region src/ui/compat-ui/compat-ui.js
/**@typedef {import('../../types/index').InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/index').ShinkomEventBus} ShinkomEventBus */
var CompatUI = class {
	/**
	* @param {ShinkomEventBus} bus
	* @param {InspectorConfig | undefined} inspectorConfig
	*/
	constructor(bus, inspectorConfig = void 0) {
		/**@type {CompatInspector} */
		this.compatInspector = new CompatInspector(inspectorConfig, bus);
		/**@type {CompatControlPanel} */
		this.controlPanel = new CompatControlPanel(bus);
	}
	/**
	* Initializes CompatUI components.
	*/
	init() {
		this.compatInspector.setup();
		this.controlPanel.setup();
		if (this.controlPanel.shadowHost) this.compatInspector.setIgnorePanel(this.controlPanel.shadowHost);
	}
	/**
	* Destroys CompatUI component instances.
	*/
	destroy() {
		this.compatInspector.destroy();
		this.controlPanel.destroy();
	}
};
//#endregion
export { CompatUI };
