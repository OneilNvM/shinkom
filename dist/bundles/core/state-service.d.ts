/**
    * Shinkom - core
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../types/public.js";

//#region src/core/state-service.d.ts
/**
 * ShinkomState provides shared UI state management for the application.
 *
 * It wraps a proxied state object and notifies subscribed listeners whenever
 * a state property changes. Components can subscribe to update events and
 * access the reactive state through `getState()`.
 */
declare class ShinkomState {
  /**
   * Initializes the shared state service.
   *
   * The returned state object is proxied so that property assignments
   * automatically notify listeners when values change.
   *
   * @param {UISharedState} initalState
   */
  constructor(initalState?: UISharedState);
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
  subscribe(callback: (prop: UISharedStateProps, val: any) => any): () => void;
  /**
   * Returns the proxied shared state object.
   *
   * Callers can read and write state properties directly, and writes will
   * trigger listener notifications when values change.
   *
   * @returns {UISharedState}
   */
  getState: () => UISharedState;
  #private;
}
type UISharedState = UISharedState$1;
type UISharedStateProps = UISharedStateProps$1;
//#endregion
export { ShinkomState, UISharedState, UISharedStateProps };