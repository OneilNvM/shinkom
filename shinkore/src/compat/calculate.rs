//! Module contains functions for calculating the compatibility scores for web features.
use std::collections::HashMap;

use version_compare::{Cmp, compare};
use wasm_bindgen::JsError;

use crate::{
    BrowserData, BrowserDataParamType, BrowserResult, BrowserUsageData, LookupResults, Scores,
    compat::{CompatType, LookupType},
    constants::{MAX_COMPAT_SCORE, MAX_STATUS_COMPAT_SCORE, MAX_SUM_BROWSER_SUPPORT_COMPAT_SCORES},
    schema::{Status, SupportData, SupportDetails, VersionValue},
};

/// Calculates the compatibility score for a web feature.
///
/// Performs calculations for a global attribute or an element/ local attribute.
///
/// ## Errors
/// A [`JsError`] is returned if any errors occurr in calculations.
pub fn calculate_compat_score(
    name: String,
    compat_type: CompatType,
    lookup_type: LookupType,
    results: &mut Vec<LookupResults>,
    browser_data_params: &Vec<BrowserDataParamType>,
) -> Result<(), JsError> {
    let mut browser_results: Vec<BrowserResult> = vec![];
    let mut compat_score = 0.0;
    match compat_type {
        CompatType::Element(el) => {
            let mut browser_score = calculate_browser_score(
                CompatType::Element(el),
                &mut browser_results,
                browser_data_params,
            )?;

            // LookupType is used for returning the appropriate error message
            let status_score = match lookup_type {
                LookupType::Element(name) => {
                    calculate_status_score(&el.compat.status, LookupType::Element(name))?
                }
                LookupType::Attribute(name) => {
                    calculate_status_score(&el.compat.status, LookupType::Attribute(name))?
                }
            };

            if status_score != 0.0 {
                compat_score += ((browser_score + status_score) / MAX_COMPAT_SCORE as f32) * 100.0;
            } else {
                browser_score = 0.0;
            }

            results.push(LookupResults {
                name,
                mdn_url: el.compat.mdn_url.clone(),
                compat_score: format!("{compat_score:.2}"),
                browser_score: format!(
                    "{:.2}",
                    ((browser_score / MAX_SUM_BROWSER_SUPPORT_COMPAT_SCORES as f32) * 100.0)
                ),
                status_score: format!(
                    "{:.1}",
                    (status_score / MAX_STATUS_COMPAT_SCORE as f32) * 100.0
                ),
                browsers: Some(browser_results),
            });

            Ok(())
        }
        CompatType::GlobalAttributes(g_attrib) => {
            let mut browser_score = calculate_browser_score(
                CompatType::GlobalAttributes(g_attrib),
                &mut browser_results,
                browser_data_params,
            )?;
            let status_score = calculate_status_score(
                &g_attrib.compat.status,
                LookupType::Attribute(name.clone()),
            )?;

            if status_score != 0.0 {
                compat_score += ((browser_score + status_score) / MAX_COMPAT_SCORE as f32) * 100.0;
            } else {
                browser_score = 0.0;
            }

            results.push(LookupResults {
                name,
                mdn_url: g_attrib.compat.mdn_url.clone(),
                compat_score: format!("{compat_score:.2}"),
                browser_score: format!(
                    "{:.2}",
                    ((browser_score / MAX_SUM_BROWSER_SUPPORT_COMPAT_SCORES as f32) * 100.0)
                ),
                status_score: format!(
                    "{:.1}",
                    (status_score / MAX_STATUS_COMPAT_SCORE as f32) * 100.0
                ),
                browsers: Some(browser_results),
            });

            Ok(())
        }
    }
}

/// Calculates the status score for a web feature
///
/// Returns the score as an [`f32`].
///
/// ## Errors
/// A [`JsError`] is returned if the status is not available for the feature.
pub fn calculate_status_score(
    compat_status: &Option<Status>,
    lookup_type: LookupType,
) -> Result<f32, JsError> {
    let mut status_score = 0.0;
    if let Some(status) = compat_status {
        if status.standard_track {
            if status.experimental {
                status_score = 50.0;
            } else {
                status_score = 100.0;
            }
        } else if status.experimental {
            status_score = 10.0
        } else if status.deprecated {
            status_score = 0.0;
        }
    } else {
        match lookup_type {
            LookupType::Element(tag) => {
                return Err(JsError::new(&format!(
                    "Status is unavailable for tag <{tag}>"
                )));
            }
            LookupType::Attribute(attribute) => {
                return Err(JsError::new(&format!(
                    "Status is unavailable for local attribute '{attribute}'"
                )));
            }
        }
    }

    Ok(status_score)
}

