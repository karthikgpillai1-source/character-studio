pub mod backend;
pub mod errors;
pub mod launcher;
pub mod manager;
pub mod model_loader;
pub mod process_monitor;
pub mod stream;
pub mod types;
pub mod prompt_builder;

use tauri::{State, Window};
use manager::RuntimeManager;
use types::{BackendMode, GenerationRequest, ModelMetadata, RuntimeStatus};

// Tauri Commands

#[tauri::command]
pub async fn load_model(
    path: String,
    mode: BackendMode,
    state: State<'_, RuntimeManager>,
    app_handle: tauri::AppHandle,
) -> Result<ModelMetadata, String> {
    state.load_model(&path, mode, app_handle).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub fn unload_model(state: State<'_, RuntimeManager>) -> Result<(), String> {
    state.unload_model().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_runtime_status(state: State<'_, RuntimeManager>) -> Result<RuntimeStatus, String> {
    Ok(state.get_status())
}

#[tauri::command]
pub async fn generate_text(
    request: GenerationRequest,
    window: Window,
    state: State<'_, RuntimeManager>,
    db: State<'_, crate::database::service::DatabaseService>,
) -> Result<(), String> {
    
    // Verify a model is actually running
    let status = state.get_status();
    
    if !status.is_running {
        return Err(r#"{"error": "Runtime backend unavailable"}"#.to_string());
    }

    if status.current_model.is_none() {
        return Err(r#"{"error": "No model loaded"}"#.to_string());
    }

    let mut history = None;
    if let Some(convo_id) = request.conversation_id {
        if let Ok(msgs) = db.get_messages(convo_id) {
            history = Some(msgs);
        }
    }

    stream::stream_text(window, request, history).await.map_err(|_| r#"{"error": "Inference failed"}"#.to_string())
}

#[tauri::command]
pub fn stop_generation() -> Result<(), String> {
    // In a full implementation, this would send an abort signal to the stream request
    // or call the /props endpoint of llama-server to halt generation.
    // For Phase 1.3 scaffolding, we acknowledge the command.
    Ok(())
}

#[tauri::command]
pub fn list_loaded_models(state: State<'_, RuntimeManager>) -> Result<Vec<ModelMetadata>, String> {
    // Phase 1.3 supports only a single model loaded at a time
    let status = state.get_status();
    if let Some(model) = status.current_model {
        Ok(vec![model])
    } else {
        Ok(vec![])
    }
}
