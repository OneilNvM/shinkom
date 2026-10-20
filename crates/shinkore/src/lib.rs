//! # Shinkore
//!
//! A cross-browser compatability data processesor and analyser originally built for the [Shinkom](https://github.com/OneilNvM/shinkom)
//! JavaScript toolkikt. The engine itself was built natively in Rust alongside a wrapper that compiles to WebAssembly via
//! [wasm-bindgen](https://github.com/wasm-bindgen/wasm-bindgen) allowing the engine to be output as WebAssembly and JavaScript code using the
//! [wasm-pack](https://github.com/wasm-bindgen/wasm-pack) binary.
//!
//! ---
//!
//! ## Usage
//! A simple way to use the engine would be to build the engine from the compiled compatibility data.
//!
//! ```rust
//! use shinkore::engine::RustEngine;
//!     
//! let engine = RustEngine::from_compiled_data();
//! ```
//!
//! For more control and customization of the data being used by the engine, use the engine builder to define where to read data files from.
//!
//! ```rust
//! use shinkore::engine::RustEngineBuilder;
//!
//! let mut builder = RustEngineBuilder::new();
//!
//! builder.with_data_dir("gen".into());
//!
//! let engine = builder.build();
//! ```
//!
//! **Note: The data files must be in JSON format and follow the specified schema for data to be deserialized appropriately. Check the [`shinkore_types::schema`]
//! for more details about the schema.**
//!
//! ---
//!
//! ## Compatibility Data Files
//! The engine requires the compatiblity data based on the [BCD](https://github.com/mdn/browser-compat-data) (browser-compatibility-data) by MDN, specifically
//! HTML, CSS and browser data by both the BCD and [caniuse-db](https://github.com/Fyrd/caniuse) for browser usage data.
//!
//! ### .json to .bin
//! The engine doesn't store this data as JSON (although the original data files need to be JSON), instead it uses `.bin` (binary) files to serialize JSON data into
//! binary format and deserialize them into the data structures used by the engine.
//!
//! Therefore, the `.json` files will need to be converted into `.bin` files by deserializing the JSON into the correct data structures, and then serailizing them into
//! binary code. Shinkore comes with a binary executable that converts `.json` files into `.bin` files called `sk_convert` that writes its output to a gen directory
//! in the Rust project. The following command installs this executable.
//!
//! ```bash
//! cargo install shinkore --bin sk_convert
//! ```
//!
//! Alternatively, developers can make their own converter as long as the output is in .bin format and can be deserialized by [`wincode`].
//!
//! ### Naming Conventions
//! The files providing compatibility data must be named accordingly for the engine to read data from `.bin` files and for `sk_convert` to read the `.json` files.
//! - HTML Data: `html-compat-data.json`, `html-compat-data.bin`
//! - SVG Data: `svg-compat-data.json`, `svg-compat-data.bin`
//! - CSS Data: `css-compat-data.json`, `css-compat-data.bin`
//! - Browser Data: `browser-data.json`, `browser-data.bin`
//! - Browser Usage Data (from caniuse-db): `browser-usage-data.json`, `browser-usage-data.bin`
//!
pub mod compat;
mod constants;
pub mod css;
pub mod engine;
pub mod errors;
mod macros;
pub mod preprocess;
mod version;

pub use lol_html::{RewriteStrSettings, element, rewrite_str};
pub use shinkore_types::{
    Deserialize, Serialize,
    prelude::{BrowserData, BrowserUsageData, CSSData, HTMLData, SVGData},
};
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

/// A struct that wraps the native [`RustEngine`] and exports the
/// engine to WebAssembly through [`macro@wasm_bindgen`].
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

    #[wasm_bindgen]
    pub fn add_external_css_styles(&mut self, stylesheets: Vec<String>) -> Result<(), JsError> {
        self.inner.add_external_css_styles(stylesheets)?;

        Ok(())
    }

    #[wasm_bindgen]
    pub fn log_css_indices(&self) {
        self.inner.log_css_indices();
    }
}
