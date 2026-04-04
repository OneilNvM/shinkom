/**
    * Shinkom - core
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { ShinkomBus } from "./event-bus.js";
import { ShinkomState } from "./state-service.js";
import { UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../types/public.js";

//#region src/core/ui-component.d.ts
declare class UIComponent {
  /**
   * @param {ShinkomBus} bus
   * @param {ShinkomState} stateService
   */
  constructor(bus: ShinkomBus, stateService: ShinkomState);
  bus: ShinkomBus;
  /**
   * Mount UIComponent to the DOM.
   */
  mount(): void;
  /**
   * Unmount UIComponent from the DOM.
   */
  unmount(): void;
  /**
   * Used to bind state from a proxy to a UIComponent instance.
   *
   * Sets any initial state defined by the component.
   * @param {UISharedState} _state
   */
  bindState(_state: UISharedState): void;
  /**
   * Notify UIComponent of a state change in the `stateBind`.
   * @param {UISharedStateProps} _prop
   * @param {any} _val
   */
  onStateChange(_prop: UISharedStateProps, _val: any): void;
}
type UISharedState = UISharedState$1;
type UISharedStateProps = UISharedStateProps$1;
//#endregion
export { UIComponent, UISharedState, UISharedStateProps };