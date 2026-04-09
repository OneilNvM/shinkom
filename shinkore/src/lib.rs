pub mod compat;
mod constants;
pub mod helpers;
mod prelude;
mod schema;
use std::collections::HashSet;
use std::{cell::RefCell, rc::Rc};

use crate::compat::check::{compat_check, multi_compat_check};
use crate::helpers::{format_html, pre_process_html};
use crate::prelude::*;
use lol_html::{RewriteStrSettings, element, rewrite_str};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Default)]
pub struct HTMLData {
    #[serde(rename = "elements")]
    el_data: HashMap<String, CompatElement>,
    #[serde(rename = "global_attributes")]
    g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}
#[derive(Serialize, Deserialize, Default)]
pub struct SVGData {
    #[serde(rename = "elements")]
    el_data: HashMap<String, CompatElement>,
    #[serde(rename = "global_attributes")]
    g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}

#[derive(Serialize, Deserialize, Default)]
#[wasm_bindgen]
pub struct CompatEngine {
    html: HTMLData,
    svg: SVGData,
}

#[derive(Default, Serialize, Deserialize)]
pub struct CompatResult {
    overall_score: u8,
    lookup_results: Vec<LookupResults>,
}

#[derive(Default, Serialize, Deserialize, Clone)]
pub struct LookupResults {
    name: String,
    compat_score: u8,
    browser_score: u8,
    status_score: u8,
}

#[wasm_bindgen]
impl CompatEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(bcd_html_data: JsValue, bcd_svg_data: JsValue) -> Self {
        let mut engine = CompatEngine::default();

        match serde_wasm_bindgen::from_value::<HTMLData>(bcd_html_data) {
            Ok(parsed_elem) => engine.html = parsed_elem,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "BCD element parsing error: {}",
                    e
                )));
            }
        }

        match serde_wasm_bindgen::from_value::<SVGData>(bcd_svg_data) {
            Ok(parsed_attrib) => engine.svg = parsed_attrib,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "BCD global attribute parsing error: {e}"
                )));
            }
        }

        engine
    }

    /// Used for checking the compatibility of a single element and its attributes.
    #[wasm_bindgen]
    pub fn check_element(&self, html: &str) -> JsValue {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let formatted = format_html(html);

        let first_line = formatted.lines().next().unwrap();

        let html_data = &self.html;
        let svg_data = &self.svg;

        let _ = rewrite_str(
            first_line,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    results
                        .borrow_mut()
                        .extend(compat_check(&tag_name, attributes, html_data, svg_data));

                    Ok(())
                })],
                ..Default::default()
            },
        )
        .unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred rewriting html: {e}"
            )));
            String::new()
        });

        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res.compat_score as f32;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        serde_wasm_bindgen::to_value(&compat_result).unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred parsing lookup results: {e}"
            )));
            JsValue::null()
        })
    }

    /// Used for checking the compatibility of multiple elements and their attributes
    ///
    /// `depth_level` is used to control how far down in a nested HTML structure to go before
    /// returning element tags.
    ///
    /// See [`helpers::pre_process_html`] to learn more about how `depth_level` works.
    #[wasm_bindgen]
    pub fn check_elements(&self, html: &str, depth_level: u32) -> JsValue {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let elements = pre_process_html(&format_html(html), depth_level);

        let html_data = &self.html;
        let svg_data = &self.svg;

        let mut element_cache: HashSet<String> = HashSet::new();
        let mut attrib_cache: HashSet<String> = HashSet::new();

        let _ = rewrite_str(
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
                    ));

                    Ok(())
                })],
                ..Default::default()
            },
        );

        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res.compat_score as f32;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        serde_wasm_bindgen::to_value(&compat_result).unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred parsing lookup results: {e}"
            )));
            JsValue::null()
        })
    }

    /// Used for performing a full page compatibility check.
    #[wasm_bindgen]
    pub fn full_inspect(&self, html: &str) -> JsValue {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let formatted = format_html(html);

        let html_data = &self.html;
        let svg_data = &self.svg;

        let mut element_cache: HashSet<String> = HashSet::new();
        let mut attrib_cache: HashSet<String> = HashSet::new();

        let _ = rewrite_str(
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
                    ));

                    Ok(())
                })],
                ..Default::default()
            },
        );

        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res.compat_score as f32;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        serde_wasm_bindgen::to_value(&compat_result).unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred parsing lookup results: {e}"
            )));
            JsValue::null()
        })
    }
}
