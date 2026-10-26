//! This module contains functions for parsing CSS content as well as some structs and enums related to the parser.
use cssparser::{
    AtRuleParser, DeclarationParser, ParseError, Parser, ParserInput, QualifiedRuleParser,
    RuleBodyItemParser, RuleBodyParser, StyleSheetParser, ToCss, Token,
};
use serde::{Deserialize, Serialize};
use shinkore_types::prelude::CSSDeclaration;

use crate::errors::ParseStylesError;

/// A parsed top-level CSS rule.
#[derive(Debug, Clone)]
pub enum ParsedCss {
    /// A selector rule and its declarations.
    SelectorRule(StyleItem),
    /// A top-level at-rule, such as `@media`.
    TopLevelAtRule(QueryItem),
}

/// A CSS selector and the rules declared within its block.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StyleItem {
    /// The selector associated with these declarations.
    pub selector: String,
    /// Declarations and nested rules in the selector block.
    pub declarations: Vec<CSSRule>,
}

/// An at-rule name, its condition or prelude, and any nested rules.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QueryItem {
    /// The at-rule name, such as `media`, `supports`, or `layer`.
    pub name: String,
    /// The text following the at-rule name.
    pub condition: String,
    /// Rules contained in the at-rule block.
    pub rules: Vec<CSSRule>,
}

/// A rule parsed from a CSS stylesheet or declaration block.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CSSRule {
    /// A property name and its value.
    Declaration((String, String)),
    /// A selector rule containing declarations or nested rules.
    QualifiedRule(StyleItem),
    /// An at-rule and its nested rules.
    Media(QueryItem),
}

struct CSSParserDriver;

struct CSSDeclarationParser;

impl<'i> DeclarationParser<'i> for CSSDeclarationParser {
    type Declaration = Option<CSSRule>;
    type Error = ();

    fn parse_value<'t>(
        &mut self,
        name: cssparser::CowRcStr<'i>,
        input: &mut Parser<'i, 't>,
        _declaration_start: &cssparser::ParserState,
    ) -> Result<Self::Declaration, ParseError<'i, Self::Error>> {
        let pos = input.position();

        while input.next().is_ok() {}

        let value = input.slice_from(pos);

        Ok(Some(CSSRule::Declaration((
            name.to_string().to_lowercase(),
            value.trim().to_string(),
        ))))
    }
}

impl<'i> QualifiedRuleParser<'i> for CSSDeclarationParser {
    type Error = ();
    type Prelude = String;
    type QualifiedRule = Option<CSSRule>;

    fn parse_prelude<'t>(
        &mut self,
        input: &mut Parser<'i, 't>,
    ) -> Result<Self::Prelude, ParseError<'i, Self::Error>> {
        let mut class_name = String::new();
        while let Ok(token) = input.next() {
            if let Token::Delim('.') = token
                && let Ok(Token::Ident(name)) = input.next()
            {
                class_name.push_str(&name.to_lowercase());
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
        let mut css_rules = Vec::new();
        let mut handler = CSSDeclarationParser;
        let body_parser = RuleBodyParser::new(input, &mut handler);

        for rule in body_parser.flatten().flatten() {
            css_rules.push(rule);
        }

        if prelude.is_empty() {
            Ok(None)
        } else {
            Ok(Some(CSSRule::QualifiedRule(StyleItem {
                selector: prelude,
                declarations: css_rules,
            })))
        }
    }
}

impl<'a> AtRuleParser<'a> for CSSDeclarationParser {
    type AtRule = Option<CSSRule>;
    type Error = ();
    type Prelude = (String, String);

    fn parse_prelude<'t>(
        &mut self,
        name: cssparser::CowRcStr<'a>,
        input: &mut Parser<'a, 't>,
    ) -> Result<Self::Prelude, ParseError<'a, Self::Error>> {
        match name.to_string().to_lowercase().as_str() {
            "media" | "supports" | "layer" => {
                let start = input.position();
                while let Ok(tok) = input.next() {
                    if matches!(tok, Token::CurlyBracketBlock) {
                        break;
                    }
                }

                Ok((name.to_string(), input.slice_from(start).trim().to_string()))
            }
            _ => Err(input.new_custom_error(())),
        }
    }

    fn parse_block<'t>(
        &mut self,
        prelude: Self::Prelude,
        _start: &cssparser::ParserState,
        input: &mut Parser<'a, 't>,
    ) -> Result<Self::AtRule, ParseError<'a, Self::Error>> {
        let mut nested_rules = Vec::new();
        let mut handler = CSSDeclarationParser;
        let rule_body_parser = RuleBodyParser::new(input, &mut handler);

        for rule in rule_body_parser.flatten().flatten() {
            nested_rules.push(rule);
        }

        Ok(Some(CSSRule::Media(QueryItem {
            name: prelude.0,
            condition: prelude.1,
            rules: nested_rules,
        })))
    }

    fn rule_without_block(
        &mut self,
        prelude: Self::Prelude,
        _start: &cssparser::ParserState,
    ) -> Result<Self::AtRule, ()> {
        Ok(Some(CSSRule::Media(QueryItem {
            name: prelude.0,
            condition: prelude.1,
            rules: vec![],
        })))
    }
}

impl<'i> QualifiedRuleParser<'i> for CSSParserDriver {
    type Error = ();
    type Prelude = String;
    type QualifiedRule = Option<CSSRule>;

