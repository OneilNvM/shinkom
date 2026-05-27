/**
    * Shinkom - shinkom
    * @version 1.1.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { CompatUI } from "./ui/compat-ui/compat-ui.js";
import { SKEngine } from "./engine/engine.js";
import { ShinkomConfig as ShinkomConfig$1 } from "./types/public.js";

//#region src/shinkom.d.ts
declare class Shinkom {
  /**
   * Initializes UI and engine components
   *
   * It creates instances for the event bus and state service and shares them
   * between the components. It also has an optional configuration object
   * used for configuring the inspector and initializing the engine with a
   * URL to the WASM file.
   *
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