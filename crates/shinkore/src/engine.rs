//! This module contains a Rust compatible version of the compatibility engine.
//! It contains the same functionality of the [`crate::CompatEngine`] version but removes any usage of the [`wasm_bindgen`] implementations
//! and replaces [`wasm_bindgen::JsValue`] and [`wasm_bindgen::JsError`] usage with native Rust types.
use std::{
    cell::RefCell,
    collections::{HashMap, HashSet},
    num::ParseFloatError,
    rc::Rc,
};

use lol_html::{RewriteStrSettings, element, rewrite_str};
use serde::{Deserialize, Serialize};

use crate::{
    compat::lookup::{lookup_attribs, lookup_element, multi_lookup_attribs, multi_lookup_element},
    constants::{IGNORE_TAGS, SKIP_TAGS},
    errors::{CheckError, PreProcessError},
    prelude::{
        BrowserData, BrowserDataParamType, BrowserUsageData, CompatResult, ElementContext,
        HTMLData, LookupAttribsContext, LookupCaches, LookupElementsContext, LookupResults,
        SVGData,
    },
    preprocess::{format_html, pre_process_html},
};

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
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.compat_check(ctx, true);

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
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.multi_compat_check(ctx, &mut caches, true);

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
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.multi_compat_check(ctx, &mut caches, true);

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
