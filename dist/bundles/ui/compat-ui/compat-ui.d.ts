/**
    * Shinkom - compat-ui
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

import { CompatInspector } from "../inspector/inspector.js";
import { CompatControlPanel } from "../control-panel/control-panel.js";

//#region src/ui/compat-ui/compat-ui.d.ts
declare class CompatUI {
  /**
   * @param {ShinkomEventBus} bus
   * @param {InspectorConfig | undefined} inspectorConfig
   */
  constructor(bus: ShinkomEventBus, inspectorConfig?: InspectorConfig | undefined);
  /**@type {CompatInspector} */
  compatInspector: CompatInspector;
  /**@type {CompatControlPanel} */
  controlPanel: CompatControlPanel;
  /**
   * Initializes CompatUI components.
   */
  init(): void;
  /**
   * Destroys CompatUI component instances.
   */
  destroy(): void;
}
type InspectorConfig = undefined;
type ShinkomEventBus = undefined;
//#endregion
export { CompatUI, InspectorConfig, ShinkomEventBus };