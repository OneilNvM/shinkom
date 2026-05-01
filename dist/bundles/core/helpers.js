/**
    * Shinkom - core\helpers
    * @version 1.0.2
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { __require } from "../_virtual/_rolldown/runtime.js";
//#region src/core/helpers.js
/**
* Get the resolved module path as a string or URL.
* @param {string} modulePath 
* @returns {Promise<string | URL>} module path
*/
const getModulePath = async (modulePath) => {
	const path = await import("node:url");
	const module = await import("node:module");
	try {
		return module.createRequire(import.meta.url).resolve(modulePath);
	} catch (_error) {
		return path.pathToFileURL(__require.resolve(modulePath));
	}
};
//#endregion
export { getModulePath };
