/// A macro for extracting individual CSS classes and at-rules from a vector of parsed css rules.
///
/// This macro should typically be used after calling [`parse_css`](crate::css::parse_css) to extract
/// all of the classes and at-rules separately. The macro accepts two or three arguments including the
/// mandatory parsed CSS, a vector for the CSS classes and a vector for the at-rules.
/// 
/// If only two arguments are supplied, then only the CSS classes will be extracted.
///
/// ## Example
/// ```
/// use shinkore::css::{CSSRule, ParsedCss, StyleItem, QueryItem, parse_css};
/// use shinkore::{extract_css_rules, flatten_css};
/// use shinkore_types::prelude::{CSSDeclaration, CSSClass, AtRule};
/// 
/// # fn main() -> Result<(), Box<dyn std::error::Error>> {
/// let demo_css = r#"
/// .foo {
///     display: grid;
///     width: 100%;
///     height: 100%;
///     @media (orientation: landscape) {
///         grid-auto-flow: column;
///     }
/// }
/// 
/// @layer utilities {
///     .flex {
///         display: flex;
///     }
///     .flex-col {
///         flex-direction: column;
///     }
/// } 
/// "#;
/// 
/// let mut classes = Vec::new();
/// let mut at_rules = Vec::new();
/// let parsed_css = parse_css(demo_css)?;
/// 
/// extract_css_rules!(parsed_css, classes, at_rules);
/// 
/// assert_eq!(classes.len(), 3);
/// assert_eq!(at_rules.len(), 2);
/// # Ok(())
/// # }
/// ```
#[macro_export]
macro_rules! extract_css_rules {
    ($parsed_css:expr, $classes:expr) => {
        for css in $parsed_css {
            match css {
                ParsedCss::SelectorRule(style) => {
                    let mut queue = Vec::new();

                    let mut top_level_declarations = Vec::new();
                    for rule in style.declarations {
                        if let CSSRule::Declaration((property, value)) = rule {
                            top_level_declarations.push(CSSDeclaration { property, value });
                        } else {
                            queue.push(rule);
                        }
                    }
                    $classes.push(CSSClass {
                        name: style.selector,
                        styles: top_level_declarations,
                    });

                    flatten_css!(queue, $classes);
                }
                ParsedCss::TopLevelAtRule(query) => {
                    let mut queue = Vec::new();

                    for rule in query.rules {
                        if matches!(rule, CSSRule::Declaration(_)) {
                            continue;
                        } else {
                            queue.push(rule);
                        }
                    }

                    flatten_css!(queue, $classes);
                }
            }
        }
    };
    ($parsed_css:expr, $classes:expr, $at_rules:expr) => {
        for css in $parsed_css {
            match css {
                ParsedCss::SelectorRule(style) => {
                    let mut queue = Vec::new();

                    let mut top_level_declarations = Vec::new();
                    for rule in style.declarations {
                        if let CSSRule::Declaration((property, value)) = rule {
                            top_level_declarations.push(CSSDeclaration { property, value });
                        } else {
                            queue.push(rule);
                        }
                    }
                    $classes.push(CSSClass {
                        name: style.selector,
                        styles: top_level_declarations,
                    });

                    flatten_css!(queue, $classes, $at_rules);
                }
                ParsedCss::TopLevelAtRule(query) => {
                    let mut queue = Vec::new();
                    $at_rules.push(AtRule {
                        name: query.name,
                        condition: query.condition,
                    });

                    for rule in query.rules {
                        if matches!(rule, CSSRule::Declaration(_)) {
                            continue;
                        } else {
                            queue.push(rule);
                        }
                    }

                    flatten_css!(queue, $classes, $at_rules);
                }
            }
        }
    };
}

/// A macro for flattening CSS rules in a queue.
/// 
/// This macro uses a BFS approach to flattening CSS rules returned by the [`parse_css`](crate::css::parse_css)
/// function. The macro accepts two or three arguments including a mandatory vector representing the queue,
/// a vector for the CSS classes and a vector for the at-rules.
/// 
/// If only two arguments are supplied, then only the CSS classes are flattened.
#[macro_export]
macro_rules! flatten_css {
    ($queue:expr, $classes:expr) => {
        while !$queue.is_empty() {
            let rule = $queue.remove(0);
            match rule {
                CSSRule::QualifiedRule(s) => {
                    let mut styles = Vec::new();
                    for item in s.declarations {
                        if let CSSRule::Declaration((property, value)) = item {
                            styles.push(CSSDeclaration { property, value });
                        } else {
                            $queue.push(item);
                        }
                    }
                    $classes.push(CSSClass {
                        name: s.selector,
                        styles,
                    });
                }
                CSSRule::Media(q) => {
                    for item in q.rules {
                        if matches!(item, CSSRule::Declaration(_)) {
                            continue;
                        } else {
                            $queue.push(item);
                        }
                    }
                }
                _ => {}
            }
        }
    };
    ($queue:expr, $classes:expr, $at_rules:expr) => {
        while !$queue.is_empty() {
            let rule = $queue.remove(0);
            match rule {
                CSSRule::QualifiedRule(s) => {
                    let mut styles = Vec::new();
                    for item in s.declarations {
                        if let CSSRule::Declaration((property, value)) = item {
                            styles.push(CSSDeclaration { property, value });
                        } else {
                            $queue.push(item);
                        }
                    }
                    $classes.push(CSSClass {
                        name: s.selector,
                        styles,
                    });
                }
                CSSRule::Media(q) => {
                    $at_rules.push(AtRule {
                        name: q.name,
                        condition: q.condition,
                    });

                    for item in q.rules {
                        if matches!(item, CSSRule::Declaration(_)) {
                            continue;
                        } else {
                            $queue.push(item);
                        }
                    }
                }
                _ => {}
            }
        }
    };
}
