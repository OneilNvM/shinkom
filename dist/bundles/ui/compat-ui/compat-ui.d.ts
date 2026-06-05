/**
    * Shinkom - compat-ui
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { ShinkomBus } from "../../core/event-bus.js";
import { ShinkomState } from "../../core/state-service.js";
import { UIComponent } from "../../core/ui-component.js";
import { UISharedState as UISharedState$1 } from "../../types/public.js";

//#region src/ui/compat-ui/compat-ui.d.ts
declare class CompatUI {
  /**
   * Initializes the provided UI components.
   *
   * It requires an instance of the `ShinkomBus` and `ShinkomState` and the UI
   * components to be mounted.
   *
   * It sets a `WeakMap` with the Proxy state from the state service for binding
   * state to the components after being mounted.
   *
   * @param {ShinkomBus} _bus
   * @param {ShinkomState} stateService
   * @param {UIComponent[]} components
   */
  constructor(_bus: ShinkomBus, stateService: ShinkomState, components?: UIComponent[]);
  /**@type {UIComponent[]} */
  components: UIComponent[];
  /**
   * Initializes CompatUI components.
   */
  init(): void;
  /**
   * Destroys CompatUI component instances.
   */
  destroy(): void;
  #private;
}
type UISharedState = UISharedState$1;
//#endregion
export { CompatUI, UISharedState };