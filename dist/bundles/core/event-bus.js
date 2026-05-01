/**
    * Shinkom - core
    * @version 1.0.2
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

//#region src/core/event-bus.js
/**@typedef {import("../types/public").ShinkomEventTarget} ShinkomEventTarget */
/**@typedef {import("../types/public").ShinkomEventMap} ShinkomEventMap */
/**@typedef {import("../types/public").ShinkomEventListener<keyof ShinkomEventMap>} ShinkomEventListener */
var ShinkomBus = class {
	/**@type {ShinkomEventTarget} */
	#customEventTarget = new EventTarget();
	/**
	* Emits an event to the event bus.
	* @param {string} event 
	* @param {object | undefined} detail 
	*/
	emit(event, detail = void 0) {
		this.#customEventTarget.dispatchEvent(new CustomEvent(event, detail));
	}
	/**
	* Registers a listener on the event bus.
	* @param {keyof ShinkomEventMap} eventName 
	* @param {Function} cb
	*/
	on(eventName, cb) {
		/**@type {ShinkomEventListener} */
		const wrapper = (e) => cb(e.detail);
		this.#customEventTarget.addEventListener(eventName, wrapper);
		return () => this.#customEventTarget.removeEventListener(eventName, wrapper);
	}
};
//#endregion
export { ShinkomBus };
