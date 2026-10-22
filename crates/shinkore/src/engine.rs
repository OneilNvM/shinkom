//! The core engine for compatibility analysis and data processing.
use std::{
    cell::RefCell,
    collections::{HashMap, HashSet},
    error::Error,
    num::ParseFloatError,
    path::{Path, PathBuf},
    rc::Rc,
    sync::OnceLock,
};

use lol_html::{RewriteStrSettings, element, rewrite_str, text};
use serde::{Deserialize, Serialize};
use shinkore_types::prelude::{
    AtRule, BrowserDataContext, CSSClass, CSSData, CSSDeclaration, CSSType, JSONStructure,
    LookupCSSContext, WebFeatureContext,
};
use wincode::{SchemaRead, config::DefaultConfig};

use crate::{
    compat::{
        calculate::calculate_compat_score,
        lookup::{
            lookup_attribs, lookup_css, lookup_element, multi_lookup_attribs, multi_lookup_element,
        },
    },
    constants::{IGNORE_TAGS, SKIP_TAGS},
    css::{CSSRule, ParsedCss, parse_css, parse_inline_styles},
    errors::{CheckError, ParseStylesError, PreProcessError},
    extract_css_rules, flatten_css,
    preprocess::{format_html, pre_process_html},
};

use shinkore_types::prelude::{
    BrowserData, BrowserUsageData, CompatResult, ElementContext, HTMLData, LookupAttribsContext,
    LookupCaches, LookupElementsContext, LookupResults, SVGData,
};

/// Stores indices that map classes to their declarations and at-rules to their conditions.
#[derive(Serialize, Deserialize, Default, Debug)]
pub struct CSSStore {
    pub class_index: HashMap<String, Vec<CSSDeclaration>>,
    pub at_rule_index: HashMap<String, Vec<String>>,
}

/// Configures and builds a [`RustEngine`] using compatibility data from `.bin` files.
///
/// By default, the builder reads the data files from `./shinkore-data`, relative
/// to the process's current working directory. Use [`with_data_dir`](Self::with_data_dir)
/// to select another directory. The directory must contain the expected Shinkore
/// binary data files, such as those produced by `sk-convert`.
#[derive(Debug, Default)]
pub struct RustEngineBuilder {
    data_dir: Option<PathBuf>,
}

impl RustEngineBuilder {
    /// Creates a builder that reads data from `./shinkore-data`.
    pub fn new() -> Self {
        Self { data_dir: None }
    }

    /// Sets the directory containing the engine's binary compatibility data.
    ///
    /// The path is used as provided; relative paths are resolved from the
    /// process's current working directory.
    pub fn with_data_dir(mut self, dir: PathBuf) -> Self {
        self.data_dir = Some(dir);
        self
    }

    /// Reads and deserializes the compatibility data, then creates the engine.
    ///
    /// ## Errors
    /// File read errors are returned. If a file's contents cannot be
    /// deserialized, that dataset is omitted from the engine.
    pub fn build(self) -> Result<RustEngine, Box<dyn Error>> {
        let base_path = self
            .data_dir
            .unwrap_or_else(|| PathBuf::from("./shinkore-data"));

        fn read_bin(base_path: &Path, filename: &str) -> Result<Vec<u8>, Box<dyn Error>> {
            let path = base_path.join(filename);
            let bytes = std::fs::read(path)?;

            Ok(bytes)
        }

        fn deserialize_bytes<'de, T>(bytes: &'de [u8]) -> Result<T, Box<dyn Error>>
        where
            T: JSONStructure + SchemaRead<'de, DefaultConfig, Dst = T>,
        {
            Ok(wincode::deserialize::<T>(bytes)?)
        }

        let html_data: Option<HTMLData> =
            deserialize_bytes(&read_bin(&base_path, "html-compat-data.bin")?).ok();
        let svg_data: Option<SVGData> =
            deserialize_bytes(&read_bin(&base_path, "svg-compat-data.bin")?).ok();
        let css_data: Option<CSSData> =
            deserialize_bytes(&read_bin(&base_path, "css-compat-data.bin")?).ok();
        let browser_data: Option<BrowserData> =
            deserialize_bytes(&read_bin(&base_path, "browser-data.bin")?).ok();
        let usage_data: Option<BrowserUsageData> =
            deserialize_bytes(&read_bin(&base_path, "browser-usage-data.bin")?).ok();

        Ok(RustEngine::new(
            html_data,
            svg_data,
            css_data,
            browser_data,
            usage_data,
        ))
    }
}


