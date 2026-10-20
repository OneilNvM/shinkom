const SIMPLE_CSS: &str = r#"
.test {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 4rem;
}

.square {
width: 3rem;
height: 3rem;
background-color: red;
position: absolute;
top: 50%;
left: 50%;
}

.circle {
width: 5rem;
height: 5rem;
border-radius: 9999px;
position: absolute;
bottom: 25%;
left: 25%;
}"#;

const MIXED_NESTED_CSS: &str = r#"
@layer utilities {
    .foo {
        display: grid;
        gap: 1rem;
        
        @media (orientation: landscape) {
            grid-auto-flow: column;
            
            @supports (width: clamp(1rem, 2vw, 3rem)) {
                max-inline-size: 1024px;
                padding-inline: clamp(1rem, 5vw, 3rem);
            }
            
            @media (width >= 1024px) {
                background-color: rgba(0, 0, 0, 0.05);
            }
        }
    }
}

@media (prefers-color-scheme: dark) {
    .card-grid {
        background-color: #111827;
        color: #f9fafb;
        
        .button-primary {
            background-color: #60a5fa;
            color: #111827;
        }
    }
}"#;

fn generate_large_css_stylesheet(rule_count: usize) -> String {
    let mut css_content = String::with_capacity(rule_count * 100);
    for i in 0..rule_count {
        css_content.push_str(&format!(
            r#"
            @media (min-width: {}px) {{
                .item-{} {{
                    display: flex;
                    flex-grow: {};
                    padding: {}rem;
                }}
            }}
            "#,
            i * 10,
            i,
            i % 5,
            (i % 4) as f32 * 0.5
        ));
    }

    css_content
}

fn main() {
    divan::main();
}

#[divan::bench_group]
mod parsing {
    use std::error::Error;

    use divan::{Bencher, black_box};
    use shinkore::css::parse_css;

    use crate::{MIXED_NESTED_CSS, SIMPLE_CSS, generate_large_css_stylesheet};

    #[divan::bench]
    fn parse_simple_css_classes() -> Result<(), Box<dyn Error>> {
        let _ = black_box(parse_css(SIMPLE_CSS)?);

        Ok(())
    }

    #[divan::bench]
    fn parse_mixed_nested_css_rules() -> Result<(), Box<dyn Error>> {
        let _ = black_box(parse_css(MIXED_NESTED_CSS)?);

        Ok(())
    }

    #[divan::bench(args = [10,20,30,40,50,60,70,80,90,100])]
    fn parse_large_css_stylesheet(bencher: Bencher, rule_count: usize) {
        let css_content = generate_large_css_stylesheet(rule_count);

        bencher.bench_local(|| -> Result<(), Box<dyn Error>> {
            let _ = black_box(parse_css(&css_content)?);

            Ok(())
        });
    }
}

#[divan::bench_group]
mod flattening {
    use std::{error::Error, hint::black_box};

    use divan::Bencher;
    use shinkore::css::{CSSRule, ParsedCss};
    use shinkore::{css::parse_css, extract_css_rules, flatten_css};
    use shinkore_types::prelude::{AtRule, CSSClass, CSSDeclaration};

    use crate::{MIXED_NESTED_CSS, SIMPLE_CSS, generate_large_css_stylesheet};

    #[divan::bench]
    fn flatten_simple_css(bencher: Bencher) {
        let parsed = parse_css(SIMPLE_CSS).unwrap();
        let mut classes: Vec<CSSClass> = Vec::new();
        let mut at_rules: Vec<AtRule> = Vec::new();

        bencher.bench_local(|| -> Result<(), Box<dyn Error>> {
            black_box(extract_css_rules!(parsed.to_owned(), classes, at_rules));

            Ok(())
        });
    }

    #[divan::bench]
    fn flatten_mixed_nested_css(bencher: Bencher) {
        let parsed = parse_css(MIXED_NESTED_CSS).unwrap();
        let mut classes: Vec<CSSClass> = Vec::new();
        let mut at_rules: Vec<AtRule> = Vec::new();

        bencher.bench_local(|| -> Result<(), Box<dyn Error>> {
            black_box(extract_css_rules!(parsed.to_owned(), classes, at_rules));

            Ok(())
        });
    }

    #[divan::bench(args = [10,20,30,40,50,60,70,80,90,100])]
    fn flatten_large_css(bencher: Bencher, rule_count: usize) {
        let css_content = generate_large_css_stylesheet(rule_count);
        let parsed = parse_css(&css_content).unwrap();
        let mut classes: Vec<CSSClass> = Vec::new();
        let mut at_rules: Vec<AtRule> = Vec::new();

        bencher.bench_local(|| -> Result<(), Box<dyn Error>> {
            black_box(extract_css_rules!(parsed.to_owned(), classes, at_rules));

            Ok(())
        });
    }
}