    fn parse_prelude<'t>(
        &mut self,
        input: &mut Parser<'i, 't>,
    ) -> Result<Self::Prelude, ParseError<'i, Self::Error>> {
        let mut class_name = String::new();
        while let Ok(token) = input.next() {
            if let Token::Delim('.') = token
                && let Ok(Token::Ident(name)) = input.next()
            {
                class_name.push_str(&name.to_lowercase());
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
        let mut css_rules = Vec::new();
        let mut handler = CSSDeclarationParser;
        let body_parser = RuleBodyParser::new(input, &mut handler);

        for css_rule in body_parser.flatten().flatten() {
            css_rules.push(css_rule);
        }

        if prelude.is_empty() {
            Ok(None)
        } else {
            Ok(Some(CSSRule::QualifiedRule(StyleItem {
                selector: prelude,
                declarations: css_rules,
            })))
        }
    }
}

impl<'a> AtRuleParser<'a> for CSSParserDriver {
    type AtRule = Option<CSSRule>;
    type Error = ();
    type Prelude = (String, String);

    fn parse_block<'t>(
        &mut self,
        prelude: Self::Prelude,
        _start: &cssparser::ParserState,
        input: &mut Parser<'a, 't>,
    ) -> Result<Self::AtRule, ParseError<'a, Self::Error>> {
        let mut driver = CSSParserDriver;
        let rule_parser = StyleSheetParser::new(input, &mut driver);
        let mut nested_rules = Vec::new();

        for rule in rule_parser {
            match rule {
                Ok(r) => {
                    if let Some(inner) = r {
                        nested_rules.push(inner)
                    }
                }
                Err(e) => eprintln!("{e:?}"),
            }
        }

        Ok(Some(CSSRule::Media(QueryItem {
            name: prelude.0,
            condition: prelude.1,
            rules: nested_rules,
        })))
    }

    fn parse_prelude<'t>(
        &mut self,
        name: cssparser::CowRcStr<'a>,
        input: &mut Parser<'a, 't>,
    ) -> Result<Self::Prelude, ParseError<'a, Self::Error>> {
        match name.to_string().as_str() {
            "media" | "supports" | "layer" => {
                let start = input.position();
                while let Ok(tok) = input.next() {
                    if matches!(tok, Token::CurlyBracketBlock) {
                        break;
                    }
                }

                Ok((name.to_string(), input.slice_from(start).trim().to_string()))
            }
            "import" => {
                let start = input.position();
                while let Ok(tok) = input.next() {
                    if matches!(tok, Token::Semicolon) {
                        break;
                    }
                }

                Ok((name.to_string(), input.slice_from(start).trim().to_string()))
            }
            _ => Err(input.new_custom_error(())),
        }
    }

    fn rule_without_block(
        &mut self,
        prelude: Self::Prelude,
        _start: &cssparser::ParserState,
    ) -> Result<Self::AtRule, ()> {
        Ok(Some(CSSRule::Media(QueryItem {
            name: prelude.0,
            condition: prelude.1,
            rules: vec![],
        })))
    }
}

impl<'i> RuleBodyItemParser<'i, Option<CSSRule>, ()> for CSSDeclarationParser {
    fn parse_declarations(&self) -> bool {
        true
    }
    fn parse_qualified(&self) -> bool {
        true
    }
}

/// Parses CSS content from stylesheets.
///
/// Uses a parsing implementation to find CSS classes and at-rules declared in the stylesheet.
///
/// ## Example
/// ```
/// use shinkore::css::{parse_css, ParsedCss};
/// # fn main() -> Result<(), Box<dyn std::error::Error>> {
///
/// let example_css = r#"
/// .container {
///     display: flex;
///     flex-direction: column;
///     align-items: center;
///     gap: 4rem;
///     background-color: grey;
///     border-radius: 3rem;
/// }
/// "#;
///
/// let parsed_css = parse_css(example_css)?;
///
/// assert!(matches!(parsed_css[0], ParsedCss::SelectorRule(_)));
/// # Ok(())
/// # }
/// ```
pub fn parse_css(css_content: &str) -> Result<Vec<ParsedCss>, ParseStylesError> {
    let mut styles = Vec::new();
    let mut input = ParserInput::new(css_content);
    let mut parser = Parser::new(&mut input);
    let mut extractor = CSSParserDriver;
    let stylesheets = StyleSheetParser::new(&mut parser, &mut extractor);

    for rule in stylesheets.flatten().flatten() {
        match rule {
            CSSRule::QualifiedRule(style) => {
                styles.push(ParsedCss::SelectorRule(style));
            }
            CSSRule::Media(query) => {
                styles.push(ParsedCss::TopLevelAtRule(query));
            }
            _ => {}
        }
    }

    Ok(styles)
}

/// Parses inline styles from style attributes.
///
/// ## Example
/// ```
/// use shinkore::css::parse_inline_styles;
///
/// # fn main() -> Result<(), Box<dyn std::error::Error>> {
/// let example_styles = "width: 120px; height: 120px; border: 1px dotted orange; background-color: cyan;";
///
/// let declarations = parse_inline_styles(example_styles)?;
///
/// assert_eq!(declarations.len(), 4);
///
/// # Ok(())
/// # }
/// ```
pub fn parse_inline_styles(styles: &str) -> Result<Vec<CSSDeclaration>, ParseStylesError> {
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

                parsed_styles.push(CSSDeclaration {
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
