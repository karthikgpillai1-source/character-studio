use crate::database::service::DatabaseService;
use crate::models::errors::ModelError;
use crate::models::metadata::extract_gguf_metadata;
use crate::models::validator::validate_model;
use std::path::PathBuf;
use std::sync::Arc;

pub fn import_model(
    db: Arc<DatabaseService>,
    source_path: &str,
    target_dir: &PathBuf,
) -> Result<i64, ModelError> {
    let source = PathBuf::from(source_path);

    let report = validate_model(&source);
    if !report.is_valid {
        return Err(ModelError::ValidationFailed(report.issues.join(", ")));
    }

    let file_name = source.file_name().ok_or_else(|| {
        ModelError::InvalidHeader("Invalid file name".to_string())
    })?;

    let target_path = target_dir.join(file_name);

    if !target_path.exists() {
        std::fs::copy(&source, &target_path)?;
    }

    let metadata = extract_gguf_metadata(&target_path)?;

    let id = db.save_model(
        &metadata.file_name,
        &metadata.file_path,
        metadata.size_bytes,
        &metadata.quantization,
        metadata.context_length,
    ).map_err(|e| ModelError::DatabaseSync(e.to_string()))?;

    Ok(id)
}
