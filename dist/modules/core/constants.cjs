Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
exports.DEFAULT_STATE = DEFAULT_STATE;
