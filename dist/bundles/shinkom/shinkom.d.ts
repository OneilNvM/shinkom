/**
    * Shinkom - shinkom
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { CompatUI } from "../ui/compat-ui/compat-ui.js";
import { SKEngine } from "../engine/engine.js";
import { InspectorConfig as InspectorConfig$1, ShinkomEventBus as ShinkomEventBus$1 } from "../types/index.js";

//#region src/shinkom/shinkom.d.ts
declare class Shinkom {
  /**
   * @param {InspectorConfig | undefined} inspectorConfig
   */
  constructor(inspectorConfig?: InspectorConfig | undefined);
  /**@type {ShinkomEventBus} */
  bus: ShinkomEventBus;
  /**@type {CompatUI} */
  compatUI: CompatUI;
  /**@type {SKEngine} */
  engine: SKEngine;
  /**
   * Handles the custom events sent from the bus.
   * @param {CustomEvent<string | void>} e
   */
  handleCustomEvents: (e: CustomEvent<string | void>) => void;
  /**
   * Initialize Shinkom
   */
  init(): void;
  /**
   * Destroy UI components and engine instance
   */
  destroy(): void;
}
type InspectorConfig = InspectorConfig$1;
type ShinkomEventBus = ShinkomEventBus$1;
//#endregion
export { InspectorConfig, Shinkom, ShinkomEventBus };