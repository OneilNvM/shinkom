use browserx_core::helpers::{write_close_tag, process_html};

#[test]
fn should_process_html() {
    let html = "<div class='demo-text-container'>
<p>Hello this is a simple test with a p element</p>
<div class='span-container'>
<span data-test='test value'>Now this div has two</span>
<span>span elements to select</span>
</div>
<button>Reset Inspector</button>
<button>Destroy Inspector</button>
</div>";


    let elements_1 = process_html(html, 1);
    let elements_2 = process_html(html, 2);

    println!("{}\n", elements_1);
    println!("{}", elements_2);

    assert_eq!(elements_1.lines().count(), 4);
    assert_eq!(elements_2.lines().count(), 7);
}

#[test]
#[should_panic]
fn should_not_write_close_tag() {
    let val = write_close_tag("<html>random text</html>");

    assert!(val.is_some())
}