/// Module contains functions involved in performing compatibility checks.
use std::collections::HashMap;

use crate::{
    BrowserDataParamType, LookupResults,
    compat::lookup::{lookup_attribs, lookup_element, multi_lookup_attribs, multi_lookup_element},
    constants::{IGNORE_TAGS, SKIP_TAGS},
    errors::CheckError,
    prelude::{ElementContext, LookupAttribsContext, LookupCaches, LookupElementsContext},
};

/// Perform a compatibility check for a single element and its attributes.
///
/// Returns a Vector of [`LookupResults`] when successful.
///
/// ## Errors
/// A [`JsError`] is returned if there are any errors in lookups.
pub fn compat_check(
    ctx: ElementContext,
    browser_data_params: Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<Vec<LookupResults>, CheckError> {
    let mut overall_results: Vec<LookupResults> = vec![];
    let mut attribs: HashMap<String, String> = HashMap::new();

    for attribute in ctx.attributes {
        attribs.insert(attribute.name_preserve_case(), attribute.value());
    }

    // If the element is an SVG element, opt for an SVG data lookup
    if ctx.svg_data.el_data.contains_key(ctx.tag_name) && !IGNORE_TAGS.contains(&ctx.tag_name) {
        let lookup_el_ctx = LookupElementsContext {
            tag: ctx.tag_name,
            el_data: &ctx.svg_data.el_data,
        };
        let lookup_attribs_ctx = LookupAttribsContext {
            tag: ctx.tag_name,
            attribs,
            el_data: &ctx.svg_data.el_data,
            g_attrib_data: &ctx.svg_data.g_attrib_data,
        };

        lookup_element(
            lookup_el_ctx,
            &mut overall_results,
            &browser_data_params,
            rust_engine,
        )?;
        lookup_attribs(
            lookup_attribs_ctx,
            &mut overall_results,
            &browser_data_params,
            rust_engine,
        )?;
    } else {
        let lookup_el_ctx = LookupElementsContext {
            tag: ctx.tag_name,
            el_data: &ctx.html_data.el_data,
        };
        let lookup_attribs_ctx = LookupAttribsContext {
            tag: ctx.tag_name,
            attribs,
            el_data: &ctx.html_data.el_data,
            g_attrib_data: &ctx.html_data.g_attrib_data,
        };

        lookup_element(
            lookup_el_ctx,
            &mut overall_results,
            &browser_data_params,
            rust_engine,
        )?;
        lookup_attribs(
            lookup_attribs_ctx,
            &mut overall_results,
            &browser_data_params,
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
/// A [`JsError`] is returned if there are any errors in lookups.
pub fn multi_compat_check(
    ctx: ElementContext,
    caches: &mut LookupCaches,
    browser_data_params: Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<Vec<LookupResults>, CheckError> {
    let mut overall_results: Vec<LookupResults> = vec![];
    let mut attribs: HashMap<String, String> = HashMap::new();

    for attribute in ctx.attributes {
        attribs.insert(attribute.name_preserve_case(), attribute.value());
    }

    // If the element is an SVG element, opt for an SVG data lookup
    if ctx.svg_data.el_data.contains_key(ctx.tag_name) && !SKIP_TAGS.contains(&ctx.tag_name) {
        let lookup_el_ctx = LookupElementsContext {
            tag: ctx.tag_name,
            el_data: &ctx.svg_data.el_data,
        };
        let lookup_attribs_ctx = LookupAttribsContext {
            tag: ctx.tag_name,
            attribs,
            el_data: &ctx.svg_data.el_data,
            g_attrib_data: &ctx.svg_data.g_attrib_data,
        };

        multi_lookup_element(
            lookup_el_ctx,
            &mut overall_results,
            &mut caches.element_cache,
            &browser_data_params,
            rust_engine,
        )?;
        multi_lookup_attribs(
            lookup_attribs_ctx,
            &mut overall_results,
            &mut caches.attrib_cache,
            &browser_data_params,
            rust_engine,
        )?;
    } else {
        let lookup_el_ctx = LookupElementsContext {
            tag: ctx.tag_name,
            el_data: &ctx.html_data.el_data,
        };
        let lookup_attribs_ctx = LookupAttribsContext {
            tag: ctx.tag_name,
            attribs,
            el_data: &ctx.html_data.el_data,
            g_attrib_data: &ctx.html_data.g_attrib_data,
        };

        multi_lookup_element(
            lookup_el_ctx,
            &mut overall_results,
            &mut caches.element_cache,
            &browser_data_params,
            rust_engine,
        )?;
        multi_lookup_attribs(
            lookup_attribs_ctx,
            &mut overall_results,
            &mut caches.attrib_cache,
            &browser_data_params,
            rust_engine,
        )?;
    }

    Ok(overall_results)
}
