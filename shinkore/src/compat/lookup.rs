//! Module contains functions for performing compatibility data lookup logic to calculate the
//! compatibility score.
use std::collections::{HashMap, HashSet};

use wasm_bindgen::JsValue;

use crate::{
    BrowserDataParamType, LookupResults,
    compat::{CompatType, LookupType, calculate::calculate_compat_score},
    errors::CheckError,
    schema::{CompatElement, CompatGlobalAttribs},
};

/// Perform a compatibility lookup for a single element.
///
/// ## Errors
/// A [`JsError`] is returned if there are any errors in score calculations.
pub fn lookup_element(
    tag: &str,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    browser_data_params: &Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<(), CheckError> {
    if let Some(el) = el_data.get(tag) {
        calculate_compat_score(
            String::from(tag),
            CompatType::Element(el),
            LookupType::Element(String::from(tag)),
            results,
            browser_data_params,
        )?;
    } else if rust_engine {
        eprintln!("<{tag}> is not an element")
    } else {
        web_sys::console::error_1(&JsValue::from_str(&format!("<{tag}> is not an element")));
    }

    Ok(())
}

/// Perform compatibility lookups for multiple elements.
///
/// ## Errors
/// A [`JsError`] is returned if there are any errors in score calculations.
pub fn multi_lookup_element(
    tag: &str,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    element_cache: &mut HashSet<String>,
    browser_data_params: &Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<(), CheckError> {
    if let Some(el) = el_data.get(tag) {
        // Store tag name in element cache to prevent duplicate element lookups
        if !element_cache.contains(tag) {
            calculate_compat_score(
                String::from(tag),
                CompatType::Element(el),
                LookupType::Element(String::from(tag)),
                results,
                browser_data_params,
            )?;

            element_cache.insert(tag.to_string());
        }
    } else if !element_cache.contains(tag) {
        if rust_engine {
            eprintln!("<{tag}> is not an element or has no compat data")
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "<{tag}> is not an element or has no compat data"
            )));
        }
        element_cache.insert(tag.to_string());
    }

    Ok(())
}

/// Perform compatibility lookups for an element's attributes.
///
/// ## Errors
/// A [`JsError`] is returned if there are any errors in score calculations.
pub fn lookup_attribs(
    tag: &str,
    attribs: HashMap<String, String>,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    g_attrib_data: &HashMap<String, CompatGlobalAttribs>,
    browser_data_params: &Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<(), CheckError> {
    for (name, value) in attribs {
        if let Some(g_attrib) = g_attrib_data.get(&name) {
            // Handle global attribute lookups
            calculate_compat_score(
                name.clone(),
                CompatType::GlobalAttributes(g_attrib),
                LookupType::Attribute(name),
                results,
                browser_data_params,
            )?;
            continue;
        } else if name.starts_with("data-")
            && let Some(d_attrib) = g_attrib_data.get("data_attributes")
        {
            // Handle special data-* attribute lookups
            calculate_compat_score(
                "data-attributes".to_string(),
                CompatType::GlobalAttributes(d_attrib),
                LookupType::Attribute("data-attributes".to_string()),
                results,
                browser_data_params,
            )?;
            continue;
        }
        if let Some(el) = el_data.get(tag) {
            if tag == "input"
                && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
            {
                // Handle input attribute lookups
                calculate_compat_score(
                    name.clone(),
                    CompatType::Element(input_attrib),
                    LookupType::Attribute(name),
                    results,
                    browser_data_params,
                )?;
                continue;
            }

            if let Some(l_attrib) = el.sub_features.get(&name) {
                // Handle local attribute lookups
                calculate_compat_score(
                    name.clone(),
                    CompatType::Element(l_attrib),
                    LookupType::Attribute(name),
                    results,
                    browser_data_params,
                )?;
                continue;
            }
        } else if rust_engine {
            eprintln!("<{tag}> is not an element")
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!("<{tag}> is not an element")));
        }

        if rust_engine {
            eprintln!("{name} is not an attribute")
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!("{name} is not an attribute")));
        }
    }

    Ok(())
}

/// Perform compatibility lookups for multiple elements' attributes.
///
/// ## Errors
/// A [`JsError`] is returned if there are any errors in score calculations.
pub fn multi_lookup_attribs(
    tag: &str,
    attribs: HashMap<String, String>,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    g_attrib_data: &HashMap<String, CompatGlobalAttribs>,
    attrib_cache: &mut HashSet<String>,
    browser_data_params: &Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<(), CheckError> {
    for (name, value) in attribs {
        if let Some(g_attrib) = g_attrib_data.get(&name) {
            // Store global attribute name in attribute cache to prevent duplicate attribute lookups
            if !attrib_cache.contains(&name) {
                calculate_compat_score(
                    name.clone(),
                    CompatType::GlobalAttributes(g_attrib),
                    LookupType::Attribute(name.clone()),
                    results,
                    browser_data_params,
                )?;
                attrib_cache.insert(name);
            }
            continue;
        } else if name.starts_with("data-")
            && let Some(d_attrib) = g_attrib_data.get("data_attributes")
        {
            // Store special data-* attribute name in attribute cache to prevent duplicate attribute lookups
            calculate_compat_score(
                "data-attributes".to_string(),
                CompatType::GlobalAttributes(d_attrib),
                LookupType::Attribute("data-attributes".to_string()),
                results,
                browser_data_params,
            )?;
            attrib_cache.insert(name);

            continue;
        }
        if let Some(el) = el_data.get(tag) {
            if tag == "input"
                && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
            {
                // Store input attribute name in attribute cache to prevent duplicate attribute lookups
                if !attrib_cache.contains(&format!("type_{value}")) {
                    calculate_compat_score(
                        format!("type_{value}"),
                        CompatType::Element(input_attrib),
                        LookupType::Attribute(format!("type_{value}")),
                        results,
                        browser_data_params,
                    )?;
                    attrib_cache.insert(format!("type_{value}"));
                }
                continue;
            }
            if let Some(l_attrib) = el.sub_features.get(&name) {
                // Store local attribute name in attribute cache to prevent duplicate attribute lookups
                if !attrib_cache.contains(&name) {
                    calculate_compat_score(
                        name.clone(),
                        CompatType::Element(l_attrib),
                        LookupType::Attribute(name.clone()),
                        results,
                        browser_data_params,
                    )?;
                    attrib_cache.insert(name);
                }
                continue;
            }
        } else if rust_engine {
            eprintln!("<{tag}> is not an element or has no compat data");
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "<{tag}> is not an element or has no compat data"
            )));
        }

        // Insert name into attribute cache to prevent duplicate error messages
        if !attrib_cache.contains(&name) {
            if rust_engine {
                eprintln!("{name} is not an attribute or has no compat data")
            } else {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "{name} is not an attribute or has no compat data"
                )));
            }

            attrib_cache.insert(name);
        }
    }

    Ok(())
}
