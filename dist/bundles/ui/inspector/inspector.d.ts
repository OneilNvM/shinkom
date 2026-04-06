/**
    * Shinkom - inspector
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { ShinkomBus } from "../../core/event-bus.js";
import { ShinkomState } from "../../core/state-service.js";
import { UIComponent } from "../../core/ui-component.js";
import { InspectorConfig as InspectorConfig$1, UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../../types/public.js";

//#region src/ui/inspector/inspector.d.ts
/**@extends {UIComponent} */
declare class CompatInspector extends UIComponent {
  /**
   * @param {ShinkomBus} bus
   * @param {ShinkomState} stateService
   * @param {InspectorConfig | undefined} config
   */
  constructor(bus: ShinkomBus, stateService: ShinkomState, config?: InspectorConfig | undefined);
  /**@type {InspectorConfig | undefined} */
  config: InspectorConfig | undefined;
  /**@type {boolean} */
  enableSwitching: boolean;
  /**@type {HTMLDivElement | null} */
  inspectorEl: HTMLDivElement | null;
  /**@type {HTMLElement | null} */
  frozenTarget: HTMLElement | null;
  /**
   * Creates the inspector element.
   */
  createInspector(): void;
  /**
   * Resets the inspector.
   */
  reset(): void;
  #private;
}
type UISharedState = UISharedState$1;
type InspectorConfig = InspectorConfig$1;
type UISharedStateProps = UISharedStateProps$1;
//#endregion
export { CompatInspector, InspectorConfig, UISharedState, UISharedStateProps };