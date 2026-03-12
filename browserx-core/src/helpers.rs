use std::{cell::RefCell, collections::HashMap, rc::Rc};

use lol_html::{
    RewriteStrSettings, element,
    html_content::{Attribute, Element},
    rewrite_str,
};
use wasm_bindgen::JsValue;

use crate::{
    LookupResults,
    schema::{CompatElement, CompatGlobalAttribs},
};

pub fn process_html(html: &str, depth_level: u32) -> String {
    if depth_level == 0 || html.len() == 0 {
        return String::new();
    }

    let mut open_tags = 0;
    let mut close_tags: Vec<String> = vec![];
    let mut lines = html.lines();
    let mut result: Vec<&str> = vec![lines.next().unwrap()];

    let mut cur_line = lines.next();
    while cur_line.is_some() {
        // if open_tags is greater than or equal to depth_level
        //      if current line is equal to last close tag
        //          decrement open_tags
        //          pop last close tag from close_tags
        //          continue to next iteration
        //      else
        //          continue to next iteration
        // 
        // if current line starts with "</"
        //      continue to next iteration
        //
        // if write_close_tag is some
        //      increment open_tags
        //      push related close tag to close_tags
        // 
        //      if open_tags is less than depth_level
        //          push new line character to result
        //          push current line to result
        // else
        //      push new line character to result
        //      push current line to result
        
        let line = cur_line.unwrap();
        println!("line: {line}");
        println!("open_tags: {}, {:?}", open_tags, close_tags);
        if open_tags >= depth_level {
            if line == close_tags.last().unwrap() {
                open_tags -= 1;
                close_tags.pop();
                cur_line = lines.next();
                continue;
            } else {
                cur_line = lines.next();
                continue;
            }
        }

        if line.starts_with("</") {
            cur_line = lines.next();
            continue;
        }

        if let Some(close_tag) = write_close_tag(line) {
            open_tags += 1;
            close_tags.push(close_tag);
            if open_tags < depth_level {
                result.push("\n");
                result.push(line);
            }
        } else {
            result.push("\n");
            result.push(line);
        }

        cur_line = lines.next();
    }

    result.into_iter().collect()
}

pub fn write_close_tag(line: &str) -> Option<String> {
    let end_tag = Rc::new(RefCell::new(None));
    let _ = rewrite_str(
        line,
        RewriteStrSettings {
            element_content_handlers: vec![element!("*", |el: &mut Element| {
                if el.can_have_content() {
                    *end_tag.borrow_mut() = Some(format!("</{}>", el.tag_name()));
                }

                let inner = Rc::clone(&end_tag);

                if let Some(handlers) = el.end_tag_handlers() {
                    handlers.push(Box::new(move |_| {
                        *inner.borrow_mut() = None;
                        Ok(())
                    }))
                }

                Ok(())
            })],
            ..Default::default()
        },
    );

    end_tag.borrow_mut().take()
}

pub fn compat_check(
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
    lookup_attribs(
        tag_name,
        attr_names,
        &mut overall_results,
        el_data,
        g_attrib_data,
    );

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
