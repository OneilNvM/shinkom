/**
    * Shinkom - compatibility-view
    * @version 1.1.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { UIComponent } from "../../core/ui-component.js";
import { CompatViewElement } from "../../core/elements/compat-view-element.js";
import { CompatResult as CompatResult$1, UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../../types/public.js";

//#region src/ui/compatibility-view/compatibility-view.d.ts
/**
 * CompatView manages the compatibility results panel that displays
 * inspection overview, result details, and history.
 *
 * It mounts the `<sk-compat-view>` custom element, binds the view to
 * shared state, listens for result updates from the Shinkom bus, and
 * handles UI interactions such as tab switching and show/hide transitions.
 *
 * @extends {UIComponent}
 */
declare class CompatView extends UIComponent {
  /**
   * Register custom elements to the CustomElementRegistry.
   */
  static register(): void;
  /**@type {CompatViewElement | null} */
  compatViewEl: CompatViewElement | null;
  /**@type {"overview" | "results" | "history"} */
  currentTab: "overview" | "results" | "history";
  /**@type {boolean} */
  active: boolean;
  /**@type {() => void} */
  unsubEvent: () => void;
  #private;
}
type UISharedState = UISharedState$1;
type UISharedStateProps = UISharedStateProps$1;
type CompatResult = CompatResult$1;
//#endregion
export { CompatResult, CompatView, UISharedState, UISharedStateProps };