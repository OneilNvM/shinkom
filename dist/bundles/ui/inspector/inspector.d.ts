/**
    * Shinkom - inspector
    * @version 1.1.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { ShinkomBus } from "../../core/event-bus.js";
import { ShinkomState } from "../../core/state-service.js";
import { UIComponent } from "../../core/ui-component.js";
import { CompatInspectorElement } from "../../core/elements/inspector-element.js";
import { InspectorConfig as InspectorConfig$1, UISharedState as UISharedState$1, UISharedStateProps as UISharedStateProps$1 } from "../../types/public.js";

//#region src/ui/inspector/inspector.d.ts
/**
 * CompatInspector manages the interactive compatibility inspector overlay.
 *
 * It mounts the custom element `<sk-compat-inspector>`, synchronizes
 * the overlay state with the shared UI state, and emits inspection
 * requests through the Shinkom event bus.
 *
 * The inspector supports pointer tracking, element freezing, optional
 * keyboard shortcuts, and soft mount/unmount flows that preserve or
 * skip event bus bindings.
 *
 * @extends {UIComponent}
 */
declare class CompatInspector extends UIComponent {
  /**
   * Register custom elements to the CustomElementRegistry.
   */
  static register(): void;
  /**
   * Initializes the compatibility inspector.
   *
   * It requires an instance of the `ShinkomBus` and `ShinkomState` to listen
   * for event bus emits and state service notifications.
   *
   * It also registers the `<sk-compat-inspector>` custom element.
   *
   * It has an optional configuration object for disabling the inspector
   * and toggling keyboard shortcuts.
   *
   * ### Keyboard Shortcuts
   *
   * - Create inspector: Ctrl + Alt + c
   * - Reset inspector: Ctrl + Shift + |
   * - Destroy inspector: Ctrl + Alt + \
   * - Toggle element switching: Ctrl + \
   *
   * @param {ShinkomBus} bus
   * @param {ShinkomState} stateService
   * @param {InspectorConfig | undefined} config
   */
  constructor(bus: ShinkomBus, stateService: ShinkomState, config?: InspectorConfig | undefined);
  /**@type {InspectorConfig | undefined} */
  config: InspectorConfig | undefined;
  /**@type {boolean} */
  enableSwitching: boolean;
  /**@type {CompatInspectorElement | null} */
  inspectorEl: CompatInspectorElement | null;
  /**@type {HTMLElement | null} */
  frozenTarget: HTMLElement | null;
  /**@type {(() => void)[]} */
  unsubEvents: (() => void)[];
  /**
   * Mounts the inspector without setting up event bus listeners or state listeners.
   *
   * This is useful when the inspector should be rendered and tracked visually,
   * but the surrounding application already manages bus events separately.
   *
   * **Only use this if you do not need to setup listeners.**
   */
  mountSoft(): void;
  /**
   * Resets the inspector.
   */
  reset(): void;
  /**
   * Resets the inspector using soft operations.
   */
  resetSoft(): void;
  /**
   * Unmounts the inspector without cleaning up event bus listeners or state listeners.
   *
   * This preserves any active bus subscriptions when the visual overlay is
   * temporarily removed.
   *
   * **Only use this if you still need the listeners after unmounting.**
   */
  unmountSoft(): void;
  #private;
}
type UISharedState = UISharedState$1;
type InspectorConfig = InspectorConfig$1;
type UISharedStateProps = UISharedStateProps$1;
//#endregion
export { CompatInspector, InspectorConfig, UISharedState, UISharedStateProps };