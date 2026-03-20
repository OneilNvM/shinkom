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
		this.engine = null;
	}
	/**
	* Initializes Rust/WASM engine
	*/
	async initEngine() {
		try {
			if (!this.engine) {
				if (typeof window === "undefined") {
					const path = await import("node:path");
					const fs = await import("node:fs");
					const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
					const __dirname = path.dirname(__filename);
					const wasmPath = path.resolve(__dirname, "../pkg/shinkore_bg.wasm");
					await __wbg_init({ module_or_path: await fs.readFileSync(wasmPath) });
				} else await __wbg_init();
				this.engine = new CompatEngine(elements, global_attributes);
			}
		} catch (error) {
			console.error(`Engine initialization error: ${error}`);
		}
	}
	/**
	* @param {string} element 
	*/
	checkElement(element) {
		console.dir(this.engine?.check_element(element));
	}
	/**
	* 
	* @param {string} html 
	* @param {number} depthLevel 
	*/
	checkElements(html, depthLevel) {
		console.log("depth level: " + depthLevel);
		console.dir(this.engine?.check_elements(html, depthLevel));
	}
	/**
	* Free WASM memory and dereference engine
	*/
	destroy() {
		this.engine?.free();
		this.engine = null;
	}
};
//#endregion
export { SKEngine };
