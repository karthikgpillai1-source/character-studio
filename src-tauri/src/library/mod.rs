pub mod benchmark;
pub mod import;
pub mod remove;
pub mod search;
pub mod stats;

use crate::database::models::Model;
use crate::database::service::DatabaseService;
use crate::runtime::manager::RuntimeManager;
use benchmark::BenchmarkResult;
use search::FilterCriteria;
use stats::LibrarySummary;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn import_model(
    source_path: String,
    db: State<'_, Arc<DatabaseService>>,
) -> Result<i64, String> {
    let target_dir = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("data")
        .join("models");
    import::import_model(db.inner().clone(), &source_path, &target_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_model(
    id: i64,
    delete_file: bool,
    db: State<'_, Arc<DatabaseService>>,
) -> Result<(), String> {
    remove::remove_model(db.inner().clone(), id, delete_file)
}

#[tauri::command]
pub fn favorite_model(
    id: i64,
    is_favorite: bool,
    db: State<'_, Arc<DatabaseService>>,
) -> Result<(), String> {
    db.set_model_favorite(id, is_favorite).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn search_models(
    query: String,
    db: State<'_, Arc<DatabaseService>>,
) -> Result<Vec<Model>, String> {
    let models = db.get_models().map_err(|e| e.to_string())?;
    Ok(search::search_models(&models, &query))
}

#[tauri::command]
pub fn filter_models(
    criteria: FilterCriteria,
    db: State<'_, Arc<DatabaseService>>,
) -> Result<Vec<Model>, String> {
    let models = db.get_models().map_err(|e| e.to_string())?;
    Ok(search::filter_models(&models, &criteria))
}

#[tauri::command]
pub fn get_library_summary(db: State<'_, Arc<DatabaseService>>) -> Result<LibrarySummary, String> {
    let models = db.get_models().map_err(|e| e.to_string())?;
    Ok(stats::get_summary(&models))
}

#[tauri::command]
pub async fn benchmark_model(
    id: i64,
    db: State<'_, Arc<DatabaseService>>,
    runtime: State<'_, Arc<RuntimeManager>>,
    app_handle: tauri::AppHandle,
) -> Result<BenchmarkResult, String> {
    benchmark::run_benchmark(db.inner().clone(), runtime.inner().clone(), id, app_handle).await
}
