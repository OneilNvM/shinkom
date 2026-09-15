use cssparser::{ParseError, Parser, ParserInput, ToCss, Token};
use shinkore_types::prelude::ParsedCssStyle;

use crate::errors::ParseStylesError;

pub fn parse_stylesheet(css_content: &str) -> Result<Vec<ParsedCssStyle>, ParseStylesError> {
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
                    Ok::<(), ParseError<'_, ParseStylesError>>(())
                });
            }
            Ok::<(), ParseError<'_, ParseStylesError>>(())
        });
    }

    Ok(parsed_css_styles)
}

pub fn parse_inline_styles(styles: &str) -> Result<Vec<ParsedCssStyle>, ParseStylesError> {
    let mut parsed_styles = vec![];
    let mut input = ParserInput::new(styles);
    let mut parser = Parser::new(&mut input);

    while !parser.is_exhausted() {
        parser.skip_whitespace();
        if parser.is_exhausted() {
            break;
        }

        if let Ok(Token::Ident(name)) = parser.next().clone() {
            let property_name = name.to_string().to_lowercase();

            if parser.expect_colon().is_ok() {
                let mut value = String::new();

                parse_value_tokens(&mut parser, &mut value)?;

                parsed_styles.push(ParsedCssStyle {
                    property: property_name,
                    value,
                })
            }
        }
    }
    Ok(parsed_styles)
}

fn parse_value_tokens(parser: &mut Parser, value: &mut String) -> Result<(), ParseStylesError> {
    while !parser.is_exhausted() {
        let token = match parser.next() {
            Ok(t) => t.clone(),
            Err(_) => break,
        };

        match token {
            Token::Semicolon => break,
            Token::Function(ref func_name) => {
                value.push_str(func_name);
                value.push('(');

                parser
                    .parse_nested_block(|nested| {
                        let _ = parse_value_tokens(nested, value);
                        Ok::<(), ParseError<'_, ParseStylesError>>(())
                    })?;
                value.push(')');
            }
            Token::ParenthesisBlock => {
                value.push('(');
                parser.parse_nested_block(|nested| {
                    let _ = parse_value_tokens(nested, value);
                    Ok::<(), ParseError<'_, ParseStylesError>>(())
                })?;
                value.push(')');
            }
            _ => {
                value.push_str(&token.to_css_string());
            }
        }
    }
    Ok(())
}
