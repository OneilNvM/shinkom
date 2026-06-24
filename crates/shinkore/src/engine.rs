//! This module contains a Rust compatible version of the compatibility engine.
//! It contains the same functionality of the [`crate::CompatEngine`] version but removes any usage of the [`wasm_bindgen`] implementations
//! and replaces [`wasm_bindgen::JsValue`] and [`wasm_bindgen::JsError`] usage with native Rust types.
use std::{
    cell::RefCell,
    collections::{HashMap, HashSet},
    error::Error,
    fs::File,
    io::BufReader,
    num::ParseFloatError,
    path::PathBuf,
    rc::Rc,
};

use lol_html::{RewriteStrSettings, element, rewrite_str};
use shinkore_types::{Deserialize, Serialize};

use crate::{
    compat::lookup::{lookup_attribs, lookup_element, multi_lookup_attribs, multi_lookup_element},
    constants::{IGNORE_TAGS, SKIP_TAGS},
    errors::{CheckError, PreProcessError},
    preprocess::{format_html, pre_process_html},
};

use shinkore_types::prelude::{
    BrowserData, BrowserDataParamType, BrowserUsageData, CompatResult, ElementContext, HTMLData,
    LookupAttribsContext, LookupCaches, LookupElementsContext, LookupResults, SVGData,
};

#[derive(Deserialize)]
pub struct CompatDataPayload {
    html: HTMLData,
    svg: SVGData,
}

pub struct RustCompatEngineBuilder {
    data_dir: Option<PathBuf>,
}

impl RustCompatEngineBuilder {
    pub fn new() -> Self {
        Self { data_dir: None }
    }

    pub fn with_data_dir(mut self, dir: PathBuf) -> Self {
        self.data_dir = Some(dir);
        self
    }

    pub fn build(&self) -> Result<RustCompatEngine, Box<dyn Error>> {
        let base_path = self
            .data_dir
            .clone()
            .unwrap_or_else(|| PathBuf::from("./shinkore-data"));

        let read_json = |filename: &str| -> Result<serde_json::Value, Box<dyn Error>> {
            let path = base_path.join(filename);
            let file = File::open(path)?;
            let value = serde_json::from_reader(BufReader::new(file))?;
            Ok(value)
        };

        let mut compat_root = read_json("compat-data.json")?;
        let browsers_root = read_json("browser-data.json")?;
        let usage_root = read_json("browser-usage-data.json")?;

        let compat_obj = compat_root
            .as_object_mut()
            .ok_or("Could not convert to object")?;

        let html_data_value = compat_obj
            .remove("html")
            .ok_or("Could not find html field in object")?;
        let svg_data_value = compat_obj
            .remove("svg")
            .ok_or("Could not find svg field in object")?;

        let html_data = serde_json::from_value(html_data_value)?;
        let svg_data = serde_json::from_value(svg_data_value)?;
        let browser_data: BrowserData = serde_json::from_value(browsers_root)?;
        let usage_data: BrowserUsageData = serde_json::from_value(usage_root)?;

        Ok(RustCompatEngine::new(
            html_data,
            svg_data,
            browser_data,
            usage_data,
        ))
    }
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct RustCompatEngine {
    html: HTMLData,
    svg: SVGData,
    browser_data: BrowserData,
    browser_usage_data: BrowserUsageData,
}

impl RustCompatEngine {
    pub fn new(
        bcd_html_data: HTMLData,
        bcd_svg_data: SVGData,
        bcd_browser_data: BrowserData,
        ciu_usage_data: BrowserUsageData,
    ) -> Self {
        RustCompatEngine {
            html: bcd_html_data,
            svg: bcd_svg_data,
            browser_data: bcd_browser_data,
            browser_usage_data: ciu_usage_data,
        }
    }

    pub fn from_compiled_data() -> Result<Self, Box<dyn Error>> {
        let compat_payload: CompatDataPayload = serde_json::from_str(include_str!(
            "../../../packages/shinkom/gen/compat-data.json"
        ))?;
        let browsers_root: serde_json::Value = serde_json::from_str(include_str!(
            "../../../packages/shinkom/gen/compat-data.json"
        ))?;
        let usage_root: serde_json::Value = serde_json::from_str(include_str!(
            "../../../packages/shinkom/gen/compat-data.json"
        ))?;

        let browser_data: BrowserData = serde_json::from_value(browsers_root)?;
        let usage_data: BrowserUsageData = serde_json::from_value(usage_root)?;

        Ok(Self::new(
            compat_payload.html,
            compat_payload.svg,
            browser_data,
            usage_data,
        ))
    }

