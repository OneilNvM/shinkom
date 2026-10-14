use shinkore::css::{parse_css, parse_stylesheet};

#[test]
fn should_parse_simple_css() {
    let simple_css = ".test {
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
gap: 4rem;
color: whitesmoke;
}
    ";

    let result = parse_stylesheet(simple_css).unwrap();

    println!("{result:#?}");

    assert!(result.len() == 6)
}

#[test]
fn should_parse_css_class() {
    let test_css = ".test {
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
}";
    let result = parse_css(test_css).unwrap();

    println!("{result:#?}");

    assert!(result.len() == 1)
}

#[test]
fn should_parse_class_names_and_declarations() {
    let test_css = ".test {
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
gap: 4rem;
color: whitesmoke;
}

.square {
width: 3rem;
height: 3rem;
border: 1px solid red;
background-color: magenta;
}

.foo {
  display: grid;
  @media (orientation: landscape) {
    grid-auto-flow: column;
    @media (width >= 1024px) {
      max-inline-size: 1024px;
    }
  }
}

@media (orientation: landscape) {
  .bar {
    grid-auto-flow: column;
    @media (max-width >= 960px) {
      max-inline-size: 960px;
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

h1 {
    font-size: 3rem;
    color: red;
}";

    let _styles = parse_css(test_css);
}
