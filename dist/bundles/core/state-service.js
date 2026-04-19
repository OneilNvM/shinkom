/**
    * Shinkom - core
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { DEFAULT_STATE } from "./constants.js";
//#region src/core/state-service.js
/**@typedef {import('../types/public').UISharedState} UISharedState */
/**@typedef {import('../types/public').UISharedStateProps} UISharedStateProps */
var ShinkomState = class {
	/**@type {UISharedState}*/
	#state;
	/**@type {function[]} */
	#listeners = [];
	/**
	* @param {UISharedState} initalState 
	*/
	constructor(initalState = DEFAULT_STATE) {
		const notify = (prop, val) => {
			this.#listeners.forEach((fn) => fn(prop, val));
		};
		this.#state = new Proxy(initalState, {
			get(obj, prop) {
				return obj[prop];
			},
			set(obj, prop, val) {
				if (obj[prop] === val) return true;
				notify(prop, val);
				/**@type {any} */ obj[prop] = val;
				console.log(`Setting ${prop} -> ${val}`);
				return true;
			}
		});
	}
	/**
	* @callback Listener
	* @param {UISharedStateProps} prop 
	* @param {any} val
	*/
	/**
	* Used to subscribe listener to the state service to listen for changes
	* to the state.
	* @param {Listener} callback
	*/
	subscribe(callback) {
		this.#listeners.push(callback);
		return () => {
			this.#listeners = this.#listeners.filter((fn) => fn !== callback);
		};
	}
	/**
	* Gets the state.
	* @returns {UISharedState}
	*/
	getState = () => this.#state;
};
//#endregion
export { ShinkomState };
