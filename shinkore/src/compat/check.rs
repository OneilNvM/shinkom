use std::collections::{HashMap, HashSet};

use lol_html::html_content::Attribute;
use wasm_bindgen::JsValue;

use crate::{
    HTMLData, LookupResults, SVGData,
    compat::{
        LookupType,
        lookup::{lookup_attribs, lookup_element, multi_lookup_attribs, multi_lookup_element},
    },
    constants::{IGNORE_TAGS, SKIP_TAGS},
    schema::Status,
};

pub fn compat_check(
    tag_name: &str,
    attributes: &[Attribute<'_>],
    html_data: &HTMLData,
    svg_data: &SVGData,
) -> Vec<LookupResults> {
    let mut overall_results: Vec<LookupResults> = vec![];
    let mut attribs: HashMap<String, String> = HashMap::new();

    for attribute in attributes {
        attribs.insert(attribute.name_preserve_case(), attribute.value());
    }

    if svg_data.el_data.contains_key(tag_name) && !IGNORE_TAGS.contains(&tag_name) {
        lookup_element(tag_name, &mut overall_results, &svg_data.el_data);
        lookup_attribs(
            tag_name,
            attribs,
            &mut overall_results,
            &svg_data.el_data,
            &svg_data.g_attrib_data,
        );
    } else {
        lookup_element(tag_name, &mut overall_results, &html_data.el_data);
        lookup_attribs(
            tag_name,
            attribs,
            &mut overall_results,
            &html_data.el_data,
            &html_data.g_attrib_data,
        );
    }

    overall_results
}

pub fn multi_compat_check(
    tag_name: &str,
    attributes: &[Attribute<'_>],
    html_data: &HTMLData,
    svg_data: &SVGData,
    element_cache: &mut HashSet<String>,
    attrib_cache: &mut HashSet<String>,
) -> Vec<LookupResults> {
    let mut overall_results: Vec<LookupResults> = vec![];
    let mut attribs: HashMap<String, String> = HashMap::new();

    for attribute in attributes {
        attribs.insert(attribute.name_preserve_case(), attribute.value());
    }

    if svg_data.el_data.contains_key(tag_name) && !SKIP_TAGS.contains(&tag_name) {
        multi_lookup_element(
            tag_name,
            &mut overall_results,
            &svg_data.el_data,
            element_cache,
        );
        multi_lookup_attribs(
            tag_name,
            attribs,
            &mut overall_results,
            &svg_data.el_data,
            &svg_data.g_attrib_data,
            attrib_cache,
        );
    } else {
        multi_lookup_element(
            tag_name,
            &mut overall_results,
            &html_data.el_data,
            element_cache,
        );
        multi_lookup_attribs(
            tag_name,
            attribs,
            &mut overall_results,
            &html_data.el_data,
            &html_data.g_attrib_data,
            attrib_cache,
        );
    }

    overall_results
}

pub fn check_status(
    compat_status: &Option<Status>,
    lookup_type: LookupType,
    results: &mut Vec<LookupResults>,
) {
    if let Some(status) = compat_status {
        if status.deprecated {
            results.push(LookupResults {
                description: match lookup_type {
                    LookupType::Element(tag) => format!("<{tag}> is deprecated"),
                    LookupType::Attribute(attribute) => format!("'{attribute}' is deprecated"),
                },
                deprecated: status.deprecated,
            });
        } else {
            results.push(LookupResults {
                description: match lookup_type {
                    LookupType::Element(tag) => format!("<{tag}> is not deprecated"),
                    LookupType::Attribute(attribute) => format!("'{attribute}' is not deprecated"),
                },
                deprecated: status.deprecated,
            });
        }
    } else {
        match lookup_type {
            LookupType::Element(tag) => web_sys::console::error_1(&JsValue::from_str(&format!(
                "Status is unavailable for tag <{tag}>"
            ))),
            LookupType::Attribute(attribute) => web_sys::console::error_1(&JsValue::from_str(
                &format!("Status is unavailable for local attribute '{attribute}'"),
            )),
        }
    }
}
