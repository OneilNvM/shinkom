/**@typedef {import('~/types/public').UISharedState} UISharedState */
/**@typedef {import('~/types/public').UISharedStateProps} UISharedStateProps */
import { DEFAULT_STATE } from "./constants";

export class ShinkomState {
    /**@type {UISharedState}*/
    #state;
    /**@type {function[]} */
    #listeners = [];

    /**
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
     * Used to subscribe listener to the state service to listen for changes
     * to the state.
     * @param {Listener} callback
     */
    subscribe(callback) {
        this.#listeners.push(callback)

        return () => {
            this.#listeners = this.#listeners.filter(fn => fn !== callback)
        }
    }

    /**
     * Gets the state.
     * @returns {UISharedState}
     */
    getState = () => this.#state
}