/**
    * Shinkom - index
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

//#region src/types/index.js
/**
* @typedef {{
* "ci:toggle": CustomEvent<void>
* "ci:inspect": CustomEvent<string>
* "ci:switch": CustomEvent<void>
* "ci:create": CustomEvent<void>
* "ci:reset": CustomEvent<void>
* "ci:destroy": CustomEvent<void>
* }} ShinkomEventMap
*/
/**
* @template {keyof ShinkomEventMap} K
* @callback ShinkomEventListener
* @this {ShinkomEventBus}
* @param {ShinkomEventMap[K]} ev
* @returns {void}
*/
/**
* @typedef {Object} ShinkomEventBus
* @property {<K extends keyof ShinkomEventMap>(
* type: K, 
* listener: ShinkomEventListener<K>, 
* options?: boolean | AddEventListenerOptions
* ) => void} addEventListener
* @property {<K extends keyof ShinkomEventMap>(
* type: K, 
* listener: ShinkomEventListener<K>
* ) => void} removeEventListener
* @property {<K extends keyof ShinkomEventMap>(
* event: ShinkomEventMap[K]
* ) => boolean} dispatchEvent
*/
/**
* @typedef {Object} InspectorConfig
* @property {boolean} disabled
* @property {boolean} keyboardShorcuts
*/
//#endregion
