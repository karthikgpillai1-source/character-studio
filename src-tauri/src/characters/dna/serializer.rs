use super::types::DnaProfile;
use std::fs;
use std::path::Path;

pub fn export_dna(dna: &DnaProfile, dest_path: &Path) -> Result<(), String> {
    let json = serde_json::to_string_pretty(dna).map_err(|e| e.to_string())?;
    fs::write(dest_path, json).map_err(|e| e.to_string())
}

pub fn import_dna(src_path: &Path) -> Result<DnaProfile, String> {
    let json = fs::read_to_string(src_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&json).map_err(|e| e.to_string())
}