/// An engine for checking HTML and CSS against browser compatibility data.
///
/// The engine stores HTML, SVG, CSS, browser-support, and browser-usage
/// datasets. Use [`from_compiled_data`](Self::from_compiled_data) to load the
/// data bundled with the crate, [`RustEngineBuilder`] to load binary data from
/// a directory, or [`new`](Self::new) to supply datasets directly. Missing
/// datasets passed to `new` are replaced with their default empty values.
///
/// # Examples
///
/// ```no_run
/// use shinkore::engine::RustEngine;
/// 
/// # fn main() -> Result<(), Box<dyn std::error::Error>> {
/// let engine = RustEngine::from_compiled_data()?;
/// 
/// let result = engine.check_element("<div></div>")?;
/// # Ok(())
/// # }

/// ```
#[derive(Serialize, Deserialize, Default, Debug)]
pub struct RustEngine {
    html: HTMLData,
    svg: SVGData,
    css: CSSData,
    browser_data: BrowserData,
    browser_usage_data: BrowserUsageData,
    /// Indices of CSS classes and at-rules used during compatibility checks.
    pub css_store: Option<CSSStore>,
}

type CompiledData = OnceLock<(
    Option<HTMLData>,
    Option<SVGData>,
    Option<CSSData>,
    Option<BrowserData>,
    Option<BrowserUsageData>,
)>;

static COMPILED_DATA: CompiledData = OnceLock::new();

impl RustEngine {
    /// Creates the engine with the supplied data.
    pub fn new(
        bcd_html_data: Option<HTMLData>,
        bcd_svg_data: Option<SVGData>,
        bcd_css_data: Option<CSSData>,
        bcd_browser_data: Option<BrowserData>,
        ciu_usage_data: Option<BrowserUsageData>,
    ) -> Self {
        RustEngine {
            html: bcd_html_data.unwrap_or_default(),
            svg: bcd_svg_data.unwrap_or_default(),
            css: bcd_css_data.unwrap_or_default(),
            browser_data: bcd_browser_data.unwrap_or_default(),
            browser_usage_data: ciu_usage_data.unwrap_or_default(),
            css_store: Some(CSSStore::default()),
        }
    }

    /// Builds the engine with the data compiled with the crate.
    pub fn from_compiled_data() -> Result<Self, Box<dyn Error>> {
        let (html, svg, css, browser_data, usage_data) = COMPILED_DATA.get_or_init(|| {
            let bcd_html_data: Option<HTMLData> =
                wincode::deserialize(include_bytes!("../gen/html-compat-data.bin")).ok();
            let bcd_svg_data: Option<SVGData> =
                wincode::deserialize(include_bytes!("../gen/svg-compat-data.bin")).ok();
            let bcd_css_data: Option<CSSData> =
                wincode::deserialize(include_bytes!("../gen/css-compat-data.bin")).ok();
            let browser_data: Option<BrowserData> =
                wincode::deserialize(include_bytes!("../gen/browser-data.bin")).ok();
            let usage_data: Option<BrowserUsageData> =
                wincode::deserialize(include_bytes!("../gen/browser-usage-data.bin")).ok();

            (
                bcd_html_data,
                bcd_svg_data,
                bcd_css_data,
                browser_data,
                usage_data,
            )
        });

        Ok(Self::new(
            html.clone(),
            svg.clone(),
            css.clone(),
            browser_data.clone(),
            usage_data.clone(),
        ))
    }

    /// Used for checking the compatibility of a single element and its attributes.
    pub fn check_element(&self, html: &str) -> Result<CompatResult, CheckError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        let first_line = formatted.lines().next().ok_or(CheckError::NoLines)?;

        let caches = Rc::new(RefCell::new(LookupCaches {
            element_cache: None,
            attrib_cache: None,
            style_cache: Some(HashSet::new()),
        }));

