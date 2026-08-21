//! This module exports all structs and enums in shinkore.
use std::collections::{HashMap, HashSet};

use crate::{Deserialize, Serialize};
pub use lol_html::html_content::Attribute;

use crate::schema::{
    Compat, CompatFeature, CompatGlobalAttribs, ReleaseStatement, SupportData, SupportDetails,
};

pub struct ElementContext<'a> {
    pub tag_name: &'a str,
    pub attributes: &'a [Attribute<'a>],
}

pub struct LookupElementsContext<'a> {
    pub tag: &'a str,
    pub el_data: &'a HashMap<String, CompatFeature>,
}

pub struct LookupAttribsContext<'a> {
    pub tag: &'a str,
    pub attribs: HashMap<String, String>,
    pub el_data: &'a HashMap<String, CompatFeature>,
    pub g_attrib_data: &'a HashMap<String, CompatGlobalAttribs>,
}

pub struct LookupCaches {
    pub element_cache: HashSet<String>,
    pub attrib_cache: HashSet<String>,
}

pub struct WebFeatureContext<'a> {
    pub name: String,
    pub compat_type: CompatType<'a>,
    pub lookup_type: LookupType<'a>,
}

pub struct BrowserSupportContext<'a> {
    pub feature_name: &'a String,
    pub compat: &'a Compat,
    pub browser_name: &'a String,
    pub support: &'a SupportData,
}

pub struct SupportDetailContext<'a> {
    pub browser_name: &'a String,
    pub detail: &'a SupportDetails,
}

pub struct BrowserUsageContext<'a> {
    pub browser_name: &'a String,
    pub usage_data: &'a BrowserUsageData,
}

#[derive(Deserialize)]
pub struct CompatDataPayload {
    pub html: HTMLData,
    pub svg: SVGData,
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct HTMLData {
    #[serde(rename = "elements")]
    pub el_data: HashMap<String, CompatFeature>,
    #[serde(rename = "global_attributes")]
    pub g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct SVGData {
    #[serde(rename = "elements")]
    pub el_data: HashMap<String, CompatFeature>,
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

pub struct BrowserDataContext<'a> {
    pub browser_data: &'a BrowserData,
    pub browser_usage_data: &'a BrowserUsageData
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

pub enum LookupType<'a> {
    Feature(&'a str),
    Attribute(&'a str),
}

pub enum CompatType<'a> {
    Feature(&'a CompatFeature),
    GlobalAttributes(&'a CompatGlobalAttribs),
}
