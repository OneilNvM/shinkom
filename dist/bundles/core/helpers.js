/**
    * Shinkom - core\helpers
    * @version 1.1.0
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
/**
* Splits a version string into parts.
* @param {string} version 
* @returns {number[]} version number in parts
*/
function versionToParts(version) {
	return version.replace(/^v/, "").split(".").map(Number);
}
/**
* 
* @param {CSSStyleSheet | null} cache 
* @param {string} styles 
* @returns {CSSStyleSheet | null}
*/
function getStyleSheet(cache, styles) {
	if (typeof window === "undefined") return null;
	if (!cache) {
		cache = new CSSStyleSheet();
		cache.replaceSync(styles);
	}
	return cache;
}
//#endregion
export { getModulePath, getStyleSheet, versionToParts };
