/**
    * Shinkom - types\index
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

//#region src/types/index.d.ts
type ShinkomEventMap = {
  "ci:toggle": CustomEvent<void>;
  "ci:inspect": CustomEvent<string>;
  "ci:switch": CustomEvent<void>;
  "ci:create": CustomEvent<void>;
  "ci:reset": CustomEvent<void>;
  "ci:destroy": CustomEvent<void>;
};
type ShinkomEventBus = {
  addEventListener: <K extends keyof ShinkomEventMap>(type: K, listener: ShinkomEventListener<K>, options?: boolean | AddEventListenerOptions) => void;
  removeEventListener: <K extends keyof ShinkomEventMap>(type: K, listener: ShinkomEventListener<K>) => void;
  dispathEvent: <K extends keyof ShinkomEventMap>(event: ShinkomEventMap[K]) => boolean;
};
type ShinkomEventListener<K extends keyof ShinkomEventMap> = (this: ShinkomEventBus, ev: ShinkomEventMap[K]) => void;
type InspectorConfig = {
  disabled: boolean;
  keyboardShorcuts: boolean;
};
//#endregion
export { InspectorConfig, ShinkomEventBus };