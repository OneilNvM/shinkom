//! This module exports all structs and enums in shinkore.
use crate::{Deserialize, Serialize};
pub use lol_html::html_content::Attribute;
use std::collections::{HashMap, HashSet};
use wincode::{SchemaRead, SchemaWrite};

use crate::schema::{
    Compat, CompatFeature, CompatGlobalAttribs, ReleaseStatement, SupportData, SupportDetails,
};

pub trait JSONStructure {}

/// HTML element information passed to an element lookup.
pub struct ElementContext<'a> {
    /// Name of the element to look up.
    pub tag_name: &'a str,
    /// Attributes parsed from the element.
    pub attributes: &'a [Attribute<'a>],
}

/// Input data for looking up an HTML or SVG element.
pub struct LookupElementsContext<'a> {
    /// Element name to find in `el_data`.
    pub tag: &'a str,
    /// Compatibility data indexed by element name.
    pub el_data: &'a HashMap<String, CompatFeature>,
}

/// Input data for looking up an element's attributes.
pub struct LookupAttribsContext<'a> {
    /// Name of the element whose attributes are being checked.
    pub tag: &'a str,
    /// Attributes and their values, indexed by attribute name.
    pub attribs: HashMap<String, String>,
    /// Compatibility data for elements and their local attributes.
    pub el_data: &'a HashMap<String, CompatFeature>,
    /// Compatibility data for global attributes.
    pub g_attrib_data: &'a HashMap<String, CompatGlobalAttribs>,
}

/// Input data for looking up CSS properties in parsed styles.
pub struct LookupCSSContext<'a> {
    /// Parsed CSS styles, indexed by property name.
    pub parsed_css_styles: HashMap<String, String>,
    /// CSS compatibility data indexed by property name.
    pub css_data: &'a HashMap<String, CompatFeature>,
}

/// Optional sets of names already processed during a multi-item lookup.
pub struct LookupCaches {
    /// Element names already considered.
    pub element_cache: Option<HashSet<String>>,
    /// Attribute names already considered.
    pub attrib_cache: Option<HashSet<String>>,
    /// Style or property names already considered.
    pub style_cache: Option<HashSet<String>>,
}

/// A resolved web feature together with the lookup kind that found it.
pub struct WebFeatureContext<'a> {
    /// Name used to identify the feature in results.
    pub name: String,
    /// Compatibility data for the feature.
    pub compat_type: CompatType<'a>,
    /// Whether the feature was found as a feature or an attribute.
    pub lookup_type: LookupType<'a>,
}

/// Browser support data required to calculate a feature's support score.
pub struct BrowserSupportContext<'a> {
    /// Name of the feature being scored.
    pub feature_name: &'a String,
    /// Compatibility record containing the feature's support information.
    pub compat: &'a Compat,
    /// Browser whose support is being scored.
    pub browser_name: &'a String,
    /// Support information for this browser and feature.
    pub support: &'a SupportData,
}

/// Browser-specific support details used when calculating a score.
pub struct SupportDetailContext<'a> {
    /// Browser whose support details are being evaluated.
    pub browser_name: &'a String,
    /// Detailed support value, such as version or implementation notes.
    pub detail: &'a SupportDetails,
}

/// Browser usage information used to weight a compatibility score.
pub struct BrowserUsageContext<'a> {
    /// Browser whose usage contributes to the score.
    pub browser_name: &'a String,
    /// Usage dataset containing the browser's version shares.
    pub usage_data: &'a BrowserUsageData,
}

/// Browser compatibility data for HTML elements and global attributes.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Default, Debug, Clone)]
pub struct HTMLData {
    /// Element compatibility records, indexed by element name.
    #[serde(rename = "elements")]
    pub el_data: HashMap<String, CompatFeature>,
    /// Global attribute compatibility records, indexed by attribute name.
    #[serde(rename = "global_attributes")]
    pub g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}

/// Browser compatibility data for SVG elements and global attributes.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Default, Debug, Clone)]
pub struct SVGData {
    /// Element compatibility records, indexed by element name.
    #[serde(rename = "elements")]
    pub el_data: HashMap<String, CompatFeature>,
    /// Global attribute compatibility records, indexed by attribute name.
    #[serde(rename = "global_attributes")]
    pub g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}