        let rewrite = rewrite_str(
            first_line,
            RewriteStrSettings::new()
                .append_element_content_handler(element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.compat_check(ctx, caches.clone());

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                }))
                .append_element_content_handler(text!("style", |el| {
                    let style_content = el.as_str();

                    let compat_results = self.css_compat_check(
                        style_content,
                        CSSType::StyleTag,
                        caches
                            .borrow_mut()
                            .style_cache
                            .as_mut()
                            .unwrap_or(&mut HashSet::new()),
                    );

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                })),
        );

        if let Err(e) = rewrite {
            return Err(e.into());
        }

        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(<ParseFloatError as Into<CheckError>>::into)?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        Ok(compat_result)
    }

    /// Used for checking the compatibility of multiple elements and their attributes
    ///
    /// `depth_level` is used to control how far down in a nested HTML structure to go before
    /// returning element tags.
    ///
    /// See [`pre_process_html`] to learn more about how `depth_level` works.
    pub fn check_elements(&self, html: &str, depth_level: u32) -> Result<CompatResult, CheckError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        let elements = pre_process_html(&formatted, depth_level);

        let caches = Rc::new(RefCell::new(LookupCaches {
            element_cache: Some(HashSet::new()),
            attrib_cache: Some(HashSet::new()),
            style_cache: Some(HashSet::new()),
        }));

        let rewrite = rewrite_str(
            &elements,
            RewriteStrSettings::new()
                .append_element_content_handler(element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.multi_compat_check(ctx, caches.clone());

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                }))
                .append_element_content_handler(text!("style", |el| {
                    let style_content = el.as_str();

                    let compat_results = self.css_compat_check(
                        style_content,
                        CSSType::StyleTag,
                        caches
                            .borrow_mut()
                            .style_cache
                            .as_mut()
                            .unwrap_or(&mut HashSet::new()),
                    );

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                })),
        );

        if let Err(e) = rewrite {
            return Err(e.into());
        }

        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(<ParseFloatError as Into<CheckError>>::into)?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        Ok(compat_result)
    }

    /// Used for performing a full page compatibility check.
    pub fn full_inspect(&self, html: &str) -> Result<CompatResult, CheckError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        let caches = Rc::new(RefCell::new(LookupCaches {
            element_cache: Some(HashSet::new()),
            attrib_cache: Some(HashSet::new()),
            style_cache: Some(HashSet::new()),
        }));

        let rewrite = rewrite_str(
            &formatted,
            RewriteStrSettings::new()
                .append_element_content_handler(element!("*", |el| {
                    let tag_name = el.tag_name();
                    let attributes = el.attributes();

                    let ctx = ElementContext {
                        tag_name: &tag_name,
                        attributes,
                    };

                    let compat_results = self.multi_compat_check(ctx, caches.clone());

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(e.into()),
                    }

                    Ok(())
                }))
                .append_element_content_handler(text!("style", |el| {
                    let style_content = el.as_str();

                    let compat_results = self.css_compat_check(
                        style_content,
                        CSSType::StyleTag,
                        caches
                            .borrow_mut()
                            .style_cache
                            .as_mut()
                            .unwrap_or(&mut HashSet::new()),
                    );

                    match compat_results {
                        Ok(res) => results.borrow_mut().extend(res),
                        Err(e) => return Err(format!("{e:?}").into()),
                    }

                    Ok(())
                })),
        );

        if let Err(e) = rewrite {
            return Err(e.into());
        }

        let mut final_score: f32 = 0.0;
        for res in &*results.borrow() {
            final_score += res
                .compat_score
                .parse::<f32>()
                .map_err(<ParseFloatError as Into<CheckError>>::into)?;
        }

        let compat_result = CompatResult {
            overall_score: (final_score / results.borrow().len() as f32) as u8,
            lookup_results: results.borrow().to_vec(),
        };

        Ok(compat_result)
    }

    /// Perform a compatibility check for a single element and its attributes.
    ///
    /// Returns a Vector of [`LookupResults`] when successful.
    ///
    /// ## Errors
    /// A [`CheckError`] is returned if there are any errors in lookups.
    fn compat_check(
        &self,
        ctx: ElementContext,
        caches: Rc<RefCell<LookupCaches>>,
    ) -> Result<Vec<LookupResults>, CheckError> {
        let mut overall_results: Vec<LookupResults> = vec![];
        let mut features: Vec<WebFeatureContext> = vec![];
        let mut attribs: HashMap<String, String> = HashMap::new();

        for attribute in ctx.attributes {
            attribs.insert(attribute.name_preserve_case(), attribute.value());
        }

        if let Some(inline_styles) = attribs.get("style") {
            overall_results.extend(
                self.css_compat_check(
                    inline_styles,
                    CSSType::Inline,
                    caches
                        .borrow_mut()
                        .style_cache
                        .as_mut()
                        .unwrap_or(&mut HashSet::new()),
                )?,
            );
        }

        if let Some(class_value) = attribs.get("class") {
            overall_results.extend(
                self.css_compat_check(
                    class_value,
                    CSSType::Class,
                    caches
                        .borrow_mut()
                        .style_cache
                        .as_mut()
                        .unwrap_or(&mut HashSet::new()),
                )?,
            )
        }

        // If the element is an SVG element, opt for an SVG data lookup
        if self.svg.el_data.contains_key(ctx.tag_name) && !IGNORE_TAGS.contains(&ctx.tag_name) {
            let lookup_attribs_ctx = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.svg.el_data,
                g_attrib_data: &self.svg.g_attrib_data,
            };

            if let Some(feat) = lookup_element(LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.svg.el_data,
            }) {
                features.push(feat);
            }
            if let Some(feats) = lookup_attribs(&lookup_attribs_ctx) {
                features.extend(feats);
            }

            for feat in features {
                calculate_compat_score(
                    feat,
                    &mut overall_results,
                    &BrowserDataContext {
                        browser_data: &self.browser_data,
                        browser_usage_data: &self.browser_usage_data,
                    },
                )?;
            }
        } else {
            let lookup_attribs_ctx = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.html.el_data,
                g_attrib_data: &self.html.g_attrib_data,
            };

            if let Some(feat) = lookup_element(LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.html.el_data,
            }) {
                features.push(feat);
            }
            if let Some(feats) = lookup_attribs(&lookup_attribs_ctx) {
                features.extend(feats);
            }

            for feat in features {
                calculate_compat_score(
                    feat,
                    &mut overall_results,
                    &BrowserDataContext {
                        browser_data: &self.browser_data,
                        browser_usage_data: &self.browser_usage_data,
                    },
                )?;
            }
        }

        Ok(overall_results)
    }

    /// Perform a compatibility check for multiple elements and their attributes.
    ///
    /// Returns a Vector of [`LookupResults`] when successful.
    ///
    /// ## Errors
    /// A [`CheckError`] is returned if there are any errors in lookups.
    fn multi_compat_check(
        &self,
        ctx: ElementContext,
        caches: Rc<RefCell<LookupCaches>>,
    ) -> Result<Vec<LookupResults>, CheckError> {
        let mut overall_results: Vec<LookupResults> = vec![];
        let mut features: Vec<WebFeatureContext> = vec![];
        let mut attribs: HashMap<String, String> = HashMap::new();

        for attribute in ctx.attributes {
            attribs.insert(attribute.name_preserve_case(), attribute.value());
        }

        if let Some(inline_styles) = attribs.get("style") {
            overall_results.extend(
                self.css_compat_check(
                    inline_styles,
                    CSSType::Inline,
                    caches
                        .borrow_mut()
                        .style_cache
                        .as_mut()
                        .unwrap_or(&mut HashSet::new()),
                )?,
            );
        }

        if let Some(class_value) = attribs.get("class") {
            overall_results.extend(
                self.css_compat_check(
                    class_value,
                    CSSType::Class,
                    caches
                        .borrow_mut()
                        .style_cache
                        .as_mut()
                        .unwrap_or(&mut HashSet::new()),
                )?,
            )
        }

        // If the element is an SVG element, opt for an SVG data lookup
        if self.svg.el_data.contains_key(ctx.tag_name) && !SKIP_TAGS.contains(&ctx.tag_name) {
            let lookup_els_context = LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.svg.el_data,
            };
            let lookup_attribs_context = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.svg.el_data,
                g_attrib_data: &self.svg.g_attrib_data,
            };

            if let Some(feat) = multi_lookup_element(
                &lookup_els_context,
                caches
                    .borrow_mut()
                    .element_cache
                    .as_mut()
                    .unwrap_or(&mut HashSet::new()),
            ) {
                features.push(feat)
            }

            if let Some(feats) = multi_lookup_attribs(
                &lookup_attribs_context,
                caches
                    .borrow_mut()
                    .attrib_cache
                    .as_mut()
                    .unwrap_or(&mut HashSet::new()),
            ) {
                features.extend(feats);
            }

            for feat in features {
                calculate_compat_score(
                    feat,
                    &mut overall_results,
                    &BrowserDataContext {
                        browser_data: &self.browser_data,
                        browser_usage_data: &self.browser_usage_data,
                    },
                )?;
            }
        } else {
            let lookup_els_context = LookupElementsContext {
                tag: ctx.tag_name,
                el_data: &self.html.el_data,
            };
            let lookup_attribs_context = LookupAttribsContext {
                tag: ctx.tag_name,
                attribs,
                el_data: &self.html.el_data,
                g_attrib_data: &self.html.g_attrib_data,
            };

            if let Some(feat) = multi_lookup_element(
                &lookup_els_context,
                caches
                    .borrow_mut()
                    .element_cache
                    .as_mut()
                    .unwrap_or(&mut HashSet::new()),
            ) {
                features.push(feat)
            }

            if let Some(feats) = multi_lookup_attribs(
                &lookup_attribs_context,
                caches
                    .borrow_mut()
                    .attrib_cache
                    .as_mut()
                    .unwrap_or(&mut HashSet::new()),
            ) {
                features.extend(feats);
            }

            for feat in features {
                calculate_compat_score(
                    feat,
                    &mut overall_results,
                    &BrowserDataContext {
                        browser_data: &self.browser_data,
                        browser_usage_data: &self.browser_usage_data,
                    },
                )?;
            }
        }

        Ok(overall_results)
    }

    /// Perform a compatibility check for CSS styles.
    ///
    /// Returns a Vector of [`LookupResults`] when successful.
    ///
    /// ## Errors
    /// A [`CheckError`] is returned if there are any errors in lookups.
    fn css_compat_check(
        &self,
        css_content: &str,
        css_type: CSSType,
        style_cache: &mut HashSet<String>,
    ) -> Result<Vec<LookupResults>, CheckError> {
        let mut overall_results = Vec::new();
        let mut features: Vec<WebFeatureContext> = Vec::new();
        let mut properties_values = HashMap::new();

        match css_type {
            CSSType::Inline => {
                for style in parse_inline_styles(css_content)? {
                    properties_values.insert(style.property, style.value);
                }
            }
            CSSType::StyleTag => {
                let parsed_css = parse_css(css_content)?;
                let mut classes = Vec::new();

                extract_css_rules!(parsed_css, classes);

                for class in classes {
                    for style in class.styles {
                        properties_values.insert(style.property, style.value);
                    }
                }
            }
            CSSType::Class => {
                let class_names = css_content.split_whitespace();
                if let Some(ref store) = self.css_store {
                    for name in class_names {
                        if store.class_index.contains_key(name)
                            && let Some(rules) = store.class_index.get(name)
                        {
                            for declaration in rules {
                                properties_values.insert(
                                    declaration.property.clone(),
                                    declaration.value.clone(),
                                );
                            }
                        }
                    }
                }
            }
        }

        let ctx = LookupCSSContext {
            parsed_css_styles: properties_values,
            css_data: &self.css.properties_data,
        };

        if let Some(feats) = lookup_css(&ctx, style_cache) {
            features.extend(feats);
        }

        for feat in features {
            calculate_compat_score(
                feat,
                &mut overall_results,
                &BrowserDataContext {
                    browser_data: &self.browser_data,
                    browser_usage_data: &self.browser_usage_data,
                },
            )?;
        }

        Ok(overall_results)
    }

    /// Adds classes and at-rules to the engine from stylesheets by mapping them to their declarations.
    /// 
    /// Used for performing compatibility checks on the declarations of a class when the `class` attribute
    /// is retrieved during an element check.
    pub fn add_external_css_styles(
        &mut self,
        stylesheets: Vec<String>,
    ) -> Result<(), ParseStylesError> {
        for sheet in stylesheets {
            let parsed_css = parse_css(&sheet)?;
            let mut classes: Vec<CSSClass> = Vec::new();
            let mut at_rules: Vec<AtRule> = Vec::new();

            extract_css_rules!(parsed_css, classes, at_rules);

            if let Some(ref mut store) = self.css_store
                && !classes.is_empty()
            {
                for class in classes {
                    store.class_index.entry(class.name).or_insert(class.styles);
                }
            }
            if let Some(ref mut store) = self.css_store
                && !at_rules.is_empty()
            {
                for at_rule in at_rules {
                    if let Some(v) = store.at_rule_index.get_mut(&at_rule.name) {
                        v.push(at_rule.condition);
                    } else {
                        store
                            .at_rule_index
                            .insert(at_rule.name, vec![at_rule.condition]);
                    }
                }
            }
        }

        Ok(())
    }

    /// Logs the indices for the classes and at-rules stored in the engine.
    pub fn log_css_indices(&self) {
        #[cfg(target_arch = "wasm32")]
        {
            use wasm_bindgen::UnwrapThrowExt;
            if let Some(ref store) = self.css_store {
                let class_indices = serde_wasm_bindgen::to_value(&store.class_index).unwrap_throw();
                let at_rule_indices =
                    serde_wasm_bindgen::to_value(&store.at_rule_index).unwrap_throw();
                web_sys::console::log_1(&class_indices);
                web_sys::console::log_1(&at_rule_indices);
            }
        }
        #[cfg(not(target_arch = "wasm32"))]
        {
            if let Some(ref store) = self.css_store {
                println!("Class indices: {:#?}", store.class_index);
                println!("At rule indices: {:#?}", store.at_rule_index);
            }
        }
    }
}
