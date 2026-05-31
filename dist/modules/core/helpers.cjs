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
		return module.createRequire({}.url).resolve(modulePath);
	} catch (_error) {
		return path.pathToFileURL(require.resolve(modulePath));
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
* Creates a CSSStyleSheet and applies styles to it.
* @param {CSSStyleSheet | null} cache 
* @param {string} styles 
* @returns {CSSStyleSheet | null} A CSS stylesheet
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
exports.getModulePath = getModulePath;
exports.getStyleSheet = getStyleSheet;
exports.versionToParts = versionToParts;
