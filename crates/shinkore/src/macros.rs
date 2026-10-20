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
