/**
    * Shinkom - control-panel
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { UIComponent } from "../../core/ui-component.js";
import { CompatControlPanelElement } from "../../core/elements/control-panel-element.js";
import { UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../../types/public.js";

//#region src/ui/control-panel/control-panel.d.ts
/**
 * CompatControlPanel manages the visibility, tabs, and input controls of
 * the compatibility control panel overlay.
 *
 * It mounts the `<sk-control-panel>` custom element, binds control values
 * to shared UI state, and dispatches user-driven commands over the Shinkom
 * event bus.
 *
 * The panel supports inspector controls, compatibility view settings,
 * tab switching, and display transitions with or without view transition
 * support.
 *
 * @extends {UIComponent}
 */
declare class CompatControlPanel extends UIComponent {
  /**
   * Register custom elements to the CustomElementRegistry.
   */
  static register(): void;
  /**@type {CompatControlPanelElement | null} */
  controlPanelEl: CompatControlPanelElement | null;
  /**@type {HTMLInputElement | null} */
  depthLevelInput: HTMLInputElement | null;
  /**@type {HTMLInputElement | null} */
  maxResultsHistoryInput: HTMLInputElement | null;
  /**@type {number} */
  maxResultsHistory: number;
  /**@type {number} */
  depthLevel: number;
  /**@type {boolean} */
  multiElements: boolean;
  /**@type {"inspector" | "compatView"} */
  currentTab: "inspector" | "compatView";
  /**@type {() => void} */
  unsubState: () => void;
  #private;
}
type UISharedState = UISharedState$1;
type UISharedStateProps = UISharedStateProps$1;
//#endregion
export { CompatControlPanel, UISharedState, UISharedStateProps };