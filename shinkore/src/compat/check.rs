use std::collections::{HashMap, HashSet};

use lol_html::html_content::Attribute;

use crate::{
    HTMLData, LookupResults, SVGData,
    compat::lookup::{lookup_attribs, lookup_element, multi_lookup_attribs, multi_lookup_element},
    constants::{IGNORE_TAGS, SKIP_TAGS},
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
