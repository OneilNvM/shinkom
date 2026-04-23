/// Module contains functions involved in performing compatibility checks.
use std::collections::{HashMap, HashSet};

use lol_html::html_content::Attribute;

use crate::{
    BrowserDataParamType, HTMLData, LookupResults, SVGData,
    compat::lookup::{lookup_attribs, lookup_element, multi_lookup_attribs, multi_lookup_element},
    constants::{IGNORE_TAGS, SKIP_TAGS},
    errors::CheckError,
};

/// Perform a compatibility check for a single element and its attributes.
///
/// Returns a Vector of [`LookupResults`] when successful.
///
/// ## Errors
/// A [`JsError`] is returned if there are any errors in lookups.
pub fn compat_check(
    tag_name: &str,
    attributes: &[Attribute<'_>],
    html_data: &HTMLData,
    svg_data: &SVGData,
    browser_data_params: Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<Vec<LookupResults>, CheckError> {
    let mut overall_results: Vec<LookupResults> = vec![];
    let mut attribs: HashMap<String, String> = HashMap::new();

    for attribute in attributes {
        attribs.insert(attribute.name_preserve_case(), attribute.value());
    }

    // If the element is an SVG element, opt for an SVG data lookup
    if svg_data.el_data.contains_key(tag_name) && !IGNORE_TAGS.contains(&tag_name) {
        lookup_element(
            tag_name,
            &mut overall_results,
            &svg_data.el_data,
            &browser_data_params,
            rust_engine,
        )?;
        lookup_attribs(
            tag_name,
            attribs,
            &mut overall_results,
            &svg_data.el_data,
            &svg_data.g_attrib_data,
            &browser_data_params,
            rust_engine,
        )?;
    } else {
        lookup_element(
            tag_name,
            &mut overall_results,
            &html_data.el_data,
            &browser_data_params,
            rust_engine,
        )?;
        lookup_attribs(
            tag_name,
            attribs,
            &mut overall_results,
            &html_data.el_data,
            &html_data.g_attrib_data,
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
    tag_name: &str,
    attributes: &[Attribute<'_>],
    html_data: &HTMLData,
    svg_data: &SVGData,
    element_cache: &mut HashSet<String>,
    attrib_cache: &mut HashSet<String>,
    browser_data_params: Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<Vec<LookupResults>, CheckError> {
    let mut overall_results: Vec<LookupResults> = vec![];
    let mut attribs: HashMap<String, String> = HashMap::new();

    for attribute in attributes {
        attribs.insert(attribute.name_preserve_case(), attribute.value());
    }

    // If the element is an SVG element, opt for an SVG data lookup
    if svg_data.el_data.contains_key(tag_name) && !SKIP_TAGS.contains(&tag_name) {
        multi_lookup_element(
            tag_name,
            &mut overall_results,
            &svg_data.el_data,
            element_cache,
            &browser_data_params,
            rust_engine,
        )?;
        multi_lookup_attribs(
            tag_name,
            attribs,
            &mut overall_results,
            &svg_data.el_data,
            &svg_data.g_attrib_data,
            attrib_cache,
            &browser_data_params,
            rust_engine,
        )?;
    } else {
        multi_lookup_element(
            tag_name,
            &mut overall_results,
            &html_data.el_data,
            element_cache,
            &browser_data_params,
            rust_engine,
        )?;
        multi_lookup_attribs(
            tag_name,
            attribs,
            &mut overall_results,
            &html_data.el_data,
            &html_data.g_attrib_data,
            attrib_cache,
            &browser_data_params,
            rust_engine,
        )?;
    }

    Ok(overall_results)
}
