/**
    * Shinkom - core\helpers
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { __require } from "../_virtual/_rolldown/runtime.js";
//#region src/core/helpers.js
/**
* Get the resolved module path.
* @param {string} path 
* @returns {string} module path
*/
const getModulePath = (path) => {
	try {
		return import.meta.resolve(path);
	} catch (_error) {
		return __require.resolve(path);
	}
};
//#endregion
export { getModulePath };
