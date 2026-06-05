/**
    * Shinkom - elements
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

//#region src/core/elements/control-panel-element.d.ts
/**
 * A custom element for the `CompatControlPanel` UI component.
 *
 * An autonomous custom element created via the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
 * This component contains methods for rendering components for the `CompatControlPanel` and providing settings for customization of different
 * UI components.
 *
 * Since this element is defined via the Web Components API, to use this element outside of the `CompatControlPanel`, it must be registered
 * as a custom element on the `window` object.
 * @extends {BaseElement}
 */
declare class CompatControlPanelElement extends HTMLElement {
  /**@type {ShadowRoot} */
  shadowRootRef: ShadowRoot;
  shadowHost: HTMLDivElement;
  connectedCallback(): void;
  disconnectedCallback(): void;
  /**
   * Renders the `ControlPanelElement` on a specific tab.
   *
   * Renders the `inspector` tab by default.
   * @param {"inspector" | "compatView" | undefined} tab
   */
  render(tab?: "inspector" | "compatView" | undefined): void;
  /**
   * Renders content for a specific tab.
   * @param {"inspector" | "compatView"} tab
   */
  renderTabContent(tab: "inspector" | "compatView"): void;
  /**
   * Renders the display of the `ControlPanelElement`.
   * @param {"show" | "hide"} display
   */
  renderDisplayTransition(display: "show" | "hide"): void;
}
//#endregion
export { CompatControlPanelElement };