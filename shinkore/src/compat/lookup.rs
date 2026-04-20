use std::collections::{HashMap, HashSet};

use wasm_bindgen::JsValue;

use crate::{
    BrowserDataParamType, LookupResults,
    compat::{LookupType, calculate::calculate_compat_score},
    schema::{CompatElement, CompatGlobalAttribs},
};

pub enum CompatType<'a> {
    Element(&'a CompatElement),
    GlobalAttributes(&'a CompatGlobalAttribs),
}

pub fn lookup_element(
    tag: &str,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    browser_data_params: &Vec<BrowserDataParamType>,
) {
    if let Some(el) = el_data.get(tag) {
        calculate_compat_score(
            String::from(tag),
            CompatType::Element(el),
            LookupType::Element(String::from(tag)),
            results,
            browser_data_params,
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
    browser_data_params: &Vec<BrowserDataParamType>,
) {
    if let Some(el) = el_data.get(tag) {
        if !element_cache.contains(tag) {
            calculate_compat_score(
                String::from(tag),
                CompatType::Element(el),
                LookupType::Element(String::from(tag)),
                results,
                browser_data_params,
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
    browser_data_params: &Vec<BrowserDataParamType>,
) {
    for (name, value) in attribs {
        if let Some(g_attrib) = g_attrib_data.get(&name) {
            calculate_compat_score(
                name.clone(),
                CompatType::GlobalAttributes(g_attrib),
                LookupType::Attribute(name),
                results,
                browser_data_params,
            );
            continue;
        } else if name.starts_with("data-")
            && let Some(d_attrib) = g_attrib_data.get("data_attributes")
        {
            calculate_compat_score(
                "data-attributes".to_string(),
                CompatType::GlobalAttributes(d_attrib),
                LookupType::Attribute("data-attributes".to_string()),
                results,
                browser_data_params,
            );
            continue;
        }
        if let Some(el) = el_data.get(tag) {
            if tag == "input"
                && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
            {
                calculate_compat_score(
                    name.clone(),
                    CompatType::Element(input_attrib),
                    LookupType::Attribute(name),
                    results,
                    browser_data_params,
                );
                continue;
            }

            if let Some(l_attrib) = el.sub_features.get(&name) {
                calculate_compat_score(
                    name.clone(),
                    CompatType::Element(l_attrib),
                    LookupType::Attribute(name),
                    results,
                    browser_data_params,
                );
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
    browser_data_params: &Vec<BrowserDataParamType>,
) {
    for (name, value) in attribs {
        if let Some(g_attrib) = g_attrib_data.get(&name) {
            if !attrib_cache.contains(&name) {
                calculate_compat_score(
                    name.clone(),
                    CompatType::GlobalAttributes(g_attrib),
                    LookupType::Attribute(name.clone()),
                    results,
                    browser_data_params,
                );
                attrib_cache.insert(name);
            }
            continue;
        } else if name.starts_with("data-")
            && let Some(d_attrib) = g_attrib_data.get("data_attributes")
        {
            calculate_compat_score(
                "data-attributes".to_string(),
                CompatType::GlobalAttributes(d_attrib),
                LookupType::Attribute("data-attributes".to_string()),
                results,
                browser_data_params,
            );
            attrib_cache.insert(name);

            continue;
        }
        if let Some(el) = el_data.get(tag) {
            if tag == "input"
                && let Some(input_attrib) = el.sub_features.get(&format!("type_{value}"))
            {
                if !attrib_cache.contains(&format!("type_{value}")) {
                    calculate_compat_score(
                        format!("type_{value}"),
                        CompatType::Element(input_attrib),
                        LookupType::Attribute(format!("type_{value}")),
                        results,
                        browser_data_params,
                    );
                    attrib_cache.insert(format!("type_{value}"));
                }
                continue;
            }
            if let Some(l_attrib) = el.sub_features.get(&name) {
                if !attrib_cache.contains(&name) {
                    calculate_compat_score(
                        name.clone(),
                        CompatType::Element(l_attrib),
                        LookupType::Attribute(name.clone()),
                        results,
                        browser_data_params,
                    );
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
