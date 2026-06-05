/**
    * Shinkom - elements
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

//#region src/core/elements/inspector-element.d.ts
/**
 * A custom element for the `CompatInspector` UI component.
 *
 * An autonomous custom element created via the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
 * This component is used for defining and initializing the styling and structure of the `CompatInspector`.
 *
 * Since this element is defined via the Web Components API, to use this element outside of the `CompatInspector`, it must be registered
 * as a custom element on the `window` object.
 * @extends {BaseElement}
 */
declare class CompatInspectorElement extends HTMLElement {
  /**@type {ShadowRoot} */
  shadowRootRef: ShadowRoot;
  shadowHost: HTMLDivElement;
  styles: HTMLStyleElement;
  connectedCallback(): void;
}
//#endregion
export { CompatInspectorElement };