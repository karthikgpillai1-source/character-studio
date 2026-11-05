pub mod connection;
pub mod errors;
pub mod migrations;
pub mod models;
pub mod repositories;
pub mod schema;
pub mod service;

use service::DatabaseService;
use models::{Conversation, Message, Model, Setting};
use tauri::State;

// Tauri Commands

#[tauri::command]
pub fn get_setting(key: String, state: State<'_, DatabaseService>) -> Result<Option<Setting>, String> {
    state.get_setting(&key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_setting(key: String, value: String, state: State<'_, DatabaseService>) -> Result<(), String> {
    state.save_setting(&key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_models(state: State<'_, DatabaseService>) -> Result<Vec<Model>, String> {
    state.get_models().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_model(
    name: String,
    path: String,
    size_bytes: u64,
    quantization: String,
    context_length: u32,
    state: State<'_, DatabaseService>,
) -> Result<i64, String> {
    state
        .save_model(&name, &path, size_bytes, &quantization, context_length)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_conversation(title: String, state: State<'_, DatabaseService>) -> Result<i64, String> {
    state.create_conversation(&title).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_conversations(state: State<'_, DatabaseService>) -> Result<Vec<Conversation>, String> {
    state.get_conversations().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_message(
    conversation_id: i64,
    role: String,
    content: String,
    token_count: Option<u32>,
    state: State<'_, DatabaseService>,
) -> Result<i64, String> {
    state
        .save_message(conversation_id, &role, &content, token_count)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_messages(conversation_id: i64, state: State<'_, DatabaseService>) -> Result<Vec<Message>, String> {
    state.get_messages(conversation_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_dashboard_stats(state: State<'_, DatabaseService>) -> Result<crate::database::models::DashboardStats, String> {
    state.get_dashboard_stats().map_err(|e| e.to_string())
}
