/**
    * Shinkom - compat-ui
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { ShinkomBus } from "../../core/event-bus.js";
import { ShinkomState } from "../../core/state-service.js";
import { UIComponent } from "../../core/ui-component.js";

//#region src/ui/compat-ui/compat-ui.d.ts
declare class CompatUI {
  /**
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
//#endregion
export { CompatUI };