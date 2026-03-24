/**
    * Shinkom - engine
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { CompatEngine, __wbg_init } from "../pkg/shinkore.js";
import { elements, global_attributes } from "../gen/compat-data.js";
//#region src/engine/engine.js
var SKEngine = class {
	constructor() {
		/**@type {CompatEngine | null} */
		this.compatEngine = null;
	}
	async loadWasm() {
		const isNode = typeof window === "undefined";
		try {
			if (isNode) {
				const path = await import("node:path");
				const fs = await import("node:fs");
				const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
				const __dirname = path.dirname(__filename);
				let wasmPath = path.resolve(__dirname, "../pkg/shinkore_bg.wasm");
				let wasmBuffer;
				if (fs.existsSync(wasmPath)) wasmBuffer = await fs.readFileSync(wasmPath);
				else {
					wasmPath = path.resolve(__dirname, "../../pkg/shinkore_bg.wasm");
					wasmBuffer = await fs.readFileSync(wasmPath);
				}
				await __wbg_init({ module_or_path: wasmBuffer });
			} else await __wbg_init();
		} catch (error) {
			throw error;
		}
	}
	/**
	* Initializes Rust/WASM engine
	*/
	async initEngine() {
		try {
			if (!this.compatEngine) {
				await this.loadWasm();
				this.compatEngine = new CompatEngine(elements, global_attributes);
			}
		} catch (error) {
			console.error(`Engine initialization error: ${error}`);
		}
	}
	/**
	* @param {string} element 
	*/
	checkElement(element) {
		console.dir(this.compatEngine?.check_element(element));
	}
	/**
	* 
	* @param {string} html 
	* @param {number} depthLevel 
	*/
	checkElements(html, depthLevel) {
		console.dir(this.compatEngine?.check_elements(html, depthLevel));
	}
	/**
	* Free WASM memory and dereference engine
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
