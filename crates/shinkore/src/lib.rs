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
//! for JSON parsing will be necessary. The JSON structure to follow for the compatibility data can be interpreted in the [`shinkore_types`] crate, but most
//! of the structure in the schema module is based on the [compat-data-schema](https://github.com/mdn/browser-compat-data/blob/main/schemas/compat-data-schema.md)
//! in the [browser-compat-data](https://github.com/mdn/browser-compat-data) project by MDN, as well as the
//! [browser-data](https://github.com/mdn/browser-compat-data/blob/main/schemas/browsers-schema.md) format in [`shinkore_types::prelude`].
//!
//! The [`BrowserUsageData`] is based on the [caniuse-db](https://github.com/Fyrd/caniuse) format which only includes the usage data for each browser.
//!
//! If your not planning on using your own custom data, then you can download each JSON file from the [gen directory](https://github.com/OneilNvM/shinkom/tree/master/packages/shinkom/gen)
//! on the Shinkom GitHub repository.
pub mod compat;
mod constants;
pub mod css;
pub mod engine;
pub mod errors;
pub mod preprocess;
mod version;
use std::collections::{HashMap, HashSet};
use std::{cell::RefCell, rc::Rc};

use lol_html::text;
pub use lol_html::{RewriteStrSettings, element, rewrite_str};
use preprocess::{format_html, pre_process_html};
pub use shinkore_types::prelude::*;
pub use shinkore_types::{Deserialize, Serialize};
pub use version::{Version, VersionRequirement};
use wasm_bindgen::prelude::*;

use crate::compat::calculate::calculate_compat_score;
use crate::compat::lookup::{
    lookup_attribs, lookup_css, lookup_element, multi_lookup_attribs, multi_lookup_element,
};
use crate::constants::{IGNORE_TAGS, SKIP_TAGS};
use crate::css::parse_stylesheet;
use crate::errors::CheckError;

#[derive(Deserialize, Default, Debug)]
#[serde(rename_all = "camelCase")]
#[wasm_bindgen]
pub struct CompatEngineBuilder {
    #[serde(default)]
    html: Option<HTMLData>,
    #[serde(default)]
    svg: Option<SVGData>,
    #[serde(default)]
    css: Option<CSSData>,
    #[serde(default)]
    browser_data: Option<BrowserData>,
    #[serde(default)]
    usage_data: Option<BrowserUsageData>,
}

#[wasm_bindgen]
impl CompatEngineBuilder {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self::default()
    }

    #[wasm_bindgen]
    pub fn set_html_binary_data(&mut self, data: &[u8]) {
        let html_data: Option<HTMLData> = wincode::deserialize(data).ok();

        self.html = html_data;
    }

    #[wasm_bindgen]
    pub fn set_svg_binary_data(&mut self, data: &[u8]) {
        let svg_data: Option<SVGData> = wincode::deserialize(data).ok();

        self.svg = svg_data;
    }

    #[wasm_bindgen]
    pub fn set_css_binary_data(&mut self, data: &[u8]) {
        let css_data: Option<CSSData> = wincode::deserialize(data).ok();

        self.css = css_data;
    }

    #[wasm_bindgen]
    pub fn set_browser_binary_data(&mut self, data: &[u8]) {
        let browser_data: Option<BrowserData> = wincode::deserialize(data).ok();

        self.browser_data = browser_data;
    }

    #[wasm_bindgen]
    pub fn set_browser_usage_binary_data(&mut self, data: &[u8]) {
        let browser_usage_data: Option<BrowserUsageData> = wincode::deserialize(data).ok();

        self.usage_data = browser_usage_data;
    }

    #[wasm_bindgen]
    pub fn build(self) -> CompatEngine {
        CompatEngine {
            html: self.html.unwrap_or_default(),
            svg: self.svg.unwrap_or_default(),
            css: self.css.unwrap_or_default(),
            browser_data: self.browser_data.unwrap_or_default(),
            browser_usage_data: self.usage_data.unwrap_or_default(),
        }
    }
}

/// The [`CompatEngine`] struct stores the compatibility data
/// and acts as an entry-point for the Rust/WASM engine.
#[derive(Serialize, Deserialize, Default, Debug)]
#[wasm_bindgen]
pub struct CompatEngine {
    html: HTMLData,
    svg: SVGData,
    css: CSSData,
    browser_data: BrowserData,
    browser_usage_data: BrowserUsageData,
}

