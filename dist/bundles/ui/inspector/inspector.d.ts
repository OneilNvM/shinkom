/**
    * Shinkom - inspector
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { InspectorConfig as InspectorConfig$1, ShinkomEventBus as ShinkomEventBus$1 } from "../../types/index.js";

//#region src/ui/inspector/inspector.d.ts
/**@typedef {import('../../types/index').InspectorConfig} InspectorConfig */
/**@typedef {import('../../types/index').ShinkomEventBus} ShinkomEventBus */
declare class CompatInspector {
  /**
   * @param {InspectorConfig} config
   * @param {ShinkomEventBus | null} bus
   */
  constructor(config?: InspectorConfig, bus?: ShinkomEventBus | null);
  /**@type {InspectorConfig} */
  config: InspectorConfig;
  /**@type {ShinkomEventBus | null} */
  _bus: ShinkomEventBus | null;
  /**@type {boolean} */
  enableSwitching: boolean;
  /**@type {HTMLDivElement | null} */
  inspectorEl: HTMLDivElement | null;
  /**@type {HTMLElement | null} */
  frozenTarget: HTMLElement | null;
  /**
   * Set inspector to ignore control panel div.
   * @param {HTMLDivElement} el
   */
  setIgnorePanel(el: HTMLDivElement): void;
  /**
   * Initializes event listeners on `window` and creates the inspector.
   */
  setup(): void;
  /**
   * Resets the inspector.
   */
  reset(): void;
  /**
   * Destroys the inspector.
   */
  destroy(): void;
  #private;
}
type InspectorConfig = InspectorConfig$1;
type ShinkomEventBus = ShinkomEventBus$1;
//#endregion
export { CompatInspector, InspectorConfig, ShinkomEventBus };