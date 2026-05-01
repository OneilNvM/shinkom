/**
    * Shinkom - engine
    * @version 1.0.2
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { ShinkomBus } from "../core/event-bus.js";
import { CompatResult as CompatResult$1, CustomEventEngineDetail as CustomEventEngineDetail$1 } from "../types/public.js";
import { CompatEngine } from "../pkg/shinkore.js";

//#region src/engine/engine.d.ts
declare class SKEngine {
  /**
   * @param {ShinkomBus | null} bus
   */
  constructor(bus?: ShinkomBus | null);
  /**@type {CompatEngine | null} */
  compatEngine: CompatEngine | null;
  /**@type {ShinkomBus | null} */
  bus: ShinkomBus | null;
  /**
   * Loads WASM for the Browser or Node.
   * @param {string | undefined} wasmURL
   */
  loadWasm(wasmURL?: string | undefined): Promise<void>;
  /**
   * Initializes Rust/WASM engine.
   * @param {string | undefined} wasmURL
   */
  initEngine(wasmURL?: string | undefined): Promise<void>;
  /**
   * Used for checking the compatibility of a single element.
   * @param {string} element
   * @returns {CompatResult | null}
   */
  checkElement(element: string): CompatResult | null;
  /**
   * Used for checking the compatibility of a multiple elements, depending on `depthLevel`.
   * @param {string} html
   * @param {number} depthLevel
   * @returns {CompatResult | null}
   */
  checkElements(html: string, depthLevel: number): CompatResult | null;
  /**
   * Used for checking the compatibility of a full page.
   *
   * Only available in `browser` environments.
   * @returns {CompatResult | null}
   */
  fullInspect(): CompatResult | null;
  /**
   * Free WASM memory and dereference engine.
   */
  destroy(): void;
  #private;
}
type CustomEventEngineDetail = CustomEventEngineDetail$1;
type CompatResult = CompatResult$1;
//#endregion
export { CompatResult, CustomEventEngineDetail, SKEngine };