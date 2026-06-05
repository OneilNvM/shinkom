/**
    * Shinkom - elements
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { getStyleSheet } from "../helpers.js";
import { hostStyles } from "./templates/root-styles.template.js";
import { controlPanelCompatViewTab, controlPanelHTML, controlPanelInspectorTab, controlPanelStyles, controlPanelTransitions } from "./templates/control-panel.templates.js";
//#region src/core/elements/control-panel-element.js
/**
* @type {typeof HTMLElement}
*/
const BaseElement = typeof window !== "undefined" ? HTMLElement : class {};
/**@type {CSSStyleSheet | null} */
let cachedHostStyleSheet = null;
/**@type {CSSStyleSheet | null} */
let cachedStyleSheet = null;
/**@type {CSSStyleSheet | null} */
let cachedTransitions = null;
/**
* A custom element for the `CompatControlPanel` UI component.
* 
* An autonomous custom element created via the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
* This component contains methods for rendering components for the `CompatControlPanel` and providing settings for customization of different
* UI components.
* 
* Since this element is defined via the Web Components API, to use this element outside of the `CompatControlPanel`, it must be registered
* as a custom element on the `window` object.
* @extends {BaseElement}
*/
var CompatControlPanelElement = class extends BaseElement {
	constructor() {
		super();
		/**@type {ShadowRoot} */
		this.shadowRootRef = this.attachShadow({ mode: "open" });
		this.shadowHost = document.createElement("div");
		this.shadowHost.id = "sk-shadow-host";
		cachedHostStyleSheet = getStyleSheet(cachedHostStyleSheet, hostStyles);
		cachedStyleSheet = getStyleSheet(cachedStyleSheet, controlPanelStyles);
		cachedTransitions = getStyleSheet(cachedTransitions, controlPanelTransitions);
	}
	connectedCallback() {
		Object.assign(this.shadowHost.style, {
			position: "fixed",
			top: "2rem",
			left: "2rem",
			zIndex: "992"
		});
		if (cachedTransitions) document.adoptedStyleSheets.push(cachedTransitions);
		if (cachedHostStyleSheet) this.shadowRootRef.adoptedStyleSheets = [cachedHostStyleSheet];
		if (cachedStyleSheet) this.shadowRootRef.adoptedStyleSheets.push(cachedStyleSheet);
		this.shadowRootRef.appendChild(this.shadowHost);
		this.render();
	}
	disconnectedCallback() {
		document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== cachedTransitions);
	}
	/**
	* Renders the `ControlPanelElement` on a specific tab.
	* 
	* Renders the `inspector` tab by default.
	* @param {"inspector" | "compatView" | undefined} tab 
	*/
	render(tab = void 0) {
		this.shadowHost.innerHTML = controlPanelHTML;
		tab ? this.renderTabContent(tab) : this.renderTabContent("inspector");
	}
	/**
	* Renders content for a specific tab.
	* @param {"inspector" | "compatView"} tab 
	*/
	renderTabContent(tab) {
		const main = this.shadowRootRef.getElementById("sk-control-panel-main");
		switch (tab) {
			case "inspector":
				if (main) main.innerHTML = controlPanelInspectorTab;
				break;
			case "compatView":
				if (main) main.innerHTML = controlPanelCompatViewTab;
				break;
			default: break;
		}
	}
	/**
	* Renders the display of the `ControlPanelElement`.
	* @param {"show" | "hide"} display
	*/
	renderDisplayTransition(display) {
		const panel = this.shadowRootRef.getElementById("sk-control-panel");
		if (panel) {
			if (display === "show") panel.style.display = "flex";
			else if (display === "hide") panel.style.display = "none";
		}
	}
};
//#endregion
export { CompatControlPanelElement };
