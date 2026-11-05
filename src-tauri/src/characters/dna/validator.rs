use super::types::DnaProfile;

pub struct DnaValidator;

impl DnaValidator {
    pub fn validate(dna: &DnaProfile) -> Result<(), String> {
        if dna.communication.tone.trim().is_empty() {
            return Err("Communication tone cannot be empty".to_string());
        }

        for value in &dna.values {
            if value.name.trim().is_empty() {
                return Err("Value trait name cannot be empty".to_string());
            }
            if value.priority > 10 {
                return Err(format!("Value trait '{}' priority must be 0-10", value.name));
            }
        }

        Ok(())
    }
}
