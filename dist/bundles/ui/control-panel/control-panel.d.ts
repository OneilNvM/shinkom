/**
    * Shinkom - control-panel
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

//#region src/ui/control-panel/control-panel.d.ts
/**@typedef {import('../../types/index').ShinkomEventBus} ShinkomEventBus */
declare class CompatControlPanel {
  /**
   * @param {ShinkomEventBus} bus
   */
  constructor(bus: ShinkomEventBus);
  /**@type {ShinkomEventBus} */
  bus: ShinkomEventBus;
  /**@type {HTMLDivElement | null} */
  shadowHost: HTMLDivElement | null;
  /**@type {ShadowRoot | null} */
  shadowRoot: ShadowRoot | null;
  /**@type {HTMLInputElement | null} */
  depthLevelInput: HTMLInputElement | null;
  /**@type {number} */
  depthLevel: number;
  /**@type {boolean} */
  multiElements: boolean;
  /**
   * Creates the control panel in a shadow root.
   */
  createPanel(): void;
  /**
   * Initializes event listeners and appends control panel.
   */
  setup(): void;
  /**
   * Destroys the control panel instance
   */
  destroy(): void;
  #private;
}
type ShinkomEventBus = undefined;
//#endregion
export { CompatControlPanel, ShinkomEventBus };