/// Browser compatibility data for CSS properties.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Default, Debug, Clone)]
pub struct CSSData {
    /// Property compatibility records, indexed by property name.
    #[serde(rename = "properties")]
    pub properties_data: HashMap<String, CompatFeature>,
}

/// Browser release information used alongside feature compatibility data.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Default, Clone, Debug)]
pub struct BrowserData {
    /// Release statements indexed first by browser, then by version.
    pub browsers: HashMap<String, HashMap<String, ReleaseStatement>>,
}

/// Browser and version usage shares used to weight compatibility scores.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Default, Clone, Debug)]
pub struct BrowserUsageData {
    /// Usage shares indexed by browser name and then by version.
    pub agents: HashMap<String, HashMap<String, f32>>,
    /// Overall market share represented by this usage dataset.
    #[serde(rename = "marketShare")]
    pub market_share: f32,
}

impl JSONStructure for HTMLData {}
impl JSONStructure for SVGData {}
impl JSONStructure for CSSData {}
impl JSONStructure for BrowserData {}
impl JSONStructure for BrowserUsageData {}

/// Browser release and usage datasets supplied to compatibility calculations.
pub struct BrowserDataContext<'a> {
    /// Browser release metadata.
    pub browser_data: &'a BrowserData,
    /// Browser version usage shares.
    pub browser_usage_data: &'a BrowserUsageData,
}

/// Aggregate compatibility score and the per-feature lookup results.
#[derive(Default, Serialize, Deserialize, Debug)]
pub struct CompatResult {
    /// Overall compatibility score as a percentage from 0 to 100.
    pub overall_score: u8,
    /// Results for the features found during the compatibility check.
    pub lookup_results: Vec<LookupResults>,
}

/// Compatibility scores and version support for a single browser.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BrowserResult {
    /// Browser name.
    pub browser_name: String,
    /// Raw and usage-weighted support scores.
    pub score: Scores,
    /// Version-level support details, when available.
    pub versions: Option<SupportData>,
}

/// Raw and usage-weighted browser support scores.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Scores {
    /// Support score before browser usage weighting, formatted as a string.
    pub raw_score: String,
    /// Support score after browser usage weighting, formatted as a string.
    pub weighted_score: String,
}

/// Compatibility scores and browser details for one looked-up feature.
#[derive(Default, Serialize, Deserialize, Clone, Debug)]
pub struct LookupResults {
    /// Feature or attribute name.
    pub name: String,
    /// MDN documentation URL, when available.
    pub mdn_url: Option<String>,
    /// Combined compatibility score, formatted as a string.
    pub compat_score: String,
    /// Browser support component of the score, formatted as a string.
    pub browser_score: String,
    /// Feature status component of the score, formatted as a string.
    pub status_score: String,
    /// Per-browser support details, when included.
    pub browsers: Option<Vec<BrowserResult>>,
}

/// Kind of source name associated with a compatibility lookup.
pub enum LookupType<'a> {
    /// The lookup was for an element or other feature.
    Feature(&'a str),
    /// The lookup was for an attribute.
    Attribute(&'a str),
}

/// Compatibility record kind attached to a resolved web feature.
pub enum CompatType<'a> {
    /// Compatibility data for an element, CSS property, or local feature.
    Feature(&'a CompatFeature),
    /// Compatibility data for a global attribute.
    GlobalAttributes(&'a CompatGlobalAttribs),
}

/// A CSS declaration represented by its property and value.
#[derive(Debug, Serialize, Deserialize)]
pub struct CSSDeclaration {
    /// CSS property name.
    pub property: String,
    /// CSS property value.
    pub value: String,
}

/// A CSS class and its declarations extracted from parsed CSS.
#[derive(Debug)]
pub struct CSSClass {
    /// Class name without its leading selector dot.
    pub name: String,
    /// Declarations associated with the class.
    pub styles: Vec<CSSDeclaration>,
}

/// An at-rule name and the condition or prelude following it.
#[derive(Debug)]
pub struct AtRule {
    /// At-rule name, such as `media` or `supports`.
    pub name: String,
    /// Condition or prelude associated with the at-rule.
    pub condition: String,
}

/// The source form of CSS styles handled by the engine.
#[derive(Debug)]
pub enum CSSType {
    /// CSS declarations written in an element's `style` attribute.
    Inline,
    /// CSS declarations inside a `<style>` element.
    StyleTag,
    /// CSS declarations associated with a class selector.
    Class,
}
