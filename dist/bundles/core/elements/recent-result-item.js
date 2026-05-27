/**
    * Shinkom - core\elements\recent-result-item
    * @version 1.1.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

//#region src/core/elements/recent-result-item.js
/**@typedef {import('../../types/public').CompatSnapshot} CompatSnapshot */
/**
* @type {typeof HTMLElement}
*/
const BaseElement = typeof window !== "undefined" ? HTMLElement : class {};
/**
* A custom element for rendering a recent compatibility result item.
* 
* An autonomous custom element created via the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
* This component is used for creating unique items that store their assigned compatibility result for future viewing.
* 
* Since this element is defined via the Web Components API it must be registered
* as a custom element on the `window` object.
* @extends {BaseElement}
*/
var RecentResultItem = class extends BaseElement {
	constructor() {
		super();
		/**@type {CompatSnapshot | null} */
		this._result = null;
		/** @type {function(CompatSnapshot): void} */
		this.viewResult = () => {};
	}
	get result() {
		return this._result;
	}
	set result(val) {
		if (val) this._result = val;
	}
	connectedCallback() {
		const detailsButton = this.querySelector(".sk-view-result");
		if (detailsButton instanceof HTMLButtonElement) detailsButton.addEventListener("click", () => {
			if (this.result) this.viewResult(this.result);
		});
	}
};
//#endregion
export { RecentResultItem };
