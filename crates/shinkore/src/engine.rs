//! This module contains a Rust compatible version of the compatibility engine.
//! It contains the same functionality of the [`crate::CompatEngine`] version but removes any usage of the [`wasm_bindgen`] implementations
//! and replaces [`wasm_bindgen::JsValue`] and [`wasm_bindgen::JsError`] usage with native Rust types.
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
    css::{CSSRule, ParsedCss, parse_css, parse_inline_styles, parse_stylesheet},
    errors::{CheckError, ParseStylesError, PreProcessError},
    preprocess::{format_html, pre_process_html},
};

use shinkore_types::prelude::{
    BrowserData, BrowserUsageData, CompatResult, ElementContext, HTMLData, LookupAttribsContext,
    LookupCaches, LookupElementsContext, LookupResults, SVGData,
};

macro_rules! process_css_rules {
    ($queue:expr, $classes:expr, $at_rules:expr) => {
        while !$queue.is_empty() {
            let rule = $queue.remove(0);
            match rule {
                CSSRule::QualifiedRule(s) => {
                    let mut styles = Vec::new();
                    for item in s.declarations {
                        if let CSSRule::Declaration((property, value)) = item {
                            styles.push(CSSDeclaration { property, value });
                        } else {
                            $queue.push(item);
                        }
                    }
                    $classes.push(CSSClass {
                        name: s.selector,
                        styles,
                    });
                }
                CSSRule::Media(q) => {
                    $at_rules.push(AtRule {
                        name: q.name,
                        condition: q.condition,
                    });

                    for item in q.rules {
                        if matches!(item, CSSRule::Declaration(_)) {
                            continue;
                        } else {
                            $queue.push(item);
                        }
                    }
                }
                _ => {}
            }
        }
    };
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct CSSStore {
    pub class_index: HashMap<String, Vec<CSSDeclaration>>,
    pub at_rule_index: HashMap<String, Vec<String>>,
}

#[derive(Debug, Default)]
pub struct RustEngineBuilder {
    data_dir: Option<PathBuf>,
}

impl RustEngineBuilder {
    pub fn new() -> Self {
        Self { data_dir: None }
    }

    pub fn with_data_dir(mut self, dir: PathBuf) -> Self {
        self.data_dir = Some(dir);
        self
    }

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

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct RustEngine {
    html: HTMLData,
    svg: SVGData,
    css: CSSData,
    browser_data: BrowserData,
    browser_usage_data: BrowserUsageData,
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

        // Format HTML tags onto individual lines
        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        // Only get the first line of the HTML String
        let first_line = formatted.lines().next().ok_or(CheckError::NoLines)?;

        let caches = Rc::new(RefCell::new(LookupCaches {
            element_cache: None,
            attrib_cache: None,
            style_cache: Some(HashSet::new()),
        }));

        // Use rewrite_str to find tag for compatibility check
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

        // Calculates the overall score
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
    /// See [`crate::preprocess::pre_process_html`] to learn more about how `depth_level` works.
    pub fn check_elements(&self, html: &str, depth_level: u32) -> Result<CompatResult, CheckError> {
        let results = Rc::new(RefCell::new(Vec::<LookupResults>::new()));

        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        // Pre-process HTML to return the appropriate String of elements
        let elements = pre_process_html(&formatted, depth_level);

        // Create HashSet cache to prevent repeated element/ attribute searches
        let caches = Rc::new(RefCell::new(LookupCaches {
            element_cache: Some(HashSet::new()),
            attrib_cache: Some(HashSet::new()),
            style_cache: Some(HashSet::new()),
        }));

        // Use rewrite_str to find tags for compatibility checks
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

        // Calculates the overall score
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

        // Format the HTML tags onto individual lines
        let formatted = format_html(html).map_err(<PreProcessError as Into<CheckError>>::into)?;

        // Create HashSet cache to prevent repeated element/ attribute searches
        let caches = Rc::new(RefCell::new(LookupCaches {
            element_cache: Some(HashSet::new()),
            attrib_cache: Some(HashSet::new()),
            style_cache: Some(HashSet::new()),
        }));

        // Use rewrite_str to find tags for compatibility checks
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

        // Calculates the overall score
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

    /// Perform a compatibility check for multiple elements and their attributes
    ///
    /// Returns a Vector of [`LookupResults`] when successful
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
                for style in parse_stylesheet(css_content)? {
                    properties_values.insert(style.property, style.value);
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

    pub fn add_external_css_styles(
        &mut self,
        stylesheets: Vec<String>,
    ) -> Result<(), ParseStylesError> {
        for sheet in stylesheets {
            let parsed_css = parse_css(&sheet)?;
            let mut classes: Vec<CSSClass> = Vec::new();
            let mut at_rules: Vec<AtRule> = Vec::new();

            for css in parsed_css {
                match css {
                    ParsedCss::SelectorRule(style) => {
                        let mut queue = Vec::new();

                        let mut top_level_declarations = Vec::new();
                        for rule in style.declarations {
                            if let CSSRule::Declaration((property, value)) = rule {
                                top_level_declarations.push(CSSDeclaration { property, value });
                            } else {
                                queue.push(rule);
                            }
                        }
                        classes.push(CSSClass {
                            name: style.selector,
                            styles: top_level_declarations,
                        });

                        process_css_rules!(queue, classes, at_rules);
                    }
                    ParsedCss::TopLevelAtRule(query) => {
                        let mut queue = Vec::new();
                        at_rules.push(AtRule {
                            name: query.name,
                            condition: query.condition,
                        });

                        for rule in query.rules {
                            if matches!(rule, CSSRule::Declaration(_)) {
                                continue;
                            } else {
                                queue.push(rule);
                            }
                        }

                        process_css_rules!(queue, classes, at_rules);
                    }
                }
            }

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
                        store.at_rule_index.insert(at_rule.name, vec![at_rule.condition]);
                    }
                }
            }
        }

        Ok(())
    }

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
