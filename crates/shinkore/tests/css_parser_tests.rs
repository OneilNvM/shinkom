use shinkore::css::{parse_css_classes, parse_stylesheet};

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
    let result = parse_css_classes(test_css).unwrap();

    println!("{result:#?}");

    assert!(result.len() == 2)
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

h1 {
    font-size: 3rem;
    color: red;
}";
    let result = parse_css_classes(test_css).unwrap();

    for class in result.iter().clone(){
        println!("class_name: {}, declarations: {:?}", class.name, class.styles);
    }

    assert_eq!(result.len(), 2)
}
