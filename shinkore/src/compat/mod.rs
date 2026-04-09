mod calculate;
pub mod check;
mod lookup;

pub enum LookupType {
    Element(String),
    Attribute(String),
}
