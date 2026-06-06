use std::{fmt::Display, num::ParseFloatError};

use thiserror::Error;

#[derive(Error, Debug, Clone)]
pub enum CheckError {
    #[error("{0}")]
    FromError(String),
    #[error("no lines were found in HTML")]
    NoLines,
    #[error("status is unavailable for {0}")]
    MissingStatus(String),
    #[error("the required browser data parameter types were not given. expected: {0}\nfound: {1}")]
    WrongBrowserDataParams(String, String),
    #[error("{0}")]
    RewriteError(String),
    #[error("{0}")]
    ParseFloatError(#[from] ParseFloatError),
}

impl From<lol_html::errors::RewritingError> for CheckError {
    fn from(value: lol_html::errors::RewritingError) -> Self {
        match value {
            lol_html::errors::RewritingError::ContentHandlerError(e) => {
                CheckError::RewriteError(e.to_string())
            }
            lol_html::errors::RewritingError::MemoryLimitExceeded(e) => {
                CheckError::RewriteError(e.to_string())
            }
            lol_html::errors::RewritingError::ParsingAmbiguity(e) => {
                CheckError::RewriteError(e.to_string())
            }
        }
    }
}

impl From<PreProcessError> for CheckError {
    fn from(value: PreProcessError) -> Self {
        CheckError::FromError(value.message)
    }
}

impl From<&CheckError> for CheckError {
    fn from(value: &CheckError) -> Self {
        value.clone()
    }
}

#[derive(Error, Debug)]
pub struct PreProcessError {
    message: String,
}

impl From<regex::Error> for PreProcessError {
    fn from(value: regex::Error) -> Self {
        match value {
            regex::Error::Syntax(msg) => Self { message: msg },
            regex::Error::CompiledTooBig(size) => Self {
                message: format!(
                    "the compiled program exceeded the set size limit\ncurrent limit: {size}"
                ),
            },
            _ => Self {
                message: String::from("regex error occurred"),
            },
        }
    }
}

impl Display for PreProcessError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "preprocess error: {}", self.message)
    }
}
