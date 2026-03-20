/**
    * Shinkom - shinkore
    * @version 1.0.0
    * @license MIT
    * @copyright 2026 - Oneil Achord
*/

//#region pkg/shinkore.d.ts
/* tslint:disable */
/* eslint-disable */
declare class CompatEngine {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Used for checking the compatibility of a single element and its attributes.
   */
  check_element(html: string): any;
  /**
   * Used for checking the compatibility of multiple elements and their attributes
   *
   * `depth_level` is used to control how far down in a nested HTML structure to go before
   * returning element tags.
   *
   * See [`helpers::pre_process_html`] to learn more about how `depth_level` works.
   */
  check_elements(html: string, depth_level: number): any;
  constructor(bcd_elem_data: any, bcd_g_attrib_data: any);
  return_element_data(): any;
  return_global_attrib_data(): any;
}
//#endregion
export { CompatEngine };