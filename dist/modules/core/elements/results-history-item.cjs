//#region src/core/elements/results-history-item.js
/**@typedef {import("../../types/public").CompatSnapshot} CompatSnapshot */
/**
* @type {typeof HTMLElement}
*/
const BaseElement = typeof window !== "undefined" ? HTMLElement : class {};
/**
* A custom element for rendering a compatibility result item from the results history object.
* 
* An autonomous custom element created via the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
* This component is used for creating unique items that store their assigned compatibility result for future viewing.
* 
* Since this element is defined via the Web Components API it must be registered
* as a custom element on the `window` object.
* @extends {BaseElement}
*/
var ResultsHistoryItem = class extends BaseElement {
	constructor() {
		super();
		/**@type {CompatSnapshot | null} */
		this._result = null;
		/**@type {function(CompatSnapshot): void} */
		this.viewResult = () => {};
	}
	get result() {
		return this._result;
	}
	set result(val) {
		if (val) this._result = val;
	}
	connectedCallback() {
		const historyItem = this.querySelector(".sk-history-item");
		if (historyItem instanceof HTMLDivElement) historyItem.addEventListener("click", () => {
			if (this.result) this.viewResult(this.result);
		});
	}
};
//#endregion
exports.ResultsHistoryItem = ResultsHistoryItem;
