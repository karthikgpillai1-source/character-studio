use std::fs;
use std::path::Path;
use super::types::Character;

pub fn export_character_to_json(character: &Character, dest_path: &Path) -> Result<(), String> {
    let json = serde_json::to_string_pretty(character).map_err(|e| e.to_string())?;
    fs::write(dest_path, json).map_err(|e| e.to_string())
}

pub fn import_character_from_json(src_path: &Path) -> Result<Character, String> {
    let json = fs::read_to_string(src_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&json).map_err(|e| e.to_string())
}
