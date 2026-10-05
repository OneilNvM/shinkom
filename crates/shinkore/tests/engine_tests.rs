use std::error::Error;

use shinkore::engine::{RustEngine, RustEngineBuilder};

#[test]
fn should_create_engine() -> Result<(), Box<dyn Error>> {
    let _engine = RustEngineBuilder::new()
        .with_data_dir("gen".into())
        .build()?;

    Ok(())
}

#[test]
fn should_create_engine_from_compiled_data() -> Result<(), Box<dyn Error>> {
    let _engine = RustEngine::from_compiled_data()?;

    Ok(())
}