#[wasm_bindgen]
impl CompatEngine {
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
            RewriteStrSettings::new()
                .append_element_content_handler(element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.compat_check(ctx);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                }))
                .append_element_content_handler(text!("style", |el| {
                    let style_content = el.as_str();

                    let compat_results = self.css_compat_check(style_content);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                })),
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
            RewriteStrSettings::new()
                .append_element_content_handler(element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.multi_compat_check(ctx, &mut caches);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                }))
                .append_element_content_handler(text!("style", |el| {
                    let style_content = el.as_str();

                    let compat_results = self.css_compat_check(style_content);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                })),
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
            RewriteStrSettings::new()
                .append_element_content_handler(element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.multi_compat_check(ctx, &mut caches);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(e.into()),
                    }

                    Ok(())
                }))
                .append_element_content_handler(text!("style", |el| {
                    let style_content = el.as_str();

                    let compat_results = self.css_compat_check(style_content);

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                })),
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
    fn compat_check(&self, ctx: ElementContext) -> Result<Vec<LookupResults>, CheckError> {
        let mut overall_results: Vec<LookupResults> = vec![];
        let mut features: Vec<WebFeatureContext> = vec![];
        let mut attribs: HashMap<String, String> = HashMap::new();

        for attribute in ctx.attributes {
            attribs.insert(attribute.name_preserve_case(), attribute.value());
        }

        // If the element is an SVG element, opt for an SVG data lookup
        if self.svg.el_data.contains_key(ctx.tag_name) && !IGNORE_TAGS.contains(&ctx.tag_name) {
            let lookup_attribs_ctx = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.svg.el_data,
                g_attrib_data: &self.svg.g_attrib_data,
            };

            if let Some(feat) = lookup_element(LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.svg.el_data,
            }) {
                features.push(feat);
            }
            if let Some(feats) = lookup_attribs(&lookup_attribs_ctx) {
                features.extend(feats);
            }

            for feat in features {
                calculate_compat_score(
                    feat,
                    &mut overall_results,
                    &BrowserDataContext {
                        browser_data: &self.browser_data,
                        browser_usage_data: &self.browser_usage_data,
                    },
                )?;
            }
        } else {
            let lookup_attribs_ctx = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.html.el_data,
                g_attrib_data: &self.html.g_attrib_data,
            };

            if let Some(feat) = lookup_element(LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.html.el_data,
            }) {
                features.push(feat);
            }
            if let Some(feats) = lookup_attribs(&lookup_attribs_ctx) {
                features.extend(feats);
            }

            for feat in features {
                calculate_compat_score(
                    feat,
                    &mut overall_results,
                    &BrowserDataContext {
                        browser_data: &self.browser_data,
                        browser_usage_data: &self.browser_usage_data,
                    },
                )?;
            }
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
    ) -> Result<Vec<LookupResults>, CheckError> {
        let mut overall_results: Vec<LookupResults> = vec![];
        let mut features: Vec<WebFeatureContext> = vec![];
        let mut attribs: HashMap<String, String> = HashMap::new();

        for attribute in ctx.attributes {
            attribs.insert(attribute.name_preserve_case(), attribute.value());
        }

        // If the element is an SVG element, opt for an SVG data lookup
        if self.svg.el_data.contains_key(ctx.tag_name) && !SKIP_TAGS.contains(&ctx.tag_name) {
            let lookup_els_context = LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.svg.el_data,
            };
            let lookup_attribs_context = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.svg.el_data,
                g_attrib_data: &self.svg.g_attrib_data,
            };

            if let Some(feat) = multi_lookup_element(&lookup_els_context, &mut caches.element_cache)
            {
                features.push(feat)
            }

            if let Some(feats) =
                multi_lookup_attribs(&lookup_attribs_context, &mut caches.attrib_cache)
            {
                features.extend(feats);
            }

            for feat in features {
                calculate_compat_score(
                    feat,
                    &mut overall_results,
                    &BrowserDataContext {
                        browser_data: &self.browser_data,
                        browser_usage_data: &self.browser_usage_data,
                    },
                )?;
            }
        } else {
            let lookup_els_context = LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.html.el_data,
            };
            let lookup_attribs_context = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.html.el_data,
                g_attrib_data: &self.html.g_attrib_data,
            };

            if let Some(feat) = multi_lookup_element(&lookup_els_context, &mut caches.element_cache)
            {
                features.push(feat)
            }

            if let Some(feats) =
                multi_lookup_attribs(&lookup_attribs_context, &mut caches.attrib_cache)
            {
                features.extend(feats);
            }

            for feat in features {
                calculate_compat_score(
                    feat,
                    &mut overall_results,
                    &BrowserDataContext {
                        browser_data: &self.browser_data,
                        browser_usage_data: &self.browser_usage_data,
                    },
                )?;
            }
        }

        Ok(overall_results)
    }

    fn css_compat_check(&self, css_content: &str) -> Result<Vec<LookupResults>, CheckError> {
        let mut overall_results = Vec::new();
        let mut features: Vec<WebFeatureContext> = Vec::new();
        let mut properties_values = HashMap::new();

        for style in parse_stylesheet(css_content) {
            properties_values.insert(style.property, style.value);
        }

        web_sys::console::log_1(&JsValue::from_str(css_content));
        web_sys::console::log_1(&JsValue::from_str(&format!("{properties_values:?}")));

        let ctx = LookupCSSContext {
            parsed_css_styles: properties_values,
            css_data: &self.css.properties_data,
        };

        if let Some(feats) = lookup_css(&ctx) {
            features.extend(feats);
        }

        for feat in features {
            calculate_compat_score(
                feat,
                &mut overall_results,
                &BrowserDataContext {
                    browser_data: &self.browser_data,
                    browser_usage_data: &self.browser_usage_data,
                },
            )?;
        }

        Ok(overall_results)
    }
}