/// Calculates the browser score for a web feature.
///
/// Returns the total browser score between the available browsers.
///
/// ## Errors
/// A [`JsError`] is returned if an error occurrs in the calculations for version scores.
pub fn calculate_browser_score(
    compat_type: CompatType,
    browser_results: &mut Vec<BrowserResult>,
    browser_data_params: &Vec<BrowserDataParamType>,
) -> Result<f32, JsError> {
    let mut browser_score_total: f32 = 0.0;
    match compat_type {
        CompatType::Element(el) => {
            for (browser_name, support) in &el.compat.support {
                browser_score_total += calculate_version_score(
                    browser_name,
                    support,
                    browser_results,
                    browser_data_params,
                )?;
            }
        }
        CompatType::GlobalAttributes(g_attrib) => {
            for (browser_name, support) in &g_attrib.compat.support {
                browser_score_total += calculate_version_score(
                    browser_name,
                    support,
                    browser_results,
                    browser_data_params,
                )?;
            }
        }
    }

    Ok(browser_score_total)
}

/// Calculates the version score for a web feature.
///
/// This functions requires the [`BrowserData`] and [`BrowserUsageData`] parameters
/// as part of the Vector of [`BrowserDataParamType`] in order to function.
///
/// Returns the calculated browser score for a specific browser.
///
/// ## Errors
/// A [`JsError`] is returned if the [`BrowserDataParamType`] Vector does not contain both
/// `browser_data` and `browser_usage_data`.
fn calculate_version_score(
    browser_name: &String,
    support: &SupportData,
    browser_results: &mut Vec<BrowserResult>,
    browser_data_params: &Vec<BrowserDataParamType>,
) -> Result<f32, JsError> {
    let mut browser_data: Option<&BrowserData> = None;
    let mut usage_data: Option<&BrowserUsageData> = None;
    let mut browser_score = 0.0;

    // Retrieve data from parameter types
    for param_type in browser_data_params {
        match param_type {
            BrowserDataParamType::BrowserData(data) => browser_data = Some(data),
            BrowserDataParamType::UsageData(data) => usage_data = Some(data),
        }
    }

    if browser_data.is_none() || usage_data.is_none() {
        return Err(JsError::new(
            "the required browser data parameter types were not given.",
        ));
    }

    calculate_support(
        support,
        browser_name,
        &mut browser_score,
        browser_results,
        browser_data.unwrap(),
        usage_data.unwrap(),
    );

    Ok(browser_score)
}

