/**
    * Shinkom - pkg
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

//#region pkg/shinkore.d.ts
declare class CompatEngine {
  /**
   * @param {any} bcd_elem_data
   * @param {any} bcd_g_attrib_data
   */
  constructor(bcd_elem_data: any, bcd_g_attrib_data: any);
  __destroy_into_raw(): number;
  __wbg_ptr: number;
  free(): void;
  /**
   * Used for checking the compatibility of a single element and its attributes.
   * @param {string} html
   * @returns {any}
   */
  check_element(html: string): any;
  /**
   * Used for checking the compatibility of multiple elements and their attributes
   *
   * `depth_level` is used to control how far down in a nested HTML structure to go before
   * returning element tags.
   *
   * See [`helpers::pre_process_html`] to learn more about how `depth_level` works.
   * @param {string} html
   * @param {number} depth_level
   * @returns {any}
   */
  check_elements(html: string, depth_level: number): any;
  /**
   * @returns {any}
   */
  return_element_data(): any;
  /**
   * @returns {any}
   */
  return_global_attrib_data(): any;
}
//#endregion
export { CompatEngine };