use shinkore::helpers::{pre_process_html, write_close_tag};

#[test]
fn should_pre_process_html() {
    let html_1 = "<div class='demo-text-container'>
<p>Hello this is a simple test with a p element</p>
<div class='span-container'>
<span data-test='test value'>Now this div has two</span>
<span>span elements to select</span>
</div>
<button>Reset Inspector</button>
<button>Destroy Inspector</button>
</div>";

    let html_2 = "<section class='demo-container'>
<div class='demo-text-container'>
<p>Hello this is a simple test with a p element</p>
<div class='span-container'>
<span data-test='test value'>Now this div has two</span>
<span>span elements to select</span>
</div>
<input type='text'/>
<script>console.log('hello')</script>
<button>Reset Inspector</button>
<button>Destroy Inspector</button>
</div>
</section>";

    let html_3 = "<section class='demo-container'>
<div class='demo-text-container'>
<p>Hello this is a simple test with a p element</p>
<script>
    let data = 12;
    console.log(data);
</script>
<div class='span-container'>
<span data-test='test value'>Now this div has two</span>
<span><b>span</b> elements to select</span>
</div>
<div class='second-span-container'>
<span data-test='test value'>Now this div has two</span>
<span>span elements to select</span>
<div>
<p>Inner Span div element</p>
</div>
</div>
<button>Reset Inspector</button>
<button>Destroy Inspector</button>
</div>
</section>";

    let val_1_1 = pre_process_html(html_1, 1);
    let val_1_2 = pre_process_html(html_1, 2);
    let val_2_1 = pre_process_html(html_2, 1);
    let val_2_2 = pre_process_html(html_2, 2);
    let val_2_3 = pre_process_html(html_2, 3);
    let val_2_4 = pre_process_html(html_2, 10);
    let val_3_1 = pre_process_html(html_3, 1);
    let val_3_2 = pre_process_html(html_3, 2);
    let val_3_3 = pre_process_html(html_3, 3);

    assert_eq!(val_1_1.lines().count(), 5);
    assert_eq!(val_1_2.lines().count(), 7);

    assert_eq!(val_2_1.lines().count(), 2);
    assert_eq!(val_2_2.lines().count(), 8);
    assert_eq!(val_2_3.lines().count(), 10);
    assert_eq!(val_2_4.lines().count(), 10);

    assert_eq!(val_3_1.lines().count(), 2);
    assert_eq!(val_3_2.lines().count(), 8);
    assert_eq!(val_3_3.lines().count(), 13);
}

#[test]
fn should_write_close_tag() {
    let html_1 = "<div id='div-id' class='div-class'>";
    let val_1 = write_close_tag(html_1);

    let html_2 = "<div><span>";
    let val_2 = write_close_tag(html_2);

    let html_3 = "<div><span><p>";
    let val_3 = write_close_tag(html_3);

    let html_4 = "<div><span></span>";
    let val_4 = write_close_tag(html_4);

    let html_5 =
        "<div><p><span class='red-bold'>hello</span><span class='green-bold'>world</span></p>";
    let val_5 = write_close_tag(html_5);

    let html_6 = "<div class='div-container'>
    <h1>Welcome to Shinkom</h1>
    <p>This library is a tool for web developers</p>";
    let val_6 = write_close_tag(html_6);

    assert!(val_1.is_some());
    assert!(val_2.is_some());
    assert!(val_3.is_some());
    assert!(val_4.is_some());
    assert!(val_5.is_some());
    assert!(val_6.is_some());
}

#[test]
fn should_not_write_close_tag() {
    let html_1 = "<div></div>";
    let val_1 = write_close_tag(html_1);

    let html_2 = "<div><span>Do not return close tag</span></div>";
    let val_2 = write_close_tag(html_2);

    let html_3 = "<div class='div-container'>
    <h1>Welcome to Shinkom</h1>
    <p>This library is a tool for web developers</p>
    </div>";
    let val_3 = write_close_tag(html_3);

    assert!(val_1.is_none());
    assert!(val_2.is_none());
    assert!(val_3.is_none());
}
