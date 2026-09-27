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
pub use lol_html::{RewriteStrSettings, element, rewrite_str};
pub use shinkore_types::prelude::*;
pub use shinkore_types::{Deserialize, Serialize};
pub use version::{Version, VersionRequirement};
use wasm_bindgen::prelude::*;

use crate::engine::RustEngine;

#[derive(Deserialize, Default, Debug)]
#[serde(rename_all = "camelCase")]
#[wasm_bindgen]
pub struct WASMEngineBuilder {
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
impl WASMEngineBuilder {
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
    pub fn build(self) -> WASMEngine {
        WASMEngine {
            inner: RustEngine::new(
                self.html,
                self.svg,
                self.css,
                self.browser_data,
                self.usage_data,
            ),
        }
    }
}

/// The [`CompatEngine`] struct stores the compatibility data
/// and acts as an entry-point for the Rust/WASM engine.
#[derive(Serialize, Deserialize, Default, Debug)]
#[wasm_bindgen]
pub struct WASMEngine {
    inner: RustEngine,
}

#[wasm_bindgen]
impl WASMEngine {
    /// Used for checking the compatibility of a single element and its attributes.
    #[wasm_bindgen]
    pub fn check_element(&self, html: &str) -> Result<JsValue, JsError> {
        let compat_result = self
            .inner
            .check_element(html)
            .map_err(|e| JsError::new(&format!("{e}")))?;

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
        let compat_result = self
            .inner
            .check_elements(html, depth_level)
            .map_err(|e| JsError::new(&format!("{e}")))?;

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
        let compat_result = self
            .inner
            .full_inspect(html)
            .map_err(|e| JsError::new(&format!("{e}")))?;

        match serde_wasm_bindgen::to_value(&compat_result) {
            Ok(val) => Ok(val),
            Err(e) => Err(JsError::new(&format!(
                "Error occurred parsing lookup results: {e}"
            ))),
        }
    }
}