/// Calculates the support score for the web feature on a specific browser.
///
/// Browser name must be present in `browser_data` or one of the `proxied` browser names.
fn calculate_support(
    support: &SupportData,
    browser_name: &String,
    browser_score: &mut f32,
    browser_results: &mut Vec<BrowserResult>,
    browser_data: &BrowserData,
    usage_data: &BrowserUsageData,
) {
    // Proxy browsers that have no usage data to browsers with similar engines.
    let browser_proxies = HashMap::from([
        (String::from("oculus"), String::from("chrome")),
        (
            String::from("opera_android"),
            String::from("chrome_android"),
        ),
        (String::from("webview_ios"), String::from("safari_ios")),
    ]);

    match support {
        SupportData::Single(detail) => {
            // Calculate browser_score for version_added
            match_version_added(browser_name, browser_score, detail, browser_data);

            if detail.partial_implementation.is_some() {
                *browser_score = 80.0;
            }
            if detail.version_removed.is_some()
                && let VersionValue::Version(added) = &detail.version_added
                && let VersionValue::Version(removed) = detail.version_removed.as_ref().unwrap()
            {
                // Make sure to check which is greater between version_added and version_removed
                match compare(removed, added) {
                    Ok(Cmp::Lt) | Ok(Cmp::Eq) => *browser_score = 100.0,
                    Ok(Cmp::Gt) => *browser_score = 0.0,
                    _ => (),
                }
            }

            // Get the raw score before the weighting calculation
            let raw_score = format!("{:.2}", *browser_score);

            if browser_data.browsers.contains_key(browser_name) {
                // Calculate the proxy weight if the browser name is proxied
                if browser_proxies.contains_key(browser_name) {
                    let proxy_name = browser_proxies.get(browser_name).unwrap();

                    calculate_weight(proxy_name, true, usage_data, browser_score);
                } else {
                    calculate_weight(browser_name, false, usage_data, browser_score);
                }
            }

            browser_results.push(BrowserResult {
                browser_name: browser_name.to_owned(),
                score: Scores {
                    raw_score,
                    weighted_score: format!("{:.2}", *browser_score),
                },
                versions: Some(SupportData::Single(detail.clone())),
            })
        }
        SupportData::Multiple(details) => {
            // Separate the total weighted score from the total raw score
            let mut sum_of_raw_scores = 0.0;
            let mut sum_of_weighted_scores = 0.0;

            for detail in details {
                let mut support_score = 0.0;

                // Use support_score instead of browser_score for average calculations later
                match_version_added(
                    browser_name,
                    &mut support_score,
                    &Box::new(detail.clone()),
                    browser_data,
                );

                if detail.partial_implementation.is_some() {
                    support_score = 80.0;
                }
                if detail.version_removed.is_some()
                    && let VersionValue::Version(added) = &detail.version_added
                    && let VersionValue::Version(removed) = detail.version_removed.as_ref().unwrap()
                {
                    // Make sure to check which is greater between version_added and version_removed
                    match compare(removed, added) {
                        Ok(Cmp::Lt) | Ok(Cmp::Eq) => *browser_score = 100.0,
                        Ok(Cmp::Gt) => *browser_score = 0.0,
                        _ => (),
                    }
                }

                sum_of_raw_scores += support_score;

                if browser_data.browsers.contains_key(browser_name) {
                    // Calculate the proxy weight if the browser name is proxied
                    if browser_proxies.contains_key(browser_name) {
                        let proxy_name = browser_proxies.get(browser_name).unwrap();

                        calculate_weight(proxy_name, true, usage_data, &mut support_score);
                    } else {
                        calculate_weight(browser_name, false, usage_data, &mut support_score);
                    }
                }

                sum_of_weighted_scores += support_score
            }

            // Calculate the averages for the raw score and weighted score
            sum_of_raw_scores /= details.len() as f32;
            *browser_score = sum_of_weighted_scores / details.len() as f32;

            browser_results.push(BrowserResult {
                browser_name: browser_name.to_owned(),
                score: Scores {
                    raw_score: format!("{:.2}", sum_of_raw_scores),
                    weighted_score: format!("{:.2}", *browser_score),
                },
                versions: Some(SupportData::Multiple(details.clone())),
            })
        }
        SupportData::Simple(version) => match version {
            VersionValue::Version(_) => {
                *browser_score = 100.0;
            }
            VersionValue::IsSupported(supported) => {
                if *supported {
                    *browser_score = 100.0;
                }
            }
            _ => (),
        },
        _ => (),
    }
}

/// Calculates the weighted score for an individual browser.
///
/// The weight is calculated by summing the total usage between a browser's versions and dividing it by
/// the total market share. This is then multiplied with the raw browser score giving the weighted score,
/// based on browser usage.
///
/// A higher weighted score **(e.g. 20)** means a feature is more likely to affect a lot of users on a browser, meanwhile
/// a low score **(e.g. 0.2)** means that it won't affect many users.
fn calculate_weight(
    browser_name: &String,
    proxied: bool,
    usage_data: &BrowserUsageData,
    browser_score: &mut f32,
) {
    if let Some(usage) = usage_data.agents.get(browser_name) {
        // Set total usage to 0 if the browser is proxied
        let total_usage = if proxied {
            0.0
        } else {
            usage.values().sum::<f32>()
        };
        let market_share = usage_data.market_share;

        *browser_score *= total_usage / market_share;
    }
}

/// Matches the [`VersionValue`] variant of the `version_added` field.
fn match_version_added(
    browser_name: &String,
    browser_score: &mut f32,
    detail: &SupportDetails,
    browser_data: &BrowserData,
) {
    match &detail.version_added {
        VersionValue::Version(ver) => {
            if let Some(browser) = browser_data.browsers.get(browser_name)
                && let Some(cur_ver) = &browser.values().next().unwrap().engine_version
            {
                match compare(ver, cur_ver) {
                    Ok(Cmp::Lt) | Ok(Cmp::Eq) => *browser_score = 100.0,
                    _ => (),
                }
            }
        }
        VersionValue::IsSupported(supported) => {
            if *supported {
                *browser_score = 100.0;
            } else {
                *browser_score = 0.0;
            }
        }
        _ => (),
    }
}
