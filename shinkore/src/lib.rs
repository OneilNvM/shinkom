pub mod compat;
mod constants;
pub mod preprocess;
mod prelude;
mod schema;
use std::collections::HashSet;
use std::{cell::RefCell, rc::Rc};

use crate::compat::check::{compat_check, multi_compat_check};
use crate::preprocess::{format_html, pre_process_html};
use crate::prelude::*;
use lol_html::{RewriteStrSettings, element, rewrite_str};
use wasm_bindgen::prelude::*;

/// The [`CompatEngine`] struct stores the compatibility data
/// and acts as an entry-point for the Rust/WASM engine.
#[derive(Serialize, Deserialize, Default)]
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

        // Store references to compatibility data to be used in element_content_handlers closure
        let html_data = &self.html;
        let svg_data = &self.svg;
        let browser_data = &self.browser_data;
        let usage_data = &self.browser_usage_data;

        // Use rewrite_str to find tag for compatibility check
        let rewrite = rewrite_str(
            first_line,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    results.borrow_mut().extend(compat_check(
                        &tag_name,
                        attributes,
                        html_data,
                        svg_data,
                        vec![
                            BrowserDataParamType::BrowserData(browser_data.to_owned()),
                            BrowserDataParamType::UsageData(usage_data.to_owned()),
                        ],
                    ));

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
    /// See [`helpers::pre_process_html`] to learn more about how `depth_level` works.
    #[wasm_bindgen]
    pub fn check_elements(&self, html: &str, depth_level: u32) -> Result<JsValue, JsError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        // Pre-process HTML to return the appropriate String of elements
        let elements = pre_process_html(&format_html(html)?, depth_level);

        // Store references to compatibility data to be used in element_content_handlers closure
        let html_data = &self.html;
        let svg_data = &self.svg;
        let browser_data = &self.browser_data;
        let usage_data = &self.browser_usage_data;

        // Create HashSet cache to prevent repeated element/ attribute searches
        let mut element_cache: HashSet<String> = HashSet::new();
        let mut attrib_cache: HashSet<String> = HashSet::new();

        // Use rewrite_str to find tags for compatibility checks
        let rewrite = rewrite_str(
            &elements,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    results.borrow_mut().extend(multi_compat_check(
                        &tag_name,
                        attributes,
                        html_data,
                        svg_data,
                        &mut element_cache,
                        &mut attrib_cache,
                        vec![
                            BrowserDataParamType::BrowserData(browser_data.to_owned()),
                            BrowserDataParamType::UsageData(usage_data.to_owned()),
                        ],
                    ));

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

        // Store references to compatibility data to be used in element_content_handlers closure
        let html_data = &self.html;
        let svg_data = &self.svg;
        let browser_data = &self.browser_data;
        let usage_data = &self.browser_usage_data;

        // Create HashSet cache to prevent repeated element/ attribute searches
        let mut element_cache: HashSet<String> = HashSet::new();
        let mut attrib_cache: HashSet<String> = HashSet::new();

        // Use rewrite_str to find tags for compatibility checks
        let rewrite = rewrite_str(
            &formatted,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    results.borrow_mut().extend(multi_compat_check(
                        &tag_name,
                        attributes,
                        html_data,
                        svg_data,
                        &mut element_cache,
                        &mut attrib_cache,
                        vec![
                            BrowserDataParamType::BrowserData(browser_data.to_owned()),
                            BrowserDataParamType::UsageData(usage_data.to_owned()),
                        ],
                    ));

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
            final_score += res.compat_score.parse::<f32>().map_err(|e| JsError::new(&e.to_string()))?;
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
}
