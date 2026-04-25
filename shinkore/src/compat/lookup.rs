//! Module contains functions for performing compatibility data lookup logic to calculate the
//! compatibility score.
use std::collections::HashSet;

use wasm_bindgen::JsValue;

use crate::{
    BrowserDataParamType, LookupResults,
    compat::{CompatType, LookupType, calculate::calculate_compat_score},
    errors::CheckError,
    prelude::{LookupAttribsContext, LookupElementsContext, WebFeatureContext},
};

/// Perform a compatibility lookup for a single element.
///
/// ## Errors
/// A [`CheckError`] is returned if there are any errors in score calculations.
pub fn lookup_element(
    ctx: LookupElementsContext,
    results: &mut Vec<LookupResults>,
    browser_data_params: &Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<(), CheckError> {
    if let Some(el) = ctx.el_data.get(ctx.tag) {
        calculate_compat_score(
            WebFeatureContext {
                name: String::from(ctx.tag),
                compat_type: CompatType::Element(el),
                lookup_type: LookupType::Element(String::from(ctx.tag)),
            },
            results,
            browser_data_params,
        )?;
    } else if rust_engine {
        eprintln!("<{}> is not an element", ctx.tag)
    } else {
        web_sys::console::error_1(&JsValue::from_str(&format!(
            "<{}> is not an element",
            ctx.tag
        )));
    }

    Ok(())
}

/// Perform compatibility lookups for multiple elements.
///
/// ## Errors
/// A [`CheckError`] is returned if there are any errors in score calculations.
pub fn multi_lookup_element(
    ctx: LookupElementsContext,
    results: &mut Vec<LookupResults>,
    element_cache: &mut HashSet<String>,
    browser_data_params: &Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<(), CheckError> {
    if let Some(el) = ctx.el_data.get(ctx.tag) {
        // Store tag name in element cache to prevent duplicate element lookups
        if !element_cache.contains(ctx.tag) {
            calculate_compat_score(
                WebFeatureContext {
                    name: String::from(ctx.tag),
                    compat_type: CompatType::Element(el),
                    lookup_type: LookupType::Element(String::from(ctx.tag)),
                },
                results,
                browser_data_params,
            )?;

            element_cache.insert(ctx.tag.to_string());
        }
    } else if !element_cache.contains(ctx.tag) {
        if rust_engine {
            eprintln!("<{}> is not an element or has no compat data", ctx.tag)
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "<{}> is not an element or has no compat data",
                ctx.tag
            )));
        }
        element_cache.insert(ctx.tag.to_string());
    }

    Ok(())
}

/// Perform compatibility lookups for an element's attributes.
///
/// ## Errors
/// A [`CheckError`] is returned if there are any errors in score calculations.
pub fn lookup_attribs(
    ctx: LookupAttribsContext,
    results: &mut Vec<LookupResults>,
    browser_data_params: &Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<(), CheckError> {
    for (name, value) in ctx.attribs {
        if let Some(g_attrib) = ctx.g_attrib_data.get(&name) {
            // Handle global attribute lookups
            calculate_compat_score(
                WebFeatureContext {
                    name: name.clone(),
                    compat_type: CompatType::GlobalAttributes(g_attrib),
                    lookup_type: LookupType::Attribute(name),
                },
                results,
                browser_data_params,
            )?;
            continue;
        } else if name.starts_with("data-")
            && let Some(d_attrib) = ctx.g_attrib_data.get("data_attributes")
        {
            // Handle special data-* attribute lookups
            calculate_compat_score(
                WebFeatureContext {
                    name: "data-attributes".to_string(),
                    compat_type: CompatType::GlobalAttributes(d_attrib),
                    lookup_type: LookupType::Attribute("data-attributes".to_string()),
                },
                results,
                browser_data_params,
            )?;
            continue;
        }
        if let Some(el) = ctx.el_data.get(ctx.tag) {
            if ctx.tag == "input"
                && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
            {
                // Handle input attribute lookups
                calculate_compat_score(
                    WebFeatureContext {
                        name: format!("type_{value}"),
                        compat_type: CompatType::Element(input_attrib),
                        lookup_type: LookupType::Attribute(name),
                    },
                    results,
                    browser_data_params,
                )?;
                continue;
            }

            if let Some(l_attrib) = el.sub_features.get(&name) {
                // Handle local attribute lookups
                calculate_compat_score(
                    WebFeatureContext {
                        name: name.clone(),
                        compat_type: CompatType::Element(l_attrib),
                        lookup_type: LookupType::Attribute(name),
                    },
                    results,
                    browser_data_params,
                )?;
                continue;
            }
        } else if rust_engine {
            eprintln!("<{}> is not an element", ctx.tag)
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "<{}> is not an element",
                ctx.tag
            )));
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
/// A [`CheckError`] is returned if there are any errors in score calculations.
pub fn multi_lookup_attribs(
    ctx: LookupAttribsContext,
    results: &mut Vec<LookupResults>,
    attrib_cache: &mut HashSet<String>,
    browser_data_params: &Vec<BrowserDataParamType>,
    rust_engine: bool,
) -> Result<(), CheckError> {
    for (name, value) in ctx.attribs {
        if let Some(g_attrib) = ctx.g_attrib_data.get(&name) {
            // Store global attribute name in attribute cache to prevent duplicate attribute lookups
            if !attrib_cache.contains(&name) {
                calculate_compat_score(
                    WebFeatureContext {
                        name: name.clone(),
                        compat_type: CompatType::GlobalAttributes(g_attrib),
                        lookup_type: LookupType::Attribute(name.clone()),
                    },
                    results,
                    browser_data_params,
                )?;
                attrib_cache.insert(name);
            }
            continue;
        } else if name.starts_with("data-")
            && let Some(d_attrib) = ctx.g_attrib_data.get("data_attributes")
        {
            // Store special data-* attribute name in attribute cache to prevent duplicate attribute lookups
            calculate_compat_score(
                WebFeatureContext {
                    name: "data-attributes".to_string(),
                    compat_type: CompatType::GlobalAttributes(d_attrib),
                    lookup_type: LookupType::Attribute("data-attributes".to_string()),
                },
                results,
                browser_data_params,
            )?;
            attrib_cache.insert(name);

            continue;
        }
        if let Some(el) = ctx.el_data.get(ctx.tag) {
            if ctx.tag == "input"
                && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
            {
                // Store input attribute name in attribute cache to prevent duplicate attribute lookups
                if !attrib_cache.contains(&format!("type_{value}")) {
                    calculate_compat_score(
                        WebFeatureContext {
                            name: format!("type_{value}"),
                            compat_type: CompatType::Element(input_attrib),
                            lookup_type: LookupType::Attribute(name),
                        },
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
                        WebFeatureContext {
                            name: name.clone(),
                            compat_type: CompatType::Element(l_attrib),
                            lookup_type: LookupType::Attribute(name.clone()),
                        },
                        results,
                        browser_data_params,
                    )?;
                    attrib_cache.insert(name);
                }
                continue;
            }
        } else if rust_engine {
            eprintln!("<{}> is not an element or has no compat data", ctx.tag);
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "<{}> is not an element or has no compat data",
                ctx.tag
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
