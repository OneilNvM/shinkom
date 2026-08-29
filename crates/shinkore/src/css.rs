use std::error::Error;

use cssparser::{ParseError, Parser, ParserInput, ToCss, Token};
use shinkore_types::prelude::ParsedCssStyle;

pub fn parse_stylesheet(css_content: &str) -> Vec<ParsedCssStyle> {
    let mut parsed_css_styles = Vec::new();
    let mut input = ParserInput::new(css_content);
    let mut parser = Parser::new(&mut input);

    while !parser.is_exhausted() {
        let _ = parser.parse_entirely(|p| {
            if let Token::CurlyBracketBlock = p.next()?.clone() {
                let _ = p.parse_nested_block(|n| {
                    while !n.is_exhausted() {
                        if let Token::Ident(name) = n.next()?.clone() {
                            let property_name = name.to_string().to_lowercase();

                            if n.expect_colon().is_ok() {
                                let mut value = String::new();

                                while let Ok(v) = n.next().clone() {
                                    if matches!(v, Token::Semicolon) {
                                        break;
                                    }
                                    value.push_str(&v.to_css_string());
                                }

                                parsed_css_styles.push(ParsedCssStyle {
                                    property: property_name,
                                    value,
                                });
                            }
                        }
                    }
                    Ok::<(), ParseError<'_, Box<dyn Error>>>(())
                });
            }
            Ok::<(), ParseError<'_, Box<dyn Error>>>(())
        });
    }

    parsed_css_styles
}
