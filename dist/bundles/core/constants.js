/**
    * Shinkom - core
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

//#region src/core/constants.js
/**@typedef {import('../types/public').UISharedState} UISharedState */
/**@type {UISharedState} */
const DEFAULT_STATE = {
	inspectorExists: false,
	inspectorActive: false,
	inspectorSwitching: false,
	ignorePanelEl: null,
	ignoreCompatViewEl: null,
	multiElements: false,
	depthLevel: 0,
	compatViewTab: "overview",
	maxResultsHistory: 10
};
//#endregion
export { DEFAULT_STATE };
