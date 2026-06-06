use std::error::Error;

use shinkore::{
    engine::RustCompatEngine,
    prelude::{BrowserData, BrowserUsageData, HTMLData, SVGData},
};

#[test]
fn should_create_engine() -> Result<(), Box<dyn Error>> {
    use serde_json::Value;
    use std::fs::File;
    use std::io::Read;

    let mut compat_data_file = File::open("../gen/compat-data.json").unwrap();
    let mut browser_data_file = File::open("../gen/browser-data.json").unwrap();
    let mut browser_usage_data_file = File::open("../gen/browser-usage-data.json").unwrap();
    let mut compat_data = String::new();
    let mut browser_data = String::new();
    let mut browser_usage_data = String::new();

    compat_data_file.read_to_string(&mut compat_data)?;
    browser_data_file.read_to_string(&mut browser_data)?;
    browser_usage_data_file.read_to_string(&mut browser_usage_data)?;

    let compat_root: Value = serde_json::from_str(&compat_data)?;
    let browsers_root: Value = serde_json::from_str(&browser_data)?;
    let usage_root: Value = serde_json::from_str(&browser_usage_data)?;

    let html_data: HTMLData =
        serde_json::from_value(compat_root.get("html").unwrap().clone()).unwrap();
    let svg_data: SVGData =
        serde_json::from_value(compat_root.get("svg").unwrap().clone()).unwrap();
    let browsers_data: BrowserData = serde_json::from_value(browsers_root).unwrap();
    let usage_data: BrowserUsageData = serde_json::from_value(usage_root).unwrap();

    let _engine = RustCompatEngine::new(html_data, svg_data, browsers_data, usage_data);

    Ok(())
}
