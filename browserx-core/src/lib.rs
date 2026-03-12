mod prelude;
mod schema;
pub mod helpers;
use std::{cell::RefCell, rc::Rc};

use crate::prelude::*;
use lol_html::{
    RewriteStrSettings, element,
    rewrite_str,
};
use crate::helpers::{compat_check, process_html};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Default)]
#[wasm_bindgen]
pub struct CompatEngine {
    el_data: HashMap<String, CompatElement>,
    g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}

#[derive(Default, Serialize, Deserialize)]
pub struct LookupResults {
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

        let first_line = html.lines().next().unwrap();

        let el_data = &self.el_data;
        let g_attrib_data = &self.g_attrib_data;

        let _ = rewrite_str(
            first_line,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    results.borrow_mut().extend(compat_check(
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

    pub fn check_elements(&self, html: &str, depth_level: u32) -> JsValue {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let elements = process_html(html, depth_level);

        let el_data = &self.el_data;
        let g_attrib_data = &self.g_attrib_data;

        let _ = rewrite_str(
            &elements,
            RewriteStrSettings {
                element_content_handlers: vec![element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    results.borrow_mut().extend(compat_check(
                        &tag_name,
                        attributes,
                        el_data,
                        g_attrib_data,
                    ));

                    Ok(())
                })],
                ..Default::default()
            },
        );

        let final_results = results.borrow();

        serde_wasm_bindgen::to_value(&*final_results).unwrap_or_else(|e| {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Error occurred parsing lookup results: {e}"
            )));
            JsValue::null()
        })
    }
}