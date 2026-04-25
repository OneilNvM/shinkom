/**
    * Shinkom - shinkom
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { CompatUI } from "./ui/compat-ui/compat-ui.js";
import { SKEngine } from "./engine/engine.js";
import { ShinkomConfig as ShinkomConfig$1 } from "./types/public.js";

//#region src/shinkom.d.ts
declare class Shinkom {
  /**
   * @param {ShinkomConfig | undefined} config
   */
  constructor(config?: ShinkomConfig | undefined);
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
type ShinkomConfig = ShinkomConfig$1;
//#endregion
export { Shinkom, ShinkomConfig };