//! This module contains types which map the schema for the compatiblity data from the [@mdn/browser-compat-data](https://github.com/mdn/browser-compat-data) package.
//! You can find the data for the schema [here](https://github.com/mdn/browser-compat-data/blob/main/schemas/compat-data.schema.json).
use std::collections::HashMap;

use wincode::{SchemaRead, SchemaWrite};

use crate::{Deserialize, Serialize};

/// Numeric JSON value represented without losing its integer or floating-point kind.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Copy, Debug)]
pub enum CustomNumber {
    /// A non-negative integer.
    PosInt(u64),
    /// A negative integer.
    NegInt(i64),
    /// A floating-point number.
    Float(f64),
}

/// JSON value used for compatibility-data values not modeled by a more specific type.
#[derive(SchemaRead, SchemaWrite, Clone, Debug)]
pub enum CustomValue {
    /// A JSON null value.
    Null,
    /// A JSON boolean.
    Bool(bool),
    /// A JSON number.
    Number(CustomNumber),
    /// A JSON string.
    String(String),
    /// A JSON array of values.
    Array(Vec<CustomValue>),
    /// A JSON object with arbitrary keys and values.
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

/// Possible representations of a feature's support version in compatibility data.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
#[serde(untagged)]
pub enum VersionValue {
    /// The version in which support was added or removed.
    Version(String),
    /// A boolean support marker used when a specific version is not supplied.
    IsSupported(bool),
    /// An unknown or otherwise unmodeled version value from the source data.
    #[serde(rename = "null")]
    Unknown(CustomValue),
}

/// Support information for a browser, in any representation accepted by the source schema.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
#[serde(untagged)]
pub enum SupportData {
    /// Multiple support records, for example when support changed over time.
    Multiple(Vec<SupportDetails>),
    /// A single detailed support record.
    Single(Box<SupportDetails>),
    /// A simple version or boolean support value.
    Simple(VersionValue),
    /// An unmodeled support value from the source data.
    Unknown(CustomValue),
}

/// One or more implementation URLs associated with a support record.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
#[serde(untagged)]
pub enum ImplementURLValue {
    /// Multiple implementation URLs.
    Multiple(Vec<String>),
    /// A single implementation URL.
    Single(String),
}

/// One or more notes associated with a support record.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
#[serde(untagged)]
pub enum NotesValue {
    /// Multiple support notes.
    Multiple(Vec<String>),
    /// A single support note.
    Single(String),
}

/// Detailed compatibility support information for a browser.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub struct SupportDetails {
    /// Version in which support was added, or a boolean/unknown marker.
    pub version_added: VersionValue,

    /// Version in which support was removed, if applicable.
    #[serde(default)]
    pub version_removed: Option<VersionValue>,

    /// Last version with support, when support is limited to a range.
    #[serde(default)]
    pub version_last: Option<VersionValue>,

    /// Vendor prefix required to use the feature, if any.
    #[serde(default)]
    pub prefix: Option<String>,

    /// Alternate name used to expose the feature, if any.
    #[serde(default)]
    pub alternative_name: Option<String>,

    /// Runtime or configuration flags required for support.
    #[serde(default)]
    pub flags: Option<Vec<FlagStatement>>,

    /// URL or URLs describing the implementation.
    #[serde(default)]
    pub impl_url: Option<ImplementURLValue>,

    /// Whether the feature is only partially implemented.
    #[serde(default)]
    pub partial_implementation: Option<bool>,

    /// Additional notes about support.
    #[serde(default)]
    pub notes: Option<NotesValue>,
}

/// A configuration flag required to enable or exercise a feature.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub struct FlagStatement {
    /// Flag type value as represented in compatibility data.
    #[serde(rename = "type")]
    pub flag_type: bool,
    /// Name of the flag.
    pub name: String,

    /// Value to assign to the flag, when one is specified.
    #[serde(default)]
    pub value_to_set: Option<String>,
}

