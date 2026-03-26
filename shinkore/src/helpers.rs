use std::{
    cell::RefCell,
    collections::{HashMap, HashSet},
    rc::Rc,
};

use lol_html::{
    RewriteStrSettings, element,
    html_content::{Attribute, Element},
    rewrite_str,
};
use regex::Regex;
use wasm_bindgen::JsValue;

use crate::{
    LookupResults,
    schema::{CompatElement, CompatGlobalAttribs},
};

/// HTML tags to ignore the body of when pre-processing HTML.
const IGNORE_TAGS: [&str; 8] = [
    "</script>",
    "</style>",
    "</textarea>",
    "</title>",
    "</noscript>",
    "</noembed>",
    "</iframe>",
    "</xmp>",
];

/// Used for pre-processing HTML to return all of the elements down to the specified `depth_level`,
/// which **must be greater than 0**.
///
/// The `depth_level` represents the amount of levels down in a nested HTML structure to go.
/// The algorithm will then only return the HTML tags up to the specified depth.
///
/// ## Example
///
/// Say we have HTML that looks like this:
///
/// ```html
/// <main>
///     <section>
///         <div>
///             <h2>Grand example</h2>
///             <p>This is a big example</p>
///             <div class="inner-div">
///                 <p>I will not be returned</p>
///                 <p>Or will I?</p>
///             </div>
///         </div>
///     </section>
/// </main>
/// ```
/// If we call the function with a depth level of 3:
///
/// ```rust
/// use shinkore::helpers::pre_process_html;
///
/// let html = "example"; // Example html above
///
/// let val = pre_process_html(html, 3);
/// ```
/// The returned output would look like this:
///
/// ```html
/// <main>
/// <section>
/// <div>
/// <h2>
/// <p>
/// <div class="inner-div">
/// ```
/// Notice how the `<p>` tags in the `inner-div` were not returned.
pub fn pre_process_html(html: &str, depth_level: u32) -> String {
    let mut result: Vec<&str> = vec![];
    let mut lines = html.lines();
    if depth_level == 0 {
        return String::new();
    }
    if let Some(line) = lines.next() {
        result.push(line)
    } else {
        return String::new();
    }

    let mut cur_depth = 0;
    let mut close_tags: Vec<String> = vec![];
    let mut parent = false;
    let mut ignore_until_closed = false;

    let mut cur_line = lines.next();
    while cur_line.is_some() {
        let line = cur_line.unwrap();
        if cur_depth < depth_level && parent {
            parent = false;
        }
        if ignore_until_closed {
            if let Some(close) = close_tags.last()
                && line == close
            {
                cur_depth -= 1;
                close_tags.pop();
                ignore_until_closed = false;
            }
            cur_line = lines.next();
            continue;
        }
        if cur_depth >= depth_level {
            if line == close_tags.last().unwrap() {
                cur_depth -= 1;
                close_tags.pop();
                cur_line = lines.next();
                continue;
            } else {
                if parent && let Some(close_tag) = write_close_tag(line) {
                    cur_depth += 1;
                    close_tags.push(close_tag);
                }

                cur_line = lines.next();
                continue;
            }
        }

        if line.starts_with("</") {
            if cur_depth > 0 && line == close_tags.last().unwrap() {
                cur_depth -= 1;
                close_tags.pop();
            }

            cur_line = lines.next();
            continue;
        }

        if let Some(close_tag) = write_close_tag(line) {
            if IGNORE_TAGS.contains(&close_tag.as_str()) {
                cur_depth += 1;
                close_tags.push(close_tag);
                result.push("\n");
                result.push(line);
                ignore_until_closed = true;
            } else {
                cur_depth += 1;
                close_tags.push(close_tag);
                if cur_depth < depth_level {
                    result.push("\n");
                    result.push(line);
                } else {
                    if depth_level == cur_depth {
                        result.push("\n");
                        result.push(line);
                    }
                    if !parent {
                        parent = true
                    }
                }
            }
        } else {
            result.push("\n");
            result.push(line);
        }

        cur_line = lines.next();
    }

    result.into_iter().collect()
}

