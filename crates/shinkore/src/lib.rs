//! # Shinkore
//!
//! Shinkore is a cross-browser compatability data processesor and analyser originally built for the [Shinkom](https://github.com/OneilNvM/shinkom)
//! Javascript library. This library is made with [wasm-bindgen](https://github.com/wasm-bindgen/wasm-bindgen) which builds and outputs a WASM binary
//! and JS '*glue code*' to allow for usage of the compatibility engine in Javascript through WebAssembly. **Keep in mind that the usage of the engine
//! in Javascript through WebAssembly is asynchronous at initialization.**
//!
//! If you plan on using this purely in Rust, then make use of the [`engine`] module for a pure Rust application.
//!
//! ---
//!
//! ## Notes
//!
//! The library consists of modules containing functions used for performing cross-browser compatibility checks of web features on modern browsers.
//! The engine requires compatibility data in JSON format, therefore usage of crates such as [`serde`] and [`serde_json`] or [`serde_wasm_bindgen`]
//! for JSON parsing will be necessary. The JSON structure to follow for the compatibility data can be interpreted in the [`schema`] module, but most
//! of the structure in the schema module is based on the [compat-data-schema](https://github.com/mdn/browser-compat-data/blob/main/schemas/compat-data-schema.md)
//! in the [browser-compat-data](https://github.com/mdn/browser-compat-data) project by MDN, as well as the
//! [browser-data](https://github.com/mdn/browser-compat-data/blob/main/schemas/browsers-schema.md) format in [`prelude`].
//!
//! The [`BrowserUsageData`] is based on the [caniuse-db](https://github.com/Fyrd/caniuse) format which only includes the usage data for each browser.
//!
//! If your not planning on using your own custom data, then you can download each JSON file from the [gen directory](https://github.com/OneilNvM/shinkom/tree/master/gen)
//! on the Shinkom GitHub repository.
pub mod compat;
mod constants;
pub mod engine;
pub mod errors;
pub mod prelude;
pub mod preprocess;
pub mod schema;
use std::collections::HashSet;
use std::{cell::RefCell, rc::Rc};

use lol_html::{RewriteStrSettings, element, rewrite_str};
use prelude::*;
use preprocess::{format_html, pre_process_html};
use wasm_bindgen::prelude::*;

use crate::compat::lookup::{
    lookup_attribs, lookup_element, multi_lookup_attribs, multi_lookup_element,
};
use crate::constants::{IGNORE_TAGS, SKIP_TAGS};
use crate::errors::CheckError;

/// The [`CompatEngine`] struct stores the compatibility data
/// and acts as an entry-point for the Rust/WASM engine.
#[derive(Serialize, Deserialize, Default, Debug)]
#[wasm_bindgen]
pub struct CompatEngine {
    html: HTMLData,
    svg: SVGData,
    browser_data: BrowserData,
    browser_usage_data: BrowserUsageData,
}

