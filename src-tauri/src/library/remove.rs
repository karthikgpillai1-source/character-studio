use crate::database::service::DatabaseService;
use std::path::PathBuf;
use std::sync::Arc;

pub fn remove_model(
    db: Arc<DatabaseService>,
    id: i64,
    delete_file: bool,
) -> Result<(), String> {
    let models = db.get_models().map_err(|e| e.to_string())?;
    
    if let Some(model) = models.iter().find(|m| m.id == id) {
        if delete_file {
            let path = PathBuf::from(&model.path);
            if path.exists() {
                let _ = std::fs::remove_file(path);
            }
        }
        
        // In a real implementation we would have db.delete_model(id)
        // For Phase 1.6 architecture scaffolding, we assume this is handled
        // or we can implement delete_model in repositories later.
    }
    
    Ok(())
}
