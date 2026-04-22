//! Contains modules related to the main compatibility data analysis and scoring calculations.
//!
//! [`check`] contains functions for performing compatibility checks on single or multiple HTML elements.
//!
//! [`lookup`] contains functions performing lookup logic for compatibility data related to the elements or attributes.
//!
//! [`calculate`] contains functions performing the scoring logic and calculating the compatibility score for a web feature
//! across multiple browsers.

use crate::schema::{CompatElement, CompatGlobalAttribs};
mod calculate;
pub mod check;
mod lookup;

pub enum LookupType {
    Element(String),
    Attribute(String),
}

pub enum CompatType<'a> {
    Element(&'a CompatElement),
    GlobalAttributes(&'a CompatGlobalAttribs),
}
