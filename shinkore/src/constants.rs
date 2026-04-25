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

/// Maximum raw compatibility score  
pub const MAX_COMPAT_SCORE: u8 = MAX_SUM_BROWSER_SUPPORT_COMPAT_SCORES + MAX_STATUS_COMPAT_SCORE;

/// Maximum raw browser score
pub const MAX_SUM_BROWSER_SUPPORT_COMPAT_SCORES: u8 = 100;

/// Maximum raw status score
pub const MAX_STATUS_COMPAT_SCORE: u8 = 100;
