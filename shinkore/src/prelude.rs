//! This module exports all structs and enums in shinkore.
use std::collections::HashSet;

use lol_html::html_content::Attribute;

pub use crate::schema::*;

pub struct ElementContext<'a> {
    pub tag_name: &'a str,
    pub attributes: &'a [Attribute<'a>],
    pub html_data: &'a HTMLData,
    pub svg_data: &'a SVGData,
}

pub struct LookupElementsContext<'a> {
    pub tag: &'a str,
    pub el_data: &'a HashMap<String, CompatElement>,
}

pub struct LookupAttribsContext<'a> {
    pub tag: &'a str,
    pub attribs: HashMap<String, String>,
    pub el_data: &'a HashMap<String, CompatElement>,
    pub g_attrib_data: &'a HashMap<String, CompatGlobalAttribs>,
}

pub struct LookupCaches {
    pub element_cache: HashSet<String>,
    pub attrib_cache: HashSet<String>,
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct HTMLData {
    #[serde(rename = "elements")]
    pub el_data: HashMap<String, CompatElement>,
    #[serde(rename = "global_attributes")]
    pub g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}
#[derive(Serialize, Deserialize, Default, Debug)]
pub struct SVGData {
    #[serde(rename = "elements")]
    pub el_data: HashMap<String, CompatElement>,
    #[serde(rename = "global_attributes")]
    pub g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}

#[derive(Serialize, Deserialize, Default, Clone, Debug)]
pub struct BrowserData {
    pub browsers: HashMap<String, HashMap<String, ReleaseStatement>>,
}

#[derive(Serialize, Deserialize, Default, Clone, Debug)]
pub struct BrowserUsageData {
    pub agents: HashMap<String, HashMap<String, f32>>,
    #[serde(rename = "marketShare")]
    pub market_share: f32,
}

#[derive(Serialize, Deserialize)]
pub enum BrowserDataParamType {
    BrowserData(BrowserData),
    UsageData(BrowserUsageData),
}

#[derive(Default, Serialize, Deserialize, Debug)]
pub struct CompatResult {
    pub overall_score: u8,
    pub lookup_results: Vec<LookupResults>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BrowserResult {
    pub browser_name: String,
    pub score: Scores,
    pub versions: Option<SupportData>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Scores {
    pub raw_score: String,
    pub weighted_score: String,
}

#[derive(Default, Serialize, Deserialize, Clone, Debug)]
pub struct LookupResults {
    pub name: String,
    pub mdn_url: Option<String>,
    pub compat_score: String,
    pub browser_score: String,
    pub status_score: String,
    pub browsers: Option<Vec<BrowserResult>>,
}
