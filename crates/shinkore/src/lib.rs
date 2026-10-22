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
//! ```no_run
//! use shinkore::engine::RustEngine;
//!     
//! let engine = RustEngine::from_compiled_data();
//! ```
//!
//! For more control and customization of the data being used by the engine, use the engine builder to define where to read data files from.
//!
//! ```no_run
//! use shinkore::engine::RustEngineBuilder;
//!
//! # fn main() {
//! let mut builder = RustEngineBuilder::new().with_data_dir("gen".into());
//!
//! let engine = builder.build();
//! # }
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
//! binary code. Shinkore comes with a binary executable that converts `.json` files into `.bin` files called `sk-convert` that writes its output to a gen directory
//! in the Rust project. The following command installs this executable.
//!
//! ```bash
//! cargo install shinkore --bin sk-convert
//! ```
//!
//! To use this binary, make sure to add the path to the directory containing your JSON data files. The path always starts relative to the terminal's current working
//! directory.
//!
//! ```bash
//! sk-convert path/to/awesome/data output/dir
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
//! ---
//! 
//! ## CSS Parsing
//! Shinkore uses the [`cssparser`] crate for its parsing implementation. The [`css`] module contains functions for parsing CSS stylesheets and inline styles from
//! style attributes. The implementation of CSS parsing currently parses: classes and their declarations and at-rules and their conditions, as well as their rules.
//! The parsing implementation also finds nested classes and at-rules, which is helpful for any third-party tools that use this feature a lot like TailwindCSS.
//! 
//! ### Limitations
//! There are a few limitations of the current parsing implementation:
//! - It is only able to parse single class names (e.g. `.test`, `.square`, `.demo`) and not multiple (e.g. `.demo.container`, `.container .inner`).
//! - The only selectors it can parse are class selectors; cannot parse tags, attributes, pseudo-elements etc.
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


/// Builds a [`WASMEngine`] from binary-encoded compatibility data.
///
/// Create a builder, provide any available datasets with their respective set
/// methods, then call [`build`](WASMEngineBuilder::build). Each setter expects
/// bytes serialized in the format used by Shinkore's generated `.bin` data
/// files. If a dataset is not provided, or its bytes cannot be deserialized,
/// that dataset is omitted from the engine.
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
    /// Creates an empty builder.
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets the HTML compatibility dataset from its serialized binary data.
    ///
    /// If `data` cannot be deserialized, the HTML dataset is unset.
    #[wasm_bindgen]
    pub fn set_html_binary_data(&mut self, data: &[u8]) {
        let html_data: Option<HTMLData> = wincode::deserialize(data).ok();

        self.html = html_data;
    }

    /// Sets the SVG compatibility dataset from its serialized binary data.
    ///
    /// If `data` cannot be deserialized, the SVG dataset is unset.
    #[wasm_bindgen]
    pub fn set_svg_binary_data(&mut self, data: &[u8]) {
        let svg_data: Option<SVGData> = wincode::deserialize(data).ok();

        self.svg = svg_data;
    }

    /// Sets the CSS compatibility dataset from its serialized binary data.
    ///
    /// If `data` cannot be deserialized, the CSS dataset is unset.
    #[wasm_bindgen]
    pub fn set_css_binary_data(&mut self, data: &[u8]) {
        let css_data: Option<CSSData> = wincode::deserialize(data).ok();

        self.css = css_data;
    }

    /// Sets the browser dataset from its serialized binary data.
    ///
    /// If `data` cannot be deserialized, the browser dataset is unset.
    #[wasm_bindgen]
    pub fn set_browser_binary_data(&mut self, data: &[u8]) {
        let browser_data: Option<BrowserData> = wincode::deserialize(data).ok();

        self.browser_data = browser_data;
    }

    /// Sets the browser usage dataset from its serialized binary data.
    ///
    /// If `data` cannot be deserialized, the browser usage dataset is unset.
    #[wasm_bindgen]
    pub fn set_browser_usage_binary_data(&mut self, data: &[u8]) {
        let browser_usage_data: Option<BrowserUsageData> = wincode::deserialize(data).ok();

        self.usage_data = browser_usage_data;
    }

    /// Builds a [`WASMEngine`] using the datasets currently set on this builder.
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

/// A wrapper for the native [`RustEngine`] and exports the
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

    /// Adds classes and at-rules to the engine from stylesheets by mapping them to their declarations.
    /// 
    /// Used for performing compatibility checks on the declarations of a class when the `class` attribute
    /// is retrieved during an element check.
    #[wasm_bindgen]
    pub fn add_external_css_styles(&mut self, stylesheets: Vec<String>) -> Result<(), JsError> {
        self.inner.add_external_css_styles(stylesheets)?;

        Ok(())
    }

    /// Logs the indices for the classes and at-rules stored in the engine.
    #[wasm_bindgen]
    pub fn log_css_indices(&self) {
        self.inner.log_css_indices();
    }
}
