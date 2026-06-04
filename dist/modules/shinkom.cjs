Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_core_event_bus = require("./core/event-bus.cjs");
const require_core_state_service = require("./core/state-service.cjs");
require("./core/index.cjs");
const require_ui_inspector_inspector = require("./ui/inspector/inspector.cjs");
const require_ui_control_panel_control_panel = require("./ui/control-panel/control-panel.cjs");
const require_ui_compatibility_view_compatibility_view = require("./ui/compatibility-view/compatibility-view.cjs");
const require_ui_compat_ui_compat_ui = require("./ui/compat-ui/compat-ui.cjs");
require("./ui/index.cjs");
const require_engine_engine = require("./engine/engine.cjs");
//#region src/shinkom.js
/**@typedef {import("./types/public").ShinkomConfig} ShinkomConfig */
/**@type {Shinkom | null} */
let instance = null;
var Shinkom = class {
	#config;
	/**
	* Initializes UI and engine components
	* 
	* It creates instances for the event bus and state service and shares them
	* between the components. It also has an optional configuration object
	* used for configuring the inspector and initializing the engine with a 
	* URL to the WASM file.
	* 
	* @param {ShinkomConfig | undefined} config 
	*/
	constructor(config = void 0) {
		if (instance) return instance;
		this.initialized = false;
		this.#config = config;
		const bus = new require_core_event_bus.ShinkomBus();
		const state = new require_core_state_service.ShinkomState();
		/**@type {SKEngine} */
		this.skEngine = new require_engine_engine.SKEngine(bus);
		/**@type {CompatUI} */
		this.compatUI = new require_ui_compat_ui_compat_ui.CompatUI(bus, state, [
			new require_ui_inspector_inspector.CompatInspector(bus, state, this.#config?.inspector),
			new require_ui_control_panel_control_panel.CompatControlPanel(bus, state),
			new require_ui_compatibility_view_compatibility_view.CompatView(bus, state)
		]);
		instance = this;
	}
	/**
	* Initialize Shinkom.
	*/
	async init() {
		try {
			if (this.initialized) {
				console.warn("Shinkom is already initialized.");
				return;
			}
			await this.skEngine.initEngine(this.#config?.engine?.wasmURL);
			this.compatUI.init();
			this.initialized = true;
		} catch (error) {
			console.error(`Shinkom initialization error: ${error}`);
		}
	}
	/**
	* Destroy UI components and engine instance.
	*/
	destroy() {
		if (!this.initialized) {
			console.warn("Shinkom has not been initialized.");
			return;
		}
		this.skEngine.destroy();
		this.compatUI.destroy();
		this.initialized = false;
	}
};
//#endregion
exports.Shinkom = Shinkom;
