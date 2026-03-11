//! This module contains types which map the schema for the compatiblity data from the [@mdn/browser-compat-data](https://github.com/mdn/browser-compat-data) package.
//! You can find the data for the schema at this link: https://github.com/mdn/browser-compat-data/blob/main/schemas/compat-data.schema.json

pub use std::collections::HashMap;

pub use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum VersionValue {
    Version(String),
    IsSupported(bool),
    #[serde(rename = "null")]
    Unknown(serde_json::Value),
}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum SupportData {
    Multiple(Vec<SupportDetails>),
    Single(SupportDetails),
    Simple(VersionValue),
    Unknown(serde_json::Value),
}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum ImplementURLValue {
    Multiple(Vec<String>),
    Single(String),
}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
pub enum NotesValue {
    Multiple(Vec<String>),
    Single(String),
}

#[derive(Serialize, Deserialize)]
pub struct SupportDetails {
    pub version_added: VersionValue,

    #[serde(default)]
    pub version_removed: Option<VersionValue>,

    #[serde(default)]
    pub version_last: Option<VersionValue>,

    #[serde(default)]
    pub prefix: Option<String>,

    #[serde(default)]
    pub alternative_name: Option<String>,

    #[serde(default)]
    pub flags: Option<Vec<FlagStatement>>,

    #[serde(default)]
    pub impl_url: Option<ImplementURLValue>,

    #[serde(default)]
    pub partial_implementation: Option<VersionValue>,

    #[serde(default)]
    pub notes: Option<NotesValue>,
}

#[derive(Serialize, Deserialize)]
pub struct FlagStatement {
    #[serde(rename = "type")]
    pub flag_type: bool,
    pub name: String,

    #[serde(default)]
    pub value_to_set: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Status {
    pub deprecated: bool,
    pub experimental: bool,
    pub standard_track: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Compat {
    #[serde(default)]
    pub description: Option<String>,

    #[serde(default)]
    pub mdn_url: Option<String>,

    #[serde(default)]
    pub tags: Option<Vec<String>>,

    #[serde(default)]
    pub source_file: Option<String>,

    pub support: HashMap<String, SupportData>,

    #[serde(default)]
    pub status: Option<Status>,
}

#[derive(Serialize, Deserialize)]
pub struct CompatElement {
    #[serde(rename = "__compat")]
    pub compat: Compat,

    #[serde(flatten)]
    pub sub_features: HashMap<String, CompatElement>,
}

#[derive(Serialize, Deserialize)]
pub struct CompatGlobalAttribs {
    #[serde(rename = "__compat")]
    pub compat: Compat,
}
