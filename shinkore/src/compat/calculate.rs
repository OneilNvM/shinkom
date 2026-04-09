use wasm_bindgen::JsValue;

use crate::{
    LookupResults,
    compat::{LookupType, lookup::CompatType},
    constants::{MAX_COMPAT_SCORE, MAX_STATUS_COMPAT_SCORE, MAX_SUM_BROWSER_SUPPORT_COMPAT_SCORES},
    schema::{Status, SupportData, VersionValue},
};

pub fn calculate_compat_score(
    name: String,
    compat_type: CompatType,
    lookup_type: LookupType,
    results: &mut Vec<LookupResults>,
) {
    let mut compat_score = 0;
    match compat_type {
        CompatType::Element(el) => {
            let mut browser_score = calculate_browser_score(CompatType::Element(el));
            let status_score = match lookup_type {
                LookupType::Element(name) => {
                    calculate_status_score(&el.compat.status, LookupType::Element(name))
                }
                LookupType::Attribute(name) => {
                    calculate_status_score(&el.compat.status, LookupType::Attribute(name))
                }
            };

            if status_score != 0.0 {
                compat_score +=
                    (((browser_score + status_score) / MAX_COMPAT_SCORE as f32) * 100.0) as u8;
            } else {
                browser_score = 0.0;
            }

            results.push(LookupResults {
                name,
                compat_score,
                browser_score: ((browser_score / MAX_SUM_BROWSER_SUPPORT_COMPAT_SCORES as f32)
                    * 100.0) as u8,
                status_score: ((status_score / MAX_STATUS_COMPAT_SCORE as f32) * 100.0) as u8,
            })
        }
        CompatType::GlobalAttributes(g_attrib) => {
            let mut browser_score = calculate_browser_score(CompatType::GlobalAttributes(g_attrib));
            let status_score = calculate_status_score(
                &g_attrib.compat.status,
                LookupType::Attribute(name.clone()),
            );

            if status_score != 0.0 {
                compat_score +=
                    (((browser_score + status_score) / MAX_COMPAT_SCORE as f32) * 100.0) as u8;
            } else {
                browser_score = 0.0;
            }

            results.push(LookupResults {
                name,
                compat_score,
                browser_score: ((browser_score / MAX_SUM_BROWSER_SUPPORT_COMPAT_SCORES as f32)
                    * 100.0) as u8,
                status_score: ((status_score / MAX_STATUS_COMPAT_SCORE as f32) * 100.0) as u8,
            })
        }
    }
}

pub fn calculate_status_score(compat_status: &Option<Status>, lookup_type: LookupType) -> f32 {
    let mut status_score = 0.0;
    if let Some(status) = compat_status {
        if status.standard_track {
            if status.experimental {
                status_score = 5.0;
            } else {
                status_score = 10.0;
            }
        } else if status.experimental {
            status_score = 1.0
        } else if status.deprecated {
            status_score = 0.0;
        }
    } else {
        match lookup_type {
            LookupType::Element(tag) => web_sys::console::error_1(&JsValue::from_str(&format!(
                "Status is unavailable for tag <{tag}>"
            ))),
            LookupType::Attribute(attribute) => web_sys::console::error_1(&JsValue::from_str(
                &format!("Status is unavailable for local attribute '{attribute}'"),
            )),
        }
    }

    status_score
}

fn calculate_browser_score(compat_type: CompatType) -> f32 {
    let mut browser_score_total: f32 = 0.0;
    match compat_type {
        CompatType::Element(el) => {
            for support in el.compat.support.values() {
                let mut browser_score = 0.0;
                match support {
                    SupportData::Single(detail) => {
                        browser_score = 10.0;

                        if detail.partial_implementation.is_some() {
                            browser_score = 8.0;
                        }
                        if detail.version_removed.is_some() {
                            browser_score = 0.0;
                        }
                    }
                    SupportData::Multiple(details) => {
                        let mut sum_of_version_scores = 0.0;

                        for detail in details {
                            let mut support_score = 10.0;

                            if detail.partial_implementation.is_some() {
                                support_score = 8.0;
                            }
                            if detail.version_removed.is_some() {
                                support_score = 0.0;
                            }

                            sum_of_version_scores += support_score
                        }

                        browser_score = sum_of_version_scores / details.len() as f32
                    }
                    SupportData::Simple(version) => match version {
                        VersionValue::Version(_) => browser_score = 10.0,
                        VersionValue::IsSupported(supported) => {
                            if *supported {
                                browser_score = 10.0;
                            }
                        }
                        VersionValue::Unknown(_) => (),
                    },
                    SupportData::Unknown(_) => (),
                }
                browser_score_total += browser_score;
            }
        }
        CompatType::GlobalAttributes(g_attrib) => {
            for support in g_attrib.compat.support.values() {
                let mut browser_score = 0.0;
                match support {
                    SupportData::Single(detail) => {
                        browser_score = 10.0;

                        if detail.partial_implementation.is_some() {
                            browser_score = 8.0;
                        }
                        if detail.version_removed.is_some() {
                            browser_score = 0.0;
                        }
                    }
                    SupportData::Multiple(details) => {
                        let mut sum_of_version_scores = 0.0;

                        for detail in details {
                            let mut support_score = 10.0;

                            if detail.partial_implementation.is_some() {
                                support_score = 8.0;
                            }
                            if detail.version_removed.is_some() {
                                support_score = 0.0;
                            }

                            sum_of_version_scores += support_score
                        }

                        browser_score = sum_of_version_scores / details.len() as f32
                    }
                    SupportData::Simple(version) => match version {
                        VersionValue::Version(_) => browser_score = 10.0,
                        VersionValue::IsSupported(supported) => {
                            if *supported {
                                browser_score = 10.0;
                            }
                        }
                        VersionValue::Unknown(_) => (),
                    },
                    SupportData::Unknown(_) => (),
                }
                browser_score_total += browser_score;
            }
        }
    }

    browser_score_total
}
