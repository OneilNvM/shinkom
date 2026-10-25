//! Hints feature for the shinkore library.
//! 
//! Provides an engine for compiling hints based on compatibility checks against [BCD](https://github.com/mdn/browser-compat-data) data
//! and logs hints based on the compatibility score of the feature.
pub mod overrides;
use std::collections::HashMap;

use shinkore_types::schema::{
    BrowserIssue, ImplementURLValue, NotesValue, StatusIssue, SupportData, VersionValue,
};
#[cfg(target_arch = "wasm32")]
use wasm_bindgen::JsValue;

use crate::overrides::get_html_overrides;

#[derive(Default)]
/// Collects compatibility and status hints for later logging.
///
/// Hint compilation methods append messages to an internal buffer. Use
/// [`log_hints`](Self::log_hints) to print them to the browser console on
/// WebAssembly or standard output on native targets, and
/// [`clear_hints`](Self::clear_hints) to empty the buffer.
///
/// [`new`](Self::new) loads the built-in HTML tag overrides used by
/// [`tier_3_hints`](Self::tier_3_hints). The derived [`Default`] implementation
/// starts with an empty override map instead.
pub struct HintEngine {
    hints: Vec<String>,
    overrides: HashMap<String, String>,
}

impl HintEngine {
    /// Creates an engine with an empty hint buffer and built-in HTML tag overrides.
    pub fn new() -> Self {
        let remedies_map = get_html_overrides();

        Self {
            hints: vec![],
            overrides: remedies_map,
        }
    }

    /// Compiles hints from browser compatibility data and appends an MDN link
    /// when the issue includes one.
    pub fn compile_browser_hints(&mut self, issue: BrowserIssue) {
        self.tier_2_hints(&issue);

        if let Some(url) = &issue.compat.mdn_url {
            self.hints
                .push(format!("[shinkore] 📖 Docs: Learn more at {url}"))
        }
    }

    /// Appends warnings for deprecated or experimental feature status.
    pub fn compile_status_hints(&mut self, issue: StatusIssue) {
        if issue.status.deprecated {
            self.hints.push(format!("[shinkore] 💡 Warning: {} is deprecated and should not be used anymore in websites.", issue.feature_name))
        }
        if issue.status.experimental {
            self.hints.push(format!("[shinkore] 💡 Warning: {} is experimental, meaning it is only implemented for a select few browsers.", issue.feature_name))
        }
    }

    /// Appends the first matching built-in HTML tag override, if any.
    pub fn tier_3_hints(&mut self, tags: &Vec<String>) {
        for tag in tags {
            if self.overrides.contains_key(tag) {
                let html_override = self.overrides.get(tag);
                if let Some(message) = html_override {
                    self.hints.push(format!("[shinkore] 💡 {message}"));
                    break;
                }
            }
        }
    }

