use std::{
    error::Error,
    fs,
    io::{BufReader, Write},
    path::PathBuf,
};

use serde::{Serialize, de::DeserializeOwned};
use serde_json::Value;
use shinkore::{BrowserData, BrowserUsageData, HTMLData, JSONStructure, SVGData};
use shinkore_types::prelude::CSSData;
use wincode::{SchemaWrite, config::DefaultConfig};

fn main() -> Result<(), Box<dyn Error>> {
    let base_path = PathBuf::from("packages/shinkom/gen");
    let read_json = |filename: &str| -> Result<serde_json::Value, Box<dyn Error>> {
        let path = base_path.join(filename);
        let file = fs::File::open(path)?;
        let value = serde_json::from_reader(BufReader::new(file))?;
        Ok(value)
    };

    println!("reading json files from gen directory in shinkom...");
    let mut html_root = read_json("html-compat-data.json")?;
    let mut svg_root = read_json("svg-compat-data.json")?;
    let mut css_root = read_json("css-compat-data.json")?;
    let mut browsers_root = read_json("browser-data.json")?;
    let mut usage_root = read_json("browser-usage-data.json")?;

    println!("deserializing json data...");
    let html_data: HTMLData = deserialize_json(&mut html_root, Some("html"))?;
    let svg_data: SVGData = deserialize_json(&mut svg_root, Some("svg"))?;
    let css_data: CSSData = deserialize_json(&mut css_root, Some("css"))?;
    let browser_data: BrowserData = deserialize_json(&mut browsers_root, None)?;
    let usage_data: BrowserUsageData = deserialize_json(&mut usage_root, None)?;

    println!("writing bin files...");
    write_bin(&html_data, "html-compat-data.bin")?;
    write_bin(&svg_data, "svg-compat-data.bin")?;
    write_bin(&css_data, "css-compat-data.bin")?;
    write_bin(&browser_data, "browser-data.bin")?;
    write_bin(&usage_data, "browser-usage-data.bin")?;

    println!("converted compatibility data from .json to .bin");

    Ok(())
}

fn deserialize_json<T>(value: &mut Value, property: Option<&str>) -> Result<T, Box<dyn Error>>
where
    T: JSONStructure + Serialize + DeserializeOwned,
{
    if let Some(prop) = property {
        let object = value
            .as_object_mut()
            .ok_or("Could not convert root to object")?;
        let object_val = object
            .remove(prop)
            .ok_or(format!("Could not find {prop} property in object"))?;

        let data: T = serde_json::from_value(object_val)
            .map_err(|e| eprintln!("Category: {:?}. {e}", e.classify()))
            .unwrap();

        Ok(data)
    } else {
        let data: T = serde_json::from_value(value.take())
            .map_err(|e| eprintln!("Category: {:?}. {e}", e.classify()))
            .unwrap();

        Ok(data)
    }
}

fn write_bin<T>(data: &T, filename: &str) -> Result<(), Box<dyn Error>>
where
    T: JSONStructure + SchemaWrite<DefaultConfig, Src = T> + ?Sized + Serialize + DeserializeOwned,
{
    let encoded = wincode::serialize(data)?;
    let base_path = PathBuf::from("crates/shinkore/gen");
    let path = base_path.join(filename);

    let mut output = fs::File::create(path)?;
    output.write_all(&encoded)?;

    Ok(())
}
