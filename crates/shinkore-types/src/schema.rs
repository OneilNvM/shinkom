//! This module contains types which map the schema for the compatiblity data from the [@mdn/browser-compat-data](https://github.com/mdn/browser-compat-data) package.
//! You can find the data for the schema [here](https://github.com/mdn/browser-compat-data/blob/main/schemas/compat-data.schema.json).
use std::collections::HashMap;

use wincode::{SchemaRead, SchemaWrite};

use crate::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Copy, Debug)]
pub enum CustomNumber {
    PosInt(u64),
    NegInt(i64),
    Float(f64),
}

#[derive(SchemaRead, SchemaWrite, Clone, Debug)]
pub enum CustomValue {
    Null,
    Bool(bool),
    Number(CustomNumber),
    String(String),
    Array(Vec<CustomValue>),
    Object(HashMap<String, CustomValue>),
}

impl<'de> Deserialize<'de> for CustomValue {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let raw = serde_json::Value::deserialize(deserializer)?;
        Ok(CustomValue::from(raw))
    }
}

impl Serialize for CustomValue {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let raw = serde_json::Value::from(self.clone());
        raw.serialize(serializer)
    }
}

impl From<serde_json::Value> for CustomValue {
    fn from(value: serde_json::Value) -> Self {
        match value {
            serde_json::Value::Null => CustomValue::Null,
            serde_json::Value::Bool(b) => CustomValue::Bool(b),
            serde_json::Value::String(s) => CustomValue::String(s),
            serde_json::Value::Number(n) => {
                if let Some(u) = n.as_u64() {
                    CustomValue::Number(CustomNumber::PosInt(u))
                } else if let Some(i) = n.as_i64() {
                    CustomValue::Number(CustomNumber::NegInt(i))
                } else {
                    CustomValue::Number(CustomNumber::Float(n.as_f64().unwrap_or(0.0)))
                }
            }
            serde_json::Value::Array(v) => {
                CustomValue::Array(v.into_iter().map(CustomValue::from).collect())
            }
            serde_json::Value::Object(o) => CustomValue::Object(
                o.into_iter()
                    .map(|(k, v)| (k, CustomValue::from(v)))
                    .collect(),
            ),
        }
    }
}

impl From<CustomValue> for serde_json::Value {
    fn from(value: CustomValue) -> Self {
        match value {
            CustomValue::Null => serde_json::Value::Null,
            CustomValue::Bool(b) => serde_json::Value::Bool(b),
            CustomValue::String(s) => serde_json::Value::String(s),
            CustomValue::Number(CustomNumber::PosInt(p)) => serde_json::Value::from(p),
            CustomValue::Number(CustomNumber::NegInt(n)) => serde_json::Value::from(n),
            CustomValue::Number(CustomNumber::Float(f)) => serde_json::Value::from(f),
            CustomValue::Array(v) => {
                serde_json::Value::Array(v.into_iter().map(serde_json::Value::from).collect())
            }
            CustomValue::Object(o) => serde_json::Value::Object(
                o.into_iter()
                    .map(|(k, v)| (k, serde_json::Value::from(v)))
                    .collect(),
            ),
        }
    }
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
#[serde(untagged)]
pub enum VersionValue {
    Version(String),
    IsSupported(bool),
    #[serde(rename = "null")]
    Unknown(CustomValue),
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
#[serde(untagged)]
pub enum SupportData {
    Multiple(Vec<SupportDetails>),
    Single(Box<SupportDetails>),
    Simple(VersionValue),
    Unknown(CustomValue),
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
#[serde(untagged)]
pub enum ImplementURLValue {
    Multiple(Vec<String>),
    Single(String),
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
#[serde(untagged)]
pub enum NotesValue {
    Multiple(Vec<String>),
    Single(String),
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
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
    pub partial_implementation: Option<bool>,

    #[serde(default)]
    pub notes: Option<NotesValue>,
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub struct FlagStatement {
    #[serde(rename = "type")]
    pub flag_type: bool,
    pub name: String,

    #[serde(default)]
    pub value_to_set: Option<String>,
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Default, Debug, Clone)]
pub struct Status {
    pub deprecated: bool,
    pub experimental: bool,
    pub standard_track: bool,
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Debug, Clone)]
pub struct Compat {
    #[serde(default)]
    pub description: Option<String>,

    #[serde(default)]
    pub mdn_url: Option<String>,

    #[serde(default)]
    pub tags: Option<Vec<String>>,

    pub source_file: String,

    pub support: HashMap<String, SupportData>,

    #[serde(default)]
    pub status: Option<Status>,
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Debug, Clone)]
pub struct CompatFeature {
    #[serde(rename = "__compat")]
    pub compat: Compat,

    #[serde(flatten)]
    pub sub_features: HashMap<String, CompatFeature>,
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Debug, Clone)]
pub struct CompatGlobalAttribs {
    #[serde(rename = "__compat")]
    pub compat: Compat,
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub struct ReleaseStatement {
    release_date: Option<String>,
    release_notes: Option<String>,
    status: BrowserStatus,
    engine: Option<BrowserEngine>,
    pub engine_version: Option<String>,
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub enum BrowserEngine {
    Blink,
    EdgeHTML,
    Gecko,
    Presto,
    Trident,
    WebKit,
    V8,
}

#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub enum BrowserStatus {
    #[serde(rename = "retired")]
    Retired,
    #[serde(rename = "current")]
    Current,
    #[serde(rename = "beta")]
    Beta,
    #[serde(rename = "nightly")]
    Nightly,
    #[serde(rename = "esr")]
    Esr,
    #[serde(rename = "planned")]
    Planned,
}

pub struct BrowserIssue<'a> {
    pub feature_name: String,
    pub browser_target: String,
    pub compat: &'a Compat,
    pub support: &'a SupportData,
}

pub struct StatusIssue<'a> {
    pub feature_name: String,
    pub status: &'a Status,
}