/// Standardization and lifecycle status for a compatibility feature.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Default, Debug, Clone)]
pub struct Status {
    /// Whether the feature is deprecated.
    pub deprecated: bool,
    /// Whether the feature is experimental.
    pub experimental: bool,
    /// Whether the feature is on a standards track.
    pub standard_track: bool,
}

/// Shared metadata and browser support records for a compatibility feature.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Debug, Clone)]
pub struct Compat {
    /// Short description of the feature, when available.
    #[serde(default)]
    pub description: Option<String>,

    /// MDN documentation URL, when available.
    #[serde(default)]
    pub mdn_url: Option<String>,

    /// Tags used to categorize the feature, when available.
    #[serde(default)]
    pub tags: Option<Vec<String>>,

    /// Path of the source compatibility-data file.
    pub source_file: String,

    /// Support information indexed by browser identifier.
    pub support: HashMap<String, SupportData>,

    /// Standardization and lifecycle status, when available.
    #[serde(default)]
    pub status: Option<Status>,
}

/// Compatibility data for an element, CSS property, or other feature and its subfeatures.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Debug, Clone)]
pub struct CompatFeature {
    /// Shared compatibility metadata stored under the source schema's `__compat` key.
    #[serde(rename = "__compat")]
    pub compat: Compat,

    /// Nested features, such as element-specific attributes, indexed by subfeature name.
    #[serde(flatten)]
    pub sub_features: HashMap<String, CompatFeature>,
}

/// Compatibility data for a global attribute.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Debug, Clone)]
pub struct CompatGlobalAttribs {
    /// Shared compatibility metadata stored under the source schema's `__compat` key.
    #[serde(rename = "__compat")]
    pub compat: Compat,
}

/// Release metadata for a browser version.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub struct ReleaseStatement {
    /// Date on which this browser version was released, if known.
    release_date: Option<String>,
    /// Notes describing the browser release, if available.
    release_notes: Option<String>,
    /// Lifecycle status of this browser version.
    status: BrowserStatus,
    /// Browser engine used by this release, if known.
    engine: Option<BrowserEngine>,
    /// Version of the browser engine used by this release, if known.
    pub engine_version: Option<String>,
}

/// Browser rendering or JavaScript engine identified in release data.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub enum BrowserEngine {
    /// Blink engine.
    Blink,
    /// EdgeHTML engine.
    EdgeHTML,
    /// Gecko engine.
    Gecko,
    /// Presto engine.
    Presto,
    /// Trident engine.
    Trident,
    /// WebKit engine.
    WebKit,
    /// V8 engine.
    V8,
}

/// Lifecycle status of a browser release.
#[derive(Serialize, Deserialize, SchemaRead, SchemaWrite, Clone, Debug)]
pub enum BrowserStatus {
    /// The browser release is no longer maintained.
    #[serde(rename = "retired")]
    Retired,
    /// The browser release is currently stable.
    #[serde(rename = "current")]
    Current,
    /// The browser release is a beta version.
    #[serde(rename = "beta")]
    Beta,
    /// The browser release is a nightly build.
    #[serde(rename = "nightly")]
    Nightly,
    /// The browser release is an Extended Support Release.
    #[serde(rename = "esr")]
    Esr,
    /// The browser release is planned but not yet available.
    #[serde(rename = "planned")]
    Planned,
}

/// Browser support information supplied to hint generation.
pub struct BrowserIssue<'a> {
    /// Name of the feature being evaluated.
    pub feature_name: String,
    /// Browser identifier targeted by the support check.
    pub browser_target: String,
    /// Shared compatibility metadata for the feature.
    pub compat: &'a Compat,
    /// Support data for the target browser.
    pub support: &'a SupportData,
}

/// Feature status information supplied to hint generation.
pub struct StatusIssue<'a> {
    /// Name of the feature being evaluated.
    pub feature_name: String,
    /// Standardization and lifecycle status for the feature.
    pub status: &'a Status,
}
