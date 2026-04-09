use std::collections::{HashMap, HashSet};

use wasm_bindgen::JsValue;

use crate::{
    LookupResults,
    compat::{LookupType, check::check_status},
    schema::{CompatElement, CompatGlobalAttribs},
};

pub fn lookup_element(
    tag: &str,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
) {
    if let Some(el) = el_data.get(tag) {
        check_status(
            &el.compat.status,
            LookupType::Element(String::from(tag)),
            results,
        );
    } else {
        web_sys::console::error_1(&JsValue::from_str(&format!("<{}> is not an element", tag)));
    }
}

pub fn multi_lookup_element(
    tag: &str,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    element_cache: &mut HashSet<String>,
) {
    if let Some(el) = el_data.get(tag) {
        if !element_cache.contains(tag) {
            check_status(
                &el.compat.status,
                LookupType::Element(String::from(tag)),
                results,
            );

            element_cache.insert(tag.to_string());
        }
    } else if !element_cache.contains(tag) {
        web_sys::console::error_1(&JsValue::from_str(&format!(
            "<{}> is not an element or has no compat data",
            tag
        )));

        element_cache.insert(tag.to_string());
    }
}

pub fn lookup_attribs(
    tag: &str,
    attribs: HashMap<String, String>,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    g_attrib_data: &HashMap<String, CompatGlobalAttribs>,
) {
    for (name, value) in attribs {
        if let Some(g_attrib) = g_attrib_data.get(&name) {
            check_status(
                &g_attrib.compat.status,
                LookupType::Attribute(name),
                results,
            );
            continue;
        }
        if let Some(el) = el_data.get(tag) {
            if tag == "input"
                && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
            {
                check_status(
                    &input_attrib.compat.status,
                    LookupType::Attribute(format!("type_{value}")),
                    results,
                );
                continue;
            }

            if let Some(l_attrib) = el.sub_features.get(&name) {
                check_status(
                    &l_attrib.compat.status,
                    LookupType::Attribute(name),
                    results,
                );
                continue;
            } else if name.starts_with("data-") {
                results.push(LookupResults {
                    description: format!("'{name}' is not deprecated"),
                    deprecated: false,
                });

                continue;
            }
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!("<{}> is not an element", tag)));
        }

        web_sys::console::error_1(&JsValue::from_str(&format!("{} is not an attribute", name)));
    }
}

pub fn multi_lookup_attribs(
    tag: &str,
    attribs: HashMap<String, String>,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    g_attrib_data: &HashMap<String, CompatGlobalAttribs>,
    attrib_cache: &mut HashSet<String>,
) {
    for (name, value) in attribs {
        if let Some(g_attrib) = g_attrib_data.get(&name) {
            if !attrib_cache.contains(&name) {
                check_status(
                    &g_attrib.compat.status,
                    LookupType::Attribute(name.clone()),
                    results,
                );
                attrib_cache.insert(name);
            }
            continue;
        }
        if let Some(el) = el_data.get(tag) {
            if tag == "input"
                && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
            {
                if !attrib_cache.contains(&format!("type_{value}")) {
                    check_status(
                        &input_attrib.compat.status,
                        LookupType::Attribute(format!("type_{value}")),
                        results,
                    );
                    attrib_cache.insert(format!("type_{value}"));
                }
                continue;
            }
            if let Some(l_attrib) = el.sub_features.get(&name) {
                if !attrib_cache.contains(&name) {
                    check_status(
                        &l_attrib.compat.status,
                        LookupType::Attribute(name.clone()),
                        results,
                    );
                    attrib_cache.insert(name);
                }
                continue;
            } else if name.starts_with("data-") {
                if !attrib_cache.contains(&name) {
                    results.push(LookupResults {
                        description: format!("'{name}' is not deprecated"),
                        deprecated: false,
                    });

                    attrib_cache.insert(name);
                }
                continue;
            }
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "<{}> is not an element or has no compat data",
                tag
            )));
        }

        if !attrib_cache.contains(&name) {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "{} is not an attribute or has no compat data",
                name
            )));

            attrib_cache.insert(name);
        }
    }
}
