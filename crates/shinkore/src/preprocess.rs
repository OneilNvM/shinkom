//! This module contains functions for pre-processing HTML input before compatibility checks.
//! The purpose of these functions is to make sure that the HTML input passed into
//! compatibility checking functions is standardized to output accurate results.
use std::{cell::RefCell, rc::Rc};

use lol_html::{RewriteStrSettings, element, html_content::Element, rewrite_str};
use regex::Regex;

use crate::{constants::IGNORE_TAGS, errors::PreProcessError};

#[derive(Debug, Clone, Copy)]
enum PreProcessState {
    Active,
    Ignoring,
    Truncating,
}

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
    let mut lines = html.trim().lines();

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

    let mut state = PreProcessState::Active;

    for line in lines {
        // Reset `parent` if parent is true
        // and when current depth is less than depth level
        if cur_depth < depth_level && parent {
            parent = false;
        }

        match state {
            PreProcessState::Ignoring => {
                // Ignore current line except for when the line is equal
                // to the last String in `close_tags`
                if let Some(close) = close_tags.last()
                    && line == close
                {
                    cur_depth -= 1;
                    close_tags.pop();
                    state = if cur_depth >= depth_level {
                        PreProcessState::Truncating
                    } else {
                        PreProcessState::Active
                    }
                }
            }
            PreProcessState::Truncating => {
                // Decrement `cur_depth` and remove a close tag if the current line matches the last close tag
                if line == *close_tags.last().unwrap() {
                    cur_depth -= 1;
                    close_tags.pop();
                    if cur_depth < depth_level {
                        state = PreProcessState::Active;
                    }
                } else if parent && let Some(close_tag) = write_close_tag(line) {
                    // If parent is already true and current line is an open tag,
                    // increase `cur_depth` and push the close tag
                    cur_depth += 1;
                    close_tags.push(close_tag);
                }
            }
            PreProcessState::Active => {
                // Decrement `cur_depth` if line is a cloes tag and matches last close tag
                if line.starts_with("</") {
                    if cur_depth > 0 && line == *close_tags.last().unwrap() {
                        cur_depth -= 1;
                        close_tags.pop();
                    }
                } else if let Some(close_tag) = write_close_tag(line) {
                    // Ignore any content within ignored tags in next iteration
                    if IGNORE_TAGS.contains(&close_tag.as_str()) {
                        cur_depth += 1;
                        close_tags.push(close_tag);
                        result.push("\n");
                        result.push(line);
                        state = PreProcessState::Ignoring;
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
                            if cur_depth >= depth_level && !parent {
                                parent = true;
                                state = PreProcessState::Truncating;
                            }
                        }
                    }
                } else {
                    result.push("\n");
                    result.push(line);
                }
            }
        }
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
    let mut end_tag: Option<String> = None;
    let open_tags: Rc<RefCell<Vec<String>>> = Rc::new(RefCell::new(Vec::new()));

    // Return the equivalent end tag if the line has an open tag
    let _ = rewrite_str(
        line,
        RewriteStrSettings::new().append_element_content_handler(element!(
            "*",
            |el: &mut Element| {
                let inner_open_tags = Rc::clone(&open_tags);
                // Check if the element is an open tag
                if el.can_have_content() {
                    let tag_name = el.tag_name();
                    inner_open_tags.borrow_mut().push(tag_name.clone());
                    end_tag = Some(tag_name);
                }

                // Check if the line has a close tag
                if let Some(handlers) = el.end_tag_handlers() {
                    handlers.push(Box::new(move |end| {
                        let mut live_tags = inner_open_tags.borrow_mut();
                        if let Some(pos) = live_tags.iter().rposition(|tag| *tag == end.name()) {
                            live_tags.remove(pos);
                        }

                        Ok(())
                    }))
                }

                Ok(())
            }
        )),
    );

    if !open_tags.borrow().is_empty() {
        end_tag.map(|name| format!("</{name}>"))
    } else {
        None
    }
}

/// Format the tags in HTML string to be on individual lines.
///
/// ## Examples
///
/// ```rust
/// use shinkore::preprocess::format_html;
/// use shinkore::errors::PreProcessError;
///
/// fn main() -> Result<(), PreProcessError> {
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
