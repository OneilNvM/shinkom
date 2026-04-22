//! This module exports all structs and enums in shinkore.
pub use crate::schema::*;

#[derive(Serialize, Deserialize, Default)]
pub struct HTMLData {
    #[serde(rename = "elements")]
    pub el_data: HashMap<String, CompatElement>,
    #[serde(rename = "global_attributes")]
    pub g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}
#[derive(Serialize, Deserialize, Default)]
pub struct SVGData {
    #[serde(rename = "elements")]
    pub el_data: HashMap<String, CompatElement>,
    #[serde(rename = "global_attributes")]
    pub g_attrib_data: HashMap<String, CompatGlobalAttribs>,
}

#[derive(Serialize, Deserialize, Default, Clone)]
pub struct BrowserData {
    pub browsers: HashMap<String, HashMap<String, ReleaseStatement>>,
}

#[derive(Serialize, Deserialize, Default, Clone)]
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

#[derive(Default, Serialize, Deserialize)]
pub struct CompatResult {
    pub overall_score: u8,
    pub lookup_results: Vec<LookupResults>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BrowserResult {
    pub browser_name: String,
    pub score: Scores,
    pub versions: Option<SupportData>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Scores {
    pub raw_score: String,
    pub weighted_score: String,
}

#[derive(Default, Serialize, Deserialize, Clone)]
pub struct LookupResults {
    pub name: String,
    pub mdn_url: Option<String>,
    pub compat_score: String,
    pub browser_score: String,
    pub status_score: String,
    pub browsers: Option<Vec<BrowserResult>>,
}
