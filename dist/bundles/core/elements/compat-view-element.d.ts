/**
    * Shinkom - elements
    * @version 1.1.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { ShinkomBus } from "../event-bus.js";
import { ShinkomState } from "../state-service.js";
import { CompatResult as CompatResult$1, CompatSnapshot as CompatSnapshot$1, LookupResult as LookupResult$1 } from "../../types/public.js";

//#region src/core/elements/compat-view-element.d.ts
/**
 * A custom element for the `CompatView` UI component.
 *
 * An autonomous custom element created via the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
 * This component contains methods for rendering components for the CompatView and handling how the results from the engine
 * is stored and displayed for viewing.
 *
 * Since this element is defined via the Web Components API, to use this element outside of the CompatView, it must be registered
 * as a custom element on the `window` object.
 * @extends {BaseElement}
*/
declare class CompatViewElement extends HTMLElement {
  /**@type {ShadowRoot} */
  shadowRootRef: ShadowRoot;
  shadowHost: HTMLDivElement;
  /**@type {"overview" | "results" | "history"} */
  currentTab: "overview" | "results" | "history";
  /**@type {ShinkomState | null} */
  state: ShinkomState | null;
  /**@type {ShinkomBus | null} */
  bus: ShinkomBus | null;
  /**@type {CompatResult | null} */
  _results: CompatResult | null;
  /**@type {CompatSnapshot[]} */
  _resultsHistory: CompatSnapshot[];
  set results(val: CompatResult$1 | null);
  get results(): CompatResult$1 | null;
  set resultsHistory(val: CompatSnapshot$1[]);
  get resultsHistory(): CompatSnapshot$1[];
  /**
   * Updates the results history and backs up the results to `localStorage`.
   * @param {CompatSnapshot} val
   */
  updateResultsHistory(val: CompatSnapshot): void;
  /**
   * Checks the current release version of `Shinkom`
   */
  checkVersion(): Promise<void>;
  connectedCallback(): void;
  _unsubEvent: (() => void) | undefined;
  _unsubState: (() => void) | undefined;
  disconnectedCallback(): void;
  /**
   * Renders the `CompatViewElement` on a specific tab.
   *
   * Renders the `overview` tab by default.
   * @param {"overview" | "results" | "history" | undefined} tab
   */
  render(tab?: "overview" | "results" | "history" | undefined): void;
  /**
   * Renders list items for the 5 most recent results.
   * @throws {Error} If the list for the recent results does not exist.
   */
  renderRecentResults(): void;
  /**
   * Renders content for a specific tab.
   * @param {"overview" | "results" | "history"} tab
   */
  renderTabContent(tab: "overview" | "results" | "history"): void;
  /**
   * Renders the results from the results history.
   * @throws {Error} If the main container does not exist.
   */
  renderHistoryResults(): void;
  /**
   * Renders the content of a compatibility result.
   * @param {CompatSnapshot | undefined} snapshot
   * @throws {Error} If the main container does not exist.
   */
  renderCompatResult(snapshot?: CompatSnapshot | undefined): void;
  /**
   * Renders the content of a browser result for a web feature.
   * @param {LookupResult} lookupResult
   * @returns {string} browser results HTML
   */
  renderBrowserResults(lookupResult: LookupResult): string;
  /**
   * Renders the display of the `CompatViewElement`.
   * @param {"show" | "hide"} display
   */
  renderDisplayTransition(display: "show" | "hide"): void;
  #private;
}
type CompatResult = CompatResult$1;
type CompatSnapshot = CompatSnapshot$1;
type LookupResult = LookupResult$1;
//#endregion
export { CompatResult, CompatSnapshot, CompatViewElement, LookupResult };