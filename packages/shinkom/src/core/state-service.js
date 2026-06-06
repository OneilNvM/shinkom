/**@typedef {import('../types/public').UISharedState} UISharedState */
/**@typedef {import('../types/public').UISharedStateProps} UISharedStateProps */
import { DEFAULT_STATE } from "./constants";

/**
 * ShinkomState provides shared UI state management for the application.
 *
 * It wraps a proxied state object and notifies subscribed listeners whenever
 * a state property changes. Components can subscribe to update events and
 * access the reactive state through `getState()`.
 */
export class ShinkomState {
    /**@type {UISharedState}*/
    #state;
    /**@type {function[]} */
    #listeners = [];

    /**
     * Initializes the shared state service.
     *
     * The returned state object is proxied so that property assignments
     * automatically notify listeners when values change.
     *
     * @param {UISharedState} initalState
     */
    constructor(initalState = DEFAULT_STATE) {
        const notify = (/**@type {UISharedStateProps} */ prop, /**@type {any} */ val) => {
            this.#listeners.forEach(fn => fn(prop, val))
        }

        this.#state = new Proxy(initalState, {
            /**
             * @param {UISharedState} obj
             * @param {UISharedStateProps} prop 
             * @returns {any}
             */
            get(obj, prop) {
                return obj[prop]
            },
            
            /**
             * @param {UISharedState} obj 
             * @param {UISharedStateProps} prop 
             * @param {any} val 
             * @returns {boolean}
             */
            set(obj, prop, val) {
                if (obj[prop] === val) return true;

                notify(prop, val);

                /**@type {any} */(obj)[prop] = val
                console.log(`Setting ${prop} -> ${val}`)

                return true
            }
        })
    }

    /**
     * @callback Listener
     * @param {UISharedStateProps} prop 
     * @param {any} val
     */

    /**
     * Subscribes a listener to state change notifications.
     *
     * When any property on the shared state changes, the callback receives the
     * changed property and its new value.
     *
     * @param {Listener} callback
     * @returns {() => void} cleanup function
     */
    subscribe(callback) {
        this.#listeners.push(callback)

        return () => {
            this.#listeners = this.#listeners.filter(fn => fn !== callback)
        }
    }

    /**
     * Returns the proxied shared state object.
     *
     * Callers can read and write state properties directly, and writes will
     * trigger listener notifications when values change.
     *
     * @returns {UISharedState}
     */
    getState = () => this.#state
}