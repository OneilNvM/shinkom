/**
    * Shinkom - core\constants
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

//#region src/core/constants.js
/**@typedef {import('../types/public').UISharedState} UISharedState */
/**@type {UISharedState} */
const DEFAULT_STATE = {
	inspectorSwitching: false,
	inspectorActive: false,
	ignorePanelEl: null,
	multiElements: false,
	depthLevel: 0
};
//#endregion
export { DEFAULT_STATE };
