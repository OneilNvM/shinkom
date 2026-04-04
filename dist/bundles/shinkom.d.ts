/**
    * Shinkom - shinkom
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { CompatUI } from "./ui/compat-ui/compat-ui.js";
import { SKEngine } from "./engine/engine.js";
//#region src/shinkom.d.ts
declare class Shinkom {
  /**@type {SKEngine} */
  skEngine: SKEngine;
  /**@type {CompatUI} */
  compatUI: CompatUI;
  /**
   * Initialize Shinkom.
   */
  init(): Promise<void>;
  /**
   * Destroy UI components and engine instance.
   */
  destroy(): void;
  #private;
}
//#endregion
export { Shinkom };