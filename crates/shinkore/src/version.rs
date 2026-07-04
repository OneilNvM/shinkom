use std::str::FromStr;

use crate::errors::ParseVersionError;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Version {
    components: Vec<u32>,
    raw: String,
}

impl Version {
    pub fn major(&self) -> u32 {
        self.components.first().copied().unwrap_or(0)
    }

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

#[derive(Debug)]
pub enum VersionRequirement {
    GreaterThanOrEqualTo(Version),
    LessThanOrEqualTo(Version),
    Range(Version, Version),
}

impl VersionRequirement {
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
