mod schema;
mod prelude;
use std::{cell::RefCell, rc::Rc};

use crate::prelude::*;
use lol_html::{RewriteStrSettings, element, html_content::Attribute, rewrite_str};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Default)]
#[wasm_bindgen]
pub struct CompatEngine {
    el_data: HashMap<String, CompatElement>,
    g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}

#[derive(Default, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct LookupResults {
    #[wasm_bindgen(getter_with_clone)]
    pub description: String,
    pub deprecated: bool,
}

#[wasm_bindgen]
impl CompatEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(bcd_elem_data: JsValue, bcd_g_attrib_data: JsValue) -> Self {
        let mut engine = CompatEngine::default();

        match serde_wasm_bindgen::from_value::<HashMap<String, CompatElement>>(bcd_elem_data) {
            Ok(parsed_elem) => engine.el_data = parsed_elem,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "BCD element parsing error: {}",
                    e
                )));
            }
        }

        match serde_wasm_bindgen::from_value::<HashMap<String, CompatGlobalAttribs>>(
            bcd_g_attrib_data,
        ) {
            Ok(parsed_attrib) => engine.g_attrib_data = parsed_attrib,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "BCD global attribute parsing error: {e}"
                )));
            }
        }

        engine
    }

    #[wasm_bindgen]
    pub fn return_element_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.el_data).unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred retrieving element data: {e}"
            )));
            JsValue::null()
        })
    }
    #[wasm_bindgen]
    pub fn return_global_attrib_data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.g_attrib_data).unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred retrieving global attribute data: {e}"
            )));
            JsValue::null()
        })
    }

    #[wasm_bindgen]
    pub fn check_element(&self, html: &str) -> JsValue {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let el_data = &self.el_data;
        let g_attrib_data = &self.g_attrib_data;

        let _ = rewrite_str(
            html,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    results.borrow_mut().extend(check_single(
                        &tag_name,
                        attributes,
                        el_data,
                        g_attrib_data,
                    ));

                    Ok(())
                })],
                ..Default::default()
            },
        )
        .unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred rewriting html: {e}"
            )));
            String::new()
        });

        let final_results = results.borrow();

        serde_wasm_bindgen::to_value(&*final_results).unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred parsing lookup results: {e}"
            )));
            JsValue::null()
        })
    }
}

fn check_single(
    tag_name: &str,
    attributes: &[Attribute<'_>],
    el_data: &HashMap<String, CompatElement>,
    g_attrib_data: &HashMap<String, CompatGlobalAttribs>,
) -> Vec<LookupResults> {
    let mut overall_results: Vec<LookupResults> = vec![];
    let mut attr_names: Vec<String> = vec![];

    for attribute in attributes {
        attr_names.push(attribute.name());
    }

    lookup_element(tag_name, &mut overall_results, el_data);
    lookup_attribs(tag_name, attr_names, &mut overall_results, el_data, g_attrib_data);

    overall_results
}

fn lookup_element(
    tag: &str,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
) {
    if let Some(el) = el_data.get(tag) {
        if let Some(status) = &el.compat.status {
            if status.deprecated {
                results.push(LookupResults {
                    description: format!("<{tag}> is deprecated"),
                    deprecated: status.deprecated,
                });
            } else {
                results.push(LookupResults {
                    description: format!("<{tag}> is not deprecated"),
                    deprecated: status.deprecated,
                });
            }
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Status is unavailable for tag <{}>",
                tag
            )));
        }
    } else {
        web_sys::console::error_1(&JsValue::from_str(&format!("<{}> is not an element", tag)));
    }
}
fn lookup_attribs(
    tag: &str,
    attr_names: Vec<String>,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    g_attrib_data: &HashMap<String, CompatGlobalAttribs>,
) {
    for attribute in attr_names {
        let mut is_global = false;
        let mut is_local = false;

        if let Some(g_attrib) = g_attrib_data.get(&attribute) {
            is_global = true;
            if let Some(status) = &g_attrib.compat.status {
                if status.deprecated {
                    results.push(LookupResults {
                        description: format!("'{attribute}' is deprecated"),
                        deprecated: status.deprecated,
                    })
                } else {
                    results.push(LookupResults {
                        description: format!("'{attribute}' is not deprecated"),
                        deprecated: status.deprecated,
                    })
                }
            } else {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Status is unavailable for global attribute '{}'",
                    attribute
                )));
            }
        }
        if let Some(el) = el_data.get(tag) {
            if let Some(l_attrib) = el.sub_features.get(&attribute) {
                is_local = true;
                if let Some(status) = &l_attrib.compat.status {
                    if status.deprecated {
                        results.push(LookupResults {
                            description: format!("'{attribute}' is deprecated"),
                            deprecated: status.deprecated,
                        })
                    } else {
                        results.push(LookupResults {
                            description: format!("'{attribute}' is not deprecated"),
                            deprecated: status.deprecated,
                        })
                    }
                } else {
                    web_sys::console::error_1(&JsValue::from_str(&format!(
                        "Status is unavailable for local attribute '{}'",
                        attribute
                    )));
                }
            }
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!("<{}> is not an element", tag)));
        }

        if !is_global && !is_local {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "{} is not an attribute",
                attribute
            )));
        }
    }
}
