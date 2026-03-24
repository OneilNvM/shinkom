/**
    * Shinkom - engine
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { CompatEngine } from "../pkg/shinkore.js";

//#region src/engine/engine.d.ts
declare class SKEngine {
  /**@type {CompatEngine | null} */
  compatEngine: CompatEngine | null;
  loadWasm(): Promise<void>;
  /**
   * Initializes Rust/WASM engine
   */
  initEngine(): Promise<void>;
  /**
   * @param {string} element
   */
  checkElement(element: string): void;
  /**
   *
   * @param {string} html
   * @param {number} depthLevel
   */
  checkElements(html: string, depthLevel: number): void;
  /**
   * Free WASM memory and dereference engine
   */
  destroy(): void;
}
//#endregion
export { SKEngine };