/**
    * Shinkom - core
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - OneilNvM
*/

import { ShinkomEventListener as ShinkomEventListener$1, ShinkomEventMap as ShinkomEventMap$1, ShinkomEventTarget as ShinkomEventTarget$1 } from "../types/public.js";

//#region src/core/event-bus.d.ts
/**@typedef {import("../types/public").ShinkomEventTarget} ShinkomEventTarget */
/**@typedef {import("../types/public").ShinkomEventMap} ShinkomEventMap */
/**@typedef {import("../types/public").ShinkomEventListener<keyof ShinkomEventMap>} ShinkomEventListener */
declare class ShinkomBus {
  /**
   * Emits an event to the event bus.
   * @param {string} event
   * @param {object | undefined} detail
   */
  emit(event: string, detail?: object | undefined): void;
  /**
   * Registers a listener on the event bus.
   * @param {keyof ShinkomEventMap} eventName
   * @param {Function} cb
   */
  on(eventName: keyof ShinkomEventMap, cb: Function): () => void;
  #private;
}
type ShinkomEventTarget = ShinkomEventTarget$1;
type ShinkomEventMap = ShinkomEventMap$1;
type ShinkomEventListener = ShinkomEventListener$1<keyof ShinkomEventMap>;
//#endregion
export { ShinkomBus, ShinkomEventListener, ShinkomEventMap, ShinkomEventTarget };