/**
    * Shinkom - engine
    * @version 1.1.1
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { ShinkomBus } from "../core/event-bus.js";
import { CustomEventEngineDetail as CustomEventEngineDetail$1 } from "../types/types.js";
import { CompatResult as CompatResult$1 } from "../types/public.js";
import { CompatEngine } from "../pkg/shinkore.js";

//#region src/engine/engine.d.ts
/**
 * SKEngine wraps the Shinkom compatibility analysis engine.
 *
 * It manages WASM loading, engine initialization, and compatibility checks
 * for single elements, element subtrees, and full pages. When a `ShinkomBus`
 * instance is provided, SKEngine also emits result events and responds to
 * engine commands from the UI.
 */
declare class SKEngine {
  /**
   * Clears the instance from memory.
   */
  static clearInstance(): void;
  /**
   * Initializes the compatibility engine.
   *
   * The engine optionally accepts an event bus to listen for
   * `engine:inspect` and `engine:full` events from UI
   * components.
   *
   * @param {ShinkomBus | null} bus
   */
  constructor(bus?: ShinkomBus | null);
  initialized: boolean | undefined;
  /**@type {CompatEngine | null} */
  compatEngine: CompatEngine | null;
  /**@type {ShinkomBus | null} */
  bus: ShinkomBus | null;
  /**@type {(() => void)[]} */
  unsubEvents: (() => void)[];
  /**
   * Gets the instance of the engine.
   * @returns {SKEngine} the instance
   */
  getInstance(): SKEngine;
  /**
   * Loads the WASM runtime and initializes the native Shinkom engine.
   *
   * In Node.js this resolves the module path and loads the WASM binary from
   * the local filesystem. In browser environments it optionally accepts a
   * WASM URL or falls back to the default packaged module loader.
   *
   * @param {string | undefined} wasmURL
   */
  loadWasm(wasmURL?: string | undefined): Promise<void>;
  /**
   * Initializes the Rust-based compatibility engine.
   *
   * The engine is created after the WASM runtime has been loaded and is
   * configured with the bundled compatibility data.
   *
   * @param {string | undefined} wasmURL
   */
  initEngine(wasmURL?: string | undefined): Promise<void>;
  /**
   * Checks compatibility for a single element HTML string.
   *
   * If a bus was provided at construction, the resulting compatibility data
   * is emitted on `results:ready`.
   *
   * @param {string} element
   * @returns {CompatResult | null}
   */
  checkElement(element: string): CompatResult | null;
  /**
   * Checks compatibility for a subtree of HTML elements.
   *
   * The `depthLevel` controls how deeply nested elements are inspected.
   *
   * @param {string} html
   * @param {number} depthLevel
   * @returns {CompatResult | null}
   */
  checkElements(html: string, depthLevel: number): CompatResult | null;
  /**
   * Checks compatibility for the current full document page.
   *
   * This method is browser-only because it depends on `document` and
   * inspects the serialized page HTML.
   *
   * @returns {CompatResult | null}
   */
  fullInspect(): CompatResult | null;
  /**
   * Releases WASM resources and destroys the engine instance.
   *
   * After calling this method, the engine must be reinitialized before
   * further compatibility checks can be performed.
   */
  destroy(): void;
  #private;
}
type CustomEventEngineDetail = CustomEventEngineDetail$1;
type CompatResult = CompatResult$1;
//#endregion
export { CompatResult, CustomEventEngineDetail, SKEngine };