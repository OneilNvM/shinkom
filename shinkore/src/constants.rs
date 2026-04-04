/// Tags to not search for in the SVG data.
pub const SKIP_TAGS: [&str; 2] = ["script", "a"];

/// HTML tags to ignore the body of when pre-processing HTML.
pub const IGNORE_TAGS: [&str; 8] = [
    "</script>",
    "</style>",
    "</textarea>",
    "</title>",
    "</noscript>",
    "</noembed>",
    "</iframe>",
    "</xmp>",
];
