/**
    * Shinkom - control-panel
    * @version 1.0.2
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { UIComponent } from "../../core/ui-component.js";
import { UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../../types/public.js";

//#region src/ui/control-panel/control-panel.d.ts
/**@extends {UIComponent} */
declare class CompatControlPanel extends UIComponent {
  /**@type {HTMLDivElement | null} */
  shadowHost: HTMLDivElement | null;
  /**@type {ShadowRoot | null} */
  shadowRoot: ShadowRoot | null;
  /**@type {HTMLInputElement | null} */
  depthLevelInput: HTMLInputElement | null;
  /**@type {HTMLParagraphElement | null} */
  ciStatusEl: HTMLParagraphElement | null;
  /**@type {HTMLButtonElement | null} */
  toggleSwitchingEl: HTMLButtonElement | null;
  /**@type {HTMLButtonElement | null} */
  toggleInspectorEl: HTMLButtonElement | null;
  /**@type {number} */
  depthLevel: number;
  /**@type {boolean} */
  multiElements: boolean;
  /**
   * Creates the control panel in a shadow root.
   */
  createPanel(): void;
  #private;
}
type UISharedState = UISharedState$1;
type UISharedStateProps = UISharedStateProps$1;
//#endregion
export { CompatControlPanel, UISharedState, UISharedStateProps };