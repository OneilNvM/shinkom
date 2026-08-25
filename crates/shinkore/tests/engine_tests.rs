use std::error::Error;

use shinkore::engine::{RustCompatEngine, RustCompatEngineBuilder};

#[test]
fn should_create_engine() -> Result<(), Box<dyn Error>> {
    let _engine = RustCompatEngineBuilder::new()
        .with_data_dir("../../packages/shinkom/gen".into())
        .build()?;

    Ok(())
}

#[test]
fn should_create_engine_from_compiled_data() -> Result<(), Box<dyn Error>> {
    let _engine = RustCompatEngine::from_compiled_data()?;

    println!("{_engine:?}");

    Ok(())
}
