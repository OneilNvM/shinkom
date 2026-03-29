/**
    * Shinkom - engine
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { ShinkomBus } from "../core/event-bus.js";
import { CustomEventEngineDetail as CustomEventEngineDetail$1 } from "../types/public.js";
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
   */
  loadWasm(): Promise<void>;
  /**
   * Initializes Rust/WASM engine.
   */
  initEngine(): Promise<void>;
  /**
   * Used for checking the compatibility of a single element.
   * @param {string} element
   */
  checkElement(element: string): void;
  /**
   * Used for checking the compatibility of a multiple elements, depending on `depthLevel`.
   * @param {string} html
   * @param {number} depthLevel
   */
  checkElements(html: string, depthLevel: number): void;
  /**
   * Used for checking the compatibility of a full page.
   */
  fullInspect(): void;
  /**
   * Free WASM memory and dereference engine.
   */
  destroy(): void;
}
type CustomEventEngineDetail = CustomEventEngineDetail$1;
//#endregion
export { CustomEventEngineDetail, SKEngine };