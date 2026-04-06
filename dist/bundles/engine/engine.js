/**
    * Shinkom - engine
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { CompatEngine, __wbg_init } from "../pkg/shinkore.js";
import { html, svg } from "../gen/compat-data.js";
//#region src/engine/engine.js
/**@typedef {import('../types/public').CustomEventEngineDetail} CustomEventEngineDetail */
var SKEngine = class {
	/**
	* @param {ShinkomBus | null} bus
	*/
	constructor(bus = null) {
		/**@type {CompatEngine | null} */
		this.compatEngine = null;
		/**@type {ShinkomBus | null} */
		this.bus = bus;
		if (this.bus) {
			this.bus.on("engine:inspect", (e) => {
				if (typeof e === "object") if (e.multiElements) this.checkElements(e.elem, e.depthLevel);
				else this.checkElement(e.elem);
			});
			this.bus.on("engine:full", () => {
				this.fullInspect();
			});
		}
	}
	/**
	* Loads WASM for the Browser or Node.
	* @param {string | undefined} wasmURL
	*/
	async loadWasm(wasmURL = void 0) {
		const isNode = typeof window === "undefined";
		try {
			if (isNode) {
				const path = await import("node:path");
				const fs = await import("node:fs");
				let wasmPath = (await import("node:url")).fileURLToPath(import.meta.resolve("shinkom/wasm"));
				let wasmBuffer;
				if (fs.existsSync(wasmPath)) wasmBuffer = fs.readFileSync(wasmPath);
				else {
					wasmPath = path.resolve(__dirname, "../../pkg/shinkore_bg.wasm");
					wasmBuffer = fs.readFileSync(wasmPath);
				}
				await __wbg_init({ module_or_path: wasmBuffer });
			} else if (wasmURL) await __wbg_init({ module_or_path: wasmURL });
			else await __wbg_init();
		} catch (error) {
			throw error;
		}
	}
	/**
	* Initializes Rust/WASM engine.
	* @param {string | undefined} wasmURL
	*/
	async initEngine(wasmURL = void 0) {
		try {
			if (!this.compatEngine) {
				if (wasmURL) await this.loadWasm(wasmURL);
				else await this.loadWasm();
				this.compatEngine = new CompatEngine(html, svg);
			}
		} catch (error) {
			console.error(`Engine initialization error: ${error}`);
		}
	}
	/**
	* Used for checking the compatibility of a single element.
	* @param {string} element 
	*/
	checkElement(element) {
		console.dir(this.compatEngine?.check_element(element));
	}
	/**
	* Used for checking the compatibility of a multiple elements, depending on `depthLevel`.
	* @param {string} html 
	* @param {number} depthLevel 
	*/
	checkElements(html, depthLevel) {
		console.dir(this.compatEngine?.check_elements(html, depthLevel));
	}
	/**
	* Used for checking the compatibility of a full page.
	* 
	* Only available in `browser` environments.
	*/
	fullInspect() {
		try {
			console.dir(this.compatEngine?.full_inspect(document.documentElement.outerHTML));
		} catch (error) {
			if (error instanceof ReferenceError) console.error("fullInspect is only available in browser environments");
			else console.error(`fullInspect error: ${error}`);
		}
	}
	/**
	* Free WASM memory and dereference engine.
	*/
	destroy() {
		if (!this.compatEngine) {
			console.warn("Shinkom Engine cannot be destroyed as it is not initialized.");
			return;
		}
		this.compatEngine?.free();
		this.compatEngine = null;
	}
};
//#endregion
export { SKEngine };
