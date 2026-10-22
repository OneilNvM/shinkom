//! Contains functions for performing compatibility data lookup logic to calculate the
//! compatibility score.
use std::collections::HashSet;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::JsValue;

use shinkore_types::prelude::{
    CompatType, LookupAttribsContext, LookupCSSContext, LookupElementsContext, LookupType,
    WebFeatureContext,
};

enum AttributeLookupState {
    Global,
    Data,
    Local,
    Missing,
}

/// Perform a compatibility lookup for a single element.
pub fn lookup_element(ctx: LookupElementsContext) -> Option<WebFeatureContext> {
    if let Some(el) = ctx.el_data.get(ctx.tag) {
        Some(WebFeatureContext {
            name: String::from(ctx.tag),
            compat_type: CompatType::Feature(el),
            lookup_type: LookupType::Feature(ctx.tag),
        })
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
            eprintln!("<{}> is not an element", ctx.tag);
        }

        None
    }
}

/// Perform compatibility lookups for multiple elements.
pub fn multi_lookup_element<'a>(
    ctx: &'a LookupElementsContext,
    element_cache: &mut HashSet<String>,
) -> Option<WebFeatureContext<'a>> {
    if let Some(el) = ctx.el_data.get(ctx.tag) {
        // Store tag name in element cache to prevent duplicate element lookups
        if !element_cache.contains(ctx.tag) {
            element_cache.insert(ctx.tag.to_string());

            return Some(WebFeatureContext {
                name: String::from(ctx.tag),
                compat_type: CompatType::Feature(el),
                lookup_type: LookupType::Feature(ctx.tag),
            });
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

    None
}

/// Perform compatibility lookups for an element's attributes.
pub fn lookup_attribs<'a>(ctx: &'a LookupAttribsContext) -> Option<Vec<WebFeatureContext<'a>>> {
    let mut state;
    let mut features: Vec<WebFeatureContext> = vec![];

    for (name, value) in &ctx.attribs {
        if name.starts_with("data-") {
            state = AttributeLookupState::Data;
        } else if ctx.g_attrib_data.contains_key(name) {
            state = AttributeLookupState::Global;
        } else if ctx.el_data.contains_key(ctx.tag) {
            state = AttributeLookupState::Local;
        } else {
            state = AttributeLookupState::Missing;
        }

        match state {
            AttributeLookupState::Global => {
                if let Some(g_attrib) = ctx.g_attrib_data.get(name) {
                    // Handle global attribute lookups
                    features.push(WebFeatureContext {
                        name: name.to_string(),
                        compat_type: CompatType::GlobalAttributes(g_attrib),
                        lookup_type: LookupType::Attribute(name),
                    });
                }
            }
            AttributeLookupState::Data => {
                if let Some(d_attrib) = ctx.g_attrib_data.get("data_attributes") {
                    // Handle special data-* attribute lookups
                    features.push(WebFeatureContext {
                        name: "data-attributes".to_string(),
                        compat_type: CompatType::GlobalAttributes(d_attrib),
                        lookup_type: LookupType::Attribute("data-attributes"),
                    });
                }
            }
            AttributeLookupState::Local => {
                if let Some(el) = ctx.el_data.get(ctx.tag) {
                    if ctx.tag == "input"
                        && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
                    {
                        // Handle input attribute lookups
                        features.push(WebFeatureContext {
                            name: format!("type_{value}"),
                            compat_type: CompatType::Feature(input_attrib),
                            lookup_type: LookupType::Attribute(name),
                        });
                    } else if let Some(l_attrib) = el.sub_features.get(name) {
                        // Handle local attribute lookups
                        features.push(WebFeatureContext {
                            name: name.to_string(),
                            compat_type: CompatType::Feature(l_attrib),
                            lookup_type: LookupType::Attribute(name),
                        });
                    } else {
                        state = AttributeLookupState::Missing;
                    }
                }
            }
            _ => (),
        }

        if let AttributeLookupState::Missing = state {
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

    if features.is_empty() {
        None
    } else {
        Some(features)
    }
}

/// Perform compatibility lookups for multiple elements' attributes.
pub fn multi_lookup_attribs<'a>(
    ctx: &'a LookupAttribsContext,
    attrib_cache: &mut HashSet<String>,
) -> Option<Vec<WebFeatureContext<'a>>> {
    let mut state;
    let mut features: Vec<WebFeatureContext> = vec![];

    for (name, value) in &ctx.attribs {
        if name.starts_with("data-") {
            state = AttributeLookupState::Data;
        } else if ctx.g_attrib_data.contains_key(name) {
            state = AttributeLookupState::Global;
        } else if ctx.el_data.contains_key(ctx.tag) {
            state = AttributeLookupState::Local;
        } else {
            state = AttributeLookupState::Missing;
        }

        match state {
            AttributeLookupState::Global => {
                if let Some(g_attrib) = ctx.g_attrib_data.get(name) {
                    // Store global attribute name in attribute cache to prevent duplicate attribute lookups
                    if !attrib_cache.contains(name) {
                        features.push(WebFeatureContext {
                            name: name.to_string(),
                            compat_type: CompatType::GlobalAttributes(g_attrib),
                            lookup_type: LookupType::Attribute(name),
                        });
                        attrib_cache.insert(name.to_string());
                    }
                }
            }
            AttributeLookupState::Data => {
                if let Some(d_attrib) = ctx.g_attrib_data.get("data_attributes")
                    && !attrib_cache.contains("data-attributes")
                {
                    // Store special data-* attribute name in attribute cache to prevent duplicate attribute lookups
                    features.push(WebFeatureContext {
                        name: "data-attributes".to_string(),
                        compat_type: CompatType::GlobalAttributes(d_attrib),
                        lookup_type: LookupType::Attribute("data-attributes"),
                    });

                    attrib_cache.insert("data-attributes".to_string());
                }
            }
            AttributeLookupState::Local => {
                if let Some(el) = ctx.el_data.get(ctx.tag) {
                    if ctx.tag == "input"
                        && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
                    {
                        // Store input attribute name in attribute cache to prevent duplicate attribute lookups
                        if !attrib_cache.contains(&format!("type_{value}")) {
                            features.push(WebFeatureContext {
                                name: format!("type_{value}"),
                                compat_type: CompatType::Feature(input_attrib),
                                lookup_type: LookupType::Attribute(name),
                            });
                            attrib_cache.insert(format!("type_{value}"));
                        }
                    }
                    if let Some(l_attrib) = el.sub_features.get(name) {
                        // Store local attribute name in attribute cache to prevent duplicate attribute lookups
                        if !attrib_cache.contains(name) {
                            features.push(WebFeatureContext {
                                name: name.to_string(),
                                compat_type: CompatType::Feature(l_attrib),
                                lookup_type: LookupType::Attribute(name),
                            });
                            attrib_cache.insert(name.to_string());
                        }
                    }
                }
            }
            _ => (),
        }

        if let AttributeLookupState::Missing = state {
            // Insert name into attribute cache to prevent duplicate error messages
            if !attrib_cache.contains(name) {
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

    if features.is_empty() {
        None
    } else {
        Some(features)
    }
}

pub fn lookup_css<'a>(
    ctx: &'a LookupCSSContext,
    style_cache: &mut HashSet<String>,
) -> Option<Vec<WebFeatureContext<'a>>> {
    let mut features = Vec::new();

    for prop in ctx.parsed_css_styles.keys() {
        if !style_cache.contains(prop) {
            if let Some(property) = ctx.css_data.get(prop) {
                features.push(WebFeatureContext {
                    name: prop.to_string(),
                    compat_type: CompatType::Feature(property),
                    lookup_type: LookupType::Feature(prop),
                });
            } else {
                #[cfg(target_arch = "wasm32")]
                {
                    web_sys::console::warn_1(&JsValue::from_str(&format!(
                        "{prop} is not a CSS property or has no compat data"
                    )));
                }
                #[cfg(not(target_arch = "wasm32"))]
                {
                    eprintln!("{prop} is not a CSS property or has no compat data")
                }
            }
            style_cache.insert(prop.to_string());
        }
    }

    if features.is_empty() {
        None
    } else {
        Some(features)
    }
}
