use shinkore::css::parse_stylesheet;

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

    let result = parse_stylesheet(simple_css);

    println!("{result:#?}");

    assert!(result.len() == 6)
}
