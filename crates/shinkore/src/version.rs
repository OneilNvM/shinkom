use std::str::FromStr;

use crate::errors::ParseVersionError;

/// A browser version represented as a sequence of numeric components.
///
/// Parse a version from dot-separated unsigned integers with [`str::parse`].
/// Spaces and the `≤` or `<=` prefixes are ignored, allowing version strings
/// such as `"≤ 10.2"` to be parsed. Ordering compares the component sequences
/// lexicographically.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Version {
    components: Vec<u32>,
    raw: String,
}

impl Version {
    /// Returns the first numeric component, or `0` if there are no components.
    pub fn major(&self) -> u32 {
        self.components.first().copied().unwrap_or(0)
    }

    /// Returns the number of major versions by which `self` exceeds `other`.
    ///
    /// Returns `0` when both versions have the same major component or when
    /// `self` has a lower major component.
    pub fn major_versions_ahead(&self, other: &Self) -> u32 {
        if self.major() > other.major() {
            self.major() - other.major()
        } else {
            0
        }
    }
}

impl PartialOrd for Version {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Version {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.components.cmp(&other.components)
    }
}

impl FromStr for Version {
    type Err = ParseVersionError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let cleaned = s.replace('≤', "").replace("<=", "").replace(' ', "");

        let components: Result<Vec<u32>, _> =
            cleaned.split(".").map(|part| part.parse::<u32>()).collect();

        match components {
            Ok(components) => Ok(Self {
                components,
                raw: s.to_string(),
            }),
            _ => Err(ParseVersionError {
                message: format!("failed to parse string '{s}' to a version"),
            }),
        }
    }
}

/// A parsed browser-version requirement.
///
/// Parse requirements with [`str::parse`]. A plain version such as `"10.2"`
/// creates a [`GreaterThanOrEqualTo`](Self::GreaterThanOrEqualTo)
/// requirement; a version prefixed with `≤` or `<=` creates a
/// [`LessThanOrEqualTo`](Self::LessThanOrEqualTo) requirement; and two
/// dot-separated versions joined by `-`, such as `"10.2-12"`, create a
/// [`Range`](Self::Range).
///
/// [`is_satisfied_by`](Self::is_satisfied_by) currently compares the target
/// against the stored version for `GreaterThanOrEqualTo` and
/// `LessThanOrEqualTo`, and against the minimum version for `Range`. It does
/// not enforce an upper bound for `LessThanOrEqualTo` or `Range`.
#[derive(Debug)]
pub enum VersionRequirement {
    /// The target must be greater than or equal to this version.
    GreaterThanOrEqualTo(Version),
    /// Stores a version parsed from a `≤` or `<=` requirement.
    ///
    /// Note that [`is_satisfied_by`](Self::is_satisfied_by) currently checks
    /// that the target is greater than or equal to this version.
    LessThanOrEqualTo(Version),
    /// Stores the minimum and maximum versions parsed from a `min-max` range.
    ///
    /// Note that [`is_satisfied_by`](Self::is_satisfied_by) currently checks
    /// only the minimum version; it does not enforce the maximum.
    Range(Version, Version),
}

impl VersionRequirement {
    /// Returns whether `target` satisfies this requirement's current comparison.
    ///
    /// `GreaterThanOrEqualTo` and `LessThanOrEqualTo` compare `target` against
    /// their stored version using `>=`. `Range` compares `target` against its
    /// minimum version and does not check its maximum.
    pub fn is_satisfied_by(&self, target: &Version) -> bool {
        match self {
            VersionRequirement::GreaterThanOrEqualTo(version) => target >= version,
            VersionRequirement::LessThanOrEqualTo(max_version) => target >= max_version,
            VersionRequirement::Range(min_version, _max) => target >= min_version,
        }
    }
}

impl FromStr for VersionRequirement {
    type Err = ParseVersionError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.contains('≤') || s.contains("<=") {
            let version = s.parse::<Version>()?;
            Ok(VersionRequirement::LessThanOrEqualTo(version))
        } else if s.contains('-') {
            let parts = s.split("-").collect::<Vec<&str>>();
            let min = parts[0].parse::<Version>()?;
            let max = parts[1].parse::<Version>()?;
            Ok(VersionRequirement::Range(min, max))
        } else {
            let version = s.parse::<Version>()?;
            Ok(VersionRequirement::GreaterThanOrEqualTo(version))
        }
    }
}
