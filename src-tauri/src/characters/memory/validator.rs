pub struct MemoryValidator;

impl MemoryValidator {
    pub fn validate(content: &str, importance: u8) -> Result<(), String> {
        if content.trim().is_empty() {
            return Err("Memory content cannot be empty".to_string());
        }
        if importance > 100 {
            return Err("Importance must be between 0 and 100".to_string());
        }
        Ok(())
    }
}
