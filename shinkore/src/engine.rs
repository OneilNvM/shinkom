//! This module contains a Rust compatible version of the compatibility engine.
//! It contains the same functionality of the [`crate::CompatEngine`] version but removes any usage of the [`wasm_bindgen`] implementations
//! and replaces [`wasm_bindgen::JsValue`] and [`wasm_bindgen::JsError`] usage with native Rust types.
use std::{cell::RefCell, collections::HashSet, num::ParseFloatError, rc::Rc};

use lol_html::{RewriteStrSettings, element, rewrite_str};
use serde::{Deserialize, Serialize};

use crate::{
    compat::check::{compat_check, multi_compat_check},
    errors::{CheckError, PreProcessError},
    prelude::{
        BrowserData, BrowserDataParamType, BrowserUsageData, CompatResult, ElementContext,
        HTMLData, LookupCaches, LookupResults, SVGData,
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

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                        html_data,
                        svg_data,
                    };

                    let compat_results = compat_check(
                        ctx,
                        vec![
                            BrowserDataParamType::BrowserData(browser_data.to_owned()),
                            BrowserDataParamType::UsageData(usage_data.to_owned()),
                        ],
                        true,
                    );

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
    /// See [`preprocess::pre_process_html`] to learn more about how `depth_level` works.
    pub fn check_elements(&self, html: &str, depth_level: u32) -> Result<CompatResult, CheckError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        // Pre-process HTML to return the appropriate String of elements
        let elements = pre_process_html(&formatted, depth_level);

        // Store references to compatibility data to be used in element_content_handlers closure
        let html_data = &self.html;
        let svg_data = &self.svg;
        let browser_data = &self.browser_data;
        let usage_data = &self.browser_usage_data;

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
                        html_data,
                        svg_data,
                    };

                    let compat_results = multi_compat_check(
                        ctx,
                        &mut caches,
                        vec![
                            BrowserDataParamType::BrowserData(browser_data.to_owned()),
                            BrowserDataParamType::UsageData(usage_data.to_owned()),
                        ],
                        true,
                    );

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

        // Store references to compatibility data to be used in element_content_handlers closure
        let html_data = &self.html;
        let svg_data = &self.svg;
        let browser_data = &self.browser_data;
        let usage_data = &self.browser_usage_data;

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
                        html_data,
                        svg_data,
                    };

                    let compat_results = multi_compat_check(
                        ctx,
                        &mut caches,
                        vec![
                            BrowserDataParamType::BrowserData(browser_data.to_owned()),
                            BrowserDataParamType::UsageData(usage_data.to_owned()),
                        ],
                        true,
                    );

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
}
