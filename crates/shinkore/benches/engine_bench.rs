use std::error::Error;

use divan::Bencher;
use shinkore::engine::{RustCompatEngine, RustCompatEngineBuilder};

const SMALL_HTML: &str = r#"
<div class="container" id="main-content">
    <h1 class="title">Hello World</h1>
    <p class="description">This is a simple baseline string to test parsing overhead.</p>
    <button type="button" disabled>Click Me</button>
</div>
"#;

const ATTRIBUTE_HEAVY_HTML: &str = r#"
<main id="app-root" data-v-app="" class="layout-grid" role="main" aria-label="Main content deck">
    <input type="text" id="username" name="user" class="form-input focus:ring-2" placeholder="Enter username" autocomplete="username" required aria-required="true" inputmode="text" autofocus />
    <dialog id="modal-alert" open class="backdrop:bg-slate-900/50 modal-primitive" aria-modal="true" popover="manual">
        <form method="dialog" class="form-wrapper" novalidate data-clean="false">
            <button type="submit" formmethod="dialog" formnovalidate class="btn-close" aria-label="Close dialog" accesskey="c">X</button>
        </form>
    </dialog>
    <img src="avatar.jpg" srcset="avatar-2x.jpg 2x, avatar-3x.jpg 3x" sizes="(max-width: 600px) 480px, 800px" loading="lazy" decoding="async" alt="User profile illustration" width="150" height="150" fetchpriority="high" />
</main>
"#;

const DEEPLY_NESTED_HTML: &str = r#"
<html>
<body>
    <header>
        <nav>
            <ul class="nav-list">
                <li class="nav-item">
                    <div class="dropdown">
                        <button class="dropdown-trigger">Menu</button>
                        <div class="dropdown-menu">
                            <span class="group-title">Settings</span>
                            <section class="settings-panel">
                                <div class="control-box">
                                    <span class="wrapper">
                                        <a href="/profile" class="link-node" data-tracking-id="nested_102">
                                            <strong>Edit Profile</strong>
                                        </a>
                                    </span>
                                </div>
                            </section>
                        </div>
                    </div>
                </li>
            </ul>
        </nav>
    </header>
</body>
</html>
"#;

const MALFORMED_HTML: &str = r#"
<DIV class=container id=unquoted>
    <h1 class="title">Missing closing tag
    <p class='mixed-quotes' data-broken=true>
    <input type="checkbox" checked=checked disabled
    <img src="broken.png" alt="no end bracket"
    <span>Unmatched closing container Element</span>
</div class="invalid-close">
"#;

fn main() {
    divan::main()
}

#[divan::bench]
fn engine_init() -> Result<(), Box<dyn Error>> {
    divan::black_box(
        RustCompatEngineBuilder::new()
            .with_data_dir(divan::black_box("../../packages/shinkom/gen".into()))
            .build()?,
    );

    Ok(())
}

#[divan::bench]
fn engine_init_from_compiled_data() -> Result<(), Box<dyn Error>> {
    divan::black_box(RustCompatEngine::from_compiled_data()?);

    Ok(())
}

#[divan::bench(args = [1, 2])]
fn engine_check_small_html(bencher: Bencher, depth_level: u32) {
    let engine = RustCompatEngine::from_compiled_data().unwrap();

    bencher.bench_local(|| -> Result<(), Box<dyn Error>> {
        let _ = divan::black_box(engine.check_elements(SMALL_HTML, depth_level))?;

        Ok(())
    });
}

#[divan::bench(args = [1, 2, 3, 4])]
fn engine_check_attribute_heavy_html(bencher: Bencher, depth_level: u32) {
    let engine = RustCompatEngine::from_compiled_data().unwrap();

    bencher.bench_local(|| -> Result<(), Box<dyn Error>> {
        let _ = divan::black_box(engine.check_elements(ATTRIBUTE_HEAVY_HTML, depth_level))?;

        Ok(())
    });
}

#[divan::bench(args = [1, 3, 5, 7, 9, 11, 13])]
fn engine_check_deeply_nested_html(bencher: Bencher, depth_level: u32) {
    let engine = RustCompatEngine::from_compiled_data().unwrap();

    bencher.bench_local(|| -> Result<(), Box<dyn Error>> {
        let _ = divan::black_box(engine.check_elements(DEEPLY_NESTED_HTML, depth_level))?;

        Ok(())
    });
}

#[divan::bench(args = [1, 2])]
fn engine_check_malformed_html(bencher: Bencher, depth_level: u32) {
    let engine = RustCompatEngine::from_compiled_data().unwrap();

    bencher.bench_local(|| -> Result<(), Box<dyn Error>> {
        let _ = divan::black_box(engine.check_elements(MALFORMED_HTML, depth_level))?;

        Ok(())
    });
}