    /// Used for checking the compatibility of a single element and its attributes.
    pub fn check_element(&self, html: &str) -> Result<CompatResult, CheckError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        // Format HTML tags onto individual lines
        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        // Only get the first line of the HTML String
        let first_line = formatted.lines().next().ok_or(CheckError::NoLines)?;

        // Use rewrite_str to find tag for compatibility check
        let rewrite = rewrite_str(
            first_line,
            RewriteStrSettings::new().append_element_content_handler(element!("*", |el| {
                let tag_name = el.tag_name();
                let attributes = el.attributes();

                let ctx = ElementContext {
                    tag_name: &tag_name,
                    attributes,
                };

                let compat_results = self.compat_check(ctx);

                match compat_results {
                    Ok(res) => results.borrow_mut().extend(res),
                    Err(e) => return Err(e.into()),
                }

                Ok(())
            })),
        );

        if let Err(e) = rewrite {
            return Err(e.into());
        }

        // Calculates the overall score
        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(<ParseFloatError as Into<CheckError>>::into)?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        Ok(compat_result)
    }

    /// Used for checking the compatibility of multiple elements and their attributes
    ///
    /// `depth_level` is used to control how far down in a nested HTML structure to go before
    /// returning element tags.
    ///
    /// See [`crate::preprocess::pre_process_html`] to learn more about how `depth_level` works.
    pub fn check_elements(&self, html: &str, depth_level: u32) -> Result<CompatResult, CheckError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        // Pre-process HTML to return the appropriate String of elements
        let elements = pre_process_html(&formatted, depth_level);

        // Create HashSet cache to prevent repeated element/ attribute searches
        let mut caches = LookupCaches {
            element_cache: HashSet::new(),
            attrib_cache: HashSet::new(),
        };

        // Use rewrite_str to find tags for compatibility checks
        let rewrite = rewrite_str(
            &elements,
            RewriteStrSettings::new().append_element_content_handler(element!("*", |el| {
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
            })),
        );

        if let Err(e) = rewrite {
            return Err(e.into());
        }

        // Calculates the overall score
        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(<ParseFloatError as Into<CheckError>>::into)?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        Ok(compat_result)
    }

    /// Used for performing a full page compatibility check.
    pub fn full_inspect(&self, html: &str) -> Result<CompatResult, CheckError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        // Format the HTML tags onto individual lines
        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        // Create HashSet cache to prevent repeated element/ attribute searches
        let mut caches = LookupCaches {
            element_cache: HashSet::new(),
            attrib_cache: HashSet::new(),
        };

        // Use rewrite_str to find tags for compatibility checks
        let rewrite = rewrite_str(
            &formatted,
            RewriteStrSettings::new().append_element_content_handler(element!("*", |el| {
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
            })),
        );

        if let Err(e) = rewrite {
            return Err(e.into());
        }

        // Calculates the overall score
        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(<ParseFloatError as Into<CheckError>>::into)?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        Ok(compat_result)
    }

    /// Perform a compatibility check for a single element and its attributes.
    ///
    /// Returns a Vector of [`LookupResults`] when successful.
    ///
    /// ## Errors
    /// A [`CheckError`] is returned if there are any errors in lookups.
    fn compat_check(&self, ctx: ElementContext) -> Result<Vec<LookupResults>, CheckError> {
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
            )?;
            lookup_attribs(
                lookup_attribs_ctx,
                &mut overall_results,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
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
            )?;
            lookup_attribs(
                lookup_attribs_ctx,
                &mut overall_results,
                &vec![
                    BrowserDataParamType::BrowserData(self.browser_data.to_owned()),
                    BrowserDataParamType::UsageData(self.browser_usage_data.to_owned()),
                ],
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
            )?;
        }

        Ok(overall_results)
    }
}