    /// Compiles hints from the support details in a browser compatibility issue.
    fn tier_2_hints(&mut self, issue: &BrowserIssue) {
        match issue.support {
            SupportData::Single(detail) => {
                if let Some(partial) = detail.partial_implementation
                    && partial
                    && let Some(notes_val) = &detail.notes
                    && let NotesValue::Single(note) = notes_val
                {
                    self.hints.push(format!(
                        "[shinkore] 💡 Hint: {} is partially implemented in {}. {note}",
                        issue.feature_name, issue.browser_target
                    ));
                }

                if let Some(prefix) = &detail.prefix {
                    self.hints.push(format!("[shinkore] 💡 Hint: {} requires a vendor prefix for {}. Consider duplicating the property as {}{}", issue.feature_name, issue.browser_target, prefix, issue.feature_name))
                }

                if let Some(notes_val) = &detail.notes {
                    match notes_val {
                        NotesValue::Single(note) => {
                            self.hints.push(format!("[shinkore] 💡 Hint: Here is a note regarding the '{}' implementation in {}. {note}", issue.feature_name, issue.browser_target))
                        }
                        NotesValue::Multiple(notes) => {
                            let note = notes.join(" ");

                            self.hints.push(format!("[shinkore] 💡 Hint: Here are some notes regarding the '{}' implementation in {}. {note}", issue.feature_name, issue.browser_target))
                        }
                    }
                }

                if let Some(impl_url) = &detail.impl_url {
                    match impl_url {
                        ImplementURLValue::Single(url) => {
                            self.hints.push(format!("[shinkore] 💡 Hint: {} currently has a bug/ issue with its implementation in {}. Consider checking the tracking for this issue here: {url}",issue.feature_name,issue.browser_target))
                        }
                        ImplementURLValue::Multiple(urls) => {
                            self.hints.push(format!("[shinkore] 💡 Hint: {} currently has bugs/ issues with its implementation in {}. Consider checking the tracking for these issues at these links: {}",issue.feature_name,issue.browser_target,urls.join("\n")))  
                        }
                    }
                }

                if let Some(alt_name) = &detail.alternative_name
                    && let VersionValue::Version(version) = &detail.version_added
                {
                    self.hints.push(format!("[shinkore] 💡 Hint: {} has the alternative name '{alt_name}'. Consider using this name if you need support for {} version {version}",issue.feature_name,issue.browser_target,))
                }
            }
            SupportData::Multiple(details) => {
                for detail in details {
                    if let Some(v_removed) = &detail.version_removed
                        && let VersionValue::Version(version) = v_removed
                    {
                        self.hints.push(format!("[shinkore] 💡 Hint: {} was removed in version {version}. If you need support for {} version {version}, consider using supported alternatives.",issue.feature_name,issue.browser_target))
                    }

                    if let Some(partial) = detail.partial_implementation
                        && partial
                        && let Some(notes_val) = &detail.notes
                        && let NotesValue::Single(note) = notes_val
                    {
                        self.hints.push(format!(
                            "[shinkore] 💡 Hint: {} is partially implemented in {}. {note}",
                            issue.feature_name, issue.browser_target
                        ));
                    }

                    if let Some(prefix) = &detail.prefix {
                        self.hints.push(format!("[shinkore] 💡 Hint: {} requires a vendor prefix for {}. Consider duplicating the property as {}{}", issue.feature_name, issue.browser_target, prefix, issue.feature_name))
                    }

                    if let Some(notes_val) = &detail.notes {
                        match notes_val {
                            NotesValue::Single(note) => {
                                self.hints.push(format!("[shinkore] 💡 Hint: Here is a note regarding the '{}' implementation in {}. {note}", issue.feature_name, issue.browser_target))
                            }
                            NotesValue::Multiple(notes) => {
                                let note = notes.join(" ");

                                self.hints.push(format!("[shinkore] 💡 Hint: Here are some notes regarding the '{}' implementation in {}. {note}", issue.feature_name, issue.browser_target))
                            }
                        }
                    }

                    if let Some(impl_url) = &detail.impl_url {
                        match impl_url {
                            ImplementURLValue::Single(url) => {
                                self.hints.push(format!("[shinkore] 💡 Hint: {} currently has a bug/ issue with its implementation in {}. Consider checking the tracking for this issue here: {url}",issue.feature_name,issue.browser_target))
                            }
                            ImplementURLValue::Multiple(urls) => {
                                self.hints.push(format!("[shinkore] 💡 Hint: {} currently has bugs/ issues with its implementation in {}. Consider checking the tracking for these issues at these links: {}",issue.feature_name,issue.browser_target,urls.join("\n")))  
                            }
                        }
                    }

                    if let Some(alt_name) = &detail.alternative_name
                        && let VersionValue::Version(version) = &detail.version_added
                    {
                        self.hints.push(format!("[shinkore] 💡 Hint: {} has the alternative name '{alt_name}'. Consider using this name if you need support for {} version {version}",issue.feature_name,issue.browser_target,
                            ))
                    }
                }
            }
            _ => (),
        }
    }

    /// Logs all buffered hints to the browser console on WebAssembly targets,
    /// or to standard output on native targets.
    pub fn log_hints(&self) {
        #[cfg(target_arch = "wasm32")]
        {
            for hint in &self.hints {
                web_sys::console::log_1(&JsValue::from_str(hint));
            }
        }
        #[cfg(not(target_arch = "wasm32"))]
        {
            for hint in &self.hints {
                println!("{hint}");
            }
        }
    }

    /// Removes all currently buffered hints.
    pub fn clear_hints(&mut self) {
        self.hints.clear()
    }
}
