use crate::runtime::errors::RuntimeError;
use crate::runtime::types::ModelMetadata;
use std::fs::File;
use std::io::Read;
use std::path::Path;

pub fn validate_gguf<P: AsRef<Path>>(path: P) -> Result<ModelMetadata, RuntimeError> {
    let path = path.as_ref();
    
    if !path.exists() {
        return Err(RuntimeError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "File does not exist",
        )));
    }
    
    if path.extension().and_then(|s| s.to_str()) != Some("gguf") {
        return Err(RuntimeError::GgufParse("File must have a .gguf extension".to_string()));
    }

    let mut file = File::open(path)?;
    let metadata = file.metadata()?;
    
    let mut magic = [0u8; 4];
    if file.read_exact(&mut magic).is_err() || &magic != b"GGUF" {
        return Err(RuntimeError::GgufParse("Invalid magic bytes. Not a valid GGUF file.".to_string()));
    }

    // In a full production implementation, we would parse the GGUF Key-Value store 
    // here to extract the actual quantization type, architecture, and context window.
    // For Phase 1.3 baseline, we validate the header and infer defaults for the UI.
    let file_name = path.file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("Unknown Model")
        .to_string();

    let quantization = if file_name.to_uppercase().contains("Q4_K_M") {
        "Q4_K_M".to_string()
    } else if file_name.to_uppercase().contains("Q8_0") {
        "Q8_0".to_string()
    } else {
        "Unknown".to_string()
    };

    Ok(ModelMetadata {
        file_path: path.to_string_lossy().to_string(),
        name: file_name,
        size_bytes: metadata.len(),
        quantization,
        context_length: 8192, // Safe default assumption for modern models if unparsed
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_validate_gguf_invalid_magic() {
        let mut temp = NamedTempFile::new().unwrap();
        temp.write_all(b"FAKE").unwrap();
        let result = validate_gguf(temp.path().with_extension("gguf"));
        assert!(matches!(result, Err(RuntimeError::GgufParse(_))));
    }

    #[test]
    fn test_validate_gguf_valid_magic() {
        let mut temp = NamedTempFile::new().unwrap();
        temp.write_all(b"GGUF_rest_of_file").unwrap();
        let path = temp.path().with_extension("gguf");
        // Re-create it with correct extension for test
        let mut file = File::create(&path).unwrap();
        file.write_all(b"GGUF_data").unwrap();
        
        let result = validate_gguf(&path).unwrap();
        assert_eq!(result.size_bytes, 9);
        std::fs::remove_file(path).unwrap();
    }
}
