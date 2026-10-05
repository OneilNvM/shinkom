use cssparser::{
    AtRuleParser, DeclarationParser, ParseError, Parser, ParserInput, QualifiedRuleParser,
    RuleBodyItemParser, RuleBodyParser, StyleSheetParser, ToCss, Token,
};
use shinkore_types::prelude::{CSSClass, ParsedCssStyle};

use crate::errors::ParseStylesError;

#[derive(Debug)]
pub struct StyleItem {
    pub class: String,
    pub declarations: Vec<(String, String)>,
}

pub struct TopLevelCSSParser;

pub struct CSSBodyParser;

impl<'i> DeclarationParser<'i> for CSSBodyParser {
    type Declaration = (String, String);
    type Error = ();

    fn parse_value<'t>(
        &mut self,
        name: cssparser::CowRcStr<'i>,
        input: &mut Parser<'i, 't>,
        _declaration_start: &cssparser::ParserState,
    ) -> Result<Self::Declaration, ParseError<'i, Self::Error>> {
        let pos = input.position();

        while let Ok(_) = input.next() {}

        let value = input.slice_from(pos);

        Ok((name.to_string().to_lowercase(), value.to_string()))
    }
}

impl<'i> QualifiedRuleParser<'i> for CSSBodyParser {
    type Error = ();
    type Prelude = ();
    type QualifiedRule = (String, String);
}

impl<'a> AtRuleParser<'a> for CSSBodyParser {
    type AtRule = (String, String);
    type Error = ();
    type Prelude = ();
}

impl<'i> QualifiedRuleParser<'i> for TopLevelCSSParser {
    type Error = ();
    type Prelude = String;
    type QualifiedRule = Option<StyleItem>;

    fn parse_prelude<'t>(
        &mut self,
        input: &mut Parser<'i, 't>,
    ) -> Result<Self::Prelude, ParseError<'i, Self::Error>> {
        let mut class_name = String::new();
        while let Ok(token) = input.next() {
            if let Token::Delim('.') = token {
                if let Ok(Token::Ident(name)) = input.next() {
                    class_name.push_str(&name.to_string().to_lowercase());
                }
            }
        }
        Ok(class_name)
    }

    fn parse_block<'t>(
        &mut self,
        prelude: Self::Prelude,
        _start: &cssparser::ParserState,
        input: &mut Parser<'i, 't>,
    ) -> Result<Self::QualifiedRule, ParseError<'i, Self::Error>> {
        let mut declarations = Vec::new();
        let mut handler = CSSBodyParser;
        let mut body_parser = RuleBodyParser::new(input, &mut handler);

        while let Some(res) = body_parser.next() {
            if let Ok(declaration) = res {
                declarations.push(declaration);
            }
        }

        if prelude.is_empty() {
            Ok(None)
        } else {
            Ok(Some(StyleItem {
                class: prelude,
                declarations,
            }))
        }
    }
}

impl<'a> AtRuleParser<'a> for TopLevelCSSParser {
    type AtRule = Option<StyleItem>;
    type Error = ();
    type Prelude = String;
}

impl<'i> RuleBodyItemParser<'i, (String, String), ()> for CSSBodyParser {
    fn parse_declarations(&self) -> bool {
        true
    }
    fn parse_qualified(&self) -> bool {
        false
    }
}

pub fn parse_css_classes(css_content: &str) -> Result<Vec<CSSClass>, ParseStylesError> {
    let mut input = ParserInput::new(css_content);
    let mut parser = Parser::new(&mut input);
    let mut top_level_extractor = TopLevelCSSParser;
    let stylesheets = StyleSheetParser::new(&mut parser, &mut top_level_extractor);

    let mut css_classes = Vec::new();

    for sheet in stylesheets {
        match sheet {
            Ok(res) => {
                let mut styles = Vec::new();
                if let Some(style) = res {
                    for declaration in style.declarations {
                        let parsed_styles = ParsedCssStyle {
                            property: declaration.0,
                            value: declaration.1,
                        };

                        styles.push(parsed_styles)
                    }
                    css_classes.push(CSSClass {
                        name: style.class,
                        styles,
                    });
                }
            }
            Err(_) => {}
        }
    }

    Ok(css_classes)
}

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

                parser.parse_nested_block(|nested| {
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
