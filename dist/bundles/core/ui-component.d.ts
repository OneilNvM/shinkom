/**
    * Shinkom - core
    * @version 1.1.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { ShinkomBus } from "./event-bus.js";
import { ShinkomState } from "./state-service.js";
import { UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../types/public.js";

//#region src/core/ui-component.d.ts
/**
 * Base UI component class for Shinkom UI modules.
 *
 * UIComponent is abstract and provides shared integration with the Shinkom
 * event bus and shared state service. Subclasses must implement lifecycle
 * methods for mounting, unmounting, binding state, and responding to state
 * changes.
 */
declare class UIComponent {
  /**
   * @param {ShinkomBus} bus
   * @param {ShinkomState} stateService
   */
  constructor(bus: ShinkomBus, stateService: ShinkomState);
  bus: ShinkomBus;
  stateService: ShinkomState;
  /**
   * Mounts the component into the DOM.
   *
   * Subclasses must implement this method to create and attach their UI.
   */
  mount(): void;
  /**
   * Unmounts the component from the DOM.
   *
   * Subclasses must implement this method to remove their UI and cleanup.
   */
  unmount(): void;
  /**
   * Binds shared UI state to the component instance.
   *
   * Implementations should store the bound state reference and apply any
   * initial state values needed by the component.
   *
   * @param {UISharedState} _state
   */
  bindState(_state: UISharedState): void;
  /**
   * Called when a shared state property changes.
   *
   * Components should override this to react to updates from the shared state
   * service.
   *
   * @param {UISharedStateProps} _prop
   * @param {any} _val
   */
  onStateChange(_prop: UISharedStateProps, _val: any): void;
}
type UISharedState = UISharedState$1;
type UISharedStateProps = UISharedStateProps$1;
//#endregion
export { UIComponent, UISharedState, UISharedStateProps };