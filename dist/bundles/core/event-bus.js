/**
    * Shinkom - core
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

//#region src/core/event-bus.js
/**@typedef {import("../types/types").ShinkomEventTarget} ShinkomEventTarget */
/**@typedef {import("../types/types").ShinkomEventMap} ShinkomEventMap */
/**@typedef {import("../types/types").ShinkomEventListener<keyof ShinkomEventMap>} ShinkomEventListener */
/**
* ShinkomBus is the application event bus used to coordinate cross-cutting
* actions across Shinkom UI components and the engine.
*
* It wraps a standard `EventTarget` and exposes a small typed API for
* emitting custom events and subscribing to them with cleanup support.
*/
var ShinkomBus = class {
	#customEventTarget = new EventTarget();
	/**
	* Emits an event to the event bus.
	*
	* @param {string} event
	* @param {object | undefined} detail
	*/
	emit(event, detail = void 0) {
		this.#customEventTarget.dispatchEvent(new CustomEvent(event, detail));
	}
	/**
	* Registers a listener on the event bus.
	*
	* The returned cleanup function removes the listener so callers can stop
	* receiving events and avoid leaking handlers when the listener is no
	* longer needed.
	*
	* @param {keyof ShinkomEventMap} eventName
	* @param {Function} cb
	* @returns {() => void} cleanup function
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
