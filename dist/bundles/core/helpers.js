/**
    * Shinkom - core\helpers
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { __require } from "../_virtual/_rolldown/runtime.js";
import { fileURLToPath, pathToFileURL } from "node:url";
//#region src/core/helpers.js
/**
* Get the resolved module path as a string or URL.
* @param {string} path 
* @returns {string | URL} module path
*/
const getModulePath = (path) => {
	try {
		return fileURLToPath(import.meta.resolve(path));
	} catch (_error) {
		return pathToFileURL(__require.resolve(path));
	}
};
//#endregion
export { getModulePath };
