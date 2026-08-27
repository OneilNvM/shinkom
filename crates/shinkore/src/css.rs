use cssparser::{Parser, ParserInput, ToCss, Token};
use shinkore_types::prelude::ParsedCssStyle;

pub fn parse_stylesheet(css_content: &str) -> Vec<ParsedCssStyle> {
    let mut parsed_css_styles = Vec::new();
    let mut input = ParserInput::new(css_content);
    let mut parser = Parser::new(&mut input);

    while let Ok(t) = parser.next().cloned() {
        if let Token::Ident(name) = t {
            let property_name = name.to_string().to_lowercase();

            if let Ok(Token::Colon) = parser.next() {
                let mut value_str = String::new();

                while let Ok(v) = parser.next().cloned() {
                    match v {
                        Token::Semicolon => break,
                        Token::CloseCurlyBracket => break,
                        _ => value_str.push_str(&v.to_css_string()),
                    }
                }

                parsed_css_styles.push(ParsedCssStyle {
                    property: property_name,
                    value: value_str,
                })
            }
        }
    }

    parsed_css_styles
}
