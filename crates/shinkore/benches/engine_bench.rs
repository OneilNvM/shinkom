use std::error::Error;

use shinkore::engine::{RustCompatEngine, RustCompatEngineBuilder};

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
    divan::black_box(
        RustCompatEngine::from_compiled_data()?
    );

    Ok(())
}
