use shinkore::{
    css::{parse_css, parse_stylesheet},
    errors::ParseStylesError,
};

#[test]
fn should_parse_simple_css() {
    let simple_css = r#"
.test {
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
gap: 4rem;
color: whitesmoke;
}
    "#;

    let result = parse_stylesheet(simple_css).unwrap();

    println!("{result:#?}");

    assert!(result.len() == 6)
}

#[test]
fn should_parse_css_class() -> Result<(), ParseStylesError> {
    let test_css = r#"
.test {
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
gap: 4rem;
color: whitesmoke;
}

#square {
width: 3rem;
height: 3rem;
border: 1px solid red;
background-color: magenta;
}"#;
    let result = parse_css(test_css)?;

    println!("{result:#?}");

    assert!(result.len() == 1);

    Ok(())
}

#[test]
fn should_parse_top_level_at_rules() -> Result<(), ParseStylesError> {
    let test_css = r#"
@import "tailwind";

@media (orientation: landscape) {
  .bar {
    grid-auto-flow: column;
    @media (max-width >= 960px) {
      max-inline-size: 960px;
    }
  }
}

@layer utilities {
    .flex {
      display: flex;
    }
    .h-12 {
      height: calc(var(--spacing) * 12);
    }
    .h-full {
      height: 100%;
    }
    .min-h-full {
      min-height: 100%;
    }
    .w-full {
      width: 100%;
    }
    .max-w-3xl {
      max-width: var(--container-3xl);
    }
    .max-w-md {
      max-width: var(--container-md);
    }
    .max-w-xs {
      max-width: var(--container-xs);
    }
}
  "#;

    let styles = parse_css(test_css)?;

    assert_eq!(styles.len(), 3);

    Ok(())
}

#[test]
fn should_parse_nested_at_rules() -> Result<(), ParseStylesError> {
    let test_css = r#"
.foo {
  display: grid;
  @media (orientation: landscape) {
    grid-auto-flow: column;
    @media (width >= 1024px) {
      max-inline-size: 1024px;
    }
  }
}

.baz {
  display: flex;
  flex-direction: column;

  @media (width <= 960px) {
    .flex-col-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
}
"#;

    let styles = parse_css(test_css)?;

    assert_eq!(styles.len(), 2);

    Ok(())
}
