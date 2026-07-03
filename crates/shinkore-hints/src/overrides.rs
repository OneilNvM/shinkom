use std::collections::HashMap;

pub fn get_html_overrides() -> HashMap<String, String> {
    let mut map = HashMap::new();

    map.insert("web-features:audio".to_string(), "Asset Optimization: Depending on the browser, certain file types and audio codecs may not be supported. Ensure you provide the supported audio files for your target browser via adding <source> tags inside <audio> tags.".to_string());
    map.insert("web-features:video".to_string(), "Asset Optimization: Depending on the browser, certain video formats may not be supported. Ensure you provide the supported video files for your target browser via adding <source> tags inside <video> tags.".to_string());
    map.insert("web-features:picture".to_string(), "Responsive Images: The <picture> tag can be overkill for simple image resolution scaling. Using <img> with the 'srcset' and 'sizes' attributes can accomplish the same thing with less HTML. Most modern web servers can also serve supported image formats to browsers that need them, while keeping <img> tags.".to_string());
    map.insert("web-features:embed".to_string(), "Alternatives: Most modern browsers have deprecated and removed support for browser plug-ins, so relying on embed is generally not advised. Instead you could use other tags to fit your needs for using assets such as <img>, <video>, <audio>, <object> etc.".to_string());
    map.insert("web-features:srcset".to_string(), "Responsive Images: Older engines cannot read responsive image matrices. Ensure your base src attribute points to a sensible global fallback image asset size.".to_string());

    map
}