/// Uses the [`lol_html::rewrite_str`] function to return the close tag equivalent
/// of the provided html.
///
/// `line` should be a string of html containing a **single tag name**,
/// if multiple open tags names are provided with no close tag equivalents,
/// the last open tag will have its close tag equivalent returned.
///
/// ## Examples
///
/// ```rust
/// use shinkore::helpers::write_close_tag;
///
/// // Single open tag
///
/// let open_div = "<div id='example-container' class='div-elem'>";
///
/// if let Some(close_tag) = write_close_tag(open_div) {
///     println!("{}", close_tag) // prints "</div>"
/// }
///
/// // Multiple open tags
/// let open_tags = "<div><span><p>";
///
/// if let Some(close_tag) = write_close_tag(open_tags) {
///     println!("{}", close_tag) // prints "</p>"
/// }
/// ```
pub fn write_close_tag(line: &str) -> Option<String> {
    let end_tag = Rc::new(RefCell::new(None));
    let open_tags: Rc<RefCell<HashMap<String, String>>> = Rc::new(RefCell::new(HashMap::new()));
    let _ = rewrite_str(
        line,
        RewriteStrSettings {
            element_content_handlers: vec![element!("*", |el: &mut Element| {
                let open_tags_inner = Rc::clone(&open_tags);
                let end_tag_inner = Rc::clone(&end_tag);
                if el.can_have_content() {
                    open_tags_inner
                        .borrow_mut()
                        .insert(el.tag_name(), format!("</{}>", el.tag_name()));
                    *end_tag.borrow_mut() = Some(format!("</{}>", el.tag_name()));
                }

                if let Some(handlers) = el.end_tag_handlers() {
                    handlers.push(Box::new(move |end| {
                        if open_tags_inner.borrow().contains_key(&end.name()) {
                            open_tags_inner.borrow_mut().remove(&end.name());
                            match open_tags_inner.borrow().iter().last() {
                                Some(tag) => *end_tag_inner.borrow_mut() = Some(tag.1.to_string()),
                                None => *end_tag_inner.borrow_mut() = None,
                            }
                        }
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
    let mut attribs: HashMap<String, String> = HashMap::new();

    for attribute in attributes {
        attribs.insert(attribute.name(), attribute.value());
    }

    lookup_element(tag_name, &mut overall_results, el_data);
    lookup_attribs(
        tag_name,
        attribs,
        &mut overall_results,
        el_data,
        g_attrib_data,
    );

    overall_results
}

pub fn multi_compat_check(
    tag_name: &str,
    attributes: &[Attribute<'_>],
    el_data: &HashMap<String, CompatElement>,
    g_attrib_data: &HashMap<String, CompatGlobalAttribs>,
    element_cache: &mut HashSet<String>,
    attrib_cache: &mut HashSet<String>,
) -> Vec<LookupResults> {
    let mut overall_results: Vec<LookupResults> = vec![];
    let mut attribs: HashMap<String, String> = HashMap::new();

    for attribute in attributes {
        attribs.insert(attribute.name(), attribute.value());
    }

    multi_lookup_element(tag_name, &mut overall_results, el_data, element_cache);
    multi_lookup_attribs(
        tag_name,
        attribs,
        &mut overall_results,
        el_data,
        g_attrib_data,
        attrib_cache,
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

fn multi_lookup_element(
    tag: &str,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    element_cache: &mut HashSet<String>,
) {
    if let Some(el) = el_data.get(tag) {
        if !element_cache.contains(tag) {
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

            element_cache.insert(tag.to_string());
        }
    } else {
        web_sys::console::error_1(&JsValue::from_str(&format!("<{}> is not an element", tag)));
    }
}

fn lookup_attribs(
    tag: &str,
    attribs: HashMap<String, String>,
    results: &mut Vec<LookupResults>,
    el_data: &HashMap<String, CompatElement>,
    g_attrib_data: &HashMap<String, CompatGlobalAttribs>,
) {
    for (name, value) in attribs {
        if let Some(g_attrib) = g_attrib_data.get(&name) {
            if let Some(status) = &g_attrib.compat.status {
                if status.deprecated {
                    results.push(LookupResults {
                        description: format!("'{name}' is deprecated"),
                        deprecated: status.deprecated,
                    })
                } else {
                    results.push(LookupResults {
                        description: format!("'{name}' is not deprecated"),
                        deprecated: status.deprecated,
                    })
                }
            } else {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Status is unavailable for global attribute '{}'",
                    name
                )));
            }
            continue;
        }
        if let Some(el) = el_data.get(tag) {
            if tag == "input" {
                if let Some(input_attrib) = el.sub_features.get(&format!("type_{value}")) {
                    if let Some(status) = &input_attrib.compat.status {
                        if status.deprecated {
                            results.push(LookupResults {
                                description: format!("'type_{value}' is deprecated"),
                                deprecated: status.deprecated,
                            })
                        } else {
                            results.push(LookupResults {
                                description: format!("'type_{value}' is not deprecated"),
                                deprecated: status.deprecated,
                            })
                        }
                    } else {
                        web_sys::console::error_1(&JsValue::from_str(&format!(
                            "Status is unavailable for local attribute '{}'",
                            format!("type_{value}")
                        )));
                    }
                    continue;
                }
            }
            if let Some(l_attrib) = el.sub_features.get(&name) {
                if let Some(status) = &l_attrib.compat.status {
                    if status.deprecated {
                        results.push(LookupResults {
                            description: format!("'{name}' is deprecated"),
                            deprecated: status.deprecated,
                        })
                    } else {
                        results.push(LookupResults {
                            description: format!("'{name}' is not deprecated"),
                            deprecated: status.deprecated,
                        })
                    }
                } else {
                    web_sys::console::error_1(&JsValue::from_str(&format!(
                        "Status is unavailable for local attribute '{}'",
                        name
                    )));
                }
                continue;
            } else {
                if name.starts_with("data-") {
                    results.push(LookupResults {
                        description: format!("'{name}' is not deprecated"),
                        deprecated: false,
                    });

                    continue;
                }
            }
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!("<{}> is not an element", tag)));
        }

        web_sys::console::error_1(&JsValue::from_str(&format!("{} is not an attribute", name)));
    }
}

fn multi_lookup_attribs(
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
                if let Some(status) = &g_attrib.compat.status {
                    if status.deprecated {
                        results.push(LookupResults {
                            description: format!("'{name}' is deprecated"),
                            deprecated: status.deprecated,
                        })
                    } else {
                        results.push(LookupResults {
                            description: format!("'{name}' is not deprecated"),
                            deprecated: status.deprecated,
                        })
                    }
                } else {
                    web_sys::console::error_1(&JsValue::from_str(&format!(
                        "Status is unavailable for global attribute '{}'",
                        name
                    )));
                }
                attrib_cache.insert(name);
            }
            continue;
        }
        if let Some(el) = el_data.get(tag) {
            if tag == "input" {
                if let Some(input_attrib) = el.sub_features.get(&format!("type_{value}")) {
                    if !attrib_cache.contains(&format!("type_{value}")) {
                        if let Some(status) = &input_attrib.compat.status {
                            if status.deprecated {
                                results.push(LookupResults {
                                    description: format!("'type_{value}' is deprecated"),
                                    deprecated: status.deprecated,
                                })
                            } else {
                                results.push(LookupResults {
                                    description: format!("'type_{value}' is not deprecated"),
                                    deprecated: status.deprecated,
                                })
                            }
                        } else {
                            web_sys::console::error_1(&JsValue::from_str(&format!(
                                "Status is unavailable for local attribute '{}'",
                                format!("type_{value}")
                            )));
                        }
                        attrib_cache.insert(format!("type_{value}"));
                    }
                    continue;
                }
            }
            if let Some(l_attrib) = el.sub_features.get(&name) {
                if !attrib_cache.contains(&name) {
                    if let Some(status) = &l_attrib.compat.status {
                        if status.deprecated {
                            results.push(LookupResults {
                                description: format!("'{name}' is deprecated"),
                                deprecated: status.deprecated,
                            })
                        } else {
                            results.push(LookupResults {
                                description: format!("'{name}' is not deprecated"),
                                deprecated: status.deprecated,
                            })
                        }
                    } else {
                        web_sys::console::error_1(&JsValue::from_str(&format!(
                            "Status is unavailable for local attribute '{}'",
                            name
                        )));
                    }
                    attrib_cache.insert(name);
                }
                continue;
            } else {
                if name.starts_with("data-") {
                    results.push(LookupResults {
                        description: format!("'{name}' is not deprecated"),
                        deprecated: false,
                    });

                    attrib_cache.insert(name);

                    continue;
                }
            }
        } else {
            web_sys::console::error_1(&JsValue::from_str(&format!("<{}> is not an element", tag)));
        }

        web_sys::console::error_1(&JsValue::from_str(&format!("{} is not an attribute", name)));
    }
}

pub fn format_html(html: &str) -> String {
    let regex = Regex::new(r">\s*<").unwrap();

    regex.replace_all(html, ">\n<").trim().to_string()
}