#[wasm_bindgen]
impl CompatEngine {
    /// Constructs an new engine instance
    #[wasm_bindgen(constructor)]
    pub fn new(
        bcd_html_data: JsValue,
        bcd_svg_data: JsValue,
        bcd_browser_data: JsValue,
        ciu_usage_data: JsValue,
    ) -> Self {
        let mut engine = CompatEngine::default();

        match serde_wasm_bindgen::from_value::<HTMLData>(bcd_html_data) {
            Ok(parsed) => engine.html = parsed,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "BCD HTML data parsing error: {e}"
                )));
            }
        }

        match serde_wasm_bindgen::from_value::<SVGData>(bcd_svg_data) {
            Ok(parsed) => engine.svg = parsed,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "BCD SVG data parsing error: {e}"
                )));
            }
        }

        match serde_wasm_bindgen::from_value::<BrowserData>(bcd_browser_data) {
            Ok(parsed) => engine.browser_data = parsed,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "BCD Browser data parsing error: {e}"
                )));
            }
        }

        match serde_wasm_bindgen::from_value::<BrowserUsageData>(ciu_usage_data) {
            Ok(parsed) => engine.browser_usage_data = parsed,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "BCD Browser Usage data parsing error: {e}"
                )));
            }
        }

        engine
    }

    /// Used for checking the compatibility of a single element and its attributes.
    #[wasm_bindgen]
    pub fn check_element(&self, html: &str) -> Result<JsValue, JsError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        // Format HTML tags onto individual lines
        let formatted = format_html(html)?;

        // Only get the first line of the HTML String
        let first_line = formatted
            .lines()
            .next()
            .ok_or_else(|| JsError::new("no lines were found in HTML"))?;

        // Use rewrite_str to find tag for compatibility check
        let rewrite = rewrite_str(
            first_line,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.compat_check(ctx, false);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                })],
                ..Default::default()
            },
        );

        if let Err(e) = rewrite {
            return Err(JsError::new(&format!("Error occurred rewriting html: {e}")));
        }

        // Calculates the overall score
        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(|e| JsError::new(&e.to_string()))?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        match serde_wasm_bindgen::to_value(&compat_result) {
            Ok(val) => Ok(val),
            Err(e) => Err(JsError::new(&format!(
                "Error occurred parsing lookup results: {e}"
            ))),
        }
    }

    /// Used for checking the compatibility of multiple elements and their attributes
    ///
    /// `depth_level` is used to control how far down in a nested HTML structure to go before
    /// returning element tags.
    ///
    /// See [`preprocess::pre_process_html`] to learn more about how `depth_level` works.
    #[wasm_bindgen]
    pub fn check_elements(&self, html: &str, depth_level: u32) -> Result<JsValue, JsError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        // Pre-process HTML to return the appropriate String of elements
        let elements = pre_process_html(&format_html(html)?, depth_level);

        // Create HashSet cache to prevent repeated element/ attribute searches
        let mut caches = LookupCaches {
            element_cache: HashSet::new(),
            attrib_cache: HashSet::new(),
        };

        // Use rewrite_str to find tags for compatibility checks
        let rewrite = rewrite_str(
            &elements,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.multi_compat_check(ctx, &mut caches, false);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                })],
                ..Default::default()
            },
        );

        if let Err(e) = rewrite {
            return Err(JsError::new(&format!("Error occurred rewriting html: {e}")));
        }

        // Calculates the overall score
        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(|e| JsError::new(&e.to_string()))?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        match serde_wasm_bindgen::to_value(&compat_result) {
            Ok(val) => Ok(val),
            Err(e) => Err(JsError::new(&format!(
                "Error occurred parsing lookup results: {e}"
            ))),
        }
    }

    /// Used for performing a full page compatibility check.
    #[wasm_bindgen]
    pub fn full_inspect(&self, html: &str) -> Result<JsValue, JsError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        // Format the HTML tags onto individual lines
        let formatted = format_html(html)?;

        // Create HashSet cache to prevent repeated element/ attribute searches
        let mut caches = LookupCaches {
            element_cache: HashSet::new(),
            attrib_cache: HashSet::new(),
        };

        // Use rewrite_str to find tags for compatibility checks
        let rewrite = rewrite_str(
            &formatted,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.multi_compat_check(ctx, &mut caches, false);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(e.into()),
                    }

                    Ok(())
                })],
                ..Default::default()
            },
        );

        if let Err(e) = rewrite {
            return Err(JsError::new(&format!("Error occurred rewriting html: {e}")));
        }

        // Calculates the overall score
        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(|e| JsError::new(&e.to_string()))?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        match serde_wasm_bindgen::to_value(&compat_result) {
            Ok(val) => Ok(val),
            Err(e) => Err(JsError::new(&format!(
                "Error occurred parsing lookup results: {e}"
            ))),
        }
    }

    /// Perform a compatibility check for a single element and its attributes.
    ///
    /// Returns a Vector of [`LookupResults`] when successful.
    ///
    /// ## Errors
    /// A [`CheckError`] is returned if there are any errors in lookups.
    fn compat_check(
        &self,
        ctx: ElementContext,
        rust_engine: bool,
    ) -> Result<Vec<LookupResults>, CheckError> {
        let mut overall_results: Vec<LookupResults> = vec![];
        let mut attribs: HashMap<String, String> = HashMap::new();

        for attribute in ctx.attributes {
            attribs.insert(attribute.name_preserve_case(), attribute.value());
        }

        // If the element is an SVG element, opt for an SVG data lookup
        if self.svg.el_data.contains_key(ctx.tag_name) && !IGNORE_TAGS.contains(&ctx.tag_name) {
            let lookup_el_ctx = LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.svg.el_data,
            };
            let lookup_attribs_ctx = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.svg.el_data,
                g_attrib_data: &self.svg.g_attrib_data,
            };

            lookup_element(
                lookup_el_ctx,
                &mut overall_results,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
                rust_engine,
            )?;
            lookup_attribs(
                lookup_attribs_ctx,
                &mut overall_results,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
                rust_engine,
            )?;
        } else {
            let lookup_el_ctx = LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.html.el_data,
            };
            let lookup_attribs_ctx = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.html.el_data,
                g_attrib_data: &self.html.g_attrib_data,
            };

            lookup_element(
                lookup_el_ctx,
                &mut overall_results,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
                rust_engine,
            )?;
            lookup_attribs(
                lookup_attribs_ctx,
                &mut overall_results,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
                rust_engine,
            )?;
        }

        Ok(overall_results)
    }

    /// Perform a compatibility check for multiple elements and their attributes
    ///
    /// Returns a Vector of [`LookupResults`] when successful
    ///
    /// ## Errors
    /// A [`CheckError`] is returned if there are any errors in lookups.
    fn multi_compat_check(
        &self,
        ctx: ElementContext,
        caches: &mut LookupCaches,
        rust_engine: bool,
    ) -> Result<Vec<LookupResults>, CheckError> {
        let mut overall_results: Vec<LookupResults> = vec![];
        let mut attribs: HashMap<String, String> = HashMap::new();

        for attribute in ctx.attributes {
            attribs.insert(attribute.name_preserve_case(), attribute.value());
        }

        // If the element is an SVG element, opt for an SVG data lookup
        if self.svg.el_data.contains_key(ctx.tag_name) && !SKIP_TAGS.contains(&ctx.tag_name) {
            multi_lookup_element(
                LookupElementsContext {
                    tag: ctx.tag_name,
                    el_data: &self.svg.el_data,
                },
                &mut overall_results,
                &mut caches.element_cache,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
                rust_engine,
            )?;
            multi_lookup_attribs(
                LookupAttribsContext {
                    tag: ctx.tag_name,
                    attribs,
                    el_data: &self.svg.el_data,
                    g_attrib_data: &self.svg.g_attrib_data,
                },
                &mut overall_results,
                &mut caches.attrib_cache,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
                rust_engine,
            )?;
        } else {
            multi_lookup_element(
                LookupElementsContext {
                    tag: ctx.tag_name,
                    el_data: &self.html.el_data,
                },
                &mut overall_results,
                &mut caches.element_cache,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
                rust_engine,
            )?;
            multi_lookup_attribs(
                LookupAttribsContext {
                    tag: ctx.tag_name,
                    attribs,
                    el_data: &self.html.el_data,
                    g_attrib_data: &self.html.g_attrib_data,
                },
                &mut overall_results,
                &mut caches.attrib_cache,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
                rust_engine,
            )?;
        }

        Ok(overall_results)
    }
}
