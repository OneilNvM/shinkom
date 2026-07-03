//! Module contains functions for performing compatibility data lookup logic to calculate the
//! compatibility score.
use std::collections::HashSet;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::JsValue;

use crate::{
    BrowserDataParamType, LookupResults, compat::calculate::calculate_compat_score,
    errors::CheckError,
};

use shinkore_types::prelude::{
    CompatType, LookupAttribsContext, LookupElementsContext, LookupType, WebFeatureContext,
};

pub enum AttributeLookupState {
    GlobalAttribute,
    DataAttribute,
    LocalAttribute,
    MissingAttribute,
}

/// Perform a compatibility lookup for a single element.
///
/// ## Errors
/// A [`CheckError`] is returned if there are any errors in score calculations.
pub fn lookup_element(
    ctx: LookupElementsContext,
    results: &mut Vec<LookupResults>,
    browser_data_params: &Vec<BrowserDataParamType>,
) -> Result<(), CheckError> {
    if let Some(el) = ctx.el_data.get(ctx.tag) {
        calculate_compat_score(
            WebFeatureContext {
                name: String::from(ctx.tag),
                compat_type: CompatType::Element(el),
                lookup_type: LookupType::Element(ctx.tag),
            },
            results,
            browser_data_params,
        )?;
    } else {
        #[cfg(target_arch = "wasm32")]
        {
            web_sys::console::warn_1(&JsValue::from_str(&format!(
                "<{}> is not an element",
                ctx.tag
            )));
        }
        #[cfg(not(target_arch = "wasm32"))]
        {
            eprintln!("<{}> is not an element", ctx.tag)
        }
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
) -> Result<(), CheckError> {
    if let Some(el) = ctx.el_data.get(ctx.tag) {
        // Store tag name in element cache to prevent duplicate element lookups
        if !element_cache.contains(ctx.tag) {
            calculate_compat_score(
                WebFeatureContext {
                    name: String::from(ctx.tag),
                    compat_type: CompatType::Element(el),
                    lookup_type: LookupType::Element(ctx.tag),
                },
                results,
                browser_data_params,
            )?;

            element_cache.insert(ctx.tag.to_string());
        }
    } else if !element_cache.contains(ctx.tag) {
        #[cfg(target_arch = "wasm32")]
        {
            web_sys::console::warn_1(&JsValue::from_str(&format!(
                "<{}> is not an element or has no compat data",
                ctx.tag
            )));
        }
        #[cfg(not(target_arch = "wasm32"))]
        {
            eprintln!("<{}> is not an element or has no compat data", ctx.tag)
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
) -> Result<(), CheckError> {
    let mut state;

    for (name, value) in ctx.attribs {
        if name.starts_with("data-") {
            state = AttributeLookupState::DataAttribute;
        } else if ctx.g_attrib_data.contains_key(&name) {
            state = AttributeLookupState::GlobalAttribute;
        } else if ctx.el_data.contains_key(ctx.tag) {
            state = AttributeLookupState::LocalAttribute;
        } else {
            state = AttributeLookupState::MissingAttribute;
        }

        match state {
            AttributeLookupState::GlobalAttribute => {
                if let Some(g_attrib) = ctx.g_attrib_data.get(&name) {
                    // Handle global attribute lookups
                    calculate_compat_score(
                        WebFeatureContext {
                            name: name.to_string(),
                            compat_type: CompatType::GlobalAttributes(g_attrib),
                            lookup_type: LookupType::Attribute(&name),
                        },
                        results,
                        browser_data_params,
                    )?;
                }
            }
            AttributeLookupState::DataAttribute => {
                if let Some(d_attrib) = ctx.g_attrib_data.get("data_attributes") {
                    // Handle special data-* attribute lookups
                    calculate_compat_score(
                        WebFeatureContext {
                            name: "data-attributes".to_string(),
                            compat_type: CompatType::GlobalAttributes(d_attrib),
                            lookup_type: LookupType::Attribute("data-attributes"),
                        },
                        results,
                        browser_data_params,
                    )?;
                }
            }
            AttributeLookupState::LocalAttribute => {
                if let Some(el) = ctx.el_data.get(ctx.tag) {
                    if ctx.tag == "input"
                        && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
                    {
                        // Handle input attribute lookups
                        calculate_compat_score(
                            WebFeatureContext {
                                name: format!("type_{value}"),
                                compat_type: CompatType::Element(input_attrib),
                                lookup_type: LookupType::Attribute(&name),
                            },
                            results,
                            browser_data_params,
                        )?;
                    } else if let Some(l_attrib) = el.sub_features.get(&name) {
                        // Handle local attribute lookups
                        calculate_compat_score(
                            WebFeatureContext {
                                name: name.to_string(),
                                compat_type: CompatType::Element(l_attrib),
                                lookup_type: LookupType::Attribute(&name),
                            },
                            results,
                            browser_data_params,
                        )?;
                    } else {
                        state = AttributeLookupState::MissingAttribute;
                    }
                }
            }
            _ => (),
        }

        if let AttributeLookupState::MissingAttribute = state {
            #[cfg(target_arch = "wasm32")]
            {
                web_sys::console::warn_1(&JsValue::from_str(&format!(
                    "{name} is not an attribute"
                )));
            }
            #[cfg(not(target_arch = "wasm32"))]
            {
                eprintln!("{name} is not an attribute")
            }
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
) -> Result<(), CheckError> {
    let mut state;

    for (name, value) in ctx.attribs {
        if name.starts_with("data-") {
            state = AttributeLookupState::DataAttribute;
        } else if ctx.g_attrib_data.contains_key(&name) {
            state = AttributeLookupState::GlobalAttribute;
        } else if ctx.el_data.contains_key(ctx.tag) {
            state = AttributeLookupState::LocalAttribute;
        } else {
            state = AttributeLookupState::MissingAttribute;
        }

        match state {
            AttributeLookupState::GlobalAttribute => {
                if let Some(g_attrib) = ctx.g_attrib_data.get(&name) {
                    // Store global attribute name in attribute cache to prevent duplicate attribute lookups
                    if !attrib_cache.contains(&name) {
                        calculate_compat_score(
                            WebFeatureContext {
                                name: name.to_string(),
                                compat_type: CompatType::GlobalAttributes(g_attrib),
                                lookup_type: LookupType::Attribute(&name),
                            },
                            results,
                            browser_data_params,
                        )?;
                        attrib_cache.insert(name.to_string());
                    }
                }
            }
            AttributeLookupState::DataAttribute => {
                if let Some(d_attrib) = ctx.g_attrib_data.get("data_attributes")
                    && !attrib_cache.contains("data-attributes")
                {
                    // Store special data-* attribute name in attribute cache to prevent duplicate attribute lookups
                    calculate_compat_score(
                        WebFeatureContext {
                            name: "data-attributes".to_string(),
                            compat_type: CompatType::GlobalAttributes(d_attrib),
                            lookup_type: LookupType::Attribute("data-attributes"),
                        },
                        results,
                        browser_data_params,
                    )?;

                    attrib_cache.insert("data-attributes".to_string());
                }
            }
            AttributeLookupState::LocalAttribute => {
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
                                    lookup_type: LookupType::Attribute(&name),
                                },
                                results,
                                browser_data_params,
                            )?;
                            attrib_cache.insert(format!("type_{value}"));
                        }
                    }
                    if let Some(l_attrib) = el.sub_features.get(&name) {
                        // Store local attribute name in attribute cache to prevent duplicate attribute lookups
                        if !attrib_cache.contains(&name) {
                            calculate_compat_score(
                                WebFeatureContext {
                                    name: name.to_string(),
                                    compat_type: CompatType::Element(l_attrib),
                                    lookup_type: LookupType::Attribute(&name),
                                },
                                results,
                                browser_data_params,
                            )?;
                            attrib_cache.insert(name.to_string());
                        }
                    }
                }
            }
            _ => (),
        }

        if let AttributeLookupState::MissingAttribute = state {
            // Insert name into attribute cache to prevent duplicate error messages
            if !attrib_cache.contains(&name) {
                #[cfg(target_arch = "wasm32")]
                {
                    web_sys::console::warn_1(&JsValue::from_str(&format!(
                        "{name} is not an attribute or has no compat data"
                    )));
                }
                #[cfg(not(target_arch = "wasm32"))]
                {
                    eprintln!("{name} is not an attribute or has no compat data")
                }

                attrib_cache.insert(name.to_string());
            }
        }
    }

    Ok(())
}
