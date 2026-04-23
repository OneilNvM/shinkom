//! This module contains functions for pre-processing HTML input before compatibility checks.
//! The purpose of these functions is to make sure that the HTML input passed into
//! compatibility checking functions is standardized to output accurate results.
use std::{cell::RefCell, collections::HashMap, rc::Rc};

use lol_html::{RewriteStrSettings, element, html_content::Element, rewrite_str};
use regex::Regex;

use crate::{constants::IGNORE_TAGS, errors::PreProcessError};

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
/// use shinkore::preprocess::pre_process_html;
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

    // Handle base cases
    if depth_level == 0 {
        return String::new();
    }
    if let Some(line) = lines.next() {
        result.push(line)
    } else {
        return String::new();
    }

    // Current depth level in the iteration
    let mut cur_depth = 0;

    // Vector of tags that have been closed
    let mut close_tags: Vec<String> = vec![];

    // Determines when an open tag is present at the depth level
    let mut parent = false;

    // Ignores any line until the parent element's close tag has been reached
    let mut ignore_until_closed = false;

    let mut cur_line = lines.next();
    while cur_line.is_some() {
        let line = cur_line.unwrap();

        // Reset `parent` if parent is true
        // and when current depth is less than depth level
        if cur_depth < depth_level && parent {
            parent = false;
        }

        // Ignore current line except for when the line is equal
        // to the last String in `close_tags`
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

        // Handle situations when current depth is greater than or equal to depth level
        if cur_depth >= depth_level {
            // Decrement `cur_depth` and remove a close tag if the current line matches the last close tag
            if line == close_tags.last().unwrap() {
                cur_depth -= 1;
                close_tags.pop();
                cur_line = lines.next();
                continue;
            } else {
                // If parent is already true and current line is an open tag,
                // increase `cur_depth` and push the close tag
                if parent && let Some(close_tag) = write_close_tag(line) {
                    cur_depth += 1;
                    close_tags.push(close_tag);
                }

                cur_line = lines.next();
                continue;
            }
        }

        // Decrement `cur_depth` if line is a cloes tag and matches last close tag
        if line.starts_with("</") {
            if cur_depth > 0 && line == close_tags.last().unwrap() {
                cur_depth -= 1;
                close_tags.pop();
            }

            cur_line = lines.next();
            continue;
        }

        // Check if the current line is an open tag
        if let Some(close_tag) = write_close_tag(line) {
            // Ignore any content within ignored tags in next iteration
            if IGNORE_TAGS.contains(&close_tag.as_str()) {
                cur_depth += 1;
                close_tags.push(close_tag);
                result.push("\n");
                result.push(line);
                ignore_until_closed = true;
            } else {
                cur_depth += 1;
                close_tags.push(close_tag);

                // Push line to result if current depth is less than depth level
                if cur_depth < depth_level {
                    result.push("\n");
                    result.push(line);
                } else {
                    // Push line to result if depth level is equal to current depth
                    if depth_level == cur_depth {
                        result.push("\n");
                        result.push(line);
                    }
                    // Set parent to true to flag that the parent element was reached
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
/// use shinkore::preprocess::write_close_tag;
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

    // Return the equivalent end tag if the line has an open tag
    let _ = rewrite_str(
        line,
        RewriteStrSettings {
            element_content_handlers: vec![element!("*", |el: &mut Element| {
                let open_tags_inner = Rc::clone(&open_tags);
                let end_tag_inner = Rc::clone(&end_tag);

                // Check if the element is an open tag
                if el.can_have_content() {
                    open_tags_inner
                        .borrow_mut()
                        .insert(el.tag_name(), format!("</{}>", el.tag_name()));
                    *end_tag.borrow_mut() = Some(format!("</{}>", el.tag_name()));
                }

                // Check if the line has a close tag
                if let Some(handlers) = el.end_tag_handlers() {
                    handlers.push(Box::new(move |end| {
                        if open_tags_inner.borrow().contains_key(&end.name()) {
                            open_tags_inner.borrow_mut().remove(&end.name());
                            match open_tags_inner.borrow().iter().last() {
                                Some((_, tag)) => {
                                    *end_tag_inner.borrow_mut() = Some(tag.to_owned())
                                }
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

/// Format the tags in HTML string to be on individual lines.
///
/// ## Examples
///
/// ```rust
/// use shinkore::preprocess::format_html;
/// use wasm_bindgen::JsError;
///
/// fn main() -> Result<(), JsError> {
///
/// let html = "<aside><section><h2>Aside Title</h2><div>Content</div></section></aside>";
///
/// let formatted = format_html(html)?;
///
/// println!("{formatted}");
///
/// /* Prints
///     <aside>
///     <section>
///     <h2>Aside Title</h2>
///     <div>Content</div>
///     </section>
///     </aside>
/// */
///
/// Ok(())
/// }
/// ```
pub fn format_html(html: &str) -> Result<String, PreProcessError> {
    let regex = Regex::new(r">\s*<")?;

    Ok(regex.replace_all(html, ">\n<").trim().to_string())
}
