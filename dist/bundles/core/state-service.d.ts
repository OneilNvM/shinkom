/**
    * Shinkom - core
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../types/public.js";

//#region src/core/state-service.d.ts
declare class ShinkomState {
  /**
   * @param {UISharedState} initalState
   */
  constructor(initalState?: UISharedState);
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
  subscribe(callback: (prop: UISharedStateProps, val: any) => any): () => void;
  /**
   * Gets the state.
   * @returns {UISharedState}
   */
  getState: () => UISharedState;
  #private;
}
type UISharedState = UISharedState$1;
type UISharedStateProps = UISharedStateProps$1;
//#endregion
export { ShinkomState, UISharedState, UISharedStateProps };