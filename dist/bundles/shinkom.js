/**
    * Shinkom - shinkom
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { ShinkomBus } from "./core/event-bus.js";
import { ShinkomState } from "./core/state-service.js";
import { CompatInspector } from "./ui/inspector/inspector.js";
import { CompatControlPanel } from "./ui/control-panel/control-panel.js";
import { CompatUI } from "./ui/compat-ui/compat-ui.js";
import { SKEngine } from "./engine/engine.js";
import "./engine/index.js";
//#region src/shinkom.js
var Shinkom = class {
	/**@type {AbortController | null} */
	#shinkomController = null;
	constructor() {
		const bus = new ShinkomBus();
		const state = new ShinkomState();
		/**@type {SKEngine} */
		this.skEngine = new SKEngine(bus);
		/**@type {CompatUI} */
		this.compatUI = new CompatUI(bus, state, [new CompatInspector(bus, state), new CompatControlPanel(bus, state)]);
	}
	/**
	* Initialize Shinkom.
	*/
	async init() {
		try {
			await this.skEngine.initEngine();
			this.compatUI.init();
		} catch (error) {
			console.error(`Shinkom initialization error: ${error}`);
		}
	}
	/**
	* Destroy UI components and engine instance.
	*/
	destroy() {
		this.skEngine.destroy();
		this.compatUI.destroy();
		if (this.#shinkomController) this.#shinkomController.abort();
		this.#shinkomController = null;
	}
};
//#endregion
export { Shinkom };
