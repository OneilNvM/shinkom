/**@typedef {import("../types/types").ShinkomEventTarget} ShinkomEventTarget */
/**@typedef {import("../types/types").ShinkomEventMap} ShinkomEventMap */
/**@typedef {import("../types/types").ShinkomEventListener<keyof ShinkomEventMap>} ShinkomEventListener */

export class ShinkomBus {
    /**@type {ShinkomEventTarget} */
    //@ts-expect-error
    #customEventTarget = new EventTarget()

    /**
     * Emits an event to the event bus.
     * @param {string} event 
     * @param {object | undefined} detail 
     */
    emit(event, detail = undefined) {
        this.#customEventTarget.dispatchEvent(new CustomEvent(event, detail))
    }

    /**
     * Registers a listener on the event bus.
     * @param {keyof ShinkomEventMap} eventName 
     * @param {Function} cb
     */
    on(eventName, cb) {
        /**@type {ShinkomEventListener} */
        const wrapper = (/**@type {any} */e) => cb(e.detail)
        this.#customEventTarget.addEventListener(eventName, wrapper)

        return () => this.#customEventTarget.removeEventListener(eventName, wrapper)
    }